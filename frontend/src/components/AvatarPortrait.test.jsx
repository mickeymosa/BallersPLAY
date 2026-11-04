import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import AvatarPortrait from "./AvatarPortrait";
import {CHIBI_CHARACTERS} from "./chibiCatalog";
import {ratingForGames,tierForRating} from "./PlayerCard";

describe("original big-head football avatar rendering",()=>{
 test("exactly six stable characters ship as local, self-contained graphics",()=>{
  expect(CHIBI_CHARACTERS).toHaveLength(6);
  for(const c of CHIBI_CHARACTERS){
   const html=renderToStaticMarkup(<AvatarPortrait id={c.id} alt={c.name}/>);
   expect(html).toContain("<svg");
   expect(html).toContain('role="img"');
   expect(html).not.toContain("<img");
   expect(html).not.toContain("http");
  }
 });
 test("each character has a different graphic",()=>{
  const pictures=CHIBI_CHARACTERS.map(c=>renderToStaticMarkup(<AvatarPortrait id={c.id}/>));
  expect(new Set(pictures).size).toBe(6);
 });
 test("invalid identifiers cannot crash the profile",()=>{
  expect(()=>renderToStaticMarkup(<AvatarPortrait id="missing"/>)).not.toThrow();
  expect(()=>renderToStaticMarkup(<AvatarPortrait id={null}/>)).not.toThrow();
 });
 test("user-selected jersey color is represented in SVG",()=>{
  expect(renderToStaticMarkup(<AvatarPortrait config={{jersey:"#ff0000"}}/>)).toContain("#ff0000");
 });
});
describe("verified-match rating thresholds",()=>{
 test.each([[0,60,"bronze"],[4,68,"bronze"],[5,70,"silver"],[10,80,"gold"],[16,92,"iconic"],[40,99,"iconic"]])
 ("games %i become %i rating in %s tier",(games,expected,tier)=>{
  expect(ratingForGames(games)).toBe(expected);
  expect(tierForRating(expected)).toBe(tier);
 });
 test("negative and invalid values never lower starting rating",()=>{
  expect(ratingForGames(-1)).toBe(60);
  expect(ratingForGames("invalid")).toBe(60);
 });
});
