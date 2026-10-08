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

Never put Gemini keys or Supabase service-role keys in frontend variables. Set `GEMINI_API_KEY` in Supabase Secrets. The exact primary and fallback model IDs are still needed from the team.

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
2. Provide the project ref and public URL/key; confirm whether the SRS schema is already installed.
3. Link with `npx supabase link --project-ref <project-ref>`.
4. Inspect the existing schema and migration history before adding any migration.
5. Generate `src/lib/database.types.ts` with the CLI after schema agreement. No hand-written generated type file is included.

The current auth client deliberately has no database queries until generated types are available. No migration, remote database update, edge function deployment or secret change has been performed.

## Remaining build

See `docs/PROGRESS.md`. The map, documents, calendar, AI assistant, HP transactions, proof verification and notifications in this repository are still to be implemented. The earlier approved UX assets remain in the separate `future-self-app` project. The input ZIP contains documentation only, not the layered ghost SVG, app PNG icons or five map backgrounds specified by the SRS.

The user's latest request authorizes localhost execution and the explicit initial Git pushes despite older generic restrictions in the supplied AGENTS.md. It does not resolve the existing schema, model IDs or contradictory game rules.
