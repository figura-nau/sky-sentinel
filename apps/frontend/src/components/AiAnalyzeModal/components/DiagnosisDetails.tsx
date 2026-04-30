import type { UAVdata } from "@sky-sentinel/database";
import * as FAILURE_CONSTANTS from "@sky-sentinel/shared/failure-constants.ts";
import { ArrowDown, ArrowLeft, ArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DiagnosisDetailsProps {
  uavData: UAVdata;
}

export function DiagnosisDetails({ uavData }: DiagnosisDetailsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col space-y-3">
      <h3 className="text-sm font-medium text-slate-300">
        {t("aiAnalyzeModal.panels.evidence.title")}
      </h3>

      {/* Black-box terminal container */}
      <div className="relative bg-[#0a0a0a] border border-slate-800 rounded-lg p-4 overflow-hidden group">
        {/* CRT Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(transparent_50%,rgba(255,255,255,1)_50%)] bg-size-[100%_4px] z-10" />

        <h4 className="text-xs text-slate-400 mb-4 tracking-wider uppercase">
          {t("aiAnalyzeModal.panels.evidence.snapshot")}
        </h4>

        <div className="space-y-3  text-sm relative z-20">
          {/* Pitch */}
          <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-2 text-slate-300">
              <ArrowDown className="w-4 h-4 text-slate-500" />
              <span>
                {t("aiAnalyzeModal.panels.evidence.pitch")}
                :
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-100">
                {uavData.pitch.toFixed(1)}
                °
              </span>
              <div className="w-5 h-5 rounded bg-rose-950/50 flex items-center justify-center border border-rose-900/50">
                <ArrowDown
                  className={`w-3 h-3 ${uavData.pitch > FAILURE_CONSTANTS.PITCH_CRIT_DEG ? "text-rose-500" : "text-slate-500"}`}
                />
              </div>
            </div>
          </div>

          {/* Roll */}
          <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-2 text-slate-300">
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>
                {t("aiAnalyzeModal.panels.evidence.roll")}
                :
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-100">
                {uavData.roll.toFixed(1)}
                °
              </span>
              <div className="w-5 h-5 rounded bg-emerald-950/50 flex items-center justify-center border border-emerald-900/50">
                <ArrowLeft
                  className={`w-3 h-3 ${Math.abs(uavData.roll) > FAILURE_CONSTANTS.ROLL_CRIT_DEG ? "text-rose-500" : "text-emerald-500"}`}
                />
              </div>
            </div>
          </div>

          {/* Throttle */}
          <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-2 text-slate-300">
              <ArrowUp className="w-4 h-4 text-slate-500" />
              <span>
                {t("aiAnalyzeModal.panels.evidence.throttle")}
                :
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-100">
                {(uavData.throttle * 100).toFixed(0)}
                %
              </span>
              <div className="w-5 h-5 rounded bg-emerald-950/50 flex items-center justify-center border border-emerald-900/50">
                <ArrowUp className="w-3 h-3 text-emerald-500" />
              </div>
            </div>
          </div>

          {/* VSI */}
          {/* <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-2 text-slate-300">
              <ArrowDown className="w-4 h-4 text-slate-500" />
              <span>{t("aiAnalyzeModal.panels.evidence.vsi")}:</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-100">{uavData.verticalSpeed.toFixed(1)} m/s</span>
              <div className="w-5 h-5 rounded bg-rose-950/50 flex items-center justify-center border border-rose-900/50">
                <ArrowDownRight className={`w-3 h-3 ${uavData.verticalSpeed < -5 ? "text-rose-500" : "text-slate-500"}`} />
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
