alter table public.player_profiles drop constraint if exists player_avatar_key_valid;
alter table public.player_profiles add constraint player_avatar_key_valid
check (avatar_key in ('striker','keeper','captain','playmaker','defender','speedster') or avatar_key ~ '^chibi-(0[1-9]|[12][0-9]|30)$');
