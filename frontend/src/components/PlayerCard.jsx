import React from "react";
import {avatarPreset} from "./FootballAvatar";
import AvatarPortrait from "./AvatarPortrait";

export function ratingForGames(games=0){return Math.min(99,60+2*Math.max(0,Math.floor(Number(games)||0)));}
export function tierForRating(rating){return rating>=91?"iconic":rating>=80?"gold":rating>=70?"silver":"bronze";}
export default function PlayerCard({profile,stats,config,preview=false}){
 const games=stats?.games_played??0;
 const rating=preview?ratingForGames(games):(stats?.overall_rating??60);
 const tier=preview?tierForRating(rating):(stats?.card_tier||"bronze");
 const name=profile?.full_name||"BALLERSPLAY PLAYER";
 const handle=profile?.username?"@"+profile.username:"BALLERSPLAY";
 const avatarConfig=config||((profile?.avatar_config&&Object.keys(profile.avatar_config).length)?profile.avatar_config:avatarPreset(profile?.avatar_key));
 return <div className={"bp-player-card bp-player-card--"+tier} aria-label={name+" "+rating+" overall "+tier+" player card"}>
  <div className="bp-player-card__ornament" aria-hidden="true">✦</div>
  <div className="bp-player-card__top"><div className="bp-player-card__overall"><strong>{rating}</strong><span>OVR</span><span className="bp-player-card__tier">{tier}</span></div>
  <div className="bp-player-card__brand">BP<span>★</span></div></div>
  <div className="bp-player-card__portrait"><AvatarPortrait className="bp-player-card__chibi" id={avatarConfig?.chibiId||"chibi-01"} config={avatarConfig} variant={profile?.avatar_key||"striker"} size={230} alt="Footballer portrait"/></div>
  <div className="bp-player-card__footer"><strong title={name}>{name}</strong><span>{handle}</span>
  <div className="bp-player-card__line"/>
  <div className="bp-player-card__numbers"><span>⚽ {games} GAMES</span><span>★ {stats?.average_rating??"—"} REVIEWS</span></div>
  <div className="bp-player-card__progress">{rating>=99?"MAX RATING":rating>=91?"ICONIC PLAYER":rating>=80?"GOLD PLAYER":rating>=70?"SILVER PLAYER":"BRONZE PLAYER"} · +2 PER GAME</div></div>
 </div>;
}
