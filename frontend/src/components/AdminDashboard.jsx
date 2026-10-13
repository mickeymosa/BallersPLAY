import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [matches, setMatches] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let alive = true;
    setAuthorized(false);
    setMatches([]);
    setBookings([]);
    if (!session || !supabase) return;
    async function load() {
      const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
      if (!alive) return;
      if (error || profile?.role !== "admin") { setMessage("This account does not have BallersPlay administrator access."); return; }
      setAuthorized(true);
      const [m, b] = await Promise.all([
        supabase.from("matches").select("*").order("starts_at", { ascending: false }).limit(100),
        supabase.from("bookings").select("*").limit(100)
      ]);
      if (!alive) return;
      if (m.error || b.error) setMessage("Unable to load admin data. Check database policies.");
      else { setMatches(m.data || []); setBookings(b.data || []); }
    }
    load();
    return () => { alive = false; };
  }, [session]);

  async function signIn(e) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true); setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    setPassword("");
    setBusy(false);
  }
  async function changeBookingStatus(id,status) {
    setBusy(true);setMessage("");
    const {error}=await supabase.from("bookings").update({status}).eq("id",id);
    if(error)setMessage(error.message);
    else setBookings(prev=>prev.map(b=>b.id===id?{...b,status}:b));
    setBusy(false);
  }
  async function changeMatchStatus(id, status) {
    setBusy(true); setMessage("");
    const { error } = await supabase.from("matches").update({ status }).eq("id", id);
    if (error) setMessage(error.message);
    else setMatches(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    setBusy(false);
  }
  return <main className="bp-admin-shell">
    <div className="container bp-admin-panel">
      <a href="/" className="bp-admin-back">← Back to BallersPlay</a>
      <h1>BallersPlay Admin</h1>
      {!supabase ? <p>Supabase configuration is missing.</p> :
        !session ? <form onSubmit={signIn} className="bp-admin-login">
          <label>Email<input type="email" required autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)}/></label>
          <label>Password<input type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>
          <button type="submit" disabled={busy}>Sign in</button>
        </form> :
        <>
          <button onClick={()=>supabase.auth.signOut()}>Sign out</button>
          {authorized ? <>
            <h2>Matches ({matches.length})</h2>
            {matches.length === 0 ? <p>No matches yet. Organizer submissions will be added in a later phase.</p> :
              <div className="bp-admin-list">{matches.map(m=><article key={m.id}>
                <strong>{m.title || m.id}</strong><p>{m.status} · {m.starts_at}</p>
                {m.status === "pending" && <button disabled={busy} onClick={()=>changeMatchStatus(m.id,"published")}>Publish</button>}
                {m.status === "published" && <button disabled={busy} onClick={()=>changeMatchStatus(m.id,"cancelled")}>Cancel</button>}
              </article>)}</div>}
            <h2>Booking requests ({bookings.length})</h2>
            <p>Booking approvals will be enabled after capacity and payment-state validation is implemented.</p>
            {bookings.map(b=><article key={b.id}>
              <strong>{b.player_name || "Player"}</strong><p>{b.player_email} · {b.status}</p>
              {b.status==="requested"&&<><button disabled={busy} onClick={()=>changeBookingStatus(b.id,"waitlisted")}>Waitlist</button><button disabled={busy} onClick={()=>changeBookingStatus(b.id,"rejected")}>Reject</button></>}
              {b.status==="confirmed"&&<button disabled={busy} onClick={()=>changeBookingStatus(b.id,"cancelled")}>Cancel</button>}
            </article>)}
          </> : <p>Checking administrator permissions…</p>}
        </>}
      {message && <p role="alert">{message}</p>}
    </div>
  </main>;
}
