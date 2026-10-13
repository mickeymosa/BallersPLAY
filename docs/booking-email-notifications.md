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
