import {
  EventDiagnosticLog,
  HardwareHealth,
  RedundancyMonitor,
  StatusBar,
} from "@/components";
import MissionMapCard from "@/components/cards/MissionMapCard";
import Header from "@/components/Header/Header";
import TelemetryChats from "@/components/TelemetryCharts/TelemetryChats";

export default function Welcome() {
  // implement use effect for socket connection and create global provider for uav data
  // custom hook useUavData for fetching and providing uav data to components using websocket connection
  return (
    <div className="w-full px-10 py-5 flex flex-col justify-start items-center min-h-screen bg-black">
      <Header />
      {/* section with connection status card, caution, systems heartbeat, flightmode, rth protocol */}
      <StatusBar />
      {/* main content */}
      {/* left aside content: PFD gause, Analytical redundancy monitor for airspeed and ground speed, hardware status */}
      <main className="w-full max-h-232 h-full flex justify-center gap-x-5">
        <aside className="h-full  w-full flex flex-col justify-start items-center gap-y-4">
          <RedundancyMonitor airspeed={120} groundSpeed={110} />
          <HardwareHealth battery={85} temp={45} latency={120} />
        </aside>
        {/* map */}
        <MissionMapCard />
        {/* right aside for  event logs, altitude and battery level line charts*/}
        <aside className="h-full w-full flex flex-col justify-center items-center gap-y-4">
          <EventDiagnosticLog />
          <TelemetryChats />
        </aside>
      </main>
    </div>
  );
}
