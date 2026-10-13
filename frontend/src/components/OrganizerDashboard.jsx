import {useCallback,useEffect,useState} from "react";
import {supabase} from "../lib/supabase";

export default function OrganizerDashboard(){
 const [user,setUser]=useState(null),[loading,setLoading]=useState(true),[rows,setRows]=useState([]),[error,setError]=useState("");
 const [busy,setBusy]=useState(""),[attendance,setAttendance]=useState({});
 const load=useCallback(async()=>{
  if(!supabase){setError("Account service unavailable.");setLoading(false);return;}
  const {data:{session}}=await supabase.auth.getSession();
  setUser(session?.user||null);
  if(!session){setRows([]);setLoading(false);return;}
  const {data,error:loadError}=await supabase.rpc("ballersplay_my_organized_matches");
  if(loadError)setError(loadError.message);
  else {setRows(data||[]);setError("");}
  setLoading(false);
 },[]);
 useEffect(()=>{load();if(!supabase)return;const {data:{subscription}}=supabase.auth.onAuthStateChange(()=>load());return()=>subscription.unsubscribe();},[load]);
 const matches=Object.values(rows.reduce((acc,row)=>{
  const id=row.match_id;if(!acc[id])acc[id]={...row,bookings:[]};
  if(row.booking_id)acc[id].bookings.push(row);
  return acc;
 },{}));
 const setPresent=(matchId,playerId,checked)=>{
  const key=matchId+":"+playerId;
  setAttendance(p=>({...p,[key]:checked}));
 };
 const isPresent=(m,b)=>attendance[m.match_id+":"+b.player_id]??b.attended;
 async function manageBooking(id,action){
  setBusy(id);setError("");
  const {error}=await supabase.rpc("ballersplay_manage_booking",{p_booking_id:id,p_action:action});
  if(error)setError(error.message);
  await load();setBusy("");
 }
 async function completeMatch(m){
  if(!window.confirm("Complete this match and award +2 OVR to each checked attendee? This cannot be undone."))return;
  const ids=[...new Set(m.bookings.filter(b=>b.player_id&&b.booking_status==="confirmed"&&isPresent(m,b)).map(b=>b.player_id))];
  setBusy(m.match_id);setError("");
  const {error}=await supabase.rpc("ballersplay_finish_match",{p_match_id:m.match_id,p_attendee_ids:ids});
  if(error)setError(error.message);
  await load();setBusy("");
 }
 return <section className="bp-form-section"><div className="container bp-form-wrap">
  <p className="eyebrow">MATCH MANAGEMENT</p><h2>Organizer dashboard</h2>
  <p>Approve requests, confirm attendance and complete matches. Only your own matches are shown.</p>
  {loading?<p>Loading your matches…</p>:!user?<p><a href="/account">Sign in</a> to manage your matches.</p>:matches.length===0?<p>No matches linked to your account yet. <a href="/organize">Submit a match</a> to get started.</p>:matches.map(m=><article className="bp-organizer-match" key={m.match_id}>
   <div className="bp-organizer-match-head"><h3>{m.title}</h3><span>{m.status}</span></div>
   <p>{m.venue} · {new Date(m.starts_at).toLocaleString()} · {m.capacity} places</p>
   {m.bookings.length===0?<p>No booking requests yet.</p>:<div className="bp-organizer-bookings">
    {m.bookings.map(b=><div className="bp-organizer-booking" key={b.booking_id}>
      <div><strong>{b.player_name}</strong><small>{b.booking_status}</small></div>
      {m.status==="published"&&<div className="bp-organizer-actions">
       {b.booking_status!=="confirmed"&&<button disabled={!!busy} onClick={()=>manageBooking(b.booking_id,"confirmed")}>Confirm</button>}
       {b.booking_status!=="rejected"&&<button disabled={!!busy} onClick={()=>manageBooking(b.booking_id,"rejected")}>Reject</button>}
      </div>}
      {m.status==="published"&&b.booking_status==="confirmed"&&b.player_id&&<label className="bp-attendance-check"><input type="checkbox" checked={!!isPresent(m,b)} onChange={e=>setPresent(m.match_id,b.player_id,e.target.checked)}/> Attended</label>}
      {m.status==="completed"&&b.attended&&<span>✓ Attendance verified</span>}
    </div>)}
   </div>}
   {m.status==="published"&&<button className="bp-finish-match" disabled={!!busy||new Date(m.starts_at)>new Date()} onClick={()=>completeMatch(m)}>Complete match & award ratings</button>}
   {m.status==="published"&&new Date(m.starts_at)>new Date()&&<p className="bp-fineprint">You can complete this match after its scheduled start.</p>}
  </article>)}
  {error&&<p role="alert">{error}</p>}
 </div></section>;
}
