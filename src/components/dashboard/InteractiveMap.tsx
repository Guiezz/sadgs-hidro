// src/components/dashboard/InteractiveMap.tsx
"use client";

import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Props = {
  lat: number;
  lon: number;
  nome: string;
};

// --- CORREÇÃO DO ÍCONE ---
// Como Turbopack não suporta import de imagens diretamente,
// usamos URLs absolutas da pasta pública
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function InteractiveMap({ lat, lon, nome }: Props) {
  return (
    <MapContainer
      center={[lat, lon]}
      zoom={13}
      scrollWheelZoom={false}
      zoomControl={false}
      className="relative z-0 h-[380px] w-full rounded-[14px] border border-border"
    >
      {/* Leaflet usa o título como aria-label dos botões */}
      <ZoomControl position="topleft" zoomInTitle="Aproximar mapa" zoomOutTitle="Afastar mapa" />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
      />
      <Marker position={[lat, lon]} alt={`Localização do açude ${nome}`}>
        <Popup>{nome}</Popup>
      </Marker>
    </MapContainer>
  );
}
