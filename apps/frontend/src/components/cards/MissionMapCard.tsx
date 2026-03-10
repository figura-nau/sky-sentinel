import { Suspense, useContext } from "react";
import { Card, CardContent, CardHeader } from "../ui";
import { lazy } from "react";
import { UavDataContext } from "@/providers";
import { useTranslation } from "react-i18next";
const UavMap = lazy(() => import("../../components/uavMap.client"));

export default function MissionMapCard() {
  const { t } = useTranslation();
  const uavData = useContext(UavDataContext);
  if (!uavData) return null;

  const { latitude: currentLatitude, longitude: currentLongitude } = uavData
    .data[uavData.data.length - 1] || {
    latitude: 0,
    longitude: 0,
  };
  const homePos: [number, number] = uavData.data[0]
    ? [uavData.data[0].latitude, uavData.data[0].longitude]
    : [51.505, -0.09];
  const history: [number, number][] = uavData.data.map((entry) => [
    entry.latitude,
    entry.longitude,
  ]);

  return (
    <Card className="w-full h-200 max-w-295 xl:max-w-5xl">
      <CardHeader>{t("missionMap.title")}</CardHeader>
      <CardContent className="h-full p-0 relative">
        <Suspense
          fallback={
            <div className="bg-muted animate-pulse h-full w-full" />
          }
        >
          <UavMap
            currentPos={[currentLatitude, currentLongitude]}
            homePos={homePos}
            history={history}
          />
        </Suspense>
      </CardContent>
    </Card>
  );
}
