import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DialogClose } from "@/components/ui/dialog";

interface AiStatusHeaderProps {
  severity: string;
  timestamp: Date;
}

export function AiStatusHeader({ severity, timestamp }: AiStatusHeaderProps) {
  const formattedTime = new Date(timestamp).toLocaleTimeString();

  return (
    <div className="flex flex-wrap items-start justify-between mb-6 gap-3">
      <div className="space-y-2">
        <h2 className="text-xl font-mono font-bold tracking-wider text-slate-100 uppercase flex items-center gap-2">
          INCIDENT FORENSICS
        </h2>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
          <span className="text-xs font-semibold text-slate-400 tracking-widest uppercase">
            Live Analysis — {formattedTime}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 justify-between">
        <Badge
          variant={severity === "CRITICAL" ? "destructive" : "outline"}
          className={`px-3 py-1 font-mono tracking-widest rounded-md ${
            severity === "CRITICAL"
              ? "bg-red-950/40 text-red-500 border border-red-800 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
              : "bg-slate-900/40 text-slate-400 border border-slate-800"
          }`}
        >
          {severity}
        </Badge>
        <DialogClose>
          <button className="text-slate-500 cursor-pointer hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </DialogClose>
      </div>
    </div>
  );
}
