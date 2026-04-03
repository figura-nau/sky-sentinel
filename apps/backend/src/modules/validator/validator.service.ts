import { Injectable } from '@nestjs/common';
import { UAVdata } from '@prisma/client';

export interface UAVdataPacket {
  data: UAVdata;
  checksum: string;
}

@Injectable()
export class ValidatorService {
  private serializeForPython(val: unknown): string {
    if (val === null || val === undefined) return 'None';
    if (typeof val === 'boolean') return val ? 'True' : 'False';
    if (val instanceof Date) return val.toISOString();

    if (typeof val === 'number') {
      const normalized = Math.round(val * 10000) / 10000 + 0;
      return normalized.toString();
    }

    if (Array.isArray(val)) {
      return `${val.map((v) => this.serializeForPython(v)).join(',')}`;
    }
    if (val instanceof Object && !Array.isArray(val)) {
      const entries = Object.entries(val as Record<string, unknown>)
        .map(([k, v]) => `'${k}': ${this.serializeForPython(v)}`)
        .join(', ');

      return `{${entries}}`;
    }

    return String(val); // eslint-disable-line @typescript-eslint/no-base-to-string
  }

  public calculateUavChecksum(data: Record<string, any>): string {
    const sortedKeys = Object.keys(data).sort();
    const payloadString = sortedKeys
      .map((key) => `${key}:${this.serializeForPython(data[key])}`)
      .join('|');

    console.log(`JS PAYLOAD: ${payloadString}`);

    let calculatedChecksum = 0;
    for (let i = 0; i < payloadString.length; i++) {
      calculatedChecksum ^= payloadString.charCodeAt(i);
    }
    console.log(`JS DEBUG: Checksum ${calculatedChecksum}`);
    return calculatedChecksum.toString(16).toUpperCase().padStart(2, '0');
  }

  validate(packet: UAVdataPacket): boolean {
    try {
      const { data, checksum } = packet;

      const hexResult = this.calculateUavChecksum(data);

      const isValid = hexResult === checksum.toUpperCase();

      if (!isValid) {
        console.error(
          `🚨 [Валідація] Чексума невідповідність! Очікуване: ${hexResult}, Отримане: ${checksum}`,
        );
      }
      // console.log('✅ [Валідація] Чексума відповіднітсть!');
      return isValid;
    } catch (error) {
      console.error('🆘 [Валідація] Помилка при валідації даних:', error);
      return false;
    }
  }
}
