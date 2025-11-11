// src/components/SpeedChart.jsx
import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { validPos, haversine } from "../utils/helpers";

/**
 * SpeedChart:
 * - Agar event me speed field nahi hai to lat/lng + time se speed compute karo
 * - Speed = distance_between_points(m) * 3.6 / deltaSeconds  (km/h)
 * - Outliers drop: <0 ya > 180 km/h ignore (dataset ke hisaab se adjust kar sakte ho)
 */
export default function SpeedChart({ selectedTripId, tripsRef, simNow }) {
  // ptr + events pick (taaki deps correct rahein)
  const trip = selectedTripId ? tripsRef.current.get(selectedTripId) : null;
  const ptr = trip?.ptr ?? 0;
  
    // eslint-disable-next-line react-hooks/exhaustive-deps
  const events = trip?.events ?? [];

  const data = useMemo(() => {
    if (!events.length || ptr < 2) return []; // 2 points chahiye speed nikalne ko
    const upto = Math.min(ptr, events.length);

    const points = [];
    let prev = null;

    for (let i = 0; i < upto; i++) {
      const e = events[i];
      if (!validPos(e) || !Number.isFinite(e.t)) continue;

      if (prev && validPos(prev)) {
        const dt = (e.t - prev.t) / 1000; // seconds
        if (dt > 0) {
          const distM = haversine(
            { lat: prev.lat, lng: prev.lng },
            { lat: e.lat, lng: e.lng }
          ); // meters
          const spd = (distM * 3.6) / dt; // km/h
          // outlier filter (0..180 km/h)
          if (spd >= 0 && spd <= 180) {
            points.push({
              time: new Date(e.t).toLocaleTimeString(),
              speed: Number(spd.toFixed(1)),
            });
          }
        }
      }
      prev = e;
    }

    // (optional) 5-point moving average for smoothness
    const smooth = [];
    const win = 5;
    for (let i = 0; i < points.length; i++) {
      const start = Math.max(0, i - (win - 1));
      const slice = points.slice(start, i + 1);
      const avg = slice.reduce((s, p) => s + p.speed, 0) / slice.length;
      smooth.push({ ...points[i], speed: Number(avg.toFixed(1)) });
    }

    return smooth;
  }, [ptr, events]); // deps sahi: ptr change par chart update

  return (
    <>
      <h3 style={{ marginTop: 16 }}>
        Speed Chart {selectedTripId ? `(${String(selectedTripId).slice(0, 18)}…)` : ""}
      </h3>
      <div style={{ height: 220, border: "1px solid #eee", borderRadius: 8, padding: 8 }}>
        {selectedTripId ? (
          data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis width={40} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="speed" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ opacity: 0.6 }}>
              Is trip ke liye abhi tak chart points nahi bane (play chalao ya thoda aage scrub karo).
            </div>
          )
        ) : (
          <div style={{ opacity: 0.6 }}>Kisi trip pe click karo — chart yahan dikhega.</div>
        )}
      </div>
    </>
  );
}
