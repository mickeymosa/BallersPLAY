import {useEffect,useRef,useState} from "react";
import {supabase} from "../lib/supabase";

const quickQuestions=[
 {label:"How do I sign in?",question:"How do I sign in?"},
 {label:"Forgot my password",question:"How do I reset a forgotten password?"},
 {label:"How do bookings work?",question:"How do I request a spot in a match?"},
 {label:"What is BallersPlay?",question:"What does BallersPlay do?"}
];
const knowledge=[
 {test:/forgot|reset|password|كلمة المرور|نسيت/i,reply:"Open /account, click Forgot password?, enter your account email, and follow the reset link sent to you. Check spam if you don't receive it.",link:"/account"},
 {test:/log.?in|sign.?in|الدخول|تسجيل/i,reply:"Open /account and choose Log in. Enter your email and password or choose Continue with Google. After signing in, you can open My Profile.",link:"/account"},
 {test:/sign.?up|register|create account|حساب جديد|إنشاء حساب/i,reply:"At /account choose Create account. Enter your name, email, international-format phone number and password. If prompted, confirm your email.",link:"/account"},
 {test:/book|match|game|spot|حجز|مباراة/i,reply:"Visit /matches, choose a match and request a spot. You must be logged in with a complete profile. The organizer confirms requests before a spot is guaranteed.",link:"/matches"},
 {test:/organize|host|submit match|منظم|تنظيم/i,reply:"Sign in, finish your profile, and submit the match at /organize. Organizers review booking requests and attendance from My Matches (/manage).",link:"/organize"},
 {test:/profile|avatar|username|rating|تصنيف|الصورة/i,reply:"Visit /profile to save a username, choose your football avatar, and view your player card. Players start at 60 OVR and earn +2 per verified attended game.",link:"/profile"},
 {test:/what|about|ballersplay|purpose|help|ما هو/i,reply:"BallersPlay connects recreational football players in Wrocław with organizers who need players. You can discover matches, request spots, and manage your own games.",link:"/"}
];
const fallback=message=>knowledge.find(x=>x.test.test(message))||{reply:"I can help with signing in, creating an account, resetting your password, requesting games and managing your profile. For an issue that needs a person, email ballerplay.2024@gmail.com.",link:"/account"};
export default function BarqChat(){
 const [open,setOpen]=useState(false),[input,setInput]=useState(""),[busy,setBusy]=useState(false);
 const [messages,setMessages]=useState([{role:"assistant",content:"Hi! I'm BARQ ⚡, your BallersPlay guide. Ask me how to sign in, recover your password, find football matches or use the site."}]);
 const [error,setError]=useState("");
 const scrollRef=useRef(null);
 useEffect(()=>{if(open)scrollRef.current?.scrollIntoView({block:"end",behavior:"smooth"});},[messages,open,busy]);
 useEffect(()=>{
  const listener=e=>{if(e.key==="Escape")setOpen(false);};
  document.addEventListener("keydown",listener);return()=>document.removeEventListener("keydown",listener);
 },[]);
 async function send(value){
  const question=(value||"").trim().slice(0,650);
  if(!question||busy)return;
  setOpen(true);setInput("");setError("");setBusy(true);
  const history=messages.filter(m=>m.role==="user"||m.role==="assistant").slice(-6);
  setMessages(list=>[...list,{role:"user",content:question}]);
  try{
   if(!supabase)throw Error("Chat service not configured");
   const {data,error:requestError}=await supabase.functions.invoke("barq-help",{body:{message:question,history}});
   if(requestError||!data?.reply)throw Error("Chat temporarily unavailable");
   setMessages(list=>[...list,{role:"assistant",content:data.reply,link:data.link||null}]);
  }catch{
   const guide=fallback(question);
   setMessages(list=>[...list,{role:"assistant",content:guide.reply,link:guide.link}]);
   setError("Using built-in help while live AI assistance is unavailable.");
  }finally{setBusy(false);}
 }
 return <div className="bp-barq-shell">
  {open&&<section className="bp-barq-window" role="dialog" aria-label="BARQ website help" aria-modal="false">
   <header className="bp-barq-header"><div className="bp-barq-identity"><span className="bp-barq-logo">⚡</span><div><strong>BARQ</strong><small>BallersPlay help assistant</small></div></div><button type="button" aria-label="Close BARQ" onClick={()=>setOpen(false)}>×</button></header>
   <div className="bp-barq-messages" role="log" aria-label="Chat messages" aria-live="polite">
    {messages.map((message,i)=><div key={i} className={"bp-barq-message "+(message.role==="user"?"bp-barq-user":"bp-barq-assistant")}>
     <span className="bp-barq-speaker">{message.role==="user"?"You":"BARQ"}</span>
     <p>{message.content}</p>
     {message.link&&<a href={message.link}>Open relevant page →</a>}
    </div>)}
    {busy&&<p className="bp-barq-typing">BARQ is thinking…</p>}
    <div ref={scrollRef}/>
   </div>
   {messages.length===1&&<div className="bp-barq-suggestions">{quickQuestions.map(item=><button key={item.label} type="button" onClick={()=>send(item.question)}>{item.label}</button>)}</div>}
   {error&&<p className="bp-barq-error" role="status">{error}</p>}
   <form className="bp-barq-compose" onSubmit={e=>{e.preventDefault();send(input);}}>
    <label htmlFor="bp-barq-input" className="bp-visually-hidden">Ask BARQ</label>
    <input id="bp-barq-input" value={input} onChange={e=>setInput(e.target.value)} maxLength={650} placeholder="Ask BARQ a question…" autoComplete="off"/>
    <button type="submit" disabled={busy||!input.trim()} aria-label="Send message">➤</button>
   </form>
   <p className="bp-barq-disclaimer">BARQ explains website steps. Never share passwords or verification codes.</p>
  </section>}
  <button type="button" className="bp-barq-launcher" onClick={()=>setOpen(v=>!v)} aria-expanded={open} aria-label={open?"Close BARQ assistant":"Chat with BARQ"}>
    <span>⚡</span><strong>{open?"Close":"Ask BARQ"}</strong>
  </button>
 </div>;
}
