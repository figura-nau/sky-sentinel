import { Injectable } from '@nestjs/common';
import { FailureLog, FailureType, Severity, UAVdata } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateFailureDto } from './dto/create-failure.dto';
import { UpdateFailureDto } from './dto/update-failure.dto';

@Injectable()
export class FailuresService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * 1. GEODESY: GPS check and height
   */
  async checkGpsAndAltitude(
    lat: UAVdata['latitude'],
    lon: UAVdata['longitude'],
    alt: UAVdata['altitude'],
    airspeed: UAVdata['airspeed'],
    uavDataId: UAVdata['id'],
  ) {
    // GPS Lost
    if (lat === 0 || lon === 0) {
      await this.create({
        type: FailureType.NETWORK,
        severity: Severity.CRITICAL,
        description: 'GPS Lost: Zero coordinates detected.',
        uavDataId,
      });
    }

    // Terrain Proximity (Ground collision risk)
    if (alt < 2 && airspeed > 40) {
      await this.create({
        type: FailureType.HARDWARE, // Або кастомний FLIGHT_DYNAMICS
        severity: Severity.CRITICAL,
        description: `Terrain Proximity: Low altitude (${alt}m) at high speed!`,
        uavDataId,
      });
    }

    // Legal limit
    if (alt > 120) {
      await this.create({
        type: FailureType.OTHER,
        severity: Severity.WARNING,
        description: `Legal Limit Warning: Altitude ${alt}m exceeds 120m limit.`,
        uavDataId,
      });
    }
  }

  /**
   * 2. AERODYNAMIC: Landing, Stall,  Кути
   */
  async checkFlightDynamics(
    vsi: UAVdata['verticalSpeed'],
    alt: UAVdata['altitude'],
    airspeed: UAVdata['airspeed'],
    pitch: UAVdata['pitch'],
    roll: UAVdata['roll'],
    uavDataId: UAVdata['id'],
  ) {
    // Hard Landing
    if (alt < 2 && vsi < -4.5) {
      await this.create({
        type: FailureType.HARDWARE,
        severity: Severity.CRITICAL,
        description: `Hard Landing CRITICAL: VSI ${vsi} m/s`,
        uavDataId,
      });
    } else if (alt < 5 && vsi < -3.5) {
      await this.create({
        type: FailureType.HARDWARE,
        severity: Severity.WARNING,
        description: `Hard Landing WARNING: VSI ${vsi} m/s`,
        uavDataId,
      });
    }

    // Stall
    if (airspeed < 45) {
      await this.create({
        type: FailureType.OTHER,
        severity: Severity.CRITICAL,
        description: `STALL CRITICAL: Airspeed ${airspeed} km/h`,
        uavDataId,
      });
    } else if (airspeed < 55) {
      await this.create({
        type: FailureType.OTHER,
        severity: Severity.WARNING,
        description: `STALL WARNING: Airspeed ${airspeed} km/h`,
        uavDataId,
      });
    }

    // Attitude (Pitch & Roll)
    if (Math.abs(pitch) > 45 || Math.abs(roll) > 60) {
      await this.create({
        type: FailureType.HARDWARE,
        severity: Severity.CRITICAL,
        description: `Unusual Attitude CRITICAL: P:${pitch} R:${roll}`,
        uavDataId,
      });
    } else if (Math.abs(pitch) > 25 || Math.abs(roll) > 45) {
      await this.create({
        type: FailureType.HARDWARE,
        severity: Severity.WARNING,
        description: `Unusual Attitude WARNING: P:${pitch} R:${roll}`,
        uavDataId,
      });
    }
  }

  /**
   * 3. HARDWARE: Gear, Battery, Overheat
   */
  async checkHardwareStatus(
    gear: UAVdata['gear_status'],
    alt: UAVdata['altitude'],
    battery: UAVdata['battery_level'],
    temp: UAVdata['temperature'],
    uavDataId: UAVdata['id'],
  ) {
    if (alt < 10 && gear === 0) {
      await this.create({
        type: FailureType.HARDWARE,
        severity: Severity.CRITICAL,
        description: 'GEAR UNSAFE: Retracted at low altitude!',
        uavDataId,
      });
    }

    if (battery < 15) {
      await this.create({
        type: FailureType.HARDWARE,
        severity: Severity.CRITICAL,
        description: `Low Battery CRITICAL: ${battery}%`,
        uavDataId,
      });
    } else if (battery < 30) {
      await this.create({
        type: FailureType.HARDWARE,
        severity: Severity.WARNING,
        description: `Low Battery WARNING: ${battery}%`,
        uavDataId,
      });
    }

    if (temp > 95) {
      await this.create({
        type: FailureType.HARDWARE,
        severity: Severity.CRITICAL,
        description: `Overheat CRITICAL: ${temp}°C`,
        uavDataId,
      });
    } else if (temp > 85) {
      await this.create({
        type: FailureType.HARDWARE,
        severity: Severity.WARNING,
        description: `Overheat WARNING: ${temp}°C`,
        uavDataId,
      });
    }
  }

  /**
   * 4. NETWORK: Signal, Latency, Time-out
   */
  async checkConnection(
    rssi: UAVdata['rssi'],
    latency: UAVdata['latency'],
    lastSeenMil: number,
    uavDataId: UAVdata['id'],
  ) {
    if (rssi) {
      if (rssi < -100) {
        await this.create({
          type: FailureType.NETWORK,
          severity: Severity.CRITICAL,
          description: `Signal Lost: RSSI ${rssi} dBm`,
          uavDataId,
        });
      } else if (rssi < -90) {
        await this.create({
          type: FailureType.NETWORK,
          severity: Severity.WARNING,
          description: `Weak Signal: RSSI ${rssi} dBm`,
          uavDataId,
        });
      }
    }
    if (latency) {
      if (latency > 1000) {
        await this.create({
          type: FailureType.NETWORK,
          severity: Severity.CRITICAL,
          description: `Control Lag CRITICAL: ${latency}ms`,
          uavDataId,
        });
      } else if (latency > 500) {
        await this.create({
          type: FailureType.NETWORK,
          severity: Severity.WARNING,
          description: `Control Lag WARNING: ${latency}ms`,
          uavDataId,
        });
      }
    }

    // Telemetry Timeout
    const timeDiff = (Date.now() - lastSeenMil) / 1000;
    if (timeDiff > 5) {
      await this.create({
        type: FailureType.NETWORK,
        severity: Severity.CRITICAL,
        description: 'Telemetry Timeout: No data for > 5s',
        uavDataId,
      });
    }
  }

  async create(data: CreateFailureDto): Promise<FailureLog> {
    return await this.prismaService.failureLog.create({ data });
  }

  async findAll(): Promise<FailureLog[]> {
    return await this.prismaService.failureLog.findMany();
  }

  async findOne(id: number): Promise<FailureLog | null> {
    return await this.prismaService.failureLog.findUnique({
      where: { id },
    });
  }

  async update(id: number, failureData: UpdateFailureDto): Promise<FailureLog> {
    return await this.prismaService.failureLog.update({
      where: { id },
      data: { ...failureData },
    });
  }

  async remove(id: number): Promise<FailureLog> {
    return await this.prismaService.failureLog.delete({
      where: {
        id,
      },
    });
  }
}
