import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const headers = { "Content-Type": "application/json", "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const respond = (body: unknown, status=200, origin="") => new Response(JSON.stringify(body), {status,headers:{...headers,...(origin?{"Access-Control-Allow-Origin":origin}:{})}});
Deno.serve(async req => {
  const allowed = (Deno.env.get("ALLOWED_ORIGINS") || "").split(",").map(x=>x.trim()).filter(Boolean);
  const origin = req.headers.get("origin") || "";
  if (!allowed.includes(origin)) return respond({error:"Origin not allowed"},403);
  if(req.method==="OPTIONS") return new Response(null,{status:204,headers:{...headers,"Access-Control-Allow-Origin":origin}});
  if(req.method!=="POST") return respond({error:"Method not allowed"},405,origin);

  // Atomic rate limiting runs before parsing or writing public submissions.
  // Only trust the platform-provided connecting IP; never trust arbitrary forwarded headers.
  const ip=req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip");
  if (!ip) return respond({error:"Submission temporarily unavailable."},503,origin);
  const secret=Deno.env.get("RATE_LIMIT_HASH_SECRET");
  if (!secret || secret.length<32) return respond({error:"Submission temporarily unavailable."},503,origin);
  const encoder=new TextEncoder();
  const key=await crypto.subtle.importKey("raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const signature=await crypto.subtle.sign("HMAC",key,encoder.encode(ip));
  const ipHash=Array.from(new Uint8Array(signature)).map(b=>b.toString(16).padStart(2,"0")).join("");
  const limitDb=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false}});
  const {data:allowedSubmission,error:limitError}=await limitDb.rpc("ballersplay_check_submission_limit",{p_action:"submit-match",p_ip_hash:ipHash,p_max_attempts:5});
  if(limitError){console.error("Rate limit check failed",limitError);return respond({error:"Submission temporarily unavailable."},503,origin);}
  if(!allowedSubmission)return respond({error:"Too many submissions. Please try again in an hour."},429,origin);
  try {
    const input=await req.json();
    if(input.website) return respond({error:"Unable to submit"},400,origin);
    const name=String(input.name||"").trim(),email=String(input.email||"").trim().toLowerCase(),phone=String(input.phone||"").trim();
    const title=String(input.title||"").trim(),venue=String(input.venue||"").trim(),description=String(input.description||"").trim();
    const format=String(input.format||"5v5"),starts_at=String(input.starts_at||"");
    const capacity=Number(input.capacity),price_pln=Number(input.price_pln);
    if(name.length<2||name.length>120||!/^\S+@\S+\.\S+$/.test(email)||email.length>254||phone.length>40||title.length<3||title.length>160||venue.length<3||venue.length>200||description.length>1500||!["5v5","6v6","7v7","8v8","11v11"].includes(format)||!Number.isInteger(capacity)||capacity<1||capacity>100||!Number.isFinite(price_pln)||price_pln<0||price_pln>10000||!Number.isFinite(Date.parse(starts_at))||Date.parse(starts_at)<Date.now()+3600000) return respond({error:"Please check your match details."},400,origin);
    const url=Deno.env.get("SUPABASE_URL")!,key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const db=createClient(url,key,{auth:{persistSession:false}});
    const {data:org,error:orgErr}=await db.from("organizers").insert({name,email,phone:phone||null}).select("id").single();
    if(orgErr) throw orgErr;
    const {error}=await db.from("matches").insert({organizer_id:org.id,title,city:"Wrocław",venue,starts_at:new Date(starts_at).toISOString(),format,capacity,price_pln,description:description||null,status:"pending"});
    if(error) throw error;
    return respond({ok:true,message:"Match submitted for review."},201,origin);
  } catch(e){console.error("submit-match",e);return respond({error:"Submission failed. Please try again."},500,origin);}
});
