# BallersPlay player accounts — deployment checklist

## Decision
Accounts are required for booking; phone numbers are required for registration. Guest booking is disabled after deployment. Existing bookings remain in the database.

## Deployment order
1. Apply `supabase/migrations/20261013050000_player_accounts.sql` to the project database. Do not deploy the booking function before the migration.
2. Confirm Supabase Auth email/password sign-ups are enabled and configure Site URL and Redirect URLs including `https://<production-domain>/account` (and preview domain if used). Configure email confirmation and an SMTP provider for reliable production sign-up messages.
3. Deploy `supabase/functions/request-spot/index.ts` with `verify_jwt=false` **as currently configured**. The function itself verifies the bearer token with `auth.getUser`, requires a profile, and checks contact details. This preserves the existing CORS preflight behavior.
4. Deploy the frontend branch through the normal Vercel workflow. Verify `/account` and `/matches` are served via SPA routing.
5. Test: sign up with a valid international phone, confirm email, log in, request a spot; verify a signed-out request receives 401 and no booking is inserted. Test invalid phone and incorrect email/password.
6. Review legacy users: users created before the migration have no player_profiles row and cannot book until onboarded.
7. Email notification scheduler is separate: the Resend test-recipient allowlist remains in place, and the cron migration is not yet applied.

## Privacy/security
The `player_profiles` table has RLS enabled and self-read/self-update policies. Phone is required and syntactically validated, **not SMS-verified**. Never expose the service-role key to the browser.

## Limitations
Booking records currently retain name/email/phone, not an auth user ID. The authenticated user is verified at booking time, but a dedicated My Bookings page with ownership-enforced access needs a separate database migration and RLS review.
