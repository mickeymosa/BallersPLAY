import {useEffect,useState} from "react";
import FootballAvatar,{AVATAR_STYLES,AVATAR_SKINS,AVATAR_HAIRS,AVATAR_JERSEYS,AVATAR_HAIR_STYLES,AVATAR_EXPRESSIONS,avatarPreset,sanitizeAvatar} from "./FootballAvatar";

const choices=[["skin","Skin tone",AVATAR_SKINS],["hair","Hair color",AVATAR_HAIRS],["jersey","Jersey color",AVATAR_JERSEYS]];
export default function AvatarCustomizer({profile,onSave,busy=false}){
 const [draft,setDraft]=useState(()=>sanitizeAvatar(profile.avatar_config && Object.keys(profile.avatar_config).length?profile.avatar_config:avatarPreset(profile.avatar_key)));
 const [preset,setPreset]=useState(profile.avatar_key||"striker");
 const [notice,setNotice]=useState("");
 useEffect(()=>{
  setDraft(sanitizeAvatar(profile.avatar_config && Object.keys(profile.avatar_config).length?profile.avatar_config:avatarPreset(profile.avatar_key)));
  setPreset(profile.avatar_key||"striker");
 },[profile.avatar_key,profile.avatar_config]);
 const update=(key,value)=>{setDraft(p=>({...p,[key]:value}));setNotice("");};
 const choose=(key)=>{setPreset(key);setDraft(avatarPreset(key));setNotice("");};
 async function save(){
  setNotice("");
  const result=await onSave(preset,sanitizeAvatar(draft));
  if(result===true)setNotice("Avatar saved to your profile.");
  else setNotice("Unable to save avatar. Please try again.");
 }
 return <section className="bp-customizer" aria-label="Customize your football avatar">
  <div className="bp-customizer-top"><div><span className="bp-customizer-kicker">YOUR PLAYER. YOUR STYLE.</span><h2>Choose your avatar</h2><p>Build your own big-head football character.</p></div></div>
  <div className="bp-customizer-layout">
   <div className="bp-customizer-gallery">
    <h3>Starting characters</h3>
    <div className="bp-customizer-grid">{AVATAR_STYLES.map(key=><button type="button" key={key} aria-pressed={preset===key} className={preset===key?"active":""} onClick={()=>choose(key)} title={key}>
      <FootballAvatar variant={key} size={94}/><span>{key}</span></button>)}</div>
    <div className="bp-customizer-options">
     {choices.map(([key,label,values])=><fieldset key={key}><legend>{label}</legend><div className="bp-color-options">{values.map(value=><button type="button" key={value} aria-label={label+" "+value} aria-pressed={draft[key]===value} className={draft[key]===value?"active":""} style={{background:value}} onClick={()=>update(key,value)}/>)}</div></fieldset>)}
     <label>Hairstyle<select value={draft.hairStyle} onChange={e=>update("hairStyle",e.target.value)}>{AVATAR_HAIR_STYLES.map(x=><option key={x} value={x}>{x}</option>)}</select></label>
     <label>Expression<select value={draft.expression} onChange={e=>update("expression",e.target.value)}>{AVATAR_EXPRESSIONS.map(x=><option key={x} value={x}>{x}</option>)}</select></label>
    </div>
   </div>
   <div className="bp-customizer-preview"><div className="bp-avatar-stadium"><div className="bp-stadium-lights">✦　✦　✦</div><FootballAvatar config={draft} size={275}/></div>
    <div className="bp-avatar-player-name"><strong>{profile.full_name||"Your footballer"}</strong><span>{profile.username?"@"+profile.username:"Your BallersPlay avatar"}</span></div>
    <div className="bp-customizer-actions"><button type="button" className="bp-avatar-random" onClick={()=>choose(AVATAR_STYLES[Math.floor(Math.random()*AVATAR_STYLES.length)])}>Random avatar</button>
     <button type="button" className="bp-avatar-save" disabled={busy} onClick={save}>{busy?"Saving…":"Save avatar"}</button></div>
    {notice&&<p role="status">{notice}</p>}
   </div>
  </div>
 </section>;
}
