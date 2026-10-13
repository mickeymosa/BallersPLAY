-- Deploy only after the Edge Function is deployed with verify_jwt=true.
-- Uses a Vault secret, never an embedded service-role key.
-- The function currently restricts recipients to BOOKING_EMAIL_TEST_RECIPIENT.
select cron.schedule(
  'ballersplay-email-dispatcher',
  '* * * * *',
  $job$
  select net.http_post(
    url := 'https://dbrsgwdlicajlbtbpylj.supabase.co/functions/v1/send-booking-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'ballersplay_cron_service_role'
        limit 1
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $job$
);
