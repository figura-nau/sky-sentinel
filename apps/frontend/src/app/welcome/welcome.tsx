import { StatusBar } from "@/components";
import MissionMapCard from "@/components/cards/MissionMapCard";
import Header from "@/components/Header/Header";
import LeftPanel from "@/components/LeftPanel/LeftPanel";
import RightPanel from "@/components/RightPanel/RightPanel";

export default function Welcome() {
  // implement use effect for socket connection and create global provider for uav data
  // custom hook useUavData for fetching and providing uav data to components using websocket connection
  return (
    <div className="w-full px-10 py-5 flex flex-col justify-start items-center h-full min-h-screen">
      <Header />
      {/* section with connection status card, caution, systems heartbeat, flightmode, rth protocol */}
      <StatusBar />
      {/* main content */}
      {/* left aside content: PFD gause, Analytical redundancy monitor for airspeed and ground speed, hardware status */}
      <main className="w-full h-full grid grid-cols-1 xl:grid-cols-3 justify-center gap-5">
        <LeftPanel />
        {/* map */}
        <MissionMapCard />
        {/* right aside for  event logs, altitude and battery level line charts*/}
        <RightPanel />
      </main>
    </div>
  );
}
