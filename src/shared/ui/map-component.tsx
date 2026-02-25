// shared/ui/map-component.tsx
"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default markers in Leaflet 1.x
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png").default,
  iconUrl: require("leaflet/dist/images/marker-icon.png").default,
  shadowUrl: require("leaflet/dist/images/marker-shadow.png").default,
});

interface Location {
  id: number;
  name: string;
  lat: number;
  lon: number;
  address?: string;
}

interface MapComponentProps {
  lat: number;
  lon: number;
  locations?: Location[];
  zoom?: number;
  width?: number | string;
  height?: number | string;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  lat,
  lon,
  locations = [],
  zoom = 12,
  width = "100%",
  height = "100%",
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Загрузка карты...</p>
      </div>
    );
  }

  return (
    <>
      <MapContainer
        center={[lat, lon]}
        zoom={zoom}
        style={{
          height: typeof height === "string" ? height : `${height}px`,
          width: typeof width === "string" ? width : `${width}px`,
          minHeight: typeof height === "string" ? height : `${height}px`,
        }}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <Marker
          position={[lat, lon]}
          icon={L.icon({
            iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          })}
        >
          <Popup>Центр города</Popup>
        </Marker>

        {locations.map((loc) => (
          <Marker
            key={loc.id}
            position={[loc.lat, loc.lon]}
            icon={L.icon({
              iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
              shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            })}
          >
            <Popup>
              {loc.name}
              {loc.address && <br />}
              {loc.address}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm rounded-md py-2 px-3 shadow-sm z-[1000] text-xs leading-tight">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Пункты выдачи</p>
            <p className="text-xs text-gray-600">
              {locations.length} складов в радиусе 20 км
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-xs">Пункты выдачи</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-xs">Ваш город</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};