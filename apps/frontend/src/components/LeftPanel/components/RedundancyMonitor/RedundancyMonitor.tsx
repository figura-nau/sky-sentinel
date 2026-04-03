import * as FAILURE_CONSTANTS from "@sky-sentinel/shared/failure-constants.ts";
import { getRoundedValue } from "@sky-sentinel/shared/utils.ts";
import { MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RedundancyMonitorProps {
  airspeed: number;
  groundSpeed: number;
}

export function RedundancyMonitor({
  airspeed,
  groundSpeed,
}: RedundancyMonitorProps) {
  const { t } = useTranslation();
  const delta = Math.abs(airspeed - groundSpeed);

  const isOk = Number(delta) <= FAILURE_CONSTANTS.PITOT_DIVERGENCE_MS;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col gap-1">
          <CardTitle>{t("redundancyMonitor.title")}</CardTitle>
          <CardDescription>
            {t("redundancyMonitor.description")}
          </CardDescription>
        </div>
        <CardAction>
          <MoreHorizontal size={14} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex items-center justify-between py-4">
        {/* Airspeed Section */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
            {t("redundancyMonitor.airspeed")}
          </span>
          <span className="text-3xl font-bold  text-foreground">
            {airspeed}
          </span>
        </div>

        <div className="h-12 w-px bg-border mx-2" />

        {/* GroundSpeed Section */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
            {t("redundancyMonitor.groundSpeed")}
          </span>
          <span className="text-3xl font-bold  text-foreground">
            {groundSpeed}
          </span>
        </div>

        {/* Visual Delta Chart */}
        <div className="flex items-end gap-4 ml-auto">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-end gap-1 h-12">
              <div
                className="w-4 bg-muted rounded-t-sm"
                style={{ height: "80%" }}
              />
              <div
                className={cn(
                  "w-4 rounded-t-sm transition-all duration-500",
                  isOk ? "bg-green-500" : "bg-red-500",
                )}
                style={{ height: "75%" }}
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px]  text-muted-foreground">
                Δ =
                {" "}
                {getRoundedValue(Number(delta))}
                {" "}
                m/s
              </span>
              <span
                className={cn(
                  "text-[10px] font-bold uppercase",
                  isOk ? "text-green-500" : "text-red-500",
                )}
              >
                {isOk ? t("redundancyMonitor.ok") : t("redundancyMonitor.fail")}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
