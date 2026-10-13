create or replace function public.ballersplay_finish_match(p_match_id uuid,p_attendee_ids uuid[])
returns void language plpgsql security definer set search_path='' as $$
declare v_match public.matches%rowtype;v_count integer;
begin
 select m.* into v_match from public.matches m join public.organizers o on o.id=m.organizer_id
 where m.id=p_match_id and o.owner_id=auth.uid() for update of m;
 if not found then raise exception 'Match not found or unauthorized';end if;
 if v_match.status<>'published' then raise exception 'Match is not published';end if;
 if v_match.starts_at>now() then raise exception 'Match has not started yet';end if;
 if coalesce(array_length(p_attendee_ids,1),0)<>coalesce((select count(distinct x) from unnest(p_attendee_ids) x),0)
 then raise exception 'Duplicate attendees';end if;
 select count(*) into v_count from unnest(coalesce(p_attendee_ids,array[]::uuid[])) x
 where not exists(select 1 from public.bookings b where b.match_id=p_match_id and b.player_id=x and b.status='confirmed');
 if v_count>0 then raise exception 'Attendance requires confirmed bookings';end if;
 insert into public.match_attendance(match_id,player_id,confirmed_by)
 select p_match_id,x,auth.uid() from unnest(coalesce(p_attendee_ids,array[]::uuid[])) x;
 update public.matches set status='completed' where id=p_match_id;
end;$$;
revoke all on function public.ballersplay_finish_match(uuid,uuid[]) from public,anon;
grant execute on function public.ballersplay_finish_match(uuid,uuid[]) to authenticated;
