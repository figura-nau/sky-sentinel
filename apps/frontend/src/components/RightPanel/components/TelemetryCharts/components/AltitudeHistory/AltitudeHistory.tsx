import { TelemetryMiniChart } from "@/components/TelemetryMiniChart";
import { UavDataContext } from "@/providers";
import { useContext } from "react";

export default function AltitudeHistory() {
  const uavData = useContext(UavDataContext);
  if (!uavData) return null;
  const data = uavData.data.map((entry) => ({
    x: entry.timestamp,
    y: entry.altitude,
  }));

  return <TelemetryMiniChart title="Altitude History (m)" data={data} />;
}
