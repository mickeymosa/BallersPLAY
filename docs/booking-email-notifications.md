# Booking email notifications (Phase 3)

This branch adds an email outbox trigger for booking status changes and a server-only email dispatcher. **Nothing sends until deployed and configured.**

## Setup
1. Apply migration `20261013020000_booking_email_outbox.sql` in Supabase SQL editor (after reviewing it).
2. Verify a sender domain with Resend. Configure Supabase Edge Function secrets `RESEND_API_KEY` and `BOOKING_EMAIL_FROM` (e.g. `BallersPlay <bookings@your-verified-domain>`).
3. Deploy `send-booking-emails` with JWT verification **enabled**. Never expose service-role credentials in React.
4. Invoke POST from a trusted server-side scheduler with `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`. Suggested interval: one minute. Configure scheduler separately; never embed credentials in cron SQL or frontend code.
5. Check outbox rows and provider delivery logs using an isolated test booking. Monitor failed attempts.

## Scope
- Sends player emails for requested, confirmed, rejected and cancelled booking statuses.
- Waitlisted bookings do not trigger emails yet.
- Existing booking rows do not generate retroactive emails.
- Organizer emails, booking self-service, opt-out policy and operational monitoring are future work.

## Operational cautions
- Dispatcher uses optimistic claim via attempt count, not a lease; failed processes can require retry, and email delivery is not guaranteed exactly once.
- A status cycling back to the same state does not generate a second event due to the unique booking/event constraint.
- Email provider API call uses a stable idempotency key; verify provider behavior before launch.
- Consider retention/deletion of email addresses and payloads under applicable privacy requirements.
- Review rate limits and edge function security before enabling production delivery.


## Deployment continuation (13 October)
1. Run `supabase/migrations/20261013030000_booking_email_delivery_leases.sql` after the outbox migration.
2. Redeploy the latest `send-booking-emails/index.ts` from this branch. Keep JWT verification enabled.
3. Ensure `BOOKING_EMAIL_TEST_RECIPIENT` equals the verified Resend inbox. The function only claims rows addressed to that inbox. Non-test recipients remain queued and must be handled under an explicit retention policy.
4. Store the **legacy Supabase service_role JWT** securely in Supabase Vault via the Secrets UI, not as a literal in SQL history. Do not use the Resend key, publishable key, or new sb_secret_ key for a JWT-verified function.
5. For scheduling, create a SQL Snippet Cron job after configuring the Vault secret named `ballersplay_cron_service_role`. Use a reviewed SQL statement of the form:

```sql
select net.http_post(
  url := 'https://dbrsgwdlicajlbtbpylj.supabase.co/functions/v1/send-booking-emails',
  headers := jsonb_build_object(
    'Content-Type','application/json',
    'Authorization','Bearer ' || (
      select decrypted_secret from vault.decrypted_secrets
      where name='ballersplay_cron_service_role' limit 1
    )
  ),
  body := '{}'::jsonb,
  timeout_milliseconds := 30000
);
```

Use schedule `* * * * *` only after manual end-to-end verification. Cron job SQL contains only a Vault lookup, never a literal secret.
6. Review Cron run history, Edge Function logs, Resend delivery logs, and `booking_email_outbox` after testing.

## Delivery semantics
Atomic `FOR UPDATE SKIP LOCKED` claims prevent simultaneous workers from claiming the same pending row. Leases expire after three minutes; retry backoff is bounded, with a maximum of five attempts. Resend's idempotency header reduces duplicates, but cannot guarantee exactly-once delivery in all failure cases. Review delivery monitoring before public launch.


## Authentication fix (commit 90f4b07)
The previously deployed function compared the incoming legacy service_role JWT byte-for-byte to `SUPABASE_SERVICE_ROLE_KEY`. Supabase can expose a different service-role API key in that environment, producing HTTP 401 `Unauthorized` even after the gateway accepts a valid JWT. The function now checks the JWT's `role=service_role` claim **only after Supabase Edge gateway verification**. **Keep `verify_jwt=true`**. Do not use this implementation with JWT verification disabled: its payload parsing does not independently verify a signature.

Deployment order:
1. Confirm `20261013020000_booking_email_outbox.sql` and `20261013030000_booking_email_delivery_leases.sql` were already run in Supabase SQL Editor (do not recreate data).
2. Deploy `supabase/functions/send-booking-emails/index.ts` with Verify JWT ON.
3. Manually invoke the existing Vault-backed `net.http_post` SQL once and inspect `net._http_response` for HTTP 200.
4. Check response `sent`, `failed`, outbox `sent_at`, and Resend delivery logs. A 200 with sent=0 is not a delivered email.
5. Only after confirmed delivery create `ballersplay-email-dispatcher` Cron using SQL Snippet `* * * * *`. Never put the service-role JWT literal into the cron command.
