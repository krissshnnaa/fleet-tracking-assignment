import React, { useEffect, useMemo, useRef } from "react";
import useTripsStore from "./state/useTripsStore";
import useSimulation from "./hooks/useSimulation";
import { loadAllEvents } from "./utils/data";
import { validPos, pickAlert } from "./utils/helpers";
import MapView, { initTripGraphics } from "./components/MapView";
import TripList from "./components/TripList";
import AlertsPanel from "./components/AlertsPanel";
import SpeedChart from "./components/SpeedChart";
import Controls from "./components/Controls";

const FILES = [
  "trip_1_cross_country.json",
  "trip_2_urban_dense.json",
  "trip_3_mountain_cancelled.json",
  "trip_4_southern_technical.json",
  "trip_5_regional_logistics.json",
];

export default function App() {
  const { tripsRef, selectedTripId, setSelectedTripId, alerts, setAlerts } =
    useTripsStore();
  const { sim, setSim } = useSimulation();
  const mapApiRef = useRef({ map: null, L: null, _initialized: false });

  // load + prepare
  useEffect(() => {
    console.log("Debug: useEffect Running.");
    console.log("Debug Files:", FILES);
    (async () => {
      try {
        const test = await fetch("/data/trip_1_cross_country.json");
        console.log(
          "TEST fetch /data/trip_1_cross_country.json status:",
          test.status
        );
        const txt = await test.text();
        console.log("TEST first 120 chars:", txt.slice(0, 120));
      } catch (e) {
        console.error("TEST fetch failed", e);
      }
      const all = await loadAllEvents(FILES);
      const grouped = new Map();
      for (const e of all) {
        if (!grouped.has(e.tripId)) grouped.set(e.tripId, []);
        grouped.get(e.tripId).push(e);
      }
      let gMin = Infinity,
        gMax = -Infinity;
      grouped.forEach((arr, id) => {
        arr.sort((a, b) => a.t - b.t);
        if (arr.length) {
          gMin = Math.min(gMin, arr[0].t);
          gMax = Math.max(gMax, arr[arr.length - 1].t);
        }
        tripsRef.current.set(id, {
          id,
          events: arr,
          ptr: 0,
          marker: null,
          line: null,
          progress: 0,
          completed: false,
        });
      });
      setSim((s) => ({ ...s, startAt: gMin, endAt: gMax, now: gMin }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // tick: apply events till sim.now
  useEffect(() => {
    const { map, L } = mapApiRef.current;
    if (!map || !L) return;
    applyUntil(sim.now);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sim.now]);

function applyUntil(now) {
  const { L } = mapApiRef.current;
  tripsRef.current.forEach(trip => {
    while (trip.ptr < trip.events.length && trip.events[trip.ptr].t <= now) {
      const e = trip.events[trip.ptr];

      // ...marker move / polyline extend...

      // 🔔 ALERT collect
      const a = pickAlert(e);
      if (a) {
        setAlerts(prev => [{ ...a, tripId: trip.id }, ...prev].slice(0, 50)); // latest 50 only
      }

      trip.ptr++;
      trip.progress = Math.round((trip.ptr / trip.events.length) * 100);
      trip.completed = trip.ptr >= trip.events.length;
    }
  });
}


  function resetPointers(clearLines = true) {
    const { L } = mapApiRef.current;
    tripsRef.current.forEach((trip) => {
      trip.ptr = 0;
      trip.progress = 0;
      trip.completed = false;
      const first = trip.events.find(validPos);
      if (first && trip.marker) trip.marker.setLatLng([first.lat, first.lng]);
      if (first && trip.line && clearLines)
        trip.line.setLatLngs([L.latLng(first.lat, first.lng)]);
    });
  }

  const fleet = useMemo(() => {
    const arr = Array.from(tripsRef.current.values());
    const any = tripsRef.current.values().next().value;
   console.log("sample ptr/progress:", any?.ptr, any?.progress);
    
    const pct = (n) => arr.filter((t) => t.progress >= n).length;
    return {
      total: arr.length,
      gte50: pct(50),
      gte80: pct(80),
      completed: arr.filter((t) => t.completed).length,
      trips: arr,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sim.now]);

  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
        gridTemplateRows: "64px 1fr 72px",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "8px 12px",
          borderBottom: "1px solid #eee",
        }}
      >
        <b>Fleet Dashboard</b>
        <span>Total: {fleet.total}</span>
        <span>≥50%: {fleet.gte50}</span>
        <span>≥80%: {fleet.gte80}</span>
        <span>Done: {fleet.completed}</span>
        <span style={{ marginLeft: "auto" }}>
          {sim.startAt ? new Date(sim.now).toLocaleString() : "Loading..."}
        </span>
      </div>

      {/* Main */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px" }}>
        <MapView
          tripsRef={tripsRef}
          onReady={(api) => {
            mapApiRef.current = api;
            if (api.map && tripsRef.current.size && !api._initialized) {
              initTripGraphics(tripsRef, api.map, api.L);
              api._initialized = true;
            }
          }}
        />
        <div
          style={{
            borderLeft: "1px solid #eee",
            padding: 12,
            overflow: "auto",
          }}
        >
          <TripList
            trips={fleet.trips}
            selectedTripId={selectedTripId}
            onSelect={(id) => {
              setSelectedTripId(id);
              const trip = tripsRef.current.get(id);
              if (trip?.line) {
                const ll = trip.line.getLatLngs();
                if (ll?.length)
                  mapApiRef.current.map.fitBounds(
                    mapApiRef.current.L.latLngBounds(ll).pad(0.2)
                  );
              } else if (trip?.marker) {
                mapApiRef.current.map.setView(trip.marker.getLatLng(), 10);
              }
            }}
          />
          <AlertsPanel alerts={alerts} />
          <SpeedChart
            selectedTripId={selectedTripId}
            tripsRef={tripsRef}
            simNow={sim.now}
          />
        </div>
      </div>

      {/* Controls */}
      <Controls
        sim={sim}
        setSim={setSim}
        onRestart={() => {
          setSim((s) => ({ ...s, now: s.startAt, playing: false }));
          resetPointers(true);
          setAlerts([]);
        }}
        onScrub={(t) => {
          setSim((s) => ({ ...s, now: t, playing: false }));
          resetPointers(false);
          setAlerts([]);
        }}
      />
    </div>
  );
}
