import { useEffect, useRef } from "react";
import L from "leaflet";
import { validPos, shortId } from "../utils/helpers";

const COLORS = ["#1e88e5","#43a047","#fb8c00","#8e24aa","#e53935"];

export default function MapView({ tripsRef, onReady }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      const m = L.map("map").setView([22.5,78.9], 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom:19 }).addTo(m);
      mapRef.current = m;
      if (onReady) onReady({ map: m, L, _initialized: false });
    }
  }, [onReady]);

  
  return <div id="map" style={{ width:"100%", height:"100%" }} />;
}

export function initTripGraphics(tripsRef, map, L) {
  const bounds = L.latLngBounds([]);
  let colorIdx = 0;
  Array.from(tripsRef.current.values()).forEach(trip => {
    const first = trip.events.find(validPos);
    const col = COLORS[colorIdx++ % COLORS.length];
    trip.line = L.polyline([], { weight:4, color:col }).addTo(map);
    if (first) {
      trip.marker = L.marker([first.lat, first.lng]).addTo(map).bindTooltip(shortId(trip.id));
      trip.line.setLatLngs([L.latLng(first.lat, first.lng)]);
      bounds.extend([first.lat, first.lng]);
    }
  });
  if (bounds.isValid()) map.fitBounds(bounds.pad(0.2));
}
