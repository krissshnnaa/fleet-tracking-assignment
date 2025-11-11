export default function Controls({ sim, setSim, onRestart, onScrub }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"8px 12px",borderTop:"1px solid #eee"}}>
      <button onClick={() => setSim(s => ({...s, playing: !s.playing}))}>
        {sim.playing ? "Pause" : "Play"}
      </button>
      <button onClick={onRestart}>↺ Restart</button>
      <span>Speed:</span>
      {[1,5,10].map(sp => (
        <button key={sp}
          onClick={() => setSim(s => ({...s, speed: sp}))}
          style={{fontWeight: sim.speed===sp ? "bold":"normal"}}
        >{sp}×</button>
      ))}
      <input type="range" min={sim.startAt||0} max={sim.endAt||100} value={sim.now||0}
        onChange={e => onScrub(Number(e.target.value))}
        style={{flex:1}} />
    </div>
  );
}
