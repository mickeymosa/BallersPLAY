import {useState} from "react";
import FootballAvatar,{avatarPreset} from "./FootballAvatar";
import {chibiImage} from "./chibiCatalog";

// The image catalog can be deployed separately. Always render a visible character
// while an asset is loading or when the image is absent (404 / blocked).
export default function AvatarPortrait({id,config,variant="striker",size=110,className="",alt="Football avatar",loading="lazy"}){
 const [failed,setFailed]=useState(false);
 const src=chibiImage(id);
 const preset=avatarPreset(variant);
 const number=Math.max(0,Number.parseInt((id||"").split("-")[1],10)-1||0);
 const styles=["spiky","swept","curly","buzz","long","mohawk"];
 const fallback={...preset,...config,skin:["#d99a71","#b97750","#8c523a","#f5c7a5","#603b2e"][number%5],hairStyle:styles[number%6],hair:["#241a19","#673b25","#e9bd59","#3057c9"][Math.floor(number/3)%4]};
 return <span className={"bp-avatar-portrait "+className} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:"100%",height:"100%",overflow:"hidden"}}>
   {!failed&&src?<img key={src} src={src} alt={alt} loading={loading} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={()=>setFailed(true)}/>:<FootballAvatar variant={variant} config={fallback} size={size}/>}
 </span>;
}
