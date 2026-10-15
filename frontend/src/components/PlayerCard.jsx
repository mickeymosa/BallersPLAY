import React from "react";
import {avatarPreset} from "./FootballAvatar";
import AvatarPortrait from "./AvatarPortrait";

export function ratingForGames(games=0){return Math.min(99,60+2*Math.max(0,Math.floor(Number(games)||0)));}
export function tierForRating(rating){return rating>=91?"iconic":rating>=80?"gold":rating>=70?"silver":"bronze";}

// Display-only attributes create a consistent collectible card layout.
// They are not skill assessments; only OVR and games played are participation-based.
const CARD_ROLES={
 "chibi-01":"ST","chibi-02":"CAM","chibi-03":"LW",
 "chibi-04":"GK","chibi-05":"CB","chibi-06":"GK"
};
const offsets={
 ST:[3,4,-1,2,-8,0],CAM:[0,0,4,3,-5,-3],
 LW:[4,0,1,4,-7,-2],GK:[-4,-5,-4,-4,3,4],
 CB:[-2,-4,-1,-3,5,4]
};
const labels=["PAC","SHO","PAS","DRI","DEF","PHY"];
const clamp=value=>Math.min(99,Math.max(1,value));
export default function PlayerCard({profile,stats,config,preview=false}){
 const games=stats?.games_played??0;
 const rating=preview?ratingForGames(games):(stats?.overall_rating??60);
 const tier=preview?tierForRating(rating):(stats?.card_tier||"bronze");
 const name=profile?.full_name||"BALLERSPLAY PLAYER";
 const handle=profile?.username?"@"+profile.username:"BALLERSPLAY";
 const avatarConfig=config||((profile?.avatar_config&&Object.keys(profile.avatar_config).length)?profile.avatar_config:avatarPreset(profile?.avatar_key));
 const avatarId=avatarConfig?.chibiId||"chibi-01";
 const role=CARD_ROLES[avatarId]||"ST";
 const cardAttributes=labels.map((label,i)=>({label,value:clamp(rating+(offsets[role]||offsets.ST)[i])}));
 return <article className={"bp-player-card bp-player-card--"+tier} aria-label={name+", "+rating+" overall, "+tier+" BallersPlay player card"}>
  <div className="bp-player-card__inner">
   <div className="bp-player-card__crest" aria-hidden="true">★</div>
   <div className="bp-player-card__lights" aria-hidden="true"/>
   <div className="bp-player-card__top">
    <div className="bp-player-card__overall"><strong>{rating}</strong><span>{role}</span><small>{tier}</small></div>
    <div className="bp-player-card__brand"><img src="/LogoEnhanced2.png" alt="Ballers Play logo"/></div>
   </div>
   <div className="bp-player-card__portrait"><AvatarPortrait id={avatarId} config={avatarConfig} variant={profile?.avatar_key||"striker"} size={320} alt="Selected BallersPlay footballer"/></div>
   <div className="bp-player-card__bottom">
    <div className="bp-player-card__identity"><strong title={name}>{name}</strong><span>{handle}</span></div>
    <div className="bp-player-card__attributes" aria-label="Illustrative card attributes">
     {cardAttributes.map(({label,value})=><div className="bp-player-card__attribute" key={label}><span>{label}</span><strong>{value}</strong></div>)}
    </div>
    <div className="bp-player-card__meta"><span>{games} {games===1?"GAME":"GAMES"} PLAYED</span><span>★ {stats?.average_rating??"—"} / 5</span></div>
    <div className="bp-player-card__stamp">BALLERS PLAY</div>
   </div>
  </div>
 </article>;
}
