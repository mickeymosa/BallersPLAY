-- Restrict BARQ's hourly quota counter to server-side service_role callers.
-- Previous function checked request.jwt.claim.role even though EXECUTE is already
-- restricted; that additional check caused REST 400 and disabled LLM replies.
create or replace function public.barq_consume_request(p_bucket text)
returns boolean language plpgsql security definer set search_path to ''
as $fn$
declare accepted boolean;
begin
 if p_bucket is null or length(p_bucket)>128 or length(p_bucket)<16 then return false;end if;
 insert into public.barq_request_limits(bucket,window_start,requests)
 values(p_bucket,now(),1)
 on conflict(bucket) do update set
 window_start=case when public.barq_request_limits.window_start<now()-interval '1 hour' then now() else public.barq_request_limits.window_start end,
 requests=case when public.barq_request_limits.window_start<now()-interval '1 hour' then 1 else public.barq_request_limits.requests+1 end
 returning requests<=15 into accepted;
 return accepted;
end;$fn$;
revoke all on function public.barq_consume_request(text) from public, anon, authenticated;
grant execute on function public.barq_consume_request(text) to service_role;
