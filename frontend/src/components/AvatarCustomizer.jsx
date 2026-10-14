import {useEffect,useMemo,useState} from "react";
import PlayerCard from "./PlayerCard";
import AvatarPortrait from "./AvatarPortrait";
import {CHIBI_CHARACTERS,CHIBI_CATEGORIES} from "./chibiCatalog";
import {avatarPreset,sanitizeAvatar} from "./FootballAvatar";

const accents=["#c6ff00","#e62c36","#2367c9","#f5f5f5","#141414","#ffd02c","#fb831b","#762ca7","#f3a0c5"];
export default function AvatarCustomizer({profile,stats,onSave,busy=false}){
 const [draft,setDraft]=useState(()=>sanitizeAvatar(profile.avatar_config||{}));
 const [character,setCharacter]=useState(profile.avatar_config?.chibiId||"chibi-01");
 const [category,setCategory]=useState("All");
 const [notice,setNotice]=useState("");
 useEffect(()=>{
  setDraft(sanitizeAvatar(profile.avatar_config||{}));
  setCharacter(profile.avatar_config?.chibiId||"chibi-01");
 },[profile.avatar_config]);
 const visible=useMemo(()=>CHIBI_CHARACTERS.filter(c=>category==="All"||c.category===category),[category]);
 const choose=id=>{setCharacter(id);setNotice("");};
 const random=()=>choose(CHIBI_CHARACTERS[Math.floor(Math.random()*CHIBI_CHARACTERS.length)].id);
 async function save(){
  setNotice("");
  // Keep the existing valid avatar_key for backwards compatibility with older profiles.
  const result=await onSave(profile.avatar_key||"striker",{...draft,chibiId:character});
  setNotice(result===true?"Character saved to your account.":"Unable to save your character. Please try again.");
 }
 return <section className="bp-chibi-editor" aria-label="Choose your football character">
  <div className="bp-chibi-main">
   <div className="bp-chibi-heading"><h2>Choose Your Avatar</h2>
    <div className="bp-chibi-tabs" role="group" aria-label="Avatar categories">{CHIBI_CATEGORIES.map(c=><button key={c} type="button" className={category===c?"active":""} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}</div>
   </div>
   <div className="bp-chibi-gallery">{visible.map(c=><button type="button" key={c.id} title={c.name} aria-label={"Select "+c.name} aria-pressed={character===c.id} className={"bp-chibi-tile"+(character===c.id?" active":"")} onClick={()=>choose(c.id)}>
    <AvatarPortrait id={c.id} config={draft} alt={c.name} size={108}/>
   </button>)}</div>
  </div>
  <aside className="bp-chibi-sidebar">
   <div className="bp-chibi-hero"><AvatarPortrait id={character} config={draft} alt="Selected football character" size={260} loading="eager"/></div>
   <div className="bp-chibi-persona">
    <div className="bp-chibi-player-row"><div><strong>{profile.full_name||"Your Player"}</strong><p>{profile.username?"@"+profile.username:"Choose a username in your profile"}</p></div><span>⚽</span></div>
    <p className="bp-chibi-subtitle">Choose your player card accent</p>
    <div className="bp-chibi-swatches">{accents.map(color=><button key={color} type="button" aria-label={"Card accent "+color} aria-pressed={draft.jersey===color} className={draft.jersey===color?"active":""} style={{background:color}} onClick={()=>setDraft(p=>({...p,jersey:color}))}/>)}</div>
   </div>
   <div className="bp-chibi-buttons"><button type="button" onClick={random}>⚄ Random Avatar</button><button type="button" disabled={busy} onClick={save}>{busy?"Saving…":"Save Avatar"}</button></div>
   {notice&&<p role="status">{notice}</p>}
   <div className="bp-chibi-card"><h3>Your player card</h3><PlayerCard profile={profile} stats={stats} config={{...draft,chibiId:character}} preview/></div>
  </aside>
 </section>;
}
