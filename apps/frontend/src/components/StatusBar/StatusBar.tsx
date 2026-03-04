import {
  Dot,
  AlertTriangle,
  Activity,
  Gauge,
} from "lucide-react";
import StatusBarItem from "./components/StatusBarItem";

export function StatusBar() {
  return (
    <header className="flex w-full h-full items-center gap-2 py-2">
      {/* 1. Connection Status */}
      <StatusBarItem
        variant="success"
        isAlerting={true}
        icon={<Dot className="size-12 fill-current" />}
        value="Connection: Active"
      />

      {/* 2. Master Caution (Triggered by failuresService) */}
      <StatusBarItem
        variant="critical"
        isAlerting={true} // Set this to true when a failure is detected
        icon={<AlertTriangle className="size-12" />}
        value="Master Caution"
      />

      {/* 3. System Heartbeat */}
      <StatusBarItem
        label="System Heartbeat:"
        value="0.5s"
        icon={<Activity className="size-12 text-green-500" />}
      />

      {/* 4. Flight Mode */}
      <StatusBarItem
        label="Flight Mode:"
        value="Autonomous"
        icon={<Gauge className="size-12 text-blue-400" />}
      />

      {/* 5. RTH Protocol (Action Button Variant) */}
      {/* <button className="ml-auto flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-100 hover:bg-slate-700 transition-colors">
        RTH Protocol
        <ChevronRight className="h-4 w-4" />
      </button> */}
    </header>
  );
}
