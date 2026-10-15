// BallersPlay launch roster: only publish characters whose artwork ships with the site.
// Stable IDs preserve selections already stored in player_profiles.avatar_config.
export const CHIBI_CHARACTERS = [
 {id:"chibi-01",image:"/avatars/chibi-01.webp",category:"Attackers",name:"The Striker"},
 {id:"chibi-02",image:"/avatars/chibi-02.webp",category:"Midfielders",name:"The Playmaker"},
 {id:"chibi-03",image:"/avatars/chibi-03.webp",category:"Attackers",name:"The Speedster"},
 {id:"chibi-04",image:"/avatars/chibi-04.webp",category:"Goalkeepers",name:"The Guardian"},
 {id:"chibi-05",image:"/avatars/chibi-05.webp",category:"Defenders",name:"The Enforcer"},
 {id:"chibi-06",image:"/avatars/chibi-06.webp",category:"Goalkeepers",name:"The Wall"}
];
export const CHIBI_CATEGORIES = ["All","Attackers","Midfielders","Defenders","Goalkeepers"];
export const chibiImage = id => CHIBI_CHARACTERS.find(c=>c.id===id)?.image||null;
