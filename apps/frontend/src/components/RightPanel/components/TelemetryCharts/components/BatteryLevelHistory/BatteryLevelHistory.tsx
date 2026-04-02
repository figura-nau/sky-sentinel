import { TelemetryMiniChart } from "@/components/TelemetryMiniChart";
import { ChartsHistoryContext } from "@/providers";
import { useContext } from "react";
import { useTranslation } from "react-i18next";

export default function BatteryLevelHistory() {
  const { t } = useTranslation();
  const chartsHistory = useContext(ChartsHistoryContext);
  const data = chartsHistory.map((entry) => ({
    x: new Date(entry.timestamp).getTime(),
    y: entry.battRem,
  }));
  return (
    <TelemetryMiniChart
      title={t("telemetryCharts.batteryLevelHistory")}
      data={data}
    />
  );
}
