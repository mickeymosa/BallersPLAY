-- Atomic email queue claiming and bounded retry leases.
alter table public.booking_email_outbox
 add column if not exists lease_token uuid,
 add column if not exists leased_until timestamptz,
 add column if not exists next_attempt_at timestamptz not null default now();

create or replace function public.ballersplay_claim_booking_emails(p_recipient text, p_limit int default 10)
returns setof public.booking_email_outbox
language plpgsql security definer set search_path = public
as $$
begin
 if auth.role() is distinct from 'service_role' then
   raise exception 'service_role required';
 end if;
 return query
 with candidates as (
  select o.id from public.booking_email_outbox o
  where o.sent_at is null and o.attempts < 5
    and o.next_attempt_at <= now()
    and (o.leased_until is null or o.leased_until < now())
    and lower(o.recipient_email) = lower(p_recipient)
  order by o.created_at
  limit least(greatest(p_limit,1),20)
  for update skip locked
 )
 update public.booking_email_outbox o
 set lease_token = gen_random_uuid(), leased_until = now() + interval '3 minutes',
     attempts = o.attempts + 1
 from candidates c where o.id=c.id
 returning o.*;
end $$;
revoke all on function public.ballersplay_claim_booking_emails(text,int) from public, anon, authenticated;
grant execute on function public.ballersplay_claim_booking_emails(text,int) to service_role;

create or replace function public.ballersplay_finish_booking_email(
 p_id bigint, p_token uuid, p_success boolean, p_error text default null
) returns boolean language plpgsql security definer set search_path = public as $$
declare affected integer;
begin
 if auth.role() is distinct from 'service_role' then
   raise exception 'service_role required';
 end if;
 update public.booking_email_outbox
 set sent_at = case when p_success then now() else sent_at end,
     last_error = case when p_success then null else left(coalesce(p_error,'Delivery failed'),250) end,
     next_attempt_at = case when p_success then next_attempt_at
       else now() + make_interval(mins => least(60, power(2,least(attempts,5))::int)) end,
     leased_until = null, lease_token = null
 where id=p_id and lease_token=p_token and sent_at is null;
 get diagnostics affected = row_count;
 return affected = 1;
end $$;
revoke all on function public.ballersplay_finish_booking_email(bigint,uuid,boolean,text) from public, anon, authenticated;
grant execute on function public.ballersplay_finish_booking_email(bigint,uuid,boolean,text) to service_role;
