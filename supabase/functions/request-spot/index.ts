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
    const input=await req.json();
    if(input.website)return respond({error:"Unable to submit"},400,origin);
    const match_id=String(input.match_id||""),player_name=String(input.player_name||"").trim(),player_email=String(input.player_email||"").trim().toLowerCase(),player_phone=String(input.player_phone||"").trim();
    if(!/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(match_id)||player_name.length<2||player_name.length>120||!/^\S+@\S+\.\S+$/.test(player_email)||player_email.length>254||player_phone.length>40)return respond({error:"Please check your details."},400,origin);
    const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false}});
    const {data:match,error:mErr}=await db.from("matches").select("id,starts_at").eq("id",match_id).eq("status","published").single();
    if(mErr||!match||Date.parse(match.starts_at)<Date.now())return respond({error:"This match is no longer available."},404,origin);
    const {error}=await db.from("bookings").insert({match_id,player_name,player_email,player_phone:player_phone||null,status:"requested"});
    if(error?.code==="23505")return respond({error:"You already have an active request for this match."},409,origin);
    if(error)throw error;
    return respond({ok:true,message:"Request received. Your spot is not confirmed yet."},201,origin);
  }catch(e){console.error("request-spot",e);return respond({error:"Request failed. Please try again."},500,origin);}
});
