import { ArrowDown, ArrowLeft, ArrowUp, ArrowDownRight } from "lucide-react";

export function DiagnosisDetails() {
  return (
    <div className="flex flex-col space-y-3">
      <h3 className="text-sm font-medium text-slate-300">The Evidence</h3>
      
      {/* Black-box terminal container */}
      <div className="relative bg-[#0a0a0a] border border-slate-800 rounded-lg p-4 overflow-hidden group">
        {/* CRT Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(transparent_50%,rgba(255,255,255,1)_50%)] bg-size-[100%_4px] z-10" />
        
        <h4 className="text-xs text-slate-400 mb-4 tracking-wider uppercase">
          Telemetry Snapshot
        </h4>
        
        <div className="space-y-3 font-mono text-sm relative z-20">
          {/* Pitch */}
          <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-2 text-slate-300">
              <ArrowDown className="w-4 h-4 text-slate-500" />
              <span>Pitch:</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-100">+34.5°</span>
              <div className="w-5 h-5 rounded bg-rose-950/50 flex items-center justify-center border border-rose-900/50">
                <ArrowDown className="w-3 h-3 text-rose-500" />
              </div>
            </div>
          </div>

          {/* Roll */}
          <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-2 text-slate-300">
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Roll:</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-100">-12.1°</span>
              <div className="w-5 h-5 rounded bg-emerald-950/50 flex items-center justify-center border border-emerald-900/50">
                <ArrowLeft className="w-3 h-3 text-emerald-500" />
              </div>
            </div>
          </div>

          {/* Throttle */}
          <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-2 text-slate-300">
              <ArrowUp className="w-4 h-4 text-slate-500" />
              <span>Throttle:</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-100">88%</span>
              <div className="w-5 h-5 rounded bg-emerald-950/50 flex items-center justify-center border border-emerald-900/50">
                <ArrowUp className="w-3 h-3 text-emerald-500" />
              </div>
            </div>
          </div>

          {/* VSI */}
          <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-2 text-slate-300">
              <ArrowDown className="w-4 h-4 text-slate-500" />
              <span>VSI:</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-100">-15.2 m/s</span>
              <div className="w-5 h-5 rounded bg-rose-950/50 flex items-center justify-center border border-rose-900/50">
                <ArrowDownRight className="w-3 h-3 text-rose-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}