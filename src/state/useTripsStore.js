import { useRef, useState } from "react";

export default function useTripsStore() {
  const tripsRef = useRef(new Map()); // tripId -> {events, ptr, marker, line, progress, completed}
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [alerts, setAlerts] = useState([]);   // latest first
  return { tripsRef, selectedTripId, setSelectedTripId, alerts, setAlerts };
}
