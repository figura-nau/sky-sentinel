import { FileText, Eye, MoreHorizontal } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const logEntries = [
  {
    time: "10:15:02",
    msg: "STALL DETECTED",
    status: "CRITICAL",
    variant: "critical",
    iconType: "file",
  },
  {
    time: "10:15:00",
    msg: "PROPULSION FAILURE",
    status: "GLIDE PROTOCOL",
    variant: "critical",
    iconType: "file",
  },
  {
    time: "10:14:55",
    msg: "LOW BATTERY",
    status: "WARNING - 15%",
    variant: "warning",
    iconType: "file",
  },
  {
    time: "10:14:50",
    msg: "DATA INTEGRITY",
    status: "VERIFIED - OK",
    variant: "success",
    iconType: "eye",
  },
  {
    time: "10:14:45",
    msg: "PITOT DISCREPANCY",
    status: "WARNING",
    variant: "warning",
    iconType: "file",
  },
];

export function EventDiagnosticLog() {
  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle>Event & Diagnostic Log</CardTitle>
        <CardAction>
          <MoreHorizontal size={14} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-0 px-0">
        {logEntries.map((entry, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3 border-b border-slate-900 last:border-0 hover:bg-slate-900/40 transition-colors"
          >
            {/* Status Indicator Dot */}
            <div
              className={cn(
                "h-5 w-5 shrink-0 rounded-full flex items-center justify-center",
                entry.variant === "critical" &&
                  "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]",
                entry.variant === "warning" && "bg-yellow-500",
                entry.variant === "success" && "bg-green-500",
              )}
            />

            {/* Text Content */}
            <div className="flex flex-col flex-1 gap-0.5">
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span>{entry.time}</span>
                <span className="opacity-30">|</span>
                <span className="font-bold text-slate-200">{entry.msg}</span>
              </div>
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-wider",
                  entry.variant === "critical" && "text-red-500",
                  entry.variant === "warning" && "text-yellow-500",
                  entry.variant === "success" && "text-green-500",
                )}
              >
                {entry.status}
              </span>
            </div>

            {/* Action Icon */}
            <div className="text-slate-600 cursor-pointer hover:text-slate-300 transition-colors">
              {entry.iconType === "file" ? (
                <FileText size={16} />
              ) : (
                <Eye size={16} />
              )}
            </div>
          </div>
        ))}
        {logEntries.length === 0 && (
          <div className="flex items-center justify-center h-32 text-slate-500">
            No log entries available.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
