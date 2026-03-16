import { Suspense, useContext, useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "../ui";
import { lazy } from "react";
import { FlightHistoryContext } from "@/providers";
import { useTranslation } from "react-i18next";
const UavMap = lazy(() => import("../../components/uavMap.client"));

export default function MissionMapCard() {
  const { t } = useTranslation();
  const flightHistory = useContext(FlightHistoryContext);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { lat: currentLatitude, lng: currentLongitude } = flightHistory[
    flightHistory.length - 1
  ] || {
    lat: 0,
    lng: 0,
  };

  const homePos: [number, number] = flightHistory[0]
    ? [flightHistory[0].lat, flightHistory[0].lng]
    : [51.505, -0.09];

  const history = flightHistory;

  const LoadingSkeleton = (
    <div className="bg-muted rounded-md animate-pulse h-full w-full" />
  );
  return (
    <Card className="w-full h-200 max-w-295 xl:max-w-5xl">
      <CardHeader>{t("missionMap.title")}</CardHeader>
      <CardContent className="h-full p-0 relative">
        {!isMounted ? (
          LoadingSkeleton
        ) : (
          <Suspense fallback={LoadingSkeleton}>
            <UavMap
              currentPos={{
                lat: currentLatitude,
                lng: currentLongitude,
              }}
              homePos={homePos}
              history={history}
            />
          </Suspense>
        )}
      </CardContent>
    </Card>
  );
}
