export const validPos = (e) => Number.isFinite(e.lat) && Number.isFinite(e.lng);
export const shortId = (id) =>
  String(id).length > 18 ? String(id).slice(0, 18) + "…" : String(id);
export const getSpeed = (e) => e.speedKmph ?? e.speed ?? e.spd ?? null;

export function pickAlert(e) {
  const t = e.t || Date.parse(e.timestamp || e.time || e.ts);
  const type = String(e.event_type || e.type || "").toLowerCase();

  // direct event types
  if (type.includes("overspeed"))
    return { t, kind: "overspeed", msg: "Overspeed" };
  if (type.includes("device_off") || type.includes("offline"))
    return { t, kind: "device", msg: "Device offline" };
  if (type.includes("fuel_low") || type.includes("low_fuel"))
    return { t, kind: "fuel", msg: "Low fuel" };
  if (
    type.includes("weather") &&
    (type.includes("cancel") || type.includes("halt"))
  )
    return { t, kind: "weather", msg: "Weather cancellation" };
  if (type.includes("trip_cancel"))
    return { t, kind: "cancelled", msg: "Trip cancelled" };

  // derived (agar dataset me direct type na ho)
  const spd = e.speedKmph ?? e.speed ?? e.spd;
  if (typeof spd === "number" && spd > 80)
    return { t, kind: "overspeed", msg: `Overspeed ${spd} km/h` };
  if (e.fuelLevelPct != null && e.fuelLevelPct < 15)
    return { t, kind: "fuel", msg: `Low fuel ${e.fuelLevelPct}%` };

  return null;
}

// (Optional) Haversine distance (meters)
export function haversine(a, b) {
  const R = 6371e3; // meters
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const la1 = toRad(a.lat),
    la2 = toRad(b.lat);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s)); // meters
}
