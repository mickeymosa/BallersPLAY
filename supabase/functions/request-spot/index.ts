import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const headers = { "Content-Type": "application/json", "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const respond = (body: unknown,status=200,origin="")=>new Response(JSON.stringify(body),{status,headers:{...headers,...(origin?{"Access-Control-Allow-Origin":origin}:{})}});
Deno.serve(async req=>{
  const allowed=(Deno.env.get("ALLOWED_ORIGINS")||"").split(",").map(x=>x.trim()).filter(Boolean);
  const origin=req.headers.get("origin")||"";
  if(!allowed.includes(origin))return respond({error:"Origin not allowed"},403);
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:{...headers,"Access-Control-Allow-Origin":origin}});
  if(req.method!=="POST")return respond({error:"Method not allowed"},405,origin);
  try{
    const authHeader=req.headers.get("authorization")||"";
    const token=authHeader.match(/^Bearer\s+([^\s]+)$/i)?.[1];
    if(!token)return respond({error:"Log in to request a spot."},401,origin);
    const authClient=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!,{auth:{persistSession:false}});
    const {data:{user},error:authError}=await authClient.auth.getUser(token);
    if(authError||!user||!user.email)return respond({error:"Please log in again."},401,origin);
    const input=await req.json();
    if(input.website)return respond({error:"Unable to submit"},400,origin);
    const match_id=String(input.match_id||""),player_name=String(input.player_name||"").trim(),player_email=String(input.player_email||"").trim().toLowerCase(),player_phone=String(input.player_phone||"").trim();
    if(!/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(match_id)||player_name.length<2||player_name.length>120||!/^\S+@\S+\.\S+$/.test(player_email)||player_email.length>254||player_phone.length>40)return respond({error:"Please check your details."},400,origin);
    const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false}});
    const {data:profile,error:profileError}=await db.from("player_profiles").select("full_name,phone").eq("id",user.id).maybeSingle();
    if(profileError||!profile)return respond({error:"Complete your player account before booking."},403,origin);
    if(player_email!==user.email.toLowerCase()||player_name!==profile.full_name||player_phone!==profile.phone)
      return respond({error:"Booking details must match your registered account."},400,origin);
    const {data:match,error:mErr}=await db.from("matches").select("id,starts_at").eq("id",match_id).eq("status","published").single();
    if(mErr||!match||Date.parse(match.starts_at)<Date.now())return respond({error:"This match is no longer available."},404,origin);
    const {error}=await db.from("bookings").insert({match_id,player_name,player_email,player_phone:player_phone||null,status:"requested"});
    if(error?.code==="23505")return respond({error:"You already have an active request for this match."},409,origin);
    if(error)throw error;
    return respond({ok:true,message:"Request received. Your spot is not confirmed yet."},201,origin);
  }catch(e){console.error("request-spot",e);return respond({error:"Request failed. Please try again."},500,origin);}
});
