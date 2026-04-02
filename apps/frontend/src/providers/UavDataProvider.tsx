import type { UAVdata } from "@prisma/client";
import { createContext } from "react";

export type FlightPathPoint = { lat: number; lng: number };

// 1. Contexts
export const LatestTelemetryContext = createContext<UAVdata | null>(null);
export const FlightHistoryContext = createContext<FlightPathPoint[]>([]);
export const ChartsHistoryContext = createContext<UAVdata[]>([]);

// 2. Separate Providers
export function LatestTelemetryProvider({
  value,
  children,
}: {
  value: UAVdata | null;
  children: React.ReactNode;
}) {
  return (
    <LatestTelemetryContext.Provider value={value}>
      {children}
    </LatestTelemetryContext.Provider>
  );
}

export function FlightHistoryProvider({
  value,
  children,
}: {
  value: FlightPathPoint[];
  children: React.ReactNode;
}) {
  return (
    <FlightHistoryContext.Provider value={value}>
      {children}
    </FlightHistoryContext.Provider>
  );
}

export function ChartsHistoryProvider({
  value,
  children,
}: {
  value: UAVdata[];
  children: React.ReactNode;
}) {
  return (
    <ChartsHistoryContext.Provider value={value}>
      {children}
    </ChartsHistoryContext.Provider>
  );
}
