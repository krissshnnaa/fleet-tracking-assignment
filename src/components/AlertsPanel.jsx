// components/AlertsPanel.jsx
import { shortId } from "../utils/helpers";

export default function AlertsPanel({ alerts }) {
  return (
    <>
      <h3 style={{marginTop:16}}>Alerts</h3>
      <div style={{maxHeight:200,overflow:"auto",border:"1px solid #eee",borderRadius:8}}>
        {alerts.length===0 && <div style={{padding:8,opacity:.6}}>No alerts yet</div>}
        {alerts.map((a, idx) => (
          <div key={idx} style={{display:"grid",gridTemplateColumns:"90px 1fr",gap:8,padding:"6px 8px",borderBottom:"1px solid #f3f3f3"}}>
            <span style={{fontSize:12,opacity:.7}}>{new Date(a.t).toLocaleTimeString()}</span>
            <div>
              <b style={{textTransform:"capitalize"}}>{a.kind}</b> — {a.msg}
              <span style={{opacity:.7,fontSize:12}}> ({shortId(a.tripId)})</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
