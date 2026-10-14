export const CHIBI_CHARACTERS = Array.from({length:30},(_,i)=>({
 id:"chibi-"+String(i+1).padStart(2,"0"),
 image:"/avatars/chibi-"+String(i+1).padStart(2,"0")+".webp",
 category:i<6?"Classic":i<12?"Modern":i<18?"Legends":"Special",
 name:"Footballer "+String(i+1)
}));
export const CHIBI_CATEGORIES=["All","Classic","Modern","Legends","Special"];
export const chibiImage=id=>CHIBI_CHARACTERS.find(c=>c.id===id)?.image||null;
