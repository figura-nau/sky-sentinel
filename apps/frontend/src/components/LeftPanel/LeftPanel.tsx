import { useContext } from "react";
import { LatestTelemetryContext } from "@/providers";
import { HardwareHealth, RedundancyMonitor } from "./components";

export default function LeftPanel() {
  const latestData = useContext(LatestTelemetryContext);
  const { airspeed, groundSpeed, battery_level, temperature, latency, rssi } =
    latestData || {
      airspeed: 0,
      groundSpeed: 0,
      battery_level: 0,
      temperature: 0,
      latency: 0,
      rssi: 0
    };

  return (
    <aside className="h-full w-full flex flex-col justify-start items-center gap-y-4">
      <RedundancyMonitor airspeed={airspeed} groundSpeed={groundSpeed} />
      <HardwareHealth
        battery={battery_level}
        temp={temperature}
        latency={latency}
        rssi={rssi}
      />
    </aside>
  );
}
