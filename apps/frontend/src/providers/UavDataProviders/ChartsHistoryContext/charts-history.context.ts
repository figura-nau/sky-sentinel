import type { UAVdata } from "@sky-sentinel/database";
import { createContext } from "react";

export const ChartsHistoryContext = createContext<UAVdata[]>([]);
