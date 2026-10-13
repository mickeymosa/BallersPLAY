-- Trust, avatars and evidence-based participation. No self-awarded verification.
alter table public.player_profiles add column if not exists avatar_key text not null default 'striker';
alter table public.player_profiles add column if not exists avatar_path text;
alter table public.player_profiles add column if not exists is_verified boolean not null default false;
alter table public.player_profiles add constraint player_avatar_key_valid check (avatar_key in ('striker','keeper','captain','playmaker','defender','speedster'));
-- Prevent a player from editing the verification flag, even through their existing self-update RLS policy.
revoke update on public.player_profiles from authenticated;
grant update(full_name,phone,username,avatar_key,avatar_path,updated_at) on public.player_profiles to authenticated;
create table if not exists public.player_reviews (
 id uuid primary key default gen_random_uuid(),
 match_id uuid not null references public.matches(id) on delete cascade,
 reviewer_id uuid not null references auth.users(id) on delete cascade,
 reviewed_id uuid not null references auth.users(id) on delete cascade,
 rating smallint not null check(rating between 1 and 5),
 comment text check(comment is null or char_length(comment)<=500),
 created_at timestamptz not null default now(),
 unique(match_id,reviewer_id,reviewed_id),
 check(reviewer_id<>reviewed_id)
);
alter table public.player_reviews enable row level security;
create policy "Players read reviews" on public.player_reviews for select to authenticated using(true);
-- Eligibility is enforced by the database, not by client-side controls.
create or replace function public.ballersplay_submit_review(p_match_id uuid,p_reviewed_id uuid,p_rating int,p_comment text default null)
returns void language plpgsql security definer set search_path='' as $$
declare uid uuid := auth.uid();
begin
 if uid is null or uid=p_reviewed_id then raise exception 'Invalid reviewer or recipient'; end if;
 if p_rating not between 1 and 5 or char_length(coalesce(p_comment,''))>500 then raise exception 'Invalid review'; end if;
 if not exists(select 1 from public.matches m where m.id=p_match_id and m.status='completed') then raise exception 'Match must be completed';end if;
 if not exists(select 1 from public.bookings b where b.match_id=p_match_id and b.player_id=uid and b.status='confirmed')
 or not exists(select 1 from public.bookings b where b.match_id=p_match_id and b.player_id=p_reviewed_id and b.status='confirmed')
 then raise exception 'Both players must have confirmed participation in the match'; end if;
 insert into public.player_reviews(match_id,reviewer_id,reviewed_id,rating,comment)
 values(p_match_id,uid,p_reviewed_id,p_rating,nullif(btrim(p_comment),''));
end; $$;
revoke all on function public.ballersplay_submit_review(uuid,uuid,int,text) from public;
grant execute on function public.ballersplay_submit_review(uuid,uuid,int,text) to authenticated;
create or replace function public.ballersplay_profile_stats(p_player_id uuid)
returns table(games_played bigint,matches_organized bigint,review_count bigint,average_rating numeric,verified boolean)
language sql stable security definer set search_path='' as $$
 select
 (select count(distinct b.match_id) from public.bookings b join public.matches m on m.id=b.match_id where b.player_id=p_player_id and b.status='confirmed' and m.status='completed'),
 (select count(*) from public.matches m join public.organizers o on o.id=m.organizer_id where o.owner_id=p_player_id and m.status='completed'),
 (select count(*) from public.player_reviews r where r.reviewed_id=p_player_id),
 (select round(avg(r.rating)::numeric,1) from public.player_reviews r where r.reviewed_id=p_player_id),
 (select p.is_verified from public.player_profiles p where p.id=p_player_id)
 where auth.uid() is not null and exists(select 1 from public.player_profiles p where p.id=p_player_id);
$$;
revoke all on function public.ballersplay_profile_stats(uuid) from public;
grant execute on function public.ballersplay_profile_stats(uuid) to authenticated;
-- Private user-specific uploads. Never permit overwriting other users' assets.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('player-avatars','player-avatars',true,2097152,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
create policy "Avatar images are public" on storage.objects for select to public using(bucket_id='player-avatars');
create policy "Players upload own avatar" on storage.objects for insert to authenticated
with check(bucket_id='player-avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "Players replace own avatar" on storage.objects for update to authenticated
using(bucket_id='player-avatars' and (storage.foldername(name))[1]=auth.uid()::text)
with check(bucket_id='player-avatars' and (storage.foldername(name))[1]=auth.uid()::text);
