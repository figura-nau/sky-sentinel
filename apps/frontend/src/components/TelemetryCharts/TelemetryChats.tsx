import { Card, CardTitle } from "../ui";
import AltitudeHistory from "./components/AltitudeHistory/AltitudeHistory";
import BatteryLevelHistory from "./components/BatteryLevelHistory/BatteryLevelHistory";

export default function TelemetryChats() {
  return (
    <Card className="w-full p-4">
      <CardTitle>Telemetry Charts</CardTitle>
      <BatteryLevelHistory />
      <AltitudeHistory />
    </Card>
  );
}
