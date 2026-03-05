export type FailureType =
  | "HARDWARE"
  | "SOFTWARE" // Помилки цілісності даних (XOR)
  | "NETWORK" // Проблеми зі зв'язком (RSSI/Latency)
  | "AERODYNAMIC" // Звалювання (Stall)
  | "FLIGHT_DYNAMICS" // Жорсткі посадки (Hard Landing)
  | "OTHER";

export type Severity = "CRITICAL" | "WARNING" | "INFO";

export type FailureLog = {
  id: string;
  uavDataId: string;
  timestamp: Date;
  type: string;
  severity: Severity;
  description: string;
  isResolved: string;
};

export type UAVdata = {
  id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  altitude: number;
  verticalSpeed: number;
  airspeed: number;
  pitch: number;
  roll: number;
  gear_status: number;
  battery_level: number;
  temperature: number;
  rssi: number;
  latency: number;
  groundSpeed: number;
  throttle: number;
  servoCurrent: number;
};
