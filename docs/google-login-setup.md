# Google login setup for BallersPlay

Code and database onboarding are implemented. Google provider credentials are **not** configured by the code.

1. Open Google Cloud Console → Google Auth Platform. Configure branding and audience (External if public).
2. Create an OAuth Client ID of type **Web application**.
3. Add Authorized JavaScript origin: `https://ballers-play-mickeymosas-projects.vercel.app`.
4. Add Authorized redirect URI: `https://dbrsgwdlicajlbtbpylj.supabase.co/auth/v1/callback`.
5. In Supabase → Authentication → Providers → Google, enable Google and enter Client ID and Client Secret. Do not commit the secret or share it in chat.
6. Keep Supabase Authentication Redirect URLs permitting `https://ballers-play-mickeymosas-projects.vercel.app/account` and the desired Vercel previews.
7. Deploy the frontend branch and test Google sign-in, required phone completion, and booking. Google sign-in alone cannot book without a profile.
8. If the Google OAuth consent screen is in Testing mode, add test accounts before attempting sign-in. Publish the app when ready.

The existing `ballersplay_create_player_profile` trigger now allows OAuth identities without phone metadata. The `ballersplay_complete_player_profile` RPC accepts a phone only for the currently authenticated user. `request-spot` rejects users without profiles. Phone is syntax-validated but not SMS-verified.

For production: confirm the Supabase email provider and email confirmation settings, configure reliable SMTP, test password reset and Google sign-in, and verify Vercel frontend SPA rewrites.
