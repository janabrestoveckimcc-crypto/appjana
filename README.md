# relAI

Production application under construction from `docs/SRS.md`. This is a separate repository from the earlier local UX prototype. The prototype's simulated data and chat are not used as a backend.

## Local development

Node 22.12+ is required.

```powershell
npm ci
Copy-Item .env.example .env.local
# Fill in the public Supabase URL and publishable/anon key in .env.local.
npm run dev
```

Open http://127.0.0.1:5195. Without configuration the app shows a connection setup screen. With configuration it supports real Supabase email/password registration, email-confirmation feedback, login, session restoration and logout. Auth has not yet been tested against the team's project.

Never put Gemini keys or Supabase service-role keys in frontend variables. Gemini is read only from Supabase Secrets: `GEMINI_API_KEY`, with support for the team's existing lower-case `gemini_api_key`. The selected API model IDs are `gemini-3.8-flash` (main) and `gemini-3.5-flash` (fallback).

## Checks

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

Vitest is limited to `supabase/functions/_shared/**/*.test.ts` per TESTING.md. No rules have been implemented yet; a zero-test exit is not evidence of verified date/HP behavior.

## Connect the existing backend

1. Sign in locally with `npx supabase login` (interactive, run in your own terminal).
2. The team supplied project `bjfrcyxaczqcxwccbuyx`; its public URL/key are now in ignored `.env.local`.
3. Link with `npx supabase link --project-ref bjfrcyxaczqcxwccbuyx`.
4. The team confirmed the database is empty. The single schema migration belongs to step 2; none is created in step 1.
5. Generate `src/lib/database.types.ts` with the CLI after schema agreement. No hand-written generated type file is included.

The current auth client deliberately has no database queries until generated types are available. No migration, remote database update, edge function deployment or secret change has been performed. The CLI link attempt failed because local CLI login is still missing.

## Step 1 Gemini check

`supabase/functions/gemini-check/index.ts` is a temporary operator-only smoke check. Deploy after CLI login:

```powershell
npx supabase functions deploy gemini-check --project-ref bjfrcyxaczqcxwccbuyx --use-api
```

It requires the server-only service-role credential in the Authorization bearer header; never embed that credential in the frontend, source files or chat. The function accepts an empty body or `{"language":"hr"}` / `{"language":"en"}`. Success is `{"ok":true,"model":"gemini-3.8-flash"}`. It ignores no auth checks, receives no user documents, and validates Gemini's structured JSON reply.

The team has a budget of **20 Gemini calls**. This check makes at most **one** generation request per invocation, with a 20-second timeout, no retry and no automatic fallback. It is never called on page load or in normal builds/tests. The fallback model constant is reserved for the later feature work. This is a per-invocation limit, not a global quota counter; record every actual generation attempt in PROGRESS.md. Remove the temporary function after a successful check before step 2.

Recorded Gemini attempts by this agent so far: **0**. Live model/key access has not yet been verified.

## Remaining build

See `docs/PROGRESS.md`. The map, documents, calendar, AI assistant, HP transactions, proof verification and notifications in this repository are still to be implemented. The earlier approved UX assets remain in the separate `future-self-app` project. The input ZIP contains documentation only, not the layered ghost SVG, app PNG icons or five map backgrounds specified by the SRS.

The user's latest request authorizes localhost execution and the explicit initial Git pushes despite older generic restrictions in the supplied AGENTS.md. It does not resolve the existing schema, model IDs or contradictory game rules.
