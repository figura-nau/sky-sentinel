import { createContext, useMemo } from "react";
import type { UAVdata } from "@sky-sentinel/typescript/types";

export const UavDataContext = createContext<{
  data: UAVdata[];
} | null>(null);

export default function UavDataProvider({
  uavData,
  children,
}: {
  uavData: UAVdata[];
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({
      data: uavData,
    }),
    [uavData],
  );
  return (
    <UavDataContext.Provider value={value}>{children}</UavDataContext.Provider>
  );
}
