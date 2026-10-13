-- Registration requires a name and international phone number.
create table if not exists public.player_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null check (char_length(btrim(full_name)) between 2 and 120),
 phone text not null check (phone ~ '^\\+[1-9][0-9]{7,14}$'),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.player_profiles enable row level security;
create policy "Players read their own profile" on public.player_profiles for select to authenticated using (auth.uid() = id);
create policy "Players update their own profile" on public.player_profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create or replace function public.ballersplay_create_player_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
declare n text; p text;
begin
 n := btrim(coalesce(new.raw_user_meta_data->>'full_name',''));
 p := btrim(coalesce(new.raw_user_meta_data->>'phone',''));
 if char_length(n) not between 2 and 120 or p !~ '^\\+[1-9][0-9]{7,14}$' then
  raise exception 'Full name and valid international phone number are required';
 end if;
 insert into public.player_profiles(id,full_name,phone) values(new.id,n,p);
 return new;
end;
$$;
drop trigger if exists ballersplay_player_profile_signup on auth.users;
create trigger ballersplay_player_profile_signup after insert on auth.users
for each row execute function public.ballersplay_create_player_profile();
