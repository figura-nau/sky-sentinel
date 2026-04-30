import type { UAVdata } from "@sky-sentinel/database";
import { LatestTelemetryContext } from "./latest-telemetry.context";

export function LatestTelemetryProvider({
  value,
  children,
}: {
  value: UAVdata | null;
  children: React.ReactNode;
}) {
  return (
    <LatestTelemetryContext value={value}>{children}</LatestTelemetryContext>
  );
}
