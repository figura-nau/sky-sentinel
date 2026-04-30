import type { UAVdata } from "@sky-sentinel/database";
import type { Socket } from "socket.io-client";
import type { FlightPathPoint } from "@/providers/UavDataProviders/FlightHistoryContext";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export function useSocketConnection() {
  const URL
    = process.env.NODE_ENV === "production" ? undefined : "http://localhost:3003";

  const [isConnected, setIsConnected] = useState(false);
  const [latestTelemetry, setLatestTelemetry] = useState<UAVdata | null>(null);
  const [flightHistory, setFlightHistory] = useState<FlightPathPoint[]>([]);
  const [chartsHistory, setChartsHistory] = useState<UAVdata[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(URL, {
      transports: ["websocket"],
    });
    socketRef.current = socket;
    socket.on("connect", onConnect);

    function onConnect() {
      setIsConnected(true);
    }
    if (socket.connected) {
      onConnect();
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onTelemetryEvent(value: UAVdata) {
      setLatestTelemetry(value);

      setFlightHistory(prev => [
        ...prev,
        { lat: value.latitude, lng: value.longitude },
      ]);

      const MAX_CHARTS_HISTORY = 10;
      setChartsHistory((prev) => {
        const next = [...prev, value];
        return next.length > MAX_CHARTS_HISTORY
          ? next.slice(next.length - MAX_CHARTS_HISTORY)
          : next;
      });
    }

    socket.on("disconnect", onDisconnect);
    socket.on("receive_ui_data", onTelemetryEvent);
    socket.on("connect_error", (err) => {
      console.error("Socket Connection Error:", err.message);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receive_ui_data", onTelemetryEvent);
      socket.disconnect();
    };
  }, []);

  return { isConnected, latestTelemetry, flightHistory, chartsHistory };
}
