import { Injectable } from '@nestjs/common';
import { FailureLog, FailureType, Severity, UAVdata } from '@prisma/client';
import { CreateFailureDto } from './dto/create-failure.dto';
import { UpdateFailureDto } from './dto/update-failure.dto';
import { PrismaService } from 'src/modules/database/prisma.service';
import * as FAILURE_CONSTANTS from '@sky-sentinel/shared/failure-constants.ts';
import { getRoundedValue } from '@sky-sentinel/shared/utils.ts';

export interface FailureReport {
  incidentId: string;
  timestamp: string;
  classification: {
    type: string;
    subsystem: string;
    severity: string;
  };
  evidence: {
    analyticalRedundancy: string;
    sensorDelta: number;
  };
  failsafeAction: string; // From Section 5 of your notes
}

// Telemetry schema (matches Python simulator + MAVLink-compatible JSON):
//
//   Navigation : lat, lon, alt_rel, fixType
//   Flight     : airspeed, groundspeed, heading, pitch, roll, throttle
//   Diagnostics: battRem, servoCurrent, vibration [X,Y,Z], rssi (0-254)
//   Recon      : camStatus, signalQuality, loiter_radius
//
// NOTE: rssi uses the MAVLink 0-254 scale, NOT dBm.
//       Removed from previous version: vsi, gear_status, temperature, latency.
@Injectable()
export class FailuresService {
  constructor(private readonly prismaService: PrismaService) {}

  generateReport(data: UAVdata, failureType: string): FailureReport {
    let action = 'CONTINUE_MISSION';

    if (failureType === 'PITOT_FAILURE') {
      action = 'SWITCH_TO_GPS_NAVIGATION (Dead Reckoning)';
    } else if (failureType === 'PROPULSION_FAILURE') {
      action = 'GLIDE_TO_HOME_OR_EMERGENCY_LAND';
    }

    return {
      incidentId: `INC-${Date.now()}`,
      timestamp: new Date().toISOString(),
      classification: {
        type: 'HARDWARE',
        subsystem: failureType,
        severity: 'CRITICAL',
      },
      evidence: {
        analyticalRedundancy: `Airspeed(${data.airspeed}) vs GroundSpeed(${data.groundspeed})`,
        sensorDelta: Math.abs(data.airspeed - data.groundspeed),
      },
      failsafeAction: action,
    };
  }
  // ── 1. ANALYTICAL REDUNDANCY ─────────────────────────────────────────────
  /**
   * Compares airspeed (Pitot tube / pressure sensor) against groundspeed (GPS).
   *
   * Theory (Section 3.2.2):
   *   In steady flight  Δv = groundspeed − airspeed  represents wind component.
   *   A sudden, large Δv that cannot be explained by wind means one sensor failed:
   *     • Pitot clogged  → airspeed drops/freezes while groundspeed stays normal
   *     • GPS degraded   → groundspeed jumps while airspeed stays normal
   *   Either case triggers a WARNING so the autopilot can switch to dead-reckoning.
   *
   * Both values arrive in m/s from VFR_HUD (MAVLink-compatible).
   */
  async checkAnalyticalRedundancy(
    airspeed: number,
    groundspeed: number,
    uavDataId: string,
  ) {
    const delta = Math.abs(groundspeed - airspeed);

    if (delta > FAILURE_CONSTANTS.PITOT_DIVERGENCE_MS) {
      await this.create({
        type: FailureType.HARDWARE,
        severity: Severity.WARNING,
        description:
          `Analytical redundancy violation: |groundspeed ${getRoundedValue(groundspeed)} ` +
          `− airspeed ${getRoundedValue(airspeed)}| = ${getRoundedValue(delta)} m/s ` +
          `(threshold ${FAILURE_CONSTANTS.PITOT_DIVERGENCE_MS} m/s). ` +
          `Possible Pitot clog or GPS degradation.`,
        uavDataId,
      });
    }
  }

  // ── 2. STALL DETECTION ───────────────────────────────────────────────────
  /**
   * Monitors airspeed against the minimum safe flight envelope.
   *
   * For a fixed-wing recon UAV the stall speed is the most critical safety limit.
   * Unlike a multirotor, a fixed-wing cannot hover — losing lift means losing the aircraft.
   * Airspeed arrives in m/s directly from the pressure sensor (no scaling needed).
   *
   * Two-level alert mirrors standard aviation warnings:
   *   WARNING  → pilot/autopilot can still recover with throttle increase
   *   CRITICAL → recovery window is closing, immediate nose-down required
   */
  async checkStall(airspeed: number, uavDataId: string) {
    if (airspeed < FAILURE_CONSTANTS.STALL_CRITICAL_MS) {
      await this.create({
        type: FailureType.HARDWARE,
        severity: Severity.CRITICAL,
        description:
          `STALL CRITICAL: airspeed ${getRoundedValue(airspeed)} m/s is below ` +
          `minimum safe speed ${FAILURE_CONSTANTS.STALL_CRITICAL_MS} m/s. Immediate recovery required.`,
        uavDataId,
      });
    } else if (airspeed < FAILURE_CONSTANTS.STALL_WARNING_MS) {
      await this.create({
        type: FailureType.HARDWARE,
        severity: Severity.WARNING,
        description:
          `STALL WARNING: airspeed ${getRoundedValue(airspeed)} m/s approaching ` +
          `stall margin (${FAILURE_CONSTANTS.STALL_WARNING_MS} m/s). Increase throttle.`,
        uavDataId,
      });
    }
  }

  // ── 3. PROPULSION SYSTEM ─────────────────────────────────────────────────
  /**
   * Detects engine/motor failure without a vertical-speed sensor.
   *
   * Previous version used vsi (vertical speed indicator) which is no longer
   * in the telemetry schema. The updated logic uses two independent indicators:
   *
   *   Indicator A — throttle saturation:
   *     Throttle at 100 % means the autopilot is demanding maximum thrust.
   *     On a healthy aircraft this should translate to climbing or level flight.
   *
   *   Indicator B — altitude loss:
   *     alt_rel is the height above take-off point (metres, from barometer + GPS).
   *     If altitude is dropping while throttle is maxed the engine is not delivering.
   *
   * The combination of both indicators reduces false positives (e.g. intentional
   * maximum-throttle climbs will not drop altitude).
   */
  async checkPropulsion(
    throttle: number,
    altRel: number,
    altRelPrev: number, // previous tick value, tracked by the caller
    uavDataId: string,
  ) {
    const altitudeDrop = altRelPrev - altRel; // positive = losing altitude

    if (throttle >= 95 && altitudeDrop > 3.0) {
      await this.create({
        type: FailureType.HARDWARE,
        severity: Severity.CRITICAL,
        description:
          `Propulsion failure: throttle ${throttle}% (saturated) but altitude ` +
          `dropped ${getRoundedValue(altitudeDrop)} m since last tick. ` +
          `Engine may have lost thrust.`,
        uavDataId,
      });
    } else if (throttle >= 85 && altitudeDrop > 5.0) {
      // High throttle + significant altitude loss even without full saturation
      await this.create({
        type: FailureType.HARDWARE,
        severity: Severity.WARNING,
        description:
          `Propulsion degradation: throttle ${throttle}%, altitude loss ` +
          `${getRoundedValue(altitudeDrop)} m. Monitor engine output.`,
        uavDataId,
      });
    }
  }

  // ── 4. IMU / ATTITUDE ────────────────────────────────────────────────────
  /**
   * Two-layer attitude check.
   *
   * Layer A — rate check (same as before):
   *   Instantaneous pitch/roll rates that exceed the airframe's physical limits
   *   indicate IMU sensor corruption, not real motion.
   *   Source: ATTITUDE message, converted from rad to °/s by the caller.
   *
   * Layer B — envelope check (new):
   *   Even at valid rates, sustained extreme angles are dangerous for a fixed-wing.
   *   pitch > 45° or roll > 60° = unusual attitude that requires immediate correction.
   *   These thresholds are standard in fixed-wing AFCS (Automatic Flight Control Systems).
   */
  async checkAttitude(
    pitch: number, // degrees, from ATTITUDE (rad × 180/π)
    roll: number, // degrees
    pitchRate: number, // deg/s (caller computes Δpitch / Δt)
    rollRate: number, // deg/s
    uavDataId: string,
  ) {
    // Layer A: physically impossible rotation rates → IMU fault
    if (
      Math.abs(pitchRate) > FAILURE_CONSTANTS.MAX_PHYSICAL_RATE ||
      Math.abs(rollRate) > FAILURE_CONSTANTS.MAX_PHYSICAL_RATE
    ) {
      await this.create({
        type: FailureType.HARDWARE,
        severity: Severity.CRITICAL,
        description:
          `IMU failure: rotation rates (pitch ${getRoundedValue(pitchRate)}°/s, ` +
          `roll ${getRoundedValue(rollRate)}°/s) exceed physical airframe limit ` +
          `(${FAILURE_CONSTANTS.MAX_PHYSICAL_RATE}°/s). Sensor data cannot be trusted.`,
        uavDataId,
      });
      return; // no point checking envelope if IMU data is invalid
    }

    // Layer B: unusual attitude envelope
    if (
      Math.abs(pitch) > FAILURE_CONSTANTS.PITCH_CRIT_DEG ||
      Math.abs(roll) > FAILURE_CONSTANTS.ROLL_CRIT_DEG
    ) {
      await this.create({
        type: FailureType.HARDWARE,
        severity: Severity.CRITICAL,
        description:
          `Unusual attitude CRITICAL: pitch ${pitch.toFixed(1)}°, ` +
          `roll ${roll.toFixed(1)}°. Aircraft approaching unrecoverable state.`,
        uavDataId,
      });
    } else if (
      Math.abs(pitch) > FAILURE_CONSTANTS.PITCH_WARN_DEG ||
      Math.abs(roll) > FAILURE_CONSTANTS.ROLL_WARN_DEG
    ) {
      await this.create({
        type: FailureType.HARDWARE,
        severity: Severity.WARNING,
        description:
          `Unusual attitude WARNING: pitch ${getRoundedValue(pitch)}°, ` +
          `roll ${getRoundedValue(roll)}°. Exceeds normal recon flight envelope.`,
        uavDataId,
      });
    }
  }

  // ── 5. NAVIGATION / GPS ──────────────────────────────────────────────────
  /**
   * Validates GPS data quality using fixType and coordinate sanity.
   *
   * fixType (from GPS_RAW_INT in MAVLink):
   *   0 = no fix, 1 = dead-reckoning only, 2 = 2D fix, 3 = 3D fix (minimum usable),
   *   4 = DGPS, 5 = RTK float, 6 = RTK fixed.
   *   Values below 3 mean the position data should be discarded.
   *
   * In REB (electronic warfare) environments GPS can degrade from fixType 3
   * to 0 within seconds. The KIUS must react immediately and switch to
   * inertial/dead-reckoning navigation if available.
   *
   * Terrain proximity uses alt_rel (height above take-off point in metres).
   * At low altitude + high speed the collision risk is critical.
   */
  async checkNavigation(
    lat: number,
    lon: number,
    altRel: number,
    fixType: number,
    airspeed: number,
    uavDataId: string,
  ) {
    // GPS fix quality check — primary navigation integrity gate
    if (fixType < FAILURE_CONSTANTS.GPS_MIN_FIX) {
      await this.create({
        type: FailureType.NETWORK,
        severity: Severity.CRITICAL,
        description:
          `GPS fix degraded: fixType = ${fixType} (minimum required: ${FAILURE_CONSTANTS.GPS_MIN_FIX}). ` +
          `Coordinate data unreliable. Possible REB interference.`,
        uavDataId,
      });
    }

    // Zero-coordinate sanity check (GPS lost / parser error)
    if (lat === 0 || lon === 0) {
      await this.create({
        type: FailureType.NETWORK,
        severity: Severity.CRITICAL,
        description:
          `GPS lost: zero coordinates detected (lat=${lat}, lon=${lon}). ` +
          `Navigation data invalid.`,
        uavDataId,
      });
    }

    // Terrain proximity — recon UAVs fly higher (350+ m) so this triggers
    // only during approach/RTL when alt_rel drops near ground level
    if (altRel < FAILURE_CONSTANTS.TERRAIN_PROXIMITY_M && airspeed > 15) {
      await this.create({
        type: FailureType.HARDWARE,
        severity: Severity.CRITICAL,
        description:
          `Terrain proximity: alt_rel ${getRoundedValue(altRel)} m at ` +
          `${getRoundedValue(airspeed)} m/s. Collision risk.`,
        uavDataId,
      });
    }

    // Regulatory altitude ceiling
    if (altRel > FAILURE_CONSTANTS.LEGAL_ALT_LIMIT_M) {
      await this.create({
        type: FailureType.OTHER,
        severity: Severity.WARNING,
        description:
          `Altitude limit exceeded: ${getRoundedValue(altRel)} m AGL ` +
          `(legal ceiling ${FAILURE_CONSTANTS.LEGAL_ALT_LIMIT_M} m).`,
        uavDataId,
      });
    }
  }

  // ── 6. SERVO / MECHANICAL HEALTH ─────────────────────────────────────────
  /**
   * Monitors servoCurrent and vibration vector for mechanical failures.
   *
   * servoCurrent (Amperes, from SYS_STATUS.currentBattery ÷ 100):
   *   Normal recon load ≈ 0.8–1.5 A (control surfaces + camera gimbal).
   *   A spike above 2 A indicates mechanical resistance on a control surface.
   *   Above 4 A the servo is likely jammed — imminent loss of control authority.
   *
   * vibration [X, Y, Z] (m/s², from VIBRATION message):
   *   The vector describes frame vibration along each axis.
   *   ArduPilot guidelines:
   *     healthy  < 0.3 m/s²
   *     monitor    0.3–1.0 m/s²
   *     fault    > 1.0 m/s²
   *   A spike on Y axis specifically is typical for a servo stall (torsional load).
   *   A spike on Z axis can indicate propeller imbalance or bearing wear.
   *   We report the worst-case axis to keep the alert actionable.
   */
  async checkMechanical(
    servoCurrent: number,
    vibration: number[], // [X, Y, Z] in m/s²
    uavDataId: string,
  ) {
    // Servo current — control surface health
    if (servoCurrent > FAILURE_CONSTANTS.SERVO_CRIT_A) {
      await this.create({
        type: FailureType.HARDWARE,
        severity: Severity.CRITICAL,
        description:
          `Servo stall CRITICAL: current ${getRoundedValue(servoCurrent)} A ` +
          `(limit ${FAILURE_CONSTANTS.SERVO_CRIT_A} A). Possible control surface jam.`,
        uavDataId,
      });
    } else if (servoCurrent > FAILURE_CONSTANTS.SERVO_WARN_A) {
      await this.create({
        type: FailureType.HARDWARE,
        severity: Severity.WARNING,
        description:
          `Servo load WARNING: current ${getRoundedValue(servoCurrent)} A ` +
          `(threshold ${FAILURE_CONSTANTS.SERVO_WARN_A} A). Monitor for mechanical resistance.`,
        uavDataId,
      });
    }

    // Vibration vector — find the worst axis
    const axisLabels = ['X', 'Y', 'Z'];
    const worstAxis = vibration.indexOf(Math.max(...vibration));
    const worstVal = vibration[worstAxis];

    if (worstVal > FAILURE_CONSTANTS.VIB_CRIT_MS2) {
      await this.create({
        type: FailureType.HARDWARE,
        severity: Severity.CRITICAL,
        description:
          `Vibration CRITICAL on axis ${axisLabels[worstAxis]}: ` +
          `${getRoundedValue(worstVal)} m/s² (limit ${FAILURE_CONSTANTS.VIB_CRIT_MS2} m/s²). ` +
          `Possible propeller imbalance or bearing failure. ` +
          `Full vector: X=${vibration[0]} Y=${vibration[1]} Z=${vibration[2]}.`,
        uavDataId,
      });
    } else if (worstVal > FAILURE_CONSTANTS.VIB_WARN_MS2) {
      await this.create({
        type: FailureType.HARDWARE,
        severity: Severity.WARNING,
        description:
          `Vibration WARNING on axis ${axisLabels[worstAxis]}: ` +
          `${getRoundedValue(worstVal)} m/s² (threshold ${FAILURE_CONSTANTS.VIB_WARN_MS2} m/s²). ` +
          `Monitor mechanical components.`,
        uavDataId,
      });
    }
  }

  // ── 7. POWER SYSTEM ──────────────────────────────────────────────────────
  /**
   * Monitors battery remaining percentage.
   *
   * battRem maps directly to SYS_STATUS.batteryRemaining (0–100 %).
   * The RTL (Return-To-Launch) trigger should be configured in the autopilot
   * at ~25–30 % to guarantee enough energy to return from max range.
   *
   * KIUS alerts at two levels so the operator can decide whether to
   * initiate manual RTL before the autopilot forces it at CRITICAL.
   */
  async checkPower(battRem: number, uavDataId: string) {
    if (battRem < FAILURE_CONSTANTS.BATT_CRITICAL_PCT) {
      await this.create({
        type: FailureType.HARDWARE,
        severity: Severity.CRITICAL,
        description:
          `Battery CRITICAL: ${getRoundedValue(battRem)}% remaining. ` +
          `RTL should be triggered immediately.`,
        uavDataId,
      });
    } else if (battRem < FAILURE_CONSTANTS.BATT_WARNING_PCT) {
      await this.create({
        type: FailureType.HARDWARE,
        severity: Severity.WARNING,
        description:
          `Battery WARNING: ${getRoundedValue(battRem)}% remaining. ` +
          `Consider initiating return to base.`,
        uavDataId,
      });
    }
  }

  // ── 8. RADIO LINK / REB DETECTION ────────────────────────────────────────
  /**
   * Monitors RSSI and signalQuality for REB (electronic warfare) threats.
   *
   * rssi uses the MAVLink 0–254 scale (RC_CHANNELS.rssi or RADIO_STATUS.rssi).
   * This is NOT dBm — thresholds differ from the previous version.
   *   254 = maximum signal strength
   *   ~100 = degraded but usable
   *   < 60  = likely REB interference or out-of-range
   *
   * signalQuality (0–100 %) is a recon-specific extension representing
   * the video-link quality to the payload camera. It degrades independently
   * of the RC link and can be the first indicator of narrowband jamming.
   *
   * Telemetry timeout is checked separately from rssi because a jammer can
   * silence the link while rssi still reads a stale non-zero value.
   */
  async checkRadioLink(
    rssi: number,
    signalQuality: number,
    lastSeenMs: number, // Date.now() of last received packet
    uavDataId: string,
  ) {
    // RSSI — primary RC link health (0-254 MAVLink scale)
    if (rssi < FAILURE_CONSTANTS.RSSI_CRIT) {
      await this.create({
        type: FailureType.NETWORK,
        severity: Severity.CRITICAL,
        description:
          `Radio link CRITICAL: RSSI ${rssi}/254. ` +
          `Possible REB interference or aircraft out of range.`,
        uavDataId,
      });
    } else if (rssi < FAILURE_CONSTANTS.RSSI_WARN) {
      await this.create({
        type: FailureType.NETWORK,
        severity: Severity.WARNING,
        description:
          `Radio link WARNING: RSSI ${rssi}/254. ` +
          `Signal degrading — monitor for REB activity.`,
        uavDataId,
      });
    }

    // Video link quality — recon-specific, independent of RC link
    if (signalQuality < 20) {
      await this.create({
        type: FailureType.NETWORK,
        severity: Severity.CRITICAL,
        description:
          `Video link CRITICAL: signalQuality ${signalQuality}%. ` +
          `Reconnaissance payload data feed lost.`,
        uavDataId,
      });
    } else if (signalQuality < 50) {
      await this.create({
        type: FailureType.NETWORK,
        severity: Severity.WARNING,
        description:
          `Video link WARNING: signalQuality ${signalQuality}%. ` +
          `Payload data quality degraded.`,
        uavDataId,
      });
    }

    // Telemetry timeout — link silence regardless of rssi value
    const silenceS = (Date.now() - lastSeenMs) / 1000;
    if (silenceS > FAILURE_CONSTANTS.TELEMETRY_TIMEOUT_S) {
      await this.create({
        type: FailureType.NETWORK,
        severity: Severity.CRITICAL,
        description:
          `Telemetry timeout: no packet received for ${getRoundedValue(silenceS)} s ` +
          `(limit ${FAILURE_CONSTANTS.TELEMETRY_TIMEOUT_S} s). Aircraft link considered lost.`,
        uavDataId,
      });
    }
  }

  // ── ORCHESTRATOR ─────────────────────────────────────────────────────────
  /**
   * Single entry point called by the telemetry gateway on every incoming packet.
   *
   * All checks run in parallel (Promise.allSettled) so one slow DB write
   * cannot block the others. Settled = we don't crash if one check throws.
   *
   * altRelPrev must be maintained by the caller (e.g. store the previous
   * value in a Map<uavId, number> in the gateway service).
   */
  async runAllChecks(
    data: {
      // Navigation
      lat: number;
      lon: number;
      alt_rel: number;
      fixType: number;
      // Flight
      airspeed: number;
      groundspeed: number;
      pitch: number;
      roll: number;
      throttle: number;
      // Diagnostics
      battRem: number;
      servoCurrent: number;
      vibration: number[];
      rssi: number;
      // Recon extensions
      signalQuality: number;
    },
    meta: {
      uavDataId: string;
      altRelPrev: number; // alt_rel from previous tick
      pitchPrev: number; // pitch from previous tick (for rate calc)
      rollPrev: number; // roll  from previous tick
      lastSeenMs: number; // Date.now() of previous packet
      deltaT: number; // seconds between ticks (for rate calc)
    },
  ) {
    const pitchRate = Math.abs(data.pitch - meta.pitchPrev) / meta.deltaT;
    const rollRate = Math.abs(data.roll - meta.rollPrev) / meta.deltaT;

    await Promise.allSettled([
      this.checkAnalyticalRedundancy(
        data.airspeed,
        data.groundspeed,
        meta.uavDataId,
      ),
      this.checkStall(data.airspeed, meta.uavDataId),
      this.checkPropulsion(
        data.throttle,
        data.alt_rel,
        meta.altRelPrev,
        meta.uavDataId,
      ),
      this.checkAttitude(
        data.pitch,
        data.roll,
        pitchRate,
        rollRate,
        meta.uavDataId,
      ),
      this.checkNavigation(
        data.lat,
        data.lon,
        data.alt_rel,
        data.fixType,
        data.airspeed,
        meta.uavDataId,
      ),
      this.checkMechanical(data.servoCurrent, data.vibration, meta.uavDataId),
      this.checkPower(data.battRem, meta.uavDataId),
      this.checkRadioLink(
        data.rssi,
        data.signalQuality,
        meta.lastSeenMs,
        meta.uavDataId,
      ),
    ]);
  }

  async create(data: CreateFailureDto): Promise<FailureLog> {
    return await this.prismaService.failureLog.create({ data });
  }

  async findAll(): Promise<FailureLog[]> {
    return await this.prismaService.failureLog.findMany({
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<FailureLog | null> {
    return await this.prismaService.failureLog.findUnique({
      where: { id },
    });
  }

  async update(id: string, failureData: UpdateFailureDto): Promise<FailureLog> {
    return await this.prismaService.failureLog.update({
      where: { id },
      data: { ...failureData },
    });
  }

  async remove(id: string): Promise<FailureLog> {
    return await this.prismaService.failureLog.delete({
      where: {
        id,
      },
    });
  }
}
