import { useState } from "react";
import { supabase } from "../lib/supabase";
const initial={name:"",email:"",phone:"",title:"",venue:"",starts_at:"",format:"5v5",capacity:10,price_pln:0,description:"",website:""};
export default function OrganizerSubmission(){
  const [form,setForm]=useState(initial),[state,setState]=useState("idle"),[message,setMessage]=useState("");
  const update=e=>setForm(f=>({...f,[e.target.name]:e.target.value}));
  async function submit(e){
    e.preventDefault();if(!supabase)return;
    setState("sending");setMessage("");
    const {data,error}=await supabase.functions.invoke("submit-match",{body:{...form,starts_at:new Date(form.starts_at).toISOString()}});
    if(error||!data?.ok){setState("error");setMessage(data?.error||"Unable to submit. Please try again.");return;}
    setState("success");setMessage("Match submitted for review. We will contact you after verification.");setForm(initial);
  }
  return <section id="submit-match" className="bp-form-section"><div className="container bp-form-wrap">
    <p className="eyebrow">FOR ORGANIZERS</p><h2>Submit a football match</h2><p>We review every submission before it appears on BallersPlay.</p>
    {!supabase?<p>Match submissions are being prepared.</p>:<form onSubmit={submit} className="bp-native-form">
      <div className="bp-form-grid">
        <label>Your name<input name="name" value={form.name} onChange={update} minLength={2} maxLength={120} required/></label>
        <label>Email<input type="email" name="email" value={form.email} onChange={update} required/></label>
        <label>Phone (optional)<input name="phone" value={form.phone} onChange={update} maxLength={40}/></label>
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
