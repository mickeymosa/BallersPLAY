-- Allow Google OAuth sign-in without phone at identity creation.
-- Booking remains blocked until a verified signed-in user supplies a valid phone.
create or replace function public.ballersplay_create_player_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
declare n text; p text;
begin
 n := btrim(coalesce(new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'name',''));
 p := btrim(coalesce(new.raw_user_meta_data->>'phone',''));
 if char_length(n) between 2 and 120 and p ~ '^[+][1-9][0-9]{7,14}$' then
  insert into public.player_profiles(id,full_name,phone) values(new.id,n,p) on conflict(id) do nothing;
 end if;
 return new;
end; $$;
create or replace function public.ballersplay_complete_player_profile(p_full_name text,p_phone text)
returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
 if uid is null then raise exception 'Authentication required'; end if;
 if char_length(btrim(coalesce(p_full_name,''))) not between 2 and 120
 or btrim(coalesce(p_phone,'')) !~ '^[+][1-9][0-9]{7,14}$' then
  raise exception 'Valid name and international phone number are required';
 end if;
 insert into public.player_profiles(id,full_name,phone)
 values(uid,btrim(p_full_name),btrim(p_phone)) on conflict(id) do nothing;
end; $$;
revoke all on function public.ballersplay_complete_player_profile(text,text) from public;
grant execute on function public.ballersplay_complete_player_profile(text,text) to authenticated;
