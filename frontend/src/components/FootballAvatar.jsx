import React from "react";
const styles={
 striker:{shirt:"#c6ff00",skin:"#c98b61",hair:"#222",ball:true},
 keeper:{shirt:"#fb923c",skin:"#d6a47a",hair:"#34231b",ball:false},
 captain:{shirt:"#60a5fa",skin:"#a96846",hair:"#161616",ball:true},
 playmaker:{shirt:"#e879f9",skin:"#e6b993",hair:"#6b3928",ball:true},
 defender:{shirt:"#34d399",skin:"#bd8057",hair:"#251b19",ball:false},
 speedster:{shirt:"#f87171",skin:"#f2c5a0",hair:"#32221b",ball:true}
};
export default function FootballAvatar({variant="striker",size=80}){
 const a=styles[variant]||styles.striker;
 return <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={variant+" cartoon football player"}>
 <circle cx="50" cy="50" r="49" fill="#243022"/>
 <path d="M14 100 Q16 67 36 66 L64 66 Q84 67 86 100Z" fill={a.shirt}/>
 <path d="M38 64 L50 80 L62 64" fill="none" stroke="#fff" strokeWidth="3"/>
 <rect x="43" y="54" width="14" height="17" rx="6" fill={a.skin}/>
 <ellipse cx="50" cy="38" rx="22" ry="26" fill={a.skin}/>
 <path d="M28 39 Q22 12 50 13 Q76 10 72 39 L65 29 Q46 35 33 27Z" fill={a.hair}/>
 <ellipse cx="42" cy="42" rx="2.4" ry="3" fill="#1f2937"/><ellipse cx="58" cy="42" rx="2.4" ry="3" fill="#1f2937"/>
 <path d="M44 53 Q50 57 56 53" stroke="#713f2a" strokeWidth="2" fill="none" strokeLinecap="round"/>
 <path d="M28 76 L16 100 M72 76 L84 100" stroke="#121212" strokeOpacity=".25" strokeWidth="4"/>
 {a.ball&&<><circle cx="80" cy="81" r="15" fill="#fff" stroke="#151515" strokeWidth="2"/><path d="M80 72 L72 78 L75 87 L85 87 L88 78Z" fill="#151515"/></>}
 </svg>;
}
