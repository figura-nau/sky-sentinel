import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Battery, Thermometer, MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

interface HardwareHealthProps {
  battery: number;
  temp: number;
  latency: number;
}

export function HardwareHealth({
  battery,
  temp,
  latency,
}: HardwareHealthProps) {
  const { t } = useTranslation();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("hardwareHealth.title")}</CardTitle>
        <CardAction>
          <MoreHorizontal size={14} />
        </CardAction>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3 pb-4">
        {/* Battery Container */}
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3 shadow-[inset_0_0_15px_rgba(34,197,94,0.1)]">
          <Battery className="h-8 w-8 text-green-500" />
          <span className="text-lg font-bold font-mono text-green-500">
            {battery}%
          </span>
        </div>

        {/* Temperature Container */}
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card/40 p-3">
          <div className="relative">
            <Thermometer className="h-8 w-8 text-yellow-500" />
            {/* Simple visual semi-circle track simulation */}
            <div className="absolute -inset-1 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full rotate-45" />
          </div>
          <span className="text-lg font-bold font-mono text-yellow-500">
            {temp}°C
          </span>
        </div>

        {/* Latency Container */}
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card/40 p-3">
          <div className="flex items-end gap-0.5 h-8">
            <div className="w-1.5 h-2 bg-cyan-500 rounded-t-sm" />
            <div className="w-1.5 h-4 bg-cyan-500 rounded-t-sm" />
            <div className="w-1.5 h-5 bg-cyan-500 rounded-t-sm" />
            <div className="w-1.5 h-7 bg-cyan-500 rounded-t-sm" />
            <div className="w-1.5 h-8 bg-cyan-500/30 rounded-t-sm" />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase font-bold text-muted-foreground">
              {t("hardwareHealth.latency")}
            </span>
            <span className="text-xs font-bold font-mono text-cyan-500">
              {latency}ms
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
