import type { FailureLog } from "@sky-sentinel/database";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Font,
} from "@react-pdf/renderer";
import { useQuery } from "@tanstack/react-query";
import { Download, AlertCircle, X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AiStatusHeader,
  DiagnosisDetails,
  AiRecommendations,
} from "./components";

interface AiAnalyzeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  failureLog: FailureLog;
}

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: "bold",
    },
  ],
});

const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Roboto",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: "#1e293b",
    paddingBottom: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    fontSize: 10,
    color: "#64748b",
    width: 100,
  },
  value: {
    fontSize: 10,
    color: "#1e293b",
    fontWeight: "bold",
  },
  highlightBox: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
  },
  criticalBox: {
    backgroundColor: "#fff1f2",
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#e11d48",
    marginBottom: 15,
  },
  warningBox: {
    backgroundColor: "#fffbeb",
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#d97706",
  },
  rootCauseText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#e11d48",
    marginBottom: 5,
  },
  bodyText: {
    fontSize: 10,
    color: "#334155",
    lineHeight: 1.5,
  },
  telemetryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  telemetryItem: {
    width: "48%",
    backgroundColor: "#f1f5f9",
    padding: 8,
    borderRadius: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#94a3b8",
  },
});

function AiFailureReport({
  analysis,
  telemetry,
  failureLog,
  t,
}: {
  analysis: any;
  telemetry: any;
  failureLog: FailureLog;
  t: any;
}) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header}>
          <View>
            <Text style={pdfStyles.title}>
              {t("aiAnalyzeModal.report.title")}
            </Text>
            <Text style={pdfStyles.subtitle}>
              {t("aiAnalyzeModal.report.subtitle")}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={pdfStyles.value}>
              {new Date(failureLog.timestamp).toLocaleString()}
            </Text>
            <Text style={pdfStyles.label}>
              {t("aiAnalyzeModal.report.incidentId")}
              :
              {failureLog.id.slice(0, 8)}
            </Text>
          </View>
        </View>

        {/* Overview */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>
            {t("aiAnalyzeModal.report.overview")}
          </Text>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>
              {t("aiAnalyzeModal.report.description")}
              :
            </Text>
            <Text style={pdfStyles.value}>{failureLog.description}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>
              {t("aiAnalyzeModal.report.severity")}
              :
            </Text>
            <Text
              style={[
                pdfStyles.value,
                {
                  color: analysis.severity === "CRITICAL" ? "#e11d48" : "#d97706",
                },
              ]}
            >
              {analysis.severity}
            </Text>
          </View>
        </View>

        {/* AI Analysis */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>
            {t("aiAnalyzeModal.report.aiDiagnostic")}
          </Text>
          <View style={pdfStyles.criticalBox}>
            <Text style={pdfStyles.rootCauseText}>
              {t("aiAnalyzeModal.status.rootCause")}
              :
              {analysis.root_cause}
            </Text>
            <Text style={pdfStyles.bodyText}>{analysis.explanation}</Text>
          </View>

          <Text
            style={[
              pdfStyles.sectionTitle,
              { borderBottomWidth: 0, marginBottom: 5 },
            ]}
          >
            {t("aiAnalyzeModal.report.suggestedRemediation")}
          </Text>
          <View style={pdfStyles.warningBox}>
            <Text style={pdfStyles.bodyText}>{analysis.suggested_action}</Text>
          </View>
        </View>

        {/* Telemetry Snapshot */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>
            {t("aiAnalyzeModal.report.telemetryEvidence")}
          </Text>
          <View style={pdfStyles.telemetryGrid}>
            <View style={pdfStyles.telemetryItem}>
              <Text style={pdfStyles.label}>
                {t("aiAnalyzeModal.panels.evidence.pitch")}
              </Text>
              <Text style={pdfStyles.value}>
                {telemetry.pitch.toFixed(2)}
                °
              </Text>
            </View>
            <View style={pdfStyles.telemetryItem}>
              <Text style={pdfStyles.label}>
                {t("aiAnalyzeModal.panels.evidence.roll")}
              </Text>
              <Text style={pdfStyles.value}>
                {telemetry.roll.toFixed(2)}
                °
              </Text>
            </View>
            <View style={pdfStyles.telemetryItem}>
              <Text style={pdfStyles.label}>
                {t("aiAnalyzeModal.panels.evidence.throttle")}
              </Text>
              <Text style={pdfStyles.value}>
                {(telemetry.throttle * 100).toFixed(0)}
                %
              </Text>
            </View>
            <View style={pdfStyles.telemetryItem}>
              <Text style={pdfStyles.label}>
                {t("aiAnalyzeModal.report.verticalSpeed")}
              </Text>
              <Text style={pdfStyles.value}>
                {telemetry.verticalSpeed.toFixed(2)}
                {" "}
                m/s
              </Text>
            </View>
            <View style={pdfStyles.telemetryItem}>
              <Text style={pdfStyles.label}>
                {t("aiAnalyzeModal.report.airspeed")}
              </Text>
              <Text style={pdfStyles.value}>
                {telemetry.airspeed.toFixed(2)}
                {" "}
                m/s
              </Text>
            </View>
            <View style={pdfStyles.telemetryItem}>
              <Text style={pdfStyles.label}>
                {t("aiAnalyzeModal.report.altitude")}
              </Text>
              <Text style={pdfStyles.value}>
                {telemetry.altitude.toFixed(1)}
                {" "}
                m
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={pdfStyles.footer}>
          <Text>{t("aiAnalyzeModal.report.confidential")}</Text>
          <Text>
            {t("aiAnalyzeModal.report.page")}
            {" "}
            1 of 1
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export function AiAnalyzeModal({
  open,
  failureLog,
  onOpenChange,
}: AiAnalyzeModalProps) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { i18n, t } = useTranslation();
  const responseLanguage = i18n.language;
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
          responseLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error(t("aiAnalyzeModal.status.failed"));
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
          {t("aiAnalyzeModal.title")}
        </DialogTitle>

        <div className="p-6 flex flex-col">
          {isLoading
            ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                  <p className=" text-sm tracking-widest uppercase animate-pulse">
                    {t("aiAnalyzeModal.status.analyzing")}
                  </p>
                </div>
              )
            : error
              ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 text-rose-500">
                    <AlertCircle className="w-12 h-12" />
                    <p className=" text-sm tracking-widest uppercase">
                      {t("aiAnalyzeModal.status.failed")}
                      :
                      {(error as Error).message}
                    </p>
                  </div>
                )
              : (
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
            disabled={isLoading || !!error || !data}
            className="border-slate-700 text-slate-300 hover:text-slate-100 hover:bg-slate-800"
          >
            <Download className="w-4 h-4 mr-2" />
            {data
              ? (
                  <PDFDownloadLink
                    document={(
                      <AiFailureReport
                        analysis={data.analysis}
                        telemetry={data.telemetry}
                        failureLog={failureLog}
                        t={t}
                      />
                    )}
                    lang={responseLanguage}
                    fileName={`Incident_Report_${failureLog.id.slice(0, 8)}.pdf`}
                  >
                    {({ loading }) =>
                      loading
                        ? t("aiAnalyzeModal.actions.preparingPdf")
                        : t("aiAnalyzeModal.actions.downloadPdf")}
                  </PDFDownloadLink>
                )
              : (
                  <span>{t("aiAnalyzeModal.actions.downloadPdf")}</span>
                )}
          </Button>

          <div className="flex flex-wrap justify-center items-center gap-3">
            <Button
              variant="destructive"
              disabled={isLoading || !!error}
              className="bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all hover:shadow-[0_0_20px_rgba(220,38,38,0.6)]"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              {t("aiAnalyzeModal.actions.executeFailsafe")}
            </Button>

            <DialogClose asChild>
              <Button className="bg-slate-100 text-slate-900 hover:bg-white transition-colors">
                <X className="w-4 h-4 mr-2" />
                {t("aiAnalyzeModal.actions.acknowledgeClose")}
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
