import { MoreHorizontal } from "lucide-react";
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
  const delta = Math.abs(airspeed - groundSpeed);
  const isOk = delta <= 15; 

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col gap-1">
          <CardTitle>Analytical Redundancy Monitor</CardTitle>
          <CardDescription>
            References principles from Lecture №10
          </CardDescription>
        </div>
        <CardAction>
          <MoreHorizontal size={14} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex items-center justify-between py-4">
        {/* Airspeed Section */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
            Airspeed
            <br />
            (Pitot):
          </span>
          <span className="text-3xl font-bold font-mono text-white">
            {airspeed}
          </span>
        </div>

        <div className="h-12 w-px bg-slate-800 mx-2" />

        {/* GroundSpeed Section */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
            GroundSpeed
            <br />
            (GPS):
          </span>
          <span className="text-3xl font-bold font-mono text-white">
            {groundSpeed}
          </span>
        </div>

        {/* Visual Delta Chart */}
        <div className="flex items-end gap-4 ml-auto">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-end gap-1 h-12">
              <div
                className="w-4 bg-slate-700 rounded-t-sm"
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
              <span className="text-[10px] font-mono text-slate-400">
                Δ = {delta}
              </span>
              <span
                className={cn(
                  "text-[10px] font-bold uppercase",
                  isOk ? "text-green-500" : "text-red-500",
                )}
              >
                {isOk ? "OK" : "FAIL"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
