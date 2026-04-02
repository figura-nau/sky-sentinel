// ── Physical constants for a fixed-wing reconnaissance UAV ──────────────────

/** Minimum safe airspeed (m/s). Below this the wing loses lift → stall. */
export const STALL_CRITICAL_MS = 12.5;
/** Pre-stall warning margin (m/s). Gives the autopilot time to react. */
export const STALL_WARNING_MS = 15.0;

/** Max pitch/roll rate physically achievable by a fixed-wing airframe (°/s).
 *  Exceeding this means the IMU data is corrupted or the frame is breaking up. */
export const MAX_PHYSICAL_RATE = 120;

/** Divergence threshold for analytical redundancy (m/s).
 *  |groundspeed − airspeed| > this value → one sensor is faulty.
 *  ~4 m/s accounts for normal headwind/tailwind on a recon profile. */
export const PITOT_DIVERGENCE_MS = 4.0;

/** Altitude above which Ukrainian/NATO regulations require special clearance (m).
 *  120 m AGL is the standard BVLOS civil limit. */
export const LEGAL_ALT_LIMIT_M = 120;

/** Terrain proximity threshold (m). Below this at cruise speed = collision risk. */
export const TERRAIN_PROXIMITY_M = 5;

/** Attitude limits for a recon fixed-wing (degrees). */
export const PITCH_WARN_DEG = 25;
export const PITCH_CRIT_DEG = 45;
export const ROLL_WARN_DEG = 45;
export const ROLL_CRIT_DEG = 60;

/** Battery thresholds (%). At CRITICAL the autopilot should trigger RTL. */
export const BATT_CRITICAL_PCT = 15;
export const BATT_WARNING_PCT = 30;

/** Servo current thresholds (Amperes).
 *  Normal recon servo load ≈ 0.8–1.5 A (includes gimbal stabiliser).
 *  A spike above 2 A suggests mechanical resistance; above 4 A = stall/jam. */
export const SERVO_WARN_A = 2.0;
export const SERVO_CRIT_A = 4.0;

/** Vibration magnitude threshold per axis (m/s²).
 *  Values derived from ArduPilot VIBRATION message guidelines:
 *    < 0.3 m/s² — healthy
 *    0.3–1.0    — monitor
 *    > 1.0      — mechanical fault likely */
export const VIB_WARN_MS2 = 0.5;
export const VIB_CRIT_MS2 = 1.2;

/** RSSI thresholds (0–254 MAVLink scale, from RC_CHANNELS.rssi).
 *  Rough mapping: 254 = full signal, ~100 = usable, < 60 = likely REB zone. */
export const RSSI_WARN = 90;
export const RSSI_CRIT = 50;

/** fixType < 3 means no 3D GPS fix. Navigation data must be treated as invalid. */
export const GPS_MIN_FIX = 3;

/** Telemetry timeout (seconds). If no packet arrives in this window,
 *  the link is considered lost regardless of rssi value. */
export const TELEMETRY_TIMEOUT_S = 5;
