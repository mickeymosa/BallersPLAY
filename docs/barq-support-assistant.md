# BARQ support assistant

BARQ appears at the bottom-right of all public pages and in the admin view.

## How it works

- The React component `frontend/src/components/BarqChat.jsx` supports question suggestions, an accessible chat pane, and quick links.
- The Supabase Edge Function `barq-help` returns verified site-help answers even without an AI provider.
- **Generative AI is optional.** To enable conversational answers, set `OPENAI_API_KEY` under Supabase → Edge Functions → Secrets. The secret must only be stored server-side. The model can be overridden with `BARQ_MODEL` (default `gpt-4o-mini`).
- AI requests are limited to 15 requests per hour per hashed network source using the `barq_consume_request` RPC. Unavailable AI falls back to deterministic FAQ help.
- Do not enter passwords, access tokens, verification codes, or payment information into chat. BARQ cannot view or change a user's account.
- User questions are sent to the Supabase help function; if AI mode is configured, limited chat history is sent to the OpenAI API. No chat history is persisted by BARQ's implementation.
- The website help facts are in the Edge Function and should be updated whenever booking or account policies change.

## QA before release

1. Open the homepage, /account, /matches, /organize, /manage, /profile, and /admin and verify the BARQ launcher is visible.
2. Ask: “How do I sign in?” → instructions for /account.
3. Ask: “Forgot password” → steps for password recovery.
4. Ask: “How can I request a game?” → /matches and organizer confirmation.
5. Ask: “What does BallersPlay do?” → Wrocław player/organizer explanation.
6. Check mobile responsiveness and keyboard Escape close.
7. If the AI secret is configured, test free-form follow-up questions and rate limiting.
8. Check the Supabase Edge Function logs for network and provider errors.
