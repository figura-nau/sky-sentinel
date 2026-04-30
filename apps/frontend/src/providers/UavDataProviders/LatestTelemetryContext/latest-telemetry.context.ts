import type { UAVdata } from "@sky-sentinel/database";
import { createContext } from "react";

export const LatestTelemetryContext = createContext<UAVdata | null>(null);
