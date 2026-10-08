# PUSH.md: extra rules for Web Push

Push requirements and architecture are in SRS 7.4 (and the tables in SRS 8.1). This file adds the implementation rules that prevent the known iOS failures. It applies to the push test (SRS 13, step 3) and to F17 if the decision at 1:30 is yes.

## 1. iOS requirements
- The manifest from SRS 10 must exist (`display: standalone`, icons, `apple-touch-icon`), otherwise iOS does not treat the app as installed and push does not work.
- Show the button "Uključi obavijesti od duha" only when running installed (`display-mode: standalone`). In a Safari tab, show short instructions for adding to the Home Screen instead.
- Request notification permission only in direct response to a tap. Never on page load.
- VAPID: the team generates the keys (`npx web-push generate-vapid-keys`). The public key goes in the frontend (`VITE_VAPID_PUBLIC_KEY` in Vercel) and in Supabase Secrets (`VAPID_PUBLIC_KEY`, the sender needs it too); the private key (`VAPID_PRIVATE_KEY`) and `VAPID_SUBJECT` (a `mailto:` address) only in Supabase Secrets.

## 2. Implementation rules
- `public/sw.js`: every `push` event calls `showNotification` inside `event.waitUntil`. Safari can cancel subscriptions that receive silent pushes.
- The service worker caches NOTHING. No offline caching, no precaching, no PWA plugin. `vercel.json` serves `/sw.js` with `Cache-Control: no-cache`.
- `push_subscriptions.endpoint` is unique; subscribing again upserts by `endpoint`. One user may have several devices.
- The sending logic lives in `_shared/push.ts`: send to all subscriptions of one user, delete those that return 404 or 410, set `notifications.pushed_at`. It has two callers:
  - `send-push` (the test button in Profil): sends ONLY to the current user, taken from the JWT; it never accepts a `user_id`.
  - `generate-notifications` (the job, service role): calls `_shared/push.ts` directly for the user being processed, not over HTTP.
- The Web Push library must be verified to work in Supabase Edge Functions (Deno) by deploying it in the push test before it is used in `main`, then added to ARCHITECTURE.md section 2.
- Push text never contains extracted personal data (OIB, amounts, diagnoses).

## 3. Push test setup (SRS 13, step 3)
- Branch `push-test` in its own folder (git worktree), linked to its OWN Supabase project and deployed by its OWN Vercel project (Production Branch = `push-test`). Never link it to the main Supabase project: its migration would break the main migration history.
- It may add a minimal email and password sign-in, only to get a JWT for the test button.
- If the decision at 1:30 is yes, step 8 ports `public/sw.js`, `_shared/push.ts`, `send-push`, the subscribe button code and the manifest changes from `push-test` into `main`. Never its migration or its sign-in: the main schema already has `push_subscriptions` (SRS 8.1).

## 4. Testing
- Push works only on the published Vercel URL with the app added to the Home Screen, never on localhost or in a Safari tab on the iPhone. Develop and debug in desktop Chrome first (localhost is fine there), then confirm on the iPhone.
- Use the "Pošalji test obavijest" button in Profil; do not wait for the hourly job.
