import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
const initial={name:"",email:"",phone:"",title:"",venue:"",starts_at:"",format:"5v5",capacity:10,price_pln:0,description:"",website:""};
export default function OrganizerSubmission(){
  const [form,setForm]=useState(initial),[state,setState]=useState("idle"),[message,setMessage]=useState("");
  const [user,setUser]=useState(null),[profile,setProfile]=useState(null),[authLoading,setAuthLoading]=useState(true);
  useEffect(()=>{
    if(!supabase){setAuthLoading(false);return;}
    let active=true;
    const refresh=async()=>{
      const {data:{session}}=await supabase.auth.getSession();
      if(!active)return;
      setUser(session?.user||null);
      if(!session?.user){setProfile(null);setAuthLoading(false);return;}
      const {data}=await supabase.from("player_profiles").select("full_name,phone").eq("id",session.user.id).maybeSingle();
      if(!active)return;
      setProfile(data||null);
      if(data)setForm(f=>({...f,name:data.full_name,email:session.user.email||"",phone:data.phone}));
      setAuthLoading(false);
    };
    refresh();
    const {data:{subscription}}=supabase.auth.onAuthStateChange(()=>{refresh();});
    return ()=>{active=false;subscription.unsubscribe();};
  },[]);
  const update=e=>setForm(f=>({...f,[e.target.name]:e.target.value}));
  async function submit(e){
    e.preventDefault();if(!supabase)return;
    if(!user||!profile){setState("error");setMessage("Sign in and complete your profile before submitting a match.");return;}
    setState("sending");setMessage("");
    const {data,error}=await supabase.functions.invoke("submit-match",{body:{...form,starts_at:new Date(form.starts_at).toISOString()}});
    if(error||!data?.ok){
      let detail=data?.error;
      const status=error?.context?.status;
      if(!detail&&error?.context?.json){try{detail=(await error.context.json())?.error;}catch(_){}}
      if(!detail&&status===401) detail="Authorization failed (401). Check Edge Function JWT verification.";
      if(!detail&&status===403) detail="Origin not allowed (403). Check ALLOWED_ORIGINS in Supabase.";
      if(!detail&&status) detail="Submission failed (HTTP "+status+"). Check Supabase function logs.";
      if(!detail) detail="Network or CORS error. Check ALLOWED_ORIGINS and browser Network tab.";
      setState("error");setMessage(detail);return;
    }
    setState("success");setMessage("Match submitted for review. We will contact you after verification.");setForm(initial);
  }
  return <section id="submit-match" className="bp-form-section"><div className="container bp-form-wrap">
    <p className="eyebrow">FOR ORGANIZERS</p><h2>Submit a football match</h2><p>We review every submission before it appears on BallersPlay.</p>
    {!supabase?<p>Match submissions are being prepared.</p>:authLoading?<p>Checking your account…</p>:!user?<p><a href="/account">Log in or create an account</a> to organize matches.</p>:!profile?<p><a href="/profile">Complete your player profile</a> before organizing a match.</p>:<form onSubmit={submit} className="bp-native-form">
      <div className="bp-form-grid">
        <label>Your name<input name="name" value={form.name} readOnly minLength={2} maxLength={120} required/></label>
        <label>Email<input type="email" name="email" value={form.email} readOnly required/></label>
        <label>Phone (from profile)<input name="phone" value={form.phone} readOnly maxLength={40}/></label>
        <label>Match title<input name="title" value={form.title} onChange={update} minLength={3} maxLength={160} required/></label>
        <label>Venue in Wrocław<input name="venue" value={form.venue} onChange={update} required/></label>
        <label>Date and time<input type="datetime-local" name="starts_at" value={form.starts_at} onChange={update} required/></label>
        <label>Format<select name="format" value={form.format} onChange={update}>{["5v5","6v6","7v7","8v8","11v11"].map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Total player capacity<input type="number" name="capacity" min="1" max="100" value={form.capacity} onChange={update} required/></label>
        <label>Price per player (PLN)<input type="number" name="price_pln" min="0" max="10000" step="0.01" value={form.price_pln} onChange={update} required/></label>
      </div>
      <label>Additional details<textarea name="description" maxLength={1500} value={form.description} onChange={update}/></label>
      <input className="bp-honeypot" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={update} aria-hidden="true"/>
      <p>By submitting, you agree to be contacted about this match. No booking or payment is guaranteed.</p>
      <button type="submit" disabled={state==="sending"}>{state==="sending"?"Submitting…":"Submit match for review"}</button>
      {message&&<p role="status">{message}</p>}
    </form>}
  </div></section>;
}
