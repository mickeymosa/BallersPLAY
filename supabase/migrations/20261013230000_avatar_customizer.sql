alter table public.player_profiles add column if not exists avatar_config jsonb not null default '{}'::jsonb;
grant update(avatar_config) on public.player_profiles to authenticated;
alter table public.player_profiles add constraint player_avatar_config_size check (pg_column_size(avatar_config) <= 2048);
