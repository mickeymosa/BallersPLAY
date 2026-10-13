-- BallersPlay MVP safeguards. Run in Supabase SQL Editor after reviewing.
-- Block duplicate active requests from the same email for one match.
CREATE UNIQUE INDEX IF NOT EXISTS bookings_one_active_request_per_email
ON public.bookings (match_id, lower(player_email))
WHERE status IN ('requested','waitlisted','confirmed');

-- Serialize confirmations on the match row, preventing concurrent overbooking.
CREATE OR REPLACE FUNCTION public.ballersplay_confirm_booking(p_booking_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE v_match_id uuid; v_capacity integer; v_confirmed integer;
BEGIN
  IF NOT public.is_ballersplay_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  SELECT match_id INTO v_match_id FROM public.bookings WHERE id=p_booking_id;
  IF v_match_id IS NULL THEN RAISE EXCEPTION 'Booking not found'; END IF;
  SELECT capacity INTO v_capacity FROM public.matches WHERE id=v_match_id AND status='published' FOR UPDATE;
  IF v_capacity IS NULL THEN RAISE EXCEPTION 'Match is not published'; END IF;
  SELECT count(*) INTO v_confirmed FROM public.bookings WHERE match_id=v_match_id AND status='confirmed';
  IF v_confirmed >= v_capacity THEN RAISE EXCEPTION 'Match is full'; END IF;
  PERFORM set_config('ballersplay.confirmation_rpc', 'yes', true);
  UPDATE public.bookings SET status='confirmed' WHERE id=p_booking_id AND status IN ('requested','waitlisted');
  PERFORM set_config('ballersplay.confirmation_rpc', '', true);
  IF NOT FOUND THEN RAISE EXCEPTION 'Booking is not eligible for confirmation'; END IF;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.ballersplay_confirm_booking(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ballersplay_confirm_booking(uuid) TO authenticated;

-- Only the privileged confirmation RPC may move a booking to confirmed.
-- Direct client updates, including admin-table updates, are rejected.
CREATE OR REPLACE FUNCTION public.ballersplay_guard_confirmation()
RETURNS trigger LANGUAGE plpgsql SET search_path = ''
AS $$
BEGIN
  IF NEW.status = 'confirmed'
     AND OLD.status IS DISTINCT FROM 'confirmed'
     AND current_setting('ballersplay.confirmation_rpc', true) IS DISTINCT FROM 'yes'
  THEN
    RAISE EXCEPTION 'Use ballersplay_confirm_booking to confirm a booking';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS bookings_guard_confirmation ON public.bookings;
CREATE TRIGGER bookings_guard_confirmation
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.ballersplay_guard_confirmation();

-- Prevent accidental bypass of the published/capacity constraints through manual status edits.
CREATE OR REPLACE FUNCTION public.ballersplay_guard_match_capacity()
RETURNS trigger LANGUAGE plpgsql SET search_path = ''
AS $$
BEGIN
  IF NEW.capacity < (SELECT count(*) FROM public.bookings WHERE match_id=NEW.id AND status='confirmed')
  THEN RAISE EXCEPTION 'Capacity cannot be less than confirmed bookings'; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS matches_guard_capacity ON public.matches;
CREATE TRIGGER matches_guard_capacity
BEFORE UPDATE OF capacity ON public.matches
FOR EACH ROW EXECUTE FUNCTION public.ballersplay_guard_match_capacity();
