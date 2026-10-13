import React from "react";

export const AVATAR_STYLES = ["striker","keeper","captain","playmaker","defender","speedster"];
export const AVATAR_SKINS = ["#f5c7a5","#d99a71","#b97750","#8c523a","#603b2e"];
export const AVATAR_HAIRS = ["#241a19","#673b25","#a96832","#e9bd59","#e5e5e5","#3057c9"];
export const AVATAR_JERSEYS = ["#c6ff00","#f04444","#367be8","#f8f8f8","#141414","#ffcb35","#fb8a24","#a855f7"];
export const AVATAR_HAIR_STYLES = ["spiky","swept","curly","buzz","long","mohawk"];
export const AVATAR_EXPRESSIONS = ["confident","smile","focused"];
export const avatarDefaults = {skin:"#d99a71",hair:"#241a19",jersey:"#c6ff00",hairStyle:"spiky",expression:"confident"};

const presets = {
 striker:{skin:"#d99a71",hair:"#673b25",jersey:"#c6ff00",hairStyle:"spiky",expression:"confident"},
 keeper:{skin:"#b97750",hair:"#241a19",jersey:"#fb8a24",hairStyle:"buzz",expression:"focused"},
 captain:{skin:"#8c523a",hair:"#241a19",jersey:"#367be8",hairStyle:"swept",expression:"smile"},
 playmaker:{skin:"#f5c7a5",hair:"#e9bd59",jersey:"#f04444",hairStyle:"long",expression:"confident"},
 defender:{skin:"#603b2e",hair:"#241a19",jersey:"#f8f8f8",hairStyle:"curly",expression:"focused"},
 speedster:{skin:"#d99a71",hair:"#3057c9",jersey:"#ffcb35",hairStyle:"mohawk",expression:"smile"}
};
export function avatarPreset(key){return {...(presets[key]||presets.striker)};}
export function sanitizeAvatar(input={}){
 const v={...avatarDefaults,...input};
 for(const [k,options] of [["skin",AVATAR_SKINS],["hair",AVATAR_HAIRS],["jersey",AVATAR_JERSEYS],["hairStyle",AVATAR_HAIR_STYLES],["expression",AVATAR_EXPRESSIONS]]){
   if(!options.includes(v[k]))v[k]=avatarDefaults[k];
 }
 return v;
}
export default function FootballAvatar({variant="striker",config,size=80}){
 const a=sanitizeAvatar(config||avatarPreset(variant));
 const hairShapes={
  spiky:"M26 44 L21 26 L32 30 L35 15 L45 24 L55 10 L60 23 L73 18 L72 33 L81 27 L76 49 L68 37 Q50 27 30 42Z",
  swept:"M23 45 Q16 23 39 17 Q62 5 77 25 Q67 26 57 32 Q37 25 27 46Z",
  curly:"M23 45 Q15 37 22 30 Q16 18 30 18 Q35 7 46 17 Q56 7 64 18 Q78 15 76 31 Q84 40 75 47 L68 37 Q47 27 30 44Z",
  buzz:"M27 39 Q26 16 50 17 Q73 17 73 39 Q53 30 27 39Z",
  long:"M23 43 Q16 17 44 13 Q77 8 79 39 L78 67 L69 61 L69 34 Q48 26 30 43 L30 63 L22 67Z",
  mohawk:"M28 43 L32 29 L42 21 L45 8 L53 18 L60 9 L65 23 L74 33 L72 43 Q51 30 28 43Z"
 };
 const eyes=a.expression==="smile"?"M37 47 Q41 43 45 47 M55 47 Q59 43 63 47":"";
 return <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={"Original cartoon footballer avatar, "+a.hairStyle+" hair"} style={{display:"block",maxWidth:"100%",height:"auto"}}>
  <defs><linearGradient id="bpAvatarBg" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#35517a"/><stop offset="1" stopColor="#0e1928"/></linearGradient></defs>
  <circle cx="50" cy="50" r="49" fill="url(#bpAvatarBg)" stroke="#4b6581" strokeWidth="1.5"/>
  <path d="M9 99 Q12 72 36 70 L64 70 Q88 72 91 99Z" fill={a.jersey} stroke="#15161a" strokeWidth="3.5"/>
  <path d="M36 72 L50 86 L64 72" fill="none" stroke="#fff" strokeWidth="3"/>
  <path d="M48 75 L50 87 L52 75" stroke="#171717" strokeWidth="2"/>
  <rect x="43" y="60" width="14" height="16" rx="5" fill={a.skin} stroke="#211713" strokeWidth="2"/>
  <ellipse cx="50" cy="42" rx="26" ry="30" fill={a.skin} stroke="#1e1514" strokeWidth="3"/>
  <path d={hairShapes[a.hairStyle]} fill={a.hair} stroke="#1a1415" strokeWidth="3" strokeLinejoin="round"/>
  <path d="M33 40 L45 42 M55 42 L67 40" fill="none" stroke="#231915" strokeWidth="3.5" strokeLinecap="round"/>
  {eyes?<path d={eyes} fill="none" stroke="#211719" strokeWidth="2.5" strokeLinecap="round"/>:<>
   <ellipse cx="41" cy="48" rx="5.7" ry="6.7" fill="#fff" stroke="#1c1718" strokeWidth="2"/>
   <ellipse cx="59" cy="48" rx="5.7" ry="6.7" fill="#fff" stroke="#1c1718" strokeWidth="2"/>
   <circle cx="43" cy="48" r="3" fill="#322c29"/><circle cx="57" cy="48" r="3" fill="#322c29"/>
   <circle cx="44" cy="46.5" r="1" fill="#fff"/><circle cx="58" cy="46.5" r="1" fill="#fff"/>
  </>}
  {a.expression==="focused"?<path d="M43 63 L57 63" stroke="#643c32" strokeWidth="2.5" strokeLinecap="round"/>:
  <path d={a.expression==="smile"?"M40 60 Q50 72 60 60Z":"M42 61 Q50 67 58 61"} stroke="#643c32" strokeWidth="2.5" fill={a.expression==="smile"?"#fff":"none"} strokeLinecap="round"/>}
  <path d="M18 83 L11 99 M82 83 L89 99" stroke="#111" strokeOpacity=".25" strokeWidth="4"/>
 </svg>;
}
