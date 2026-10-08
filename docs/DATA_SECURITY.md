# DATA_SECURITY.md

Tables, columns and access rules are defined in SRS 8. This file defines how they are enforced.

## 1. Schema
- The whole schema is created in ONE migration file in `supabase/migrations/` at the start (SRS 8, SRS 13 step 2). The same file also creates: the private bucket `documents` and its storage policies; a trigger that creates the user's `profiles` row with defaults on sign-up; the protection triggers from section 2; and it adds `notifications` to the `supabase_realtime` publication (SRS 7.4).
- Later changes happen only when a prompt explicitly asks, as a new migration file (`npx supabase migration new <name>`). Never edit a migration that has been applied (`npx supabase db push`). Never change the schema by hand in the Supabase Dashboard: the migration files are the only source of the schema.
- The team may add rows by hand in the SQL editor (demo data). Demo documents are fake only (SRS 10).
- Enforce SRS rules in the database where possible: check constraints for enum values and `tier` 1–5, `unique (user_id, file_hash)` on `documents`, foreign keys with `on delete cascade` from the user.
- Writes that may repeat use upserts. The notification job must never create the same notification twice: add a unique key (user, task, template, Zagreb day) and upsert.

## 2. Access
- RLS enabled on every table, default deny, owner policies as in SRS 8.3.
- **Tasks are written by edge functions** (SRS 5.3). Normal users never insert tasks (there is no manual adding, SRS 5.5). They may only update the editable fields of their own tasks (Uredi: title, dates, tier) and delete their own tasks (Poništi).
- **Protected game state is enforced in the database, not only in the UI** (SRS 8.3):
  - `hp_ledger`: select policy only. No insert, update or delete for normal users.
  - `profiles` and `tasks`: a `BEFORE INSERT OR UPDATE` trigger rejects changes to protected columns unless the request role is `service_role` or there is no request JWT at all (a direct database session: migrations, and the team's SQL editor for demo data). Protected in `profiles`: `hp`, `map_index`, `presence`, `streak_days`, `last_completed_date`. Protected in `tasks`: `status` (any value other than `open`), `completed_at`, `proof_document_id`, `proof_reason`, `penalty_applied`. On insert these columns must equal their defaults.
- Edge functions:
  - Always take the user from the JWT (`_shared/auth.ts`). Never accept `user_id` from the request body.
  - Reads of user data use the user's own token, so RLS applies.
  - The service-role client is used only for writes users are not allowed to make (task inserts from documents and chat, `complete-task`, `verify-proof`, the job, `send-push`), and every such query is filtered by the user id from the JWT (or, in the job, by the user being processed).
- Storage: private bucket `documents`; a storage policy allows access only to objects whose first folder equals `auth.uid()`. Files are shown only via signed URLs valid for at most 10 minutes (SRS 8.2).
- Friends (F16, only when activated): data only through the security-definer function `get_friend_profiles()`, which checks the friendship and returns only the columns listed in SRS 8.3.

## 3. Scheduled job
- `generate-notifications` runs every hour through `pg_cron` + `pg_net`, scheduled in its own new migration in step 8 (SRS 13).
- The project URL and the cron secret are read from Supabase Vault (`vault.decrypted_secrets`). The team stores them in Vault by hand in the SQL editor; they never appear in a migration file or in git.
- The function has `verify_jwt = false` in `supabase/config.toml` and rejects every request whose `x-cron-secret` header does not equal the `CRON_SECRET` secret.

## 4. Time
- Store timestamps as `timestamptz`. Everything that depends on "today" (day boundaries, streaks, daily limits, quiet hours, "3 days before") is computed in `Europe/Zagreb` with `lib/zagreb-time.ts` / `_shared/rules.ts`. Never rely on the server's or browser's local time zone.

## 5. Secrets and logs
- `GEMINI_API_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` and `CRON_SECRET` are set only by the team with `npx supabase secrets set`, and read once in `_shared/config.ts`. Never in a prompt, a file or a commit. `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are provided to edge functions by Supabase automatically (check with `npx supabase secrets list`).
- The frontend contains no API keys (SRS 12). The Supabase anon (publishable) key in `VITE_SUPABASE_ANON_KEY` is public by design; RLS protects the data.
- Logs contain only function name, error code, ids and duration. Never document content, extracted fields (OIB, amounts, diagnoses), chat messages or prompts.
