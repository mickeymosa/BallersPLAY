import React from "react";

// Original late-2000s-era football-game portrait aesthetic.
// Vector portraits ship with the app: no broken external image assets.
export default function AvatarPortrait({id="chibi-01",config={},size=150,className="",alt="Footballer portrait"}){
 const n=Math.max(0,Math.min(29,(parseInt(String(id).split("-")[1],10)||1)-1));
 const skins=["#d9a078","#a96745","#f0c4a1","#78452e","#c58b64","#9e603e"];
 const hairs=["#241a17","#30241e","#ae7844","#171b22","#51352c","#e1b66e","#452718","#242324"];
 const shirts=["#dce7f0","#2254a2","#bf282c","#171c23","#e7c931","#18806b","#f5f5f5"];
 const faces=["M64 69 Q62 37 95 33 Q128 37 127 71 L123 104 Q114 124 96 128 Q78 123 69 106Z",
 "M66 72 Q62 37 94 34 Q126 38 125 75 Q122 113 98 129 Q74 121 68 102Z",
 "M64 67 Q67 35 97 35 Q129 37 128 71 L121 110 Q110 125 95 128 Q77 121 68 102Z"];
 const skin=skins[n%skins.length],hair=hairs[(n*3+Math.floor(n/5))%hairs.length],shirt=config?.jersey||shirts[n%shirts.length];
 const beard=n%5===1||n%7===2;
 const longHair=n%6===2||n%6===4;
 const crop=n%7===3;
 const highHair=n%6===0||n%6===5;
 const uid="bpface"+n;
 const hairPath=crop?"M65 70 Q57 40 75 33 Q101 20 121 39 L127 70 Q116 49 96 49 Q78 50 65 70Z":
 longHair?"M62 76 Q49 43 66 24 Q86 4 119 21 Q141 36 128 78 L132 120 L120 117 L118 58 Q99 44 76 53 L72 110 L60 117Z":
 highHair?"M62 76 L58 43 L66 25 L73 31 L82 15 L91 25 L106 11 L115 27 L129 21 L127 48 L133 72 Q114 47 95 50 Q75 48 62 76Z":
 "M62 77 Q52 40 77 24 Q105 11 125 35 L132 74 Q121 49 99 47 Q78 49 62 77Z";
 return <span className={"bp-avatar-portrait "+className} style={{display:"block",width:"100%",height:"100%",overflow:"hidden"}} role="img" aria-label={alt}>
 <svg width={size} height={size} viewBox="0 0 190 192" preserveAspectRatio="xMidYMid slice" style={{display:"block",width:"100%",height:"100%"}}>
 <defs>
  <radialGradient id={uid+"bg"} cx="52%" cy="22%" r="85%"><stop stopColor="#53789b"/><stop offset=".53" stopColor="#1d384f"/><stop offset="1" stopColor="#09131d"/></radialGradient>
  <linearGradient id={uid+"skin"} x1="0" y1="0" x2="1" y2=".65"><stop stopColor="#f0cba9"/><stop offset=".24" stopColor={skin}/><stop offset=".68" stopColor={skin}/><stop offset="1" stopColor="#60382c"/></linearGradient>
  <linearGradient id={uid+"hair"} x1="0" x2="1" y1="0" y2="1"><stop stopColor="#775643"/><stop offset=".27" stopColor={hair}/><stop offset="1" stopColor="#100e12"/></linearGradient>
  <linearGradient id={uid+"kit"} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffffff" stopOpacity=".22"/><stop offset=".28" stopColor={shirt}/><stop offset="1" stopColor="#101a28"/></linearGradient>
  <radialGradient id={uid+"light"}><stop stopColor="#fff"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></radialGradient>
 </defs>
 <rect width="190" height="192" fill={"url(#"+uid+"bg)"}/>
 <circle cx="23" cy="22" r="25" fill={"url(#"+uid+"light)"} opacity=".8"/><circle cx="158" cy="29" r="28" fill={"url(#"+uid+"light)"} opacity=".65"/>
 <g opacity=".35"><path d="M0 159 Q100 119 190 156" stroke="#74b18a" strokeWidth="12" fill="none"/></g>
 <path d="M10 192 Q15 149 65 143 L123 143 Q170 148 183 192Z" fill={"url(#"+uid+"kit)"} stroke="#0b141e" strokeWidth="4"/>
 <path d="M65 144 L94 166 L124 144 M91 166 L91 192" fill="none" stroke="#e7edf3" strokeOpacity=".75" strokeWidth="4"/>
 <path d="M79 116 L78 152 Q94 163 111 150 L108 116" fill={skin} stroke="#663d2f" strokeWidth="2"/>
 <ellipse cx="64" cy="81" rx="8" ry="15" fill={skin}/><ellipse cx="127" cy="81" rx="8" ry="15" fill={skin}/>
 <path d={faces[n%faces.length]} fill={"url(#"+uid+"skin)"} stroke="#513326" strokeOpacity=".65" strokeWidth="1.4"/>
 <path d="M67 81 Q70 57 85 53 M122 81 Q119 57 106 53" fill="none" stroke="#ffdbbb" strokeOpacity=".22" strokeWidth="5"/>
 <path d="M82 90 L94 83 L101 100 L92 102" stroke="#7e4935" strokeWidth="1.4" fill="none" opacity=".6"/>
 <path d={hairPath} fill={"url(#"+uid+"hair)"} stroke="#201615" strokeWidth="2"/>
 <path d="M70 46 Q89 24 122 41 M73 54 Q90 35 125 49" fill="none" stroke="#f1d6aa" strokeOpacity=".14" strokeWidth="2"/>
 <path d="M72 80 Q81 74 91 79 M103 78 Q114 74 122 80" fill="none" stroke={hair} strokeWidth="3.2" strokeLinecap="round"/>
 <path d="M76 84 L90 84 M105 84 L119 84" stroke="#f4eddf" strokeWidth="3.6"/>
 <ellipse cx="84" cy="85" rx="2.5" ry="3.3" fill="#27201d"/><ellipse cx="110" cy="85" rx="2.5" ry="3.3" fill="#27201d"/>
 <path d="M97 91 L93 103 L102 104" fill="none" stroke="#844e3b" strokeWidth="1.8"/>
 <path d="M84 113 Q97 118 110 112" stroke="#623a30" strokeWidth="2" fill="none" strokeLinecap="round"/>
 {beard&&<><path d="M70 104 Q76 124 95 132 Q115 129 123 103 L115 118 Q94 140 78 117Z" fill={hair} opacity=".83"/><path d="M84 111 Q97 108 110 111" stroke={hair} strokeWidth="4" strokeLinecap="round"/></>}
 <path d="M130 0 L190 0 L190 192 L165 192 Q183 92 130 0" fill="#071321" opacity=".14"/>
 </svg></span>;
}
