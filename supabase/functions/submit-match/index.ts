import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const headers = { "Content-Type": "application/json", "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const respond = (body: unknown, status=200, origin="") => new Response(JSON.stringify(body), {status,headers:{...headers,...(origin?{"Access-Control-Allow-Origin":origin}:{})}});
Deno.serve(async req => {
  const allowed = (Deno.env.get("ALLOWED_ORIGINS") || "").split(",").map(x=>x.trim()).filter(Boolean);
  const origin = req.headers.get("origin") || "";
  const validOrigin = allowed.includes(origin) || /^https:\/\/ballers-play(?:-[a-z0-9-]+)?-mickeymosas-projects\.vercel\.app$/.test(origin);
  if (!validOrigin) return respond({error:"Origin not allowed"},403);
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
    const token=(req.headers.get("authorization")||"").match(/^Bearer\s+([^\s]+)$/i)?.[1];
    if(!token)return respond({error:"Sign in to organize a match."},401,origin);
    const url=Deno.env.get("SUPABASE_URL")!;
    const authClient=createClient(url,(Deno.env.get("SUPABASE_ANON_KEY")||Deno.env.get("SUPABASE_PUBLISHABLE_KEY"))!,{auth:{persistSession:false}});
    const {data:{user},error:authError}=await authClient.auth.getUser(token);
    if(authError||!user?.email)return respond({error:"Please log in again."},401,origin);
    const input=await req.json();
    if(input.website) return respond({error:"Unable to submit"},400,origin);
    const name=String(input.name||"").trim(),email=String(input.email||"").trim().toLowerCase(),phone=String(input.phone||"").trim();
    const title=String(input.title||"").trim(),venue=String(input.venue||"").trim(),description=String(input.description||"").trim();
    const format=String(input.format||"5v5"),starts_at=String(input.starts_at||"");
    const capacity=Number(input.capacity),price_pln=Number(input.price_pln);
    if(name.length<2||name.length>120||!/^\S+@\S+\.\S+$/.test(email)||email.length>254||phone.length>40||title.length<3||title.length>160||venue.length<3||venue.length>200||description.length>1500||!["5v5","6v6","7v7","8v8","11v11"].includes(format)||!Number.isInteger(capacity)||capacity<1||capacity>100||!Number.isFinite(price_pln)||price_pln<0||price_pln>10000||!Number.isFinite(Date.parse(starts_at))||Date.parse(starts_at)<Date.now()+3600000) return respond({error:"Please check your match details."},400,origin);
    const key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const db=createClient(url,key,{auth:{persistSession:false}});
    const {data:profile,error:profileError}=await db.from("player_profiles").select("full_name,phone").eq("id",user.id).maybeSingle();
    if(profileError||!profile)return respond({error:"Complete your account profile before organizing."},403,origin);
    if(email!==user.email.toLowerCase()||name!==profile.full_name||phone!==profile.phone)return respond({error:"Contact details must match your account."},400,origin);
    let {data:org,error:orgErr}=await db.from("organizers").select("id").eq("owner_id",user.id).limit(1).maybeSingle();
    if(orgErr)throw orgErr;
    if(!org){
      const created=await db.from("organizers").insert({owner_id:user.id,name,email,phone}).select("id").single();
      if(created.error)throw created.error;
      org=created.data;
    }
    const {error}=await db.from("matches").insert({organizer_id:org.id,title,city:"Wrocław",venue,starts_at:new Date(starts_at).toISOString(),format,capacity,price_pln,description:description||null,status:"pending"});
    if(error) throw error;
    return respond({ok:true,message:"Match submitted for review."},201,origin);
  } catch(e){console.error("submit-match",e);return respond({error:"Submission failed. Please try again."},500,origin);}
});
