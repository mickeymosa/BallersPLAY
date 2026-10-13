import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function MatchDiscovery() {
  const [matches, setMatches] = useState([]);
  const [state, setState] = useState("loading");
  const [selected,setSelected]=useState(null);
  const [player,setPlayer]=useState({player_name:"",player_email:"",player_phone:"",website:""});
  const [requestState,setRequestState]=useState("idle");
  const [requestMessage,setRequestMessage]=useState("");
  async function requestSpot(e){
    e.preventDefault();setRequestState("sending");setRequestMessage("");
    const {data,error}=await supabase.functions.invoke("request-spot",{body:{...player,match_id:selected.id}});
    if(error||!data?.ok){
      let detail=data?.error;
      const status=error?.context?.status;
      if(!detail&&error?.context?.json){try{detail=(await error.context.json())?.error;}catch(_){}}
      if(!detail&&status===401) detail="Authorization failed (401). Check request-spot JWT verification.";
      if(!detail&&status===403) detail="Origin not allowed (403). Check ALLOWED_ORIGINS.";
      if(!detail&&status) detail="Booking failed (HTTP "+status+"). Check request-spot function logs.";
      if(!detail) detail="Network or CORS error. Check ALLOWED_ORIGINS and browser Network tab.";
      setRequestState("error");setRequestMessage(detail);return;
    }
    setRequestState("success");setRequestMessage("Request sent. Your spot is not confirmed yet.");
  }

  useEffect(() => {
    let active = true;
    if (!supabase) { setState("configuration"); return; }
    supabase.from("matches")
      .select("id,title,city,venue,starts_at,format,capacity,price_pln,description")
      .eq("status", "published")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(24)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setState("error");
        else { setMatches(data || []); setState("ready"); }
      });
    return () => { active = false; };
  }, []);

  return (
    <section id="find-matches" className="bp-match-discovery" aria-labelledby="match-discovery-title">
      <div className="container">
        <p className="section-label">FIND YOUR GAME</p>
        <h2 id="match-discovery-title">Upcoming football matches</h2>
        {state === "loading" && <p>Loading matches…</p>}
        {state === "configuration" && <p>Match listings are being prepared. Join the player list in the meantime.</p>}
        {state === "error" && <p>Matches are temporarily unavailable. Please try again later.</p>}
        {state === "ready" && matches.length === 0 && <p>No published matches yet. New games are coming soon.</p>}
        {state === "ready" && matches.length > 0 && (
          <div className="bp-match-grid">
            {matches.map(match => (
              <article className="bp-match-card" key={match.id}>
                <span className="bp-match-format">{match.format}</span>
                <h3>{match.title}</h3>
                <p>{match.venue}, {match.city}</p>
                <p>{new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Warsaw" }).format(new Date(match.starts_at))}</p>
                <p>{Number(match.price_pln).toFixed(2)} PLN per player</p>
                <p>{match.description}</p>
                <button className="bp-request-button" onClick={()=>{setSelected(match);setRequestState("idle");setRequestMessage("");}}>Request a spot</button>
              </article>
            ))}
          </div>
        )}
        {selected && <div className="bp-booking-overlay"><div className="bp-booking-dialog" role="dialog" aria-modal="true" aria-label="Request a spot">
          <button type="button" className="bp-dialog-close" onClick={()=>setSelected(null)}>Close ×</button>
          <h3>Request a spot: {selected.title}</h3><p>Submitting a request does not confirm a booking. Pay the organizer directly only after confirmation.</p>
          {requestState==="success"?<p role="status">{requestMessage}</p>:<form onSubmit={requestSpot} className="bp-native-form">
            <label>Your name<input required minLength={2} maxLength={120} value={player.player_name} onChange={e=>setPlayer(x=>({...x,player_name:e.target.value}))}/></label>
            <label>Email<input type="email" required value={player.player_email} onChange={e=>setPlayer(x=>({...x,player_email:e.target.value}))}/></label>
            <label>Phone (optional)<input maxLength={40} value={player.player_phone} onChange={e=>setPlayer(x=>({...x,player_phone:e.target.value}))}/></label>
            <input className="bp-honeypot" tabIndex={-1} aria-hidden="true" autoComplete="off" value={player.website} onChange={e=>setPlayer(x=>({...x,website:e.target.value}))}/>
            <button disabled={requestState==="sending"}>{requestState==="sending"?"Sending…":"Send booking request"}</button>
            {requestMessage&&<p role="alert">{requestMessage}</p>}
          </form>}
        </div></div>}
      </div>
    </section>
  );
}
