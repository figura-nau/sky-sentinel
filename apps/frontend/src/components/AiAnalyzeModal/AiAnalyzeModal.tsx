// AiAnalyzeModal/AiAnalyzeModal.tsx
import { Download, AlertCircle, X } from "lucide-react";
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

interface AiAnalyzeModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AiAnalyzeModal({ open, onOpenChange }: AiAnalyzeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-4xl p-0 gap-0 bg-slate-950/90 backdrop-blur-xl border-slate-800 shadow-2xl rounded-xl overflow-hidden"
      >
        <DialogTitle className="sr-only">
          Incident Forensics Analysis
        </DialogTitle>

        <div className="p-6 overflow-y-auto">
          <AiStatusHeader />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5">
              <DiagnosisDetails />
            </div>
            <div className="md:col-span-7">
              <AiRecommendations />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 bg-slate-950/50 p-4 px-6 flex items-center justify-between">
          <div>
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300 hover:text-slate-100 hover:bg-slate-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF Report
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="destructive"
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
