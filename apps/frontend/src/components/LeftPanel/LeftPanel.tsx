import { useContext } from "react";
import { UavDataContext } from "@/providers";
import { HardwareHealth, RedundancyMonitor } from "./components";

export default function LeftPanel() {
  const uavData = useContext(UavDataContext);
  if (!uavData) return null;
  const { airspeed, groundSpeed, battery_level, temperature, latency } = uavData
    .data[uavData.data.length - 1] || {
    airspeed: 0,
    groundSpeed: 0,
    battery_level: 0,
    temperature: 0,
    latency: 0,
  };
  console.log("LeftPanel received uavData:", uavData);
  return (
    <aside className="h-full  w-full flex flex-col justify-start items-center gap-y-4">
      <RedundancyMonitor airspeed={airspeed} groundSpeed={groundSpeed} />
      <HardwareHealth
        battery={battery_level}
        temp={temperature}
        latency={latency}
      />
    </aside>
  );
}
