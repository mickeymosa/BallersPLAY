// Deploy with JWT verification enabled. Invoke only from a trusted scheduler with service-role authorization.
// Required secrets: RESEND_API_KEY, BOOKING_EMAIL_FROM, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
Deno.serve(async (req) => {
 if(req.method!=="POST") return new Response("Method not allowed",{status:405});
 const bearer=req.headers.get("authorization")||"";
 const secret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!secret || bearer!==`Bearer ${secret}`) return new Response("Unauthorized",{status:401});
 const apiKey=Deno.env.get("RESEND_API_KEY"),from=Deno.env.get("BOOKING_EMAIL_FROM");
 if(!apiKey||!from) return new Response("Email service not configured",{status:503});
 // While using Resend's test sender, restrict delivery to the account's verified inbox.
 const testRecipient=(Deno.env.get("BOOKING_EMAIL_TEST_RECIPIENT")||"").trim().toLowerCase();
 if(!testRecipient) return new Response("Test recipient allowlist is not configured",{status:503});
 const db=createClient(Deno.env.get("SUPABASE_URL")!,secret,{auth:{persistSession:false}});
 const {data:jobs,error}=await db.rpc("ballersplay_claim_booking_emails",{p_recipient:testRecipient,p_limit:10});
 if(error) {console.error("Email queue claim failed",error);return new Response("Outbox unavailable",{status:500});}
 let sent=0,failed=0;
 for(const job of jobs||[]){
   const p=job.payload||{};
   const title=String(p.match_title||"your football match");
   const subject=({requested:"Booking request received",confirmed:"Your spot is confirmed",rejected:"Booking request update",cancelled:"Booking cancelled"} as Record<string,string>)[job.event_type]||"Booking update";
   const state=({requested:"Your request is pending approval.",confirmed:"Your spot has been confirmed.",rejected:"Your booking request was not accepted.",cancelled:"Your booking has been cancelled."} as Record<string,string>)[job.event_type]||"Your booking was updated.";
   const date=p.starts_at?new Date(p.starts_at).toLocaleString("en-GB",{timeZone:"Europe/Warsaw",dateStyle:"full",timeStyle:"short"}):"To be confirmed";
   const text=`Hello ${p.player_name||"player"},\n\n${state}\nMatch: ${title}\nWhen: ${date} (Poland time)\nWhere: ${[p.venue,p.city].filter(Boolean).join(", ")}\n\nPayments are arranged directly with the organizer after confirmation.\n\nBallersPlay`;
   try{
     const res=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":`Bearer ${apiKey}`,"Content-Type":"application/json","Idempotency-Key":`ballersplay-${job.id}`},body:JSON.stringify({from,to:[job.recipient_email],subject,text})});
     if(!res.ok)throw new Error(`Email provider HTTP ${res.status}`);
     const {data:marked,error:markError}=await db.rpc("ballersplay_finish_booking_email",{p_id:job.id,p_token:job.lease_token,p_success:true});
     if(markError||!marked) throw new Error("Provider accepted email but outbox acknowledgement failed");
     sent++;
   }catch(e){
     failed++;
     console.error("Booking email delivery failed",job.id,String(e));
     await db.rpc("ballersplay_finish_booking_email",{p_id:job.id,p_token:job.lease_token,p_success:false,p_error:String(e).slice(0,250)});
   }
 }
 return Response.json({processed:(jobs||[]).length,sent,failed});
});
