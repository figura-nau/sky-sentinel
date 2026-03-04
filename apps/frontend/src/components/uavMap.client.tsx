import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const uavIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute inset-0 animate-pulse rounded-full bg-blue-500/20 blur-xl"></div>
      
      <div class="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="42" 
          height="42" 
          viewBox="0 0 100 100" 
          fill="currentColor"
        >
          <path d="
            M 50,10 
            L 46,25 
            L 10,35 
            L 10,42 
            L 46,38 
            L 48,75 
            L 38,85 
            L 38,90 
            L 50,85 
            L 62,90 
            L 62,85 
            L 52,75 
            L 54,38 
            L 90,42 
            L 90,35 
            L 54,25 
            Z
          " />
          
          <circle cx="50" cy="12" r="2" fill="white" fill-opacity="0.5" />
        </svg>
      </div>
    </div>
  `,
  className: "custom-uav-icon",
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

const homeIcon = L.divIcon({
  html: `<div class="text-red-600"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>`,
  className: "custom-home-icon",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Component to automatically re-center map when UAV moves
const RecenterMap = ({ position }: { position: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position);
  }, [position, map]);
  return null;
};

interface UavMapProps {
  currentPos: [number, number]; // [lat, lng]
  history: [number, number][]; // Array of previous positions
  homePos: [number, number];
  geofenceRadius?: number; // Meters
}

export default function UavMap({
  currentPos,
  history,
  homePos,
  geofenceRadius = 500,
}: UavMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, [isMounted]);
  if (!isMounted) {
    return null;
  }
  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
      <MapContainer
        center={currentPos}
        zoom={15}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        {/* Professional Dark Map Style (CartoDB Dark Matter) */}
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

        {/* 1. Geofence Boundary (Lecture №10 Requirement) */}
        <Circle
          center={homePos}
          radius={geofenceRadius}
          pathOptions={{
            color: "#ef4444",
            weight: 2,
            dashArray: "5, 10",
            fillColor: "#ef4444",
            fillOpacity: 0.1,
          }}
        />

        {/* 2. Flight Path (Breadcrumbs) */}
        <Polyline
          positions={history}
          pathOptions={{ color: "#3b82f6", weight: 3, opacity: 0.6 }}
        />

        {/* 3. Home Point */}
        <Marker position={homePos} icon={homeIcon}>
          <Popup className="dark-popup">Launch Point (Home)</Popup>
        </Marker>

        {/* 4. Active UAV Marker */}
        <Marker position={currentPos} icon={uavIcon}>
          <RecenterMap position={currentPos} />
          <Popup>
            <div className="text-xs font-mono">
              <strong>SkySentinel UAV</strong>
              <br />
              Lat: {currentPos[0].toFixed(4)}
              <br />
              Lng: {currentPos[1].toFixed(4)}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
