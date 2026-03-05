import { Suspense, useContext } from "react";
import { Card, CardContent, CardHeader } from "../ui";
import { lazy } from "react";
import { UavDataContext } from "@/providers";
const UavMap = lazy(() => import("../../components/uavMap.client"));

export default function MissionMapCard() {
  const uavData = useContext(UavDataContext);
  if (!uavData) return null;
  const { latitude, longitude } = uavData.data[uavData.data.length - 1] || {
    latitude: 0,
    longitude: 0,
  };

  return (
    <Card className="w-full h-200 max-w-5xl">
      <CardHeader>Mission Map</CardHeader>
      <CardContent className="h-full p-0 relative">
        <Suspense
          fallback={
            <div className="bg-slate-800 animate-pulse h-full w-full" />
          }
        >
          <UavMap
            currentPos={[latitude, longitude]}
            history={[
              [latitude, longitude],
              [latitude, longitude - 0.01],
              [latitude, longitude - 0.02],
              [latitude, longitude - 0.04],
              [latitude, longitude - 0.05],
              [latitude, longitude - 0.06],
            ]}
            homePos={[51.505, -0.09]}
          />
        </Suspense>
      </CardContent>
    </Card>
  );
}
