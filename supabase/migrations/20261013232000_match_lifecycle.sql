-- Ownership checks are enforced server-side. Legacy organizer rows without owner_id are not claimable.
create table if not exists public.match_attendance (
 match_id uuid not null references public.matches(id) on delete cascade,
 player_id uuid not null references auth.users(id) on delete cascade,
 confirmed_by uuid not null references auth.users(id),
 confirmed_at timestamptz not null default now(),
 primary key(match_id,player_id)
);
alter table public.match_attendance enable row level security;
create policy "Players view own attendance" on public.match_attendance for select to authenticated
 using(player_id=auth.uid() or exists(select 1 from public.matches m join public.organizers o on o.id=m.organizer_id where m.id=match_id and o.owner_id=auth.uid()));
create or replace function public.ballersplay_my_organized_matches()
returns table(match_id uuid,title text,venue text,starts_at timestamptz,status text,capacity integer,booking_id uuid,player_id uuid,player_name text,booking_status text,attended boolean)
language sql security definer stable set search_path='' as $$
 select m.id,m.title,m.venue,m.starts_at,m.status,m.capacity,b.id,b.player_id,b.player_name,b.status,(a.player_id is not null)
 from public.matches m join public.organizers o on o.id=m.organizer_id
 left join public.bookings b on b.match_id=m.id
 left join public.match_attendance a on a.match_id=m.id and a.player_id=b.player_id
 where auth.uid() is not null and o.owner_id=auth.uid()
 order by m.starts_at desc,b.created_at asc;
$$;
create or replace function public.ballersplay_manage_booking(p_booking_id uuid,p_action text)
returns void language plpgsql security definer set search_path='' as $$
declare v_match uuid;v_status text;v_capacity integer;v_confirmed integer;
begin
 if p_action not in ('confirmed','rejected') then raise exception 'Invalid booking action';end if;
 select m.id,m.status,m.capacity into v_match,v_status,v_capacity
 from public.bookings b join public.matches m on m.id=b.match_id
 join public.organizers o on o.id=m.organizer_id
 where b.id=p_booking_id and o.owner_id=auth.uid()
 for update of m;
 if v_match is null then raise exception 'Booking not found or unauthorized';end if;
 if v_status<>'published' then raise exception 'Only published matches accept booking changes';end if;
 if p_action='confirmed' then
  select count(*) into v_confirmed from public.bookings where match_id=v_match and status='confirmed' and id<>p_booking_id;
  if v_confirmed>=v_capacity then raise exception 'Match capacity reached';end if;
 end if;
 update public.bookings set status=p_action where id=p_booking_id and status in ('pending','confirmed','rejected');
 if not found then raise exception 'Booking cannot be updated';end if;
end;$$;
create or replace function public.ballersplay_finish_match(p_match_id uuid,p_attendee_ids uuid[])
returns void language plpgsql security definer set search_path='' as $$
declare v_match public.matches%rowtype;v_owner uuid;v_count integer;
begin
 select m.*,o.owner_id into v_match from public.matches m join public.organizers o on o.id=m.organizer_id
 where m.id=p_match_id and o.owner_id=auth.uid() for update of m;
 if not found then raise exception 'Match not found or unauthorized';end if;
 if v_match.status<>'published' then raise exception 'Match is not published';end if;
 if v_match.starts_at>now() then raise exception 'Match has not started yet';end if;
 if coalesce(array_length(p_attendee_ids,1),0)<>coalesce((select count(distinct x) from unnest(p_attendee_ids) x),0)
 then raise exception 'Duplicate attendees';end if;
 select count(*) into v_count from unnest(coalesce(p_attendee_ids,array[]::uuid[])) x
 where not exists(select 1 from public.bookings b where b.match_id=p_match_id and b.player_id=x and b.status='confirmed');
 if v_count>0 then raise exception 'Attendance requires confirmed bookings';end if;
 insert into public.match_attendance(match_id,player_id,confirmed_by)
 select p_match_id,x,auth.uid() from unnest(coalesce(p_attendee_ids,array[]::uuid[])) x;
 update public.matches set status='completed' where id=p_match_id;
end;$$;
create or replace function public.ballersplay_player_card(p_player_id uuid)
returns table(games_played bigint,overall_rating integer,card_tier text)
language sql stable security definer set search_path='' as $$
 with played as (
  select count(*)::bigint n from public.match_attendance a
  join public.matches m on m.id=a.match_id
  where a.player_id=p_player_id and m.status='completed'
 ), rated as (
  select n,least(99,60+2*least(n,20)::integer) rating from played
 )
 select n,rating,case when rating>=91 then 'iconic' when rating>=80 then 'gold'
 when rating>=70 then 'silver' else 'bronze' end from rated
 where auth.uid() is not null and exists(select 1 from public.player_profiles p where p.id=p_player_id);
$$;
create or replace function public.ballersplay_profile_stats(p_player_id uuid)
returns table(games_played bigint,matches_organized bigint,review_count bigint,average_rating numeric,verified boolean)
language sql stable security definer set search_path='' as $$
 select
 (select count(*) from public.match_attendance a join public.matches m on m.id=a.match_id where a.player_id=p_player_id and m.status='completed'),
 (select count(*) from public.matches m join public.organizers o on o.id=m.organizer_id where o.owner_id=p_player_id and m.status='completed'),
 (select count(*) from public.player_reviews r where r.reviewed_id=p_player_id),
 (select round(avg(r.rating)::numeric,1) from public.player_reviews r where r.reviewed_id=p_player_id),
 (select p.is_verified from public.player_profiles p where p.id=p_player_id)
 where auth.uid() is not null and exists(select 1 from public.player_profiles p where p.id=p_player_id);
$$;
create or replace function public.ballersplay_review_candidates()
returns table(match_id uuid,match_title text,player_id uuid,player_name text,player_username text)
language sql security definer stable set search_path='' as $$
 select distinct m.id,m.title,p.id,p.full_name,p.username
 from public.match_attendance mine
 join public.matches m on m.id=mine.match_id and m.status='completed'
 join public.match_attendance theirs on theirs.match_id=m.id and theirs.player_id<>auth.uid()
 join public.player_profiles p on p.id=theirs.player_id
 where mine.player_id=auth.uid()
 and not exists(select 1 from public.player_reviews r where r.match_id=m.id and r.reviewer_id=auth.uid() and r.reviewed_id=p.id)
 order by m.title,p.full_name;
$$;
create or replace function public.ballersplay_submit_review(p_match_id uuid,p_reviewed_id uuid,p_rating int,p_comment text default null)
returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();
begin
 if uid is null or uid=p_reviewed_id then raise exception 'Invalid reviewer or recipient';end if;
 if p_rating not between 1 and 5 or char_length(coalesce(p_comment,''))>500 then raise exception 'Invalid review';end if;
 if not exists(select 1 from public.matches m where m.id=p_match_id and m.status='completed') then raise exception 'Match must be completed';end if;
 if not exists(select 1 from public.match_attendance a where a.match_id=p_match_id and a.player_id=uid)
 or not exists(select 1 from public.match_attendance a where a.match_id=p_match_id and a.player_id=p_reviewed_id)
 then raise exception 'Both players must have verified attendance';end if;
 insert into public.player_reviews(match_id,reviewer_id,reviewed_id,rating,comment)
 values(p_match_id,uid,p_reviewed_id,p_rating,nullif(btrim(p_comment),''));
end;$$;
create or replace function public.ballersplay_verify_player(p_player_id uuid,p_verified boolean)
returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.is_ballersplay_admin() then raise exception 'Admin permission required';end if;
 update public.player_profiles set is_verified=p_verified where id=p_player_id;
 if not found then raise exception 'Player not found';end if;
end;$$;
do $$declare f text;begin
 foreach f in array array[
 'ballersplay_my_organized_matches()',
 'ballersplay_manage_booking(uuid,text)',
 'ballersplay_finish_match(uuid,uuid[])',
 'ballersplay_player_card(uuid)',
 'ballersplay_profile_stats(uuid)',
 'ballersplay_review_candidates()',
 'ballersplay_submit_review(uuid,uuid,integer,text)',
 'ballersplay_verify_player(uuid,boolean)'
 ] loop
 execute 'revoke all on function public.'||f||' from public,anon';
 execute 'grant execute on function public.'||f||' to authenticated';
 end loop;
end$$;
