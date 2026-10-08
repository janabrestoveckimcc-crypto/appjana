# AGENTS.md: relAI

Codex reads this file before every task. The details live in docs/.

**App:** relAI, a mobile PWA (Croatian by default, with an English mode) that turns personal paperwork into deadlines, and deadlines into a game.
**Core value:** the user photographs a document → the app finds the follow-up obligation → code calculates the date → the task is saved to the calendar automatically, and the user can undo or edit it (SRS 5.3).
**Stack:** Vite + React + TypeScript, deployed on Vercel · one Supabase project (Postgres, Auth, Storage, Edge Functions, pg_cron) managed with the Supabase CLI · Gemini only from edge functions.

**Docs in /docs (read the relevant ones before every task):** SRS.md (source of truth, wins over everything) · SCOPE_GUARD.md · ARCHITECTURE.md · DATA_SECURITY.md · AI_RULES.md · TESTING.md · PROGRESS.md · PUSH.md (push test and F17).

**Start of every task:** read docs/PROGRESS.md (current step, decisions, known issues) and the SRS sections the prompt names. Every build step runs in a new Codex session, so anything decided must be written to docs/PROGRESS.md, not only said in chat.

## Rules that always apply
1. Build only what SRS.md specifies: one step or section per prompt, in SRS 13 order. No extras, no mock features.
2. Supabase only (database, auth, storage, edge functions, pg_cron). Gemini only from edge functions, key in Supabase Secrets. No API keys in the frontend, in files or in commits.
3. AI: every prompt includes today's date, weekday, time and time zone Europe/Zagreb; the assistant gets a summary from the database, never files; dates and HP are calculated by code, never by AI; AI returns only validated JSON and never writes to the database: edge functions save the task, and the user can undo it (Poništi) or edit it (Uredi).
4. The client never writes HP, the HP ledger or task status "done". Only edge functions do, enforced in the database.
5. RLS on every table. The user always comes from the JWT, never from the request body.
6. UI and AI text in Croatian by default, English as a switchable mode (profiles.language). All UI text from the i18n dictionary, never hard-coded. Code and database in English. Times shown in Europe/Zagreb.
7. TDD for date and HP rules (TESTING.md); everything else via the SRS 12 checklist.
8. Unclear, or the SRS contradicts itself? Ask with a recommended default. Stuck after two attempts? Stop.
9. KISS. End every task with the SCOPE_GUARD.md report, update PROGRESS.md and make one commit.

## Commands
| Purpose | Command |
|---|---|
| Install | `npm install` |
| Rules tests | `npm test` (`vitest run --passWithNoTests`) |
| Type check | `npm run typecheck` (app only; `supabase/functions` is Deno code and is excluded) |
| Lint | `npm run lint` |
| Build | `npm run build` |
| New migration | `npx supabase migration new <name>` |
| Apply migrations | `npx supabase db push`: the team runs it (it can ask for the database password). Write the migration, then stop and ask. |
| DB types | `npx supabase gen types typescript --linked > src/lib/database.types.ts` (after every applied migration) |
| Deploy a function | `npx supabase functions deploy <name>` (only after the team approves; add `--use-api` if it asks for Docker) |

Before finishing any task, typecheck, lint, test and build must pass. Put the results in the report.

## Shell
- Only non-interactive commands (use flags such as `--yes`, `--template`, `--defaults`). A command that waits for input hangs the task.
- Do not start long-running processes (`npm run dev`, `supabase start`, `supabase functions serve`). The team tests on the deployed app.
- Network is needed only for `npm`, `npx shadcn` and `npx supabase` commands. Ask before anything else that goes online.

## Git
- Work on the current branch. One commit per step: `step N: <name>`. Bug fixes: `fix: <short description>`.
- Never push, force-push, `reset --hard`, rebase or delete branches. The team does that.
- Never commit `.env` or `.env.local`. Only `.env.example` (names, no values).

## Secrets
- Never ask for, print, write or commit a secret value. If one is needed, put the command with a placeholder in the report (e.g. `npx supabase secrets set CRON_SECRET=<value>`); the team runs it.
- Public by design: the Supabase anon (publishable) key and the VAPID public key. Everything else is a secret.

## Never touch
- `src/components/ui/` (shadcn, generated) and `src/lib/database.types.ts` (generated).
- Applied migrations in `supabase/migrations/`. Add a new one only when a prompt asks.
- Supabase Dashboard, Secrets, Vault and Vercel settings: the team manages them. If something must be set there, list the exact step in the report.

## Latest user override — 2026-10-08
The user explicitly requires ALL navigation, visuals, UX and prototype interactions from the approved `future-self-app` at localhost:5188 and the supplied screenshots. That request overrides SRS screen layout/design and prototype feature exclusions: Mapa, Zadaci, Ekipa, Avatar, Više; documents, rewards and settings under Više; global avatar chat, original camera, custom categories, HR/EN, themes and original animations. Preserve backend security requirements. Do not substitute the SRS five-screen layout again.
