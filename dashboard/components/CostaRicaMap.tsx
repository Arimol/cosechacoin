"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import type { Crop } from "@/types";
import "leaflet/dist/leaflet.css";

// Icono por defecto de Leaflet en bundlers Next.js
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface CostaRicaMapProps {
  crops: Crop[];
}

export default function CostaRicaMap({ crops }: CostaRicaMapProps) {
  useEffect(() => {
    L.Marker.prototype.options.icon = markerIcon;
  }, []);

  const withCoords = crops.filter((c) => c.lat != null && c.lng != null);

  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-white">
      <MapContainer
        center={[9.75, -84.1]}
        zoom={7}
        scrollWheelZoom
        className="h-[520px] w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.map((crop) => (
          <Marker
            key={crop.id}
            position={[crop.lat!, crop.lng!]}
            icon={markerIcon}
          >
            <Popup>
              <div className="min-w-[200px] text-sm">
                <p className="font-semibold text-ink-primary">
                  {crop.cropName} — {crop.region}
                </p>
                <p className="mt-1 text-ink-secondary">{crop.farmer}</p>
                <p className="mt-2">
                  {crop.tokensAvailable} tokens disponibles · {crop.priceLabel}
                </p>
                <p className="mt-1 text-xs text-ink-secondary">
                  Estado: {crop.status}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
