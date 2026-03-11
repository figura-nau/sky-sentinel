// AiAnalyzeModal/AiAnalyzeModal.tsx
import { Download, AlertCircle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"; // Adjust import path to your shadcn dialog file
import {
  AiStatusHeader,
  DiagnosisDetails,
  AiRecommendations,
} from "./components";
import { useQuery } from "@tanstack/react-query";
import type { FailureLog } from "@prisma/client";
import { useTranslation } from "react-i18next";

interface AiAnalyzeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  failureLog: FailureLog;
}

export function AiAnalyzeModal({
  open,
  failureLog,
  onOpenChange,
}: AiAnalyzeModalProps) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { i18n } = useTranslation();
  const { data, isLoading, error } = useQuery({
    queryKey: ["ai-analyze", failureLog.id],
    queryFn: async () => {
      const response = await fetch(`${backendUrl}/ai/failure-analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...failureLog,
          responseLanguage: i18n.language,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch AI analysis");
      }

      return response.json();
    },
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-4xl p-0 gap-0 max-h-screen overflow-y-auto bg-slate-950/90 backdrop-blur-xl border-slate-800 shadow-2xl rounded-xl"
      >
        <DialogTitle className="sr-only">
          Incident Forensics Analysis
        </DialogTitle>

        <div className="p-6 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
              <p className="font-mono text-sm tracking-widest uppercase animate-pulse">
                Analyzing Telemetry...
              </p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-rose-500">
              <AlertCircle className="w-12 h-12" />
              <p className="font-mono text-sm tracking-widest uppercase">
                Analysis Failed: {(error as Error).message}
              </p>
            </div>
          ) : (
            <>
              <AiStatusHeader
                severity={data.analysis.severity}
                timestamp={failureLog.timestamp}
              />

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-5">
                  <DiagnosisDetails uavData={data.telemetry} />
                </div>
                <div className="md:col-span-7">
                  <AiRecommendations
                    rootCause={data.analysis.root_cause}
                    explanation={data.analysis.explanation}
                    suggestedAction={data.analysis.suggested_action}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="border-t border-slate-800 bg-slate-950/50 gap-4 p-4 px-6 flex flex-wrap items-center justify-center">
          <Button
            variant="outline"
            disabled={isLoading || !!error}
            className="border-slate-700 text-slate-300 hover:text-slate-100 hover:bg-slate-800"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF Report
          </Button>

          <div className="flex flex-wrap justify-center items-center gap-3">
            <Button
              variant="destructive"
              disabled={isLoading || !!error}
              className="bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all hover:shadow-[0_0_20px_rgba(220,38,38,0.6)]"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Execute Failsafe (RTL)
            </Button>

            <DialogClose asChild>
              <Button className="bg-slate-100 text-slate-900 hover:bg-white transition-colors">
                <X className="w-4 h-4 mr-2" />
                Acknowledge & Close
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
