import { Activity, Wifi } from "lucide-react";
import StatusBarItem from "./components/StatusBarItem";
import { useContext } from "react";
import { UavDataContext } from "@/providers/UavDataProvider";
import { useSocketConnection } from "@/hooks/useSocketConnection";
import { useTimeConnected } from "./hooks";
import { useTranslation } from "react-i18next";

export function StatusBar() {
  const { t } = useTranslation();
  const uavData = useContext(UavDataContext);
  if (!uavData) return null;
  const { isConnected } = useSocketConnection();
  const { timeConnected } = useTimeConnected(isConnected);

  return (
    <header className="flex w-full flex-wrap items-center gap-2 py-2">
      {/* 1. Connection Status */}
      <StatusBarItem
        variant={isConnected ? "success" : "critical"}
        isAlerting={true}
        icon={<Wifi className="size-6 fill-current" />}
        value={
          isConnected
            ? t("statusBar.connectionActive")
            : t("statusBar.connectionInactive")
        }
      />

      {/* 2. Master Caution (Triggered by failuresService) */}
      {/* <StatusBarItem
        variant="critical"
        isAlerting={true} // Set this to true when a failure is detected
        icon={<AlertTriangle className="size-6" />}
        value="Master Caution"
      /> */}

      {/* 3. System Heartbeat */}
      <StatusBarItem
        label={t("statusBar.systemHeartbeat")}
        value={`${timeConnected}s`}
        icon={
          <Activity
            className={`size-6 ${isConnected ? "text-green-500" : "text-red-500"}`}
          />
        }
      />

      {/* 4. Flight Mode */}
      {/* <StatusBarItem
        label="Flight Mode:"
        value="Autonomous"
        icon={<Gauge className="size-12 text-blue-400" />}
      /> */}

      {/* 5. RTH Protocol (Action Button Variant) */}
      {/* <button className="ml-auto flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-100 hover:bg-slate-700 transition-colors">
        RTH Protocol
        <ChevronRight className="h-4 w-4" />
      </button> */}
    </header>
  );
}
