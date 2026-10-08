# CODEX_MAKE_IT_WORK.md: make relAI actually work (demo mode)

We have a few hours, not days. Goal: ONE real end-to-end flow that works on a phone with real data, built on the existing UX and the existing Supabase setup (migration, auth, RLS, bucket, `_shared/config.ts`). This file overrides CODEX_TESTS.md until it is done.

## Rules
- **Thin and real beats complete.** Build the simplest version that works end-to-end. No polishing, no refactoring, no edge cases beyond what is listed.
- **Keep the existing UI.** Replace local data (IndexedDB, local tasks, local points, sample chat answers) with the real backend behind the same screens.
- **Work through the steps without waiting for me.** After each step: deploy, verify with a real call, write a 3-line report (what works, what was cut, how to check), then continue. Stop and ask only if you are blocked for more than 15 minutes on the same problem.
- Security stays: the user comes from the JWT in every edge function, RLS stays on, the client never writes HP, ledger or task status `done`, and the Gemini key is only read on the server.
- Dates and HP are calculated by code, never by AI. AI returns JSON that is validated; invalid output gets one retry, then a friendly error.
- Every AI prompt contains today's date, weekday, time and the time zone Europe/Zagreb, and asks for the reply in the user's language (`profiles.language`) and tone.
- Tests: only for the pure date and HP functions. Everything else is verified by a real call.

## Step 0: Gemini works (do this first)
1. Find out why the `gemini-check` call returned 401 before reaching Gemini (likely the function's JWT verification or a missing Authorization header from the client) and fix it.
2. Call Gemini's model list with the configured key, and set the chat model in `_shared/config.ts` to a flash model that actually exists. Remove model names that do not exist.
3. **Done when:** a signed-in user calls `gemini-check` from the app and gets a real Gemini answer back.

## Step 1: Document → AI → task in the calendar (core value)
1. Upload goes to the private `documents` bucket (`{user_id}/{document_id}.{ext}`) instead of IndexedDB. Images: resize in the browser to max 2048 px and convert to JPEG (canvas). PDF up to 10 MB. Duplicate check by file hash stays. Skip special HEIC handling; if a file can't be decoded, show a friendly error.
2. Edge function `extract-document` (authenticated, checks the file belongs to the user): one Gemini call with the file, structured JSON output (SRS 9.2): category, title, document_date, expiry_date, key_fields, follow_up with the literal quote. Store it in `documents`.
3. If there is a follow-up, code calculates `remind_at` and `due_date` with the SRS 5.4 rules (pure function with tests), and the edge function creates the task (`source = 'document'`).
4. UI: "Čitam dokument…" while waiting, then the document in its category folder and a notification "Pronađeno: …" with the quote, Poništi (deletes the task) and Uredi (edits title and dates).
5. Calendar and task lists read tasks from the database instead of local storage.
6. **Done when:** photographing a test finding on a phone produces the document in the right folder and the task on the right calendar day.

## Step 2: The assistant chat works
1. Edge function `assistant-chat` (authenticated): builds a short context from the database (today's date line, tone and language, up to 50 newest documents with title, category, dates and key_fields, open tasks for the next 60 days, last 10 chat messages). No files are sent.
2. Gemini returns JSON: `{ "reply": "...", "create_tasks": [ { "title", "date", "time", "tier" } ] }`. The server validates it, normalizes dates in code, creates the tasks (`source = 'chat'`), and stores both messages in `chat_messages`.
3. Personal questions (e.g. OIB) are answered only from the user's own documents; if the data isn't there, the ghost says so.
4. UI: the existing chat screen calls this function; created tasks show the same Poništi/Uredi notification.
5. **Done when:** "Koji mi je OIB?" is answered from an uploaded document, and "Stavi mi sastanak u četvrtak u 10" creates a task on the right Thursday.

## Step 3: Completing a task moves the ghost
1. Edge function `complete-task` (authenticated): marks the task done, calculates HP with the SRS 6.2 formula (pure function with tests; for now proof factor ×0.3 without proof, no daily proof limit), writes `hp_ledger`, and updates `profiles.hp` and `map_index` (at 100 HP: next map, carry the surplus).
2. +1 HP per new document (max 5 per day) through the same ledger helper.
3. UI: the map reads HP from the profile; the ghost stands on field `floor(HP/10)+1` and moves after completion; the map name changes at 100 HP.
4. **Done when:** completing a task on the phone visibly moves the ghost, and the HP shown equals the ledger sum.

## Step 4 (only if steps 0–3 work): presence and notifications
1. Presence: +10 % per completed task in `complete-task`; the ghost's opacity follows presence.
2. In-app notifications: show rows from `notifications` in the bell; the "Pošalji test obavijest" button inserts one through an edge function using a template in the user's tone and language.

## Cut for now (do not build)
Hourly notification job, push, proofs and AI proof checks, friends, daily presence decay, stars after map 5, any feature from CODEX_FEATURES.md.

## Final report
List what works end-to-end on a phone, what was cut, and the exact demo steps with test data.
