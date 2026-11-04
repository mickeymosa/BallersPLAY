import React, {useId} from "react";

// Original, self-contained big-head football characters. No network images or external sprites.
// Keep legacy chibi-XX IDs so existing players retain their saved choices.
const characters=[
 {skin:"#e5a26f",hair:"#171b2c",eyes:"#192f54",style:0,expression:0},
 {skin:"#a86a48",hair:"#39231b",eyes:"#593621",style:1,expression:1},
 {skin:"#f3bc8b",hair:"#e7bc37",eyes:"#2d81bb",style:2,expression:0},
 {skin:"#c88962",hair:"#242424",eyes:"#27272c",style:3,expression:2},
 {skin:"#855137",hair:"#111b23",eyes:"#264d32",style:4,expression:1},
 {skin:"#dfaa7e",hair:"#643b2e",eyes:"#70412c",style:5,expression:0}
];
const hairStyles=[
 "M45 91L34 66L48 67L42 44L61 52L72 25L84 39L106 19L122 36L150 24L155 47L178 41L173 66L188 77L166 102L157 67Q120 52 82 72L55 103Z",
 "M39 101Q22 42 80 30Q122 13 171 52L180 101Q162 64 132 67Q88 46 51 102Z",
 "M35 96L40 55L55 60L72 25L91 41L107 14L131 36L155 28L161 52L181 60L172 89Q112 45 59 104Z",
 "M48 95Q45 40 95 40Q158 34 169 97Q134 72 106 75Q76 70 48 95Z",
 "M40 103Q35 49 70 43L74 28L93 42L111 24L125 43L153 39L169 60L174 105Q141 69 110 68Q69 71 40 103Z",
 "M39 99Q24 55 67 39Q96 18 131 40Q159 27 177 64L173 106Q155 61 118 62Q79 52 48 104Z"
];
export default function AvatarPortrait({id="chibi-01",config={},size=150,className="",alt="BallersPlay big-head football avatar"}){
 const uid=useId().replace(/:/g,"");
 const raw=Number.parseInt(String(id).split("-")[1],10);
 const n=Number.isFinite(raw)?Math.max(0,(raw-1)%characters.length):0;
 const c=characters[n];
 const shirt=/^#[0-9a-fA-F]{6}$/.test(config?.jersey||"")?config.jersey:"#1451b5";
 const dark=n%2===0?"#071a3c":"#12243c";
 return <span className={"bp-avatar-portrait bp-headsoccer-avatar "+className} role="img" aria-label={alt} style={{display:"block",height:"100%",width:"100%",overflow:"hidden"}}>
  <svg width={size} height={size} viewBox="0 0 220 230" preserveAspectRatio="xMidYMid meet" style={{width:"100%",height:"100%",display:"block"}} aria-hidden="true">
   <defs>
    <radialGradient id={uid+"bg"} cx="50%" cy="38%"><stop stopColor="#3174b1"/><stop offset="1" stopColor="#0b1b37"/></radialGradient>
    <linearGradient id={uid+"face"} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff0c6"/><stop offset=".27" stopColor={c.skin}/><stop offset="1" stopColor="#74422e"/></linearGradient>
    <linearGradient id={uid+"kit"} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#65b7ff"/><stop offset=".35" stopColor={shirt}/><stop offset="1" stopColor={dark}/></linearGradient>
   </defs>
   <rect width="220" height="230" fill={"url(#"+uid+"bg)"}/>
   <g opacity=".27" stroke="#92d5ff" fill="none"><path d="M-5 183Q105 113 225 180M0 210Q105 138 220 210"/><circle cx="110" cy="186" r="48"/></g>
   <ellipse cx="110" cy="221" rx="76" ry="13" fill="#020c20" opacity=".55"/>
   {/* Tiny body and boots exaggerate the head-to-body scale. */}
   <path d="M78 172Q61 177 54 192L47 218L172 218L164 191Q156 176 138 172Z" fill={"url(#"+uid+"kit)"} stroke="#091524" strokeWidth="6" strokeLinejoin="round"/>
   <path d="M77 182L107 197L140 182" fill="none" stroke="#ffd44c" strokeWidth="7"/>
   <rect x="81" y="211" width="22" height="14" rx="4" fill="#101b30" stroke="#f7f9ff" strokeWidth="3"/>
   <rect x="119" y="211" width="22" height="14" rx="4" fill="#101b30" stroke="#f7f9ff" strokeWidth="3"/>
   {/* Oversized face, ears and expressive eyebrows: arcade soccer aesthetic. */}
   <ellipse cx="42" cy="114" rx="15" ry="23" fill={c.skin} stroke="#151923" strokeWidth="6"/>
   <ellipse cx="179" cy="114" rx="15" ry="23" fill={c.skin} stroke="#151923" strokeWidth="6"/>
   <path d="M45 105Q43 48 109 44Q179 44 177 107L167 145Q153 181 110 181Q65 177 52 146Z" fill={"url(#"+uid+"face)"} stroke="#151923" strokeWidth="7" strokeLinejoin="round"/>
   <path d={hairStyles[c.style]} fill={c.hair} stroke="#10121b" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round"/>
   <path d="M59 80Q88 56 116 65" stroke="#ffffff" strokeOpacity=".2" strokeWidth="7" fill="none" strokeLinecap="round"/>
   <path d="M64 105L100 97M123 98L157 104" stroke={c.hair} strokeWidth="9" strokeLinecap="round"/>
   <ellipse cx="83" cy="117" rx="20" ry="20" fill="#fffdf5" stroke="#191b20" strokeWidth="5"/>
   <ellipse cx="140" cy="117" rx="20" ry="20" fill="#fffdf5" stroke="#191b20" strokeWidth="5"/>
   <ellipse cx="89" cy="118" rx="8.2" ry="11" fill={c.eyes}/>
   <ellipse cx="135" cy="118" rx="8.2" ry="11" fill={c.eyes}/>
   <circle cx="91" cy="113" r="3.5" fill="white"/><circle cx="137" cy="113" r="3.5" fill="white"/>
   <path d="M110 118L103 139L115 141" fill="none" stroke="#9a553d" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
   {c.expression===0?<path d="M87 151Q110 171 136 151Q110 178 87 151Z" fill="#fffbec" stroke="#462b30" strokeWidth="4"/>:
    c.expression===1?<path d="M92 157Q110 148 130 155" fill="none" stroke="#442b32" strokeWidth="5" strokeLinecap="round"/>:
    <path d="M92 151Q110 171 132 148" fill="none" stroke="#493037" strokeWidth="6" strokeLinecap="round"/>}
   {(n===1||n===5)&&<path d="M88 149Q108 166 135 149L130 163Q109 185 91 163Z" fill={c.hair} opacity=".58"/>}
   <path d="M56 141Q73 167 89 171" fill="none" stroke="#ffecc6" strokeWidth="4" strokeOpacity=".25"/>
   <circle cx="181" cy="48" r="7" fill="#c6ff00"/><circle cx="30" cy="37" r="4" fill="#fdd460"/>
  </svg>
 </span>;
}
