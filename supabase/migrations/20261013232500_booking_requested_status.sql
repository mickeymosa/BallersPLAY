create or replace function public.ballersplay_manage_booking(p_booking_id uuid,p_action text)
returns void language plpgsql security definer set search_path='' as $$
declare v_match uuid;v_status text;v_capacity integer;v_confirmed integer;
begin
 if p_action not in ('confirmed','rejected') then raise exception 'Invalid booking action';end if;
 select m.id,m.status,m.capacity into v_match,v_status,v_capacity
 from public.bookings b join public.matches m on m.id=b.match_id
 join public.organizers o on o.id=m.organizer_id
 where b.id=p_booking_id and o.owner_id=auth.uid() for update of m;
 if v_match is null then raise exception 'Booking not found or unauthorized';end if;
 if v_status<>'published' then raise exception 'Only published matches accept booking changes';end if;
 if p_action='confirmed' then
  select count(*) into v_confirmed from public.bookings where match_id=v_match and status='confirmed' and id<>p_booking_id;
  if v_confirmed>=v_capacity then raise exception 'Match capacity reached';end if;
 end if;
 update public.bookings set status=p_action where id=p_booking_id and status in ('requested','waitlisted','confirmed','rejected');
 if not found then raise exception 'Booking cannot be updated';end if;
end;$$;
revoke all on function public.ballersplay_manage_booking(uuid,text) from public,anon;
grant execute on function public.ballersplay_manage_booking(uuid,text) to authenticated;
