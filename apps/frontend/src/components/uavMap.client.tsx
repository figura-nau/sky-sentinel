import { useEffect } from "react";
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
  html: `<div class="text-blue-500 transform -rotate-45"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15h3l2 2 4-14 4 14 2-2h3"/></svg></div>`,
  className: "custom-uav-icon",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
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
  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
      <MapContainer
        center={currentPos}
        zoom={15}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        {/* Professional Dark Map Style (CartoDB Dark Matter) */}
        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

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

      {/* Map Overlay Controls (Tailwind) */}
      <div className="absolute bottom-4 right-4 z-1000 bg-slate-900/80 p-2 rounded-lg border border-slate-700 backdrop-blur-md">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
          Signal: Operational
        </p>
      </div>
    </div>
  );
}
