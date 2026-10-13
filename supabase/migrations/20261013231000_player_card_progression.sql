-- Overall rating is derived from confirmed participation in completed matches, never user-editable.
create or replace function public.ballersplay_player_card(p_player_id uuid)
returns table(games_played bigint,overall_rating integer,card_tier text)
language sql stable security definer set search_path='' as $$
 with played as (
  select count(distinct b.match_id)::bigint as n
  from public.bookings b
  join public.matches m on m.id=b.match_id
  where b.player_id=p_player_id and b.status='confirmed' and m.status='completed'
 ), rated as (
  select n,least(99,60+2*least(n,20)::integer) as rating from played
 )
 select n,rating,case when rating>=91 then 'iconic' when rating>=80 then 'gold'
 when rating>=70 then 'silver' else 'bronze' end
 from rated
 where auth.uid() is not null
 and exists(select 1 from public.player_profiles p where p.id=p_player_id);
$$;
revoke all on function public.ballersplay_player_card(uuid) from public,anon;
grant execute on function public.ballersplay_player_card(uuid) to authenticated;
