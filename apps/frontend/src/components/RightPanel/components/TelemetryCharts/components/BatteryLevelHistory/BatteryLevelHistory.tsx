import { TelemetryMiniChart } from "@/components/TelemetryMiniChart";
import { UavDataContext } from "@/providers";
import { useContext } from "react";

export default function BatteryLevelHistory() {
  const uavData = useContext(UavDataContext);
  if (!uavData) return null;
  const data = uavData.data.map((entry) => ({
    x: entry.timestamp,
    y: entry.battery_level,
  }));

  return <TelemetryMiniChart title="Battery Level History (%)" data={data} />;
}
