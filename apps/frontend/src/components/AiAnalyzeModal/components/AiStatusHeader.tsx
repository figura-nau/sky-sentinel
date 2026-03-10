import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AiStatusHeader() {
  return (
    <div className="flex items-start justify-between mb-6">
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
            Live Analysis
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Badge 
          variant="destructive" 
          className="bg-red-950/40 text-red-500 border border-red-800 shadow-[0_0_15px_rgba(220,38,38,0.3)] px-3 py-1 font-mono tracking-widest rounded-md"
        >
          CRITICAL
        </Badge>
        <button className="text-slate-500 cursor-pointer hover:text-slate-300 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}