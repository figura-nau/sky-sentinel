import * as FAILURE_CONSTANTS from "@sky-sentinel/shared/failure-constants.ts";
import { getRoundedValue } from "@sky-sentinel/shared/utils.ts";
import { Battery, Thermometer, MoreHorizontal, Wifi } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { cn } from "@/lib/utils";

interface HardwareHealthProps {
  battery: number;
  temp: number;
  rssi: number;
}

export function HardwareHealth({ battery, temp, rssi }: HardwareHealthProps) {
  const { t } = useTranslation();

  const getBatteryColor = (val: number) => {
    if (val < FAILURE_CONSTANTS.BATT_CRITICAL_PCT)
      return "text-red-500 border-red-500/20 bg-red-500/10 shadow-[inset_0_0_15px_rgba(239,68,68,0.1)]";
    if (val < FAILURE_CONSTANTS.BATT_WARNING_PCT)
      return "text-yellow-500 border-yellow-500/20 bg-yellow-500/10 shadow-[inset_0_0_15px_rgba(234,179,8,0.1)]";
    return "text-green-500 border-green-500/20 bg-green-500/10 shadow-[inset_0_0_15px_rgba(34,197,94,0.1)]";
  };

  const getTempColor = (val: number) => {
    if (val > FAILURE_CONSTANTS.TEMP_CRIT)
      return "text-red-500 border-red-500/20 bg-red-500/10";
    if (val > FAILURE_CONSTANTS.TEMP_WARN)
      return "text-yellow-500 border-yellow-500/20 bg-yellow-500/10";
    return "text-blue-500 border-blue-500/20 bg-blue-500/10";
  };

  // const getLatencyColor = (val: number) => {
  //   if (val > 800) return "text-red-500 border-red-500/20 bg-red-500/10";
  //   if (val > 150)
  //     return "text-yellow-500 border-yellow-500/20 bg-yellow-500/10";
  //   return "text-cyan-500 border-cyan-500/20 bg-cyan-500/10";
  // };

  const getRssiColor = (val: number) => {
    if (val < -FAILURE_CONSTANTS.RSSI_CRIT)
      return "text-red-500 border-red-500/20 bg-red-500/10";
    if (val < -FAILURE_CONSTANTS.RSSI_WARN)
      return "text-yellow-500 border-yellow-500/20 bg-yellow-500/10";
    return "text-emerald-500 border-emerald-500/20 bg-emerald-500/10";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("hardwareHealth.title")}</CardTitle>
        <CardAction>
          <MoreHorizontal size={14} />
        </CardAction>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 pb-4">
        {/* Battery Container */}
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border p-3 transition-colors",
            getBatteryColor(battery),
          )}
        >
          <Battery className="h-6 w-6" />
          <span className="text-lg font-bold">
            {getRoundedValue(battery)}
            %
          </span>
        </div>

        {/* Temperature Container */}
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border p-3 transition-colors",
            getTempColor(temp),
          )}
        >
          <div className="relative">
            <Thermometer className="h-6 w-6" />
          </div>
          <span className="text-lg font-bold">
            {temp.toFixed(2)}
            °C
          </span>
        </div>

        {/* RSSI Container */}
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border p-3 transition-colors",
            getRssiColor(rssi),
          )}
        >
          <Wifi className="h-6 w-6" />
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase font-bold opacity-70">
              RSSI
            </span>
            <span className="text-lg font-bold">
              {getRoundedValue(rssi)}
              {" "}
              dBm
            </span>
          </div>
        </div>

        {/* Latency Container */}
        {/* <div
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border p-3 transition-colors",
            getLatencyColor(latency),
          )}
        >
          <div className="flex items-end gap-0.5 h-6">
            <div className="w-1 h-2 bg-current rounded-t-sm" />
            <div className="w-1 h-3 bg-current rounded-t-sm" />
            <div className="w-1 h-4 bg-current rounded-t-sm" />
            <div className="w-1 h-5 bg-current rounded-t-sm" />
            <div className="w-1 h-6 bg-current/30 rounded-t-sm" />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase font-bold opacity-70">
              {t("hardwareHealth.latency")}
            </span>
            <span className="text-xs font-bold">{latency.toFixed(2)}ms</span>
          </div>
        </div> */}
      </CardContent>
    </Card>
  );
}
