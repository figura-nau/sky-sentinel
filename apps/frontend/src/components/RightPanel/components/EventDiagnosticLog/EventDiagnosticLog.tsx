import { FileText, MoreHorizontal } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Severity } from "@prisma/client";
import { useGetFailureLogs } from "./hooks";
import { Virtualizer } from "@/components/Virtualizer";
import { useTranslation } from "react-i18next";

export function EventDiagnosticLog() {
  const { failureLogs } = useGetFailureLogs();
  const { t, i18n } = useTranslation();

  return (
    <Card className="h-full max-h-80 w-full">
      <CardHeader>
        <CardTitle>{t("eventLog.title")}</CardTitle>
        <CardAction>
          <MoreHorizontal size={14} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex h-full overflow-y-auto flex-col gap-0 px-0">
        {failureLogs.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            {t("eventLog.noEntries")}
          </div>
        )}
        {failureLogs && (
          <Virtualizer>
            {failureLogs.map((entry, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
              >
                {/* Status Indicator Dot */}
                <div
                  className={cn(
                    "h-5 w-5 shrink-0 rounded-full flex items-center justify-center",
                    entry.severity === Severity.CRITICAL &&
                      "bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.5)]",
                    entry.severity === Severity.WARNING && "bg-yellow-500",
                    entry.severity === Severity.INFO && "bg-green-500",
                  )}
                />

                {/* Text Content */}
                <div className="flex flex-col flex-1 gap-0.5">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                    <span>
                      {new Date(entry.timestamp).toLocaleString(
                        i18n.language === "ua" ? "uk-UA" : "en-US",
                      )}
                    </span>
                    <span className="opacity-30">|</span>
                    <span className="font-bold text-foreground">
                      {entry.description}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-black uppercase tracking-wider",
                      entry.severity === Severity.CRITICAL && "text-destructive",
                      entry.severity === Severity.WARNING && "text-yellow-500",
                      entry.severity === Severity.INFO && "text-green-500",
                    )}
                  >
                    {entry.isResolved
                      ? t("eventLog.resolved")
                      : t("eventLog.active")}
                  </span>
                </div>

                {/* Action Icon */}
                <div className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  <FileText size={16} />
                </div>
              </div>
            ))}
          </Virtualizer>
        )}
      </CardContent>
    </Card>
  );
}
