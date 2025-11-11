import { useEffect, useState } from "react";

export default function useSimulation() {
  const [sim, setSim] = useState({ startAt:0, endAt:0, now:0, playing:false, speed:1 });
  useEffect(() => {
    const id = setInterval(() => {
      setSim(s => s.playing ? { ...s, now: Math.min(s.now + 250*s.speed, s.endAt) } : s);
    }, 250);
    return () => clearInterval(id);
  }, []);
  return { sim, setSim };
}
