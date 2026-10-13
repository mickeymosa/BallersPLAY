-- Transactional booking email outbox. No credentials stored in database.
create table if not exists public.booking_email_outbox (
 id bigint generated always as identity primary key,
 booking_id uuid not null,
 event_type text not null check (event_type in ('requested','confirmed','rejected','cancelled')),
 recipient_email text not null,
 payload jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 sent_at timestamptz,
 attempts integer not null default 0,
 last_error text,
 unique (booking_id,event_type)
);
alter table public.booking_email_outbox enable row level security;
revoke all on public.booking_email_outbox from anon, authenticated;
create or replace function public.ballersplay_queue_booking_email()
returns trigger language plpgsql security definer set search_path = public
as $$
declare details jsonb;
begin
 if TG_OP = 'UPDATE' and NEW.status is not distinct from OLD.status then return NEW; end if;
 if NEW.status not in ('requested','confirmed','rejected','cancelled') then return NEW; end if;
 select jsonb_build_object('match_title',m.title,'venue',m.venue,'city',m.city,'starts_at',m.starts_at,'player_name',NEW.player_name)
 into details from public.matches m where m.id=NEW.match_id;
 insert into public.booking_email_outbox(booking_id,event_type,recipient_email,payload)
 values(NEW.id,NEW.status,NEW.player_email,coalesce(details,'{}'::jsonb))
 on conflict (booking_id,event_type) do nothing;
 return NEW;
end $$;
drop trigger if exists ballersplay_booking_email_trigger on public.bookings;
create trigger ballersplay_booking_email_trigger after insert or update of status on public.bookings
for each row execute function public.ballersplay_queue_booking_email();
