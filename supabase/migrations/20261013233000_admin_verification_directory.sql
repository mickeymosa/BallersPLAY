create or replace function public.ballersplay_admin_player_directory()
returns table(player_id uuid,full_name text,username text,is_verified boolean,created_at timestamptz)
language plpgsql stable security definer set search_path='' as $$
begin
 if not public.is_ballersplay_admin() then raise exception 'Admin permission required';end if;
 return query select p.id,p.full_name,p.username,p.is_verified,p.created_at
 from public.player_profiles p order by p.created_at desc limit 250;
end;$$;
revoke all on function public.ballersplay_admin_player_directory() from public,anon;
grant execute on function public.ballersplay_admin_player_directory() to authenticated;
