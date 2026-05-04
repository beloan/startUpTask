// shared/ui/map-preview.tsx
"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";

const MapComponent = dynamic(
  () => import("@/shared/ui/map-component").then((mod) => mod.MapComponent),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Загрузка карты...</p>
      </div>
    ),
  }
);

interface Location {
  id: number;
  name: string;
  lat: number;
  lon: number;
  address?: string;
}

interface MapPreviewProps {
  lat: number;
  lon: number;
  locations?: Location[];
  zoom?: number;
  width?: number | string;
  height?: number | string;
  centerPointLabel?: string;
  summaryTitle?: string;
  summarySubtitle?: string;
  pointsLegendLabel?: string;
  centerLegendLabel?: string;
}

export const MapPreview: React.FC<MapPreviewProps> = ({
  lat,
  lon,
  locations = [],
  zoom = 12,
  width = "100%",
  height = "100%",
  centerPointLabel,
  summaryTitle,
  summarySubtitle,
  pointsLegendLabel,
  centerLegendLabel,
}) => {
  return (
    <div className="relative h-full w-full">
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">Загрузка карты...</p>
          </div>
        }
      >
        <MapComponent
          lat={lat}
          lon={lon}
          locations={locations}
          zoom={zoom}
          width={width}
          height={height}
          centerPointLabel={centerPointLabel}
          summaryTitle={summaryTitle}
          summarySubtitle={summarySubtitle}
          pointsLegendLabel={pointsLegendLabel}
          centerLegendLabel={centerLegendLabel}
        />
      </Suspense>
    </div>
  );
};