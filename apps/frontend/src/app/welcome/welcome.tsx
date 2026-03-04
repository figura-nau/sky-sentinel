import UavMap from "../../components/uavMap.client";
import { Card, CardContent, CardHeader } from "../../components/ui";

export function Welcome() {
  // implement use effect for socket connection and create global provider for uav data
  return (
    <div className="w-full flex justify-center items-center min-h-screen gap-y-6">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">SkySentinel</h1>
      </header>
      {/* section with connection status card, caution, systems heartbeat, flightmode, rth protocol */}
      <section className="w-full flex justify-center items-center gap-4">
        <Card>
          <h2 className="text-lg font-semibold">
            Connection Status: Connected
          </h2>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Caution: None</h2>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Systems Heartbeat: Active</h2>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Flight Mode: Manual</h2>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">RTH Protocol: Active</h2>
        </Card>
      </section>
      {/* main content */}
      {/* left aside content: PFD gause, Analytical redundancy monitor for airspeed and ground speed, hardware status */}
      <main className="w-full h-full flex justify-center items-center gap-x-5">
        <aside className="h-full flex flex-col justify-center items-center gap-y-4">
          <Card>PFD gause</Card>
          <Card>
            Analytical redundancy monitor for airspeed and ground speed
          </Card>
          <Card>Hardware status</Card>
        </aside>
        {/* map */}
        <Card>
          <CardHeader>Mission Map</CardHeader>
          <CardContent className="flex-1 p-0 relative min-h-0">
            <UavMap
              currentPos={[51.505, -0.09]}
              history={[]}
              homePos={[51.505, -0.09]}
            />
          </CardContent>
        </Card>
        {/* right aside for  event logs, altitude and battery level line charts*/}
        <aside className="h-full flex flex-col justify-center items-center gap-y-4">
          <Card>
            <CardHeader>Event Logs</CardHeader>
          </Card>
          <Card>
            <CardHeader>Altitude History</CardHeader>
          </Card>
          <Card>
            <CardHeader>Battery Level History</CardHeader>
          </Card>
        </aside>
      </main>
    </div>
  );
}
