import { shortId } from "../utils/helpers";
const COLORS = ["#1e88e5","#43a047","#fb8c00","#8e24aa","#e53935"];

export default function TripList({ trips, selectedTripId, onSelect }) {
  return (
    <>
      <h3>Trips</h3>
      {trips.map((t, i) => (
        <div key={t.id}
          onClick={() => onSelect(t.id)}
          style={{
            cursor:"pointer", padding:8, marginBottom:10,
            border:"1px solid #ddd", borderRadius:8,
            background: selectedTripId===t.id ? "#f0f8ff":"white"
          }}>
          <div style={{ fontWeight:600, marginBottom:6 }}>
            <span style={{display:"inline-block",width:10,height:10,background:COLORS[i%COLORS.length],marginRight:8,borderRadius:2}}/>
            {shortId(t.id)} {t.completed ? "✓" : ""}
          </div>
          <div style={{height:8,background:"#eee",borderRadius:5,overflow:"hidden"}}>
            <div style={{width:`${t.progress}%`,height:"100%",background:"#4caf50"}}/>
          </div>
          <div style={{fontSize:12,opacity:.7,marginTop:4}}>{t.progress}%</div>
        </div>
      ))}
    </>
  );
}
