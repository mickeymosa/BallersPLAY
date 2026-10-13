import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
export default function AccountNav() {
 const [user,setUser]=useState(null);
 useEffect(()=>{
  if(!supabase)return;
  supabase.auth.getUser().then(({data})=>setUser(data.user||null));
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>setUser(session?.user||null));
  return ()=>subscription.unsubscribe();
 },[]);
 return <span className="bp-account-nav">
   <a href="/account">{user?"My Profile":"Log in / Sign up"}</a>
   {user&&<button type="button" onClick={async()=>{await supabase.auth.signOut();window.location.assign("/");}}>Sign out</button>}
 </span>;
}
