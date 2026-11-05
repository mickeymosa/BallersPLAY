create table if not exists public.barq_daily_ai_quota (
 day date primary key,
 requests integer not null default 0 check(requests>=0),
 updated_at timestamptz not null default now()
);
alter table public.barq_daily_ai_quota enable row level security;
revoke all on public.barq_daily_ai_quota from public, anon, authenticated;
create or replace function public.barq_consume_daily_ai_quota(p_limit integer)
returns boolean language plpgsql security definer set search_path = ''
as $fn$
declare accepted boolean;
begin
 if p_limit is null or p_limit<1 or p_limit>100 then return false; end if;
 insert into public.barq_daily_ai_quota(day,requests,updated_at)
 values((now() at time zone 'UTC')::date,1,now())
 on conflict(day) do update set
 requests=public.barq_daily_ai_quota.requests+1,
 updated_at=now()
 where public.barq_daily_ai_quota.requests < p_limit
 returning true into accepted;
 return coalesce(accepted,false);
end;
$fn$;
revoke all on function public.barq_consume_daily_ai_quota(integer) from public,anon,authenticated;
grant execute on function public.barq_consume_daily_ai_quota(integer) to service_role;
grant select,insert,update on public.barq_daily_ai_quota to service_role;