import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AccountNav() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!supabase) { setReady(true); return; }
    let mounted = true;
    // getSession reads the persisted browser session without a network round trip.
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) { setUser(data.session?.user || null); setReady(true); }
    }).catch(() => { if (mounted) setReady(true); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) { setUser(session?.user || null); setReady(true); }
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  async function signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) return window.alert("Unable to sign out: " + error.message);
    window.location.assign("/");
  }

  return <span className="bp-account-nav">
    <a href="/profile" className="bp-profile-link">{!ready ? "Account" : user ? "My Profile" : "Log in / Sign up"}</a>
    {user && <button type="button" onClick={signOut}>Sign out</button>}
  </span>;
}
