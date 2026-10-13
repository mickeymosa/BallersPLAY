-- Public discovery is username-only; contact details remain private.
alter table public.player_profiles add column if not exists username text;
alter table public.player_profiles add constraint player_profiles_username_format
 check (username is null or username ~ '^[a-z][a-z0-9_]{2,19}$');
create unique index if not exists player_profiles_username_unique on public.player_profiles (lower(username)) where username is not null;
create or replace function public.ballersplay_set_username(p_username text)
returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid()); normalized text := lower(btrim(coalesce(p_username,'')));
begin
 if uid is null then raise exception 'Authentication required'; end if;
 if normalized !~ '^[a-z][a-z0-9_]{2,19}$' then
  raise exception 'Username must be 3-20 characters, start with a letter, and contain only letters, digits or underscores';
 end if;
 if normalized in ('admin','support','ballersplay','moderator','official','system','root') then
  raise exception 'Username is reserved';
 end if;
 update public.player_profiles set username=normalized,updated_at=now() where id=uid;
 if not found then raise exception 'Complete your player profile first'; end if;
end; $$;
revoke all on function public.ballersplay_set_username(text) from public;
grant execute on function public.ballersplay_set_username(text) to authenticated;
create or replace function public.ballersplay_find_player(p_username text)
returns table(username text,full_name text) language sql security definer set search_path = '' stable as $$
 select p.username,p.full_name from public.player_profiles p
 where auth.uid() is not null and p.username=lower(btrim(p_username)) limit 1;
$$;
revoke all on function public.ballersplay_find_player(text) from public;
grant execute on function public.ballersplay_find_player(text) to authenticated;
