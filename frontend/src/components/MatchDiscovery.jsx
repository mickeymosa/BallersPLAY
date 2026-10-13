import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function MatchDiscovery() {
  const [matches, setMatches] = useState([]);
  const [state, setState] = useState("loading");

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
                <span>Booking requests opening soon</span>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
