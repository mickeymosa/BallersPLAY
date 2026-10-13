-- Only show people eligible for a review based on shared completed matches.
create or replace function public.ballersplay_review_candidates()
returns table(match_id uuid,match_title text,player_id uuid,player_name text,player_username text)
language sql security definer set search_path='' stable as $$
 select distinct m.id,m.title,p.id,p.full_name,p.username
 from public.bookings mine
 join public.matches m on m.id=mine.match_id and m.status='completed'
 join public.bookings theirs on theirs.match_id=m.id and theirs.status='confirmed' and theirs.player_id<>auth.uid()
 join public.player_profiles p on p.id=theirs.player_id
 where mine.player_id=auth.uid() and mine.status='confirmed'
 and not exists(select 1 from public.player_reviews r where r.match_id=m.id and r.reviewer_id=auth.uid() and r.reviewed_id=p.id)
 order by m.title,p.full_name;
$$;
revoke all on function public.ballersplay_review_candidates() from public;
grant execute on function public.ballersplay_review_candidates() to authenticated;
