import { io, Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import type { UAVdata } from "@sky-sentinel/typescript/types";

export const useSocketConnection = () => {
  const URL =
    process.env.NODE_ENV === "production" ? undefined : "http://localhost:3003";

  const [isConnected, setIsConnected] = useState(false);
  const [telemetryEvents, setTelemetryEvents] = useState<any[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(URL, {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    if (socket.connected) {
      setIsConnected(true);
    }
    function onConnect() {
      console.log("Connected to telemetry server");
      setIsConnected(true);
    }

    function onDisconnect() {
      console.log("Disconnected from telemetry server");
      setIsConnected(false);
    }

    function onTelemetryEvent(value: UAVdata) {
      console.log("Received telemetry event");
      setTelemetryEvents((previous) => [...previous, value]);
    }

    socket.on("connect", onConnect);
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

  return { isConnected, telemetryEvents };
};
