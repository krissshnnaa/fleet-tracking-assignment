
export async function loadAllEvents(files) {
  console.log("DEBUG: loadAllEvents called with files =", files);
  const results = [];
  const report = [];

  if (!files || !files.length) {
    console.warn("DEBUG: files array empty!");
    return [];
  }

  for (const f of files) {
    const url = `/data/${f}`;
    try {
      console.log("DEBUG: fetching", url);
      const res = await fetch(url, { cache: "no-store" });
      console.log("DEBUG:", url, "status =", res.status);
      report.push({ file: f, status: res.status });

      if (!res.ok) continue;

      const raw = await res.json();
      const arr = Array.isArray(raw) ? raw : (raw.events || raw.data || []);
      report[report.length - 1].items = Array.isArray(arr) ? arr.length : 0;

      const norm = (Array.isArray(arr) ? arr : []).map((e) => ({
        ...e,
        t: e.t ?? Date.parse(e.timestamp ?? e.time ?? e.eventTime ?? e.ts),
        lat: e.lat ?? e.latitude ?? (e.location && e.location.lat),
        lng: e.lng ?? e.lon ?? e.longitude ?? (e.location && e.location.lng),
        tripId: e.tripId ?? e.trip_id ?? e.trip ?? e.vehicleId ?? e.vehicle_id,
      }));

      results.push(...norm);

      if (arr && arr.length) {
        console.log(`DEBUG sample from ${f}:`, arr[0]);
      }
    } catch (err) {
      console.error("DEBUG fetch error", url, err);
      report.push({ file: f, status: "fetch-error" });
    }
  }

  console.table(report);
  const cleaned = results.filter(
    (e) => e.tripId && Number.isFinite(e.t) && Number.isFinite(e.lat) && Number.isFinite(e.lng)
  );
  console.log("DEBUG: total raw =", results.length, "cleaned =", cleaned.length);
  return cleaned;
}
