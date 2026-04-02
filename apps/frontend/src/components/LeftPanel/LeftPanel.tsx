import { useContext } from "react";
import { LatestTelemetryContext } from "@/providers";
import { HardwareHealth, RedundancyMonitor } from "./components";

export default function LeftPanel() {
  const latestData = useContext(LatestTelemetryContext);
  const { airspeed, groundspeed, battRem, temperature, rssi } = latestData || {
    airspeed: 0,
    groundspeed: 0,
    battRem: 0,
    temperature: 0,
    latency: 0,
    rssi: 0,
  };

  return (
    <aside className="h-full w-full flex flex-col justify-start items-center gap-y-4">
      <RedundancyMonitor airspeed={airspeed} groundSpeed={groundspeed} />
      <HardwareHealth battery={battRem} temp={temperature} rssi={rssi} />
    </aside>
  );
}
