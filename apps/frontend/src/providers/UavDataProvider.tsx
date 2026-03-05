import { createContext, useState } from "react";
import type { UAVdata } from "@sky-sentinel/typescript/types";

export const UavDataContext = createContext<{
  data: UAVdata[];
  setData: React.Dispatch<React.SetStateAction<UAVdata[]>>;
} | null>(null);

export default function UavDataProvider({
  uavData,
  children,
}: {
  uavData: UAVdata[];
  children: React.ReactNode;
}) {
  const [data, setData] = useState(uavData);

  const value = {
    data,
    setData,
  };
  return (
    <UavDataContext.Provider value={value}>{children}</UavDataContext.Provider>
  );
}
