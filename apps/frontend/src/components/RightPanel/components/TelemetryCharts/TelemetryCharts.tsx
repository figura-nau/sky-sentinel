import type { UAVdata } from "@sky-sentinel/database";
import { use } from "react";
import { useTranslation } from "react-i18next";
import { TelemetryMiniChart } from "@/components/TelemetryMiniChart";
import { Card, CardTitle, CardHeader } from "@/components/ui/card";
import { ChartsHistoryContext } from "@/providers/UavDataProviders/ChartsHistoryContext";

interface ChartConfig {
  field: keyof UAVdata;
  titleKey: string;
  color: string;
  multiplier?: number;
}

const CHART_CONFIGS: ChartConfig[] = [
  { field: "altitude", titleKey: "altitudeHistory", color: "#3b82f6" },
  { field: "battRem", titleKey: "batteryLevelHistory", color: "#10b981" },
  { field: "airspeed", titleKey: "airspeedHistory", color: "#06b6d4" },
  { field: "groundspeed", titleKey: "groundSpeedHistory", color: "#6366f1" },
  { field: "pitch", titleKey: "pitchHistory", color: "#f59e0b" },
  { field: "roll", titleKey: "rollHistory", color: "#8b5cf6" },
  {
    field: "throttle",
    titleKey: "throttleHistory",
    color: "#ec4899",
    multiplier: 100,
  },
  { field: "temperature", titleKey: "temperatureHistory", color: "#ef4444" },
  { field: "rssi", titleKey: "rssiHistory", color: "#14b8a6" },
  { field: "servoCurrent", titleKey: "servoCurrentHistory", color: "#a855f7" },
];

export default function TelemetryCharts() {
  const { t } = useTranslation();
  const chartsHistory = use(ChartsHistoryContext);

  return (
    <Card className="w-full bg-slate-950/20 border-slate-900 shadow-xl overflow-hidden">
      <CardHeader className="border-b border-slate-900 bg-slate-950/40 px-6 py-4">
        <CardTitle className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <div className="w-2 h-6 bg-primary rounded-full" />
          {t("telemetryCharts.title")}
        </CardTitle>
      </CardHeader>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {CHART_CONFIGS.map((config) => {
          const chartData = chartsHistory.map(entry => ({
            x: new Date(entry.timestamp).getTime(),
            y: Number(
              (
                (entry[config.field] as number) * (config.multiplier || 1)
              ).toFixed(4),
            ),
          }));

          return (
            <div
              key={config.field}
              className="transition-transform hover:scale-[1.02] duration-200"
            >
              <TelemetryMiniChart
                title={t(`telemetryCharts.${config.titleKey}`)}
                data={chartData}
                color={config.color}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
