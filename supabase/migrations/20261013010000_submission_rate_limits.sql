-- Apply in Supabase SQL Editor before deploying the corresponding Edge Function changes.
-- Atomic per-IP submission throttling. Keep this function callable by service_role only.
CREATE TABLE IF NOT EXISTS public.ballersplay_submission_limits (
  action text NOT NULL,
  ip_hash text NOT NULL,
  window_start timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 1,
  PRIMARY KEY (action, ip_hash, window_start)
);
ALTER TABLE public.ballersplay_submission_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ballersplay_submission_limits FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE FUNCTION public.ballersplay_check_submission_limit(
  p_action text, p_ip_hash text, p_max_attempts integer DEFAULT 5
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE v_attempts integer;
BEGIN
  IF p_action NOT IN ('request-spot', 'submit-match')
     OR length(p_ip_hash) <> 64
     OR p_ip_hash !~ '^[0-9a-f]{64}$'
     OR p_max_attempts NOT BETWEEN 1 AND 20 THEN
    RAISE EXCEPTION 'Invalid rate limit parameters';
  END IF;
  INSERT INTO public.ballersplay_submission_limits(action,ip_hash,window_start,attempts)
  VALUES (p_action,p_ip_hash,date_trunc('hour',now()),1)
  ON CONFLICT (action,ip_hash,window_start)
  DO UPDATE SET attempts=public.ballersplay_submission_limits.attempts+1
  RETURNING attempts INTO v_attempts;
  RETURN v_attempts <= p_max_attempts;
END;
$$;
REVOKE ALL ON FUNCTION public.ballersplay_check_submission_limit(text,text,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ballersplay_check_submission_limit(text,text,integer) TO service_role;
-- Run periodically with an authorized maintenance job:
-- DELETE FROM public.ballersplay_submission_limits WHERE window_start < now() - interval '2 days';
