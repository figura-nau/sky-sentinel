import { Suspense } from "react";
import { Card, CardContent, CardHeader } from "../ui";
import { lazy } from "react";
const UavMap = lazy(() => import("../../components/uavMap.client"));

export default function MissionMapCard() {
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
            currentPos={[51.505, -0.09]}
            history={[
              [51.505, -0.09],
              [51.505, -0.08],
              [51.505, -0.07],
              [51.505, -0.05],
              [51.505, -0.04],
              [51.505, -0.03],
            ]}
            homePos={[51.505, -0.09]}
          />
        </Suspense>
      </CardContent>
    </Card>
  );
}
