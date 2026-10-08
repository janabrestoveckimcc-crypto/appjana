# PROGRESS.md

Codex updates this file after every task, before the step's commit. Only the team fills in the **Verified on iPhone** column.

**Current step:** 1 — local configuration and Gemini check implementation complete; live deployment/check blocked on CLI login
**Phase:** building
**Push decision at 1:30 (SRS 13, step 3):** pending

## Build steps (SRS 13)
Status: `todo` · `in-progress` · `done` · `blocked`

| Step | Name | Status | Rules tests | Commit | Verified on iPhone (team) | Notes |
|---|---|---|---|---|---|---|
| 1 | Postavljanje | in-progress | n/a (no rules yet) | see git log | | Public config saved; Gemini smoke check written and typechecked; CLI login/deploy/live check outstanding |
| 2 | Temelj | todo | n/a | | | |
| 3 | Push test (branch push-test, own Supabase and Vercel project) | todo | n/a | | | |
| 4 | Dokumenti | todo | | | | |
| 5 | Kalendar | todo | | | | |
| 6 | Asistent | todo | n/a | | | |
| 7 | Igra | todo | | | | |
| 8 | Dokazi i notifikacije | todo | | | | |
| 9 | Rezerva (F16 if all green) | todo | n/a | | | |
| 10 | Stop | todo | n/a | | | |

## Decisions
The team's answers to open questions (kickoff and later). Every new Codex session reads them. A decision fills a gap; the SRS still wins.

| Time | Topic | Decision |
|---|---|---|
| 2026-10-08 | Repository | Reuse existing empty clone at `appjana`, origin `janabrestoveckimcc-crypto/appjana`; user explicitly requested initial commits and pushes. |
| 2026-10-08 | Local execution | User explicitly requires localhost, overriding the generic no-dev-server instruction. Vite runs on 127.0.0.1:5195. |
| 2026-10-08 | Existing backend | Team says a database already exists. Inspect schema and migration history before creating or applying any migration. |
| 2026-10-08 | Database clarification | Team confirms project `bjfrcyxaczqcxwccbuyx` is empty. Schema is not applied; one migration will be created in step 2. |
| 2026-10-08 | Frontend environment | Supplied public URL/publishable key saved only in git-ignored `.env.local`; `.env.example` retains names and empty values. Trailing chat formatting backslashes omitted. |
| 2026-10-08 | Gemini models | Team selected Flash-3.8 and Flash-3.5; documented API IDs are `gemini-3.8-flash` and `gemini-3.5-flash`. No model substitution. |
| 2026-10-08 | Gemini secret | Team reports `gemini_api_key` already in Supabase Secrets. Server supports that spelling and the specified `GEMINI_API_KEY`. Secret value not saved or repeated. |
| 2026-10-08 | API budget | 20 Gemini calls available per team. Step-1 smoke check uses at most one call per invocation, no automatic retry/fallback, no frontend auto-check. Agent has made 0 generation attempts. |
| 2026-10-08 | Check authorization | Temporary gemini-check requires existing service-role bearer credential plus gateway verification, so public site visitors cannot spend the check budget. No client-side check button. |

## Scope changes
| Time | Change | Decided by |
|---|---|---|

## Open questions
- Team must sign in using `npx supabase login`; CLI project listing returned AccessTokenRequiredError.
- Confirm retaining the approved blue/orange Montserrat design and human avatar assets instead of SRS 11 magenta/system-font/layered calendar ghost.
- ZIP contains no designer assets. Required layered SVG and five backgrounds are absent; approved previous prototype assets are available separately.
- Confirm month-end clamp, half odd intervals in days rounded down, shared HP transaction for documents/tasks, omission of persons/children from assistant context.
- Further game details before implementation: first-day streak bonus, recurring task creation, boss completion snapshot and map-5 star persistence.
- Push test needs separate Supabase/Vercel project and real-iPhone outcome before selecting F17/F14.

## Known issues
| Step | Issue | Severity (blocks demo / annoying / cosmetic) |
|---|---|---|
| 1 | CLI login missing: link fails with AccessTokenRequiredError. No function deployed or live Gemini check performed. Auth UI renders but sign-up not tested with a real account. | blocks demo |
| 1 | Database types intentionally not hand-written; generate after linking and inspecting real schema | blocks demo |

## Latest checks — 2026-10-08

- `npm install`: successful; audit reported 0 vulnerabilities.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: runner passed with **0 tests** (`--passWithNoTests`); date/HP rules are not implemented or verified.
- `npm run build`: passed (213 modules). Isolated Vite's PostCSS configuration from an unrelated parent project's Tailwind v3 config.
- `npx supabase init --yes`: passed. No migration applied, project linked, secrets changed or function deployed.
- Browser: setup screen rendered at localhost:5195, HR→EN→HR switch worked, no console warnings/errors. 390px viewport: scrollWidth equals clientWidth.
- Email/password registration/login/session/logout services are implemented but not verified against a live backend. Auth landing is a foundation only, not the completed application.
- No iPhone acceptance items marked verified.

## Step 1 continuation — configuration and Gemini check

- `.env.local` saved and verified ignored; `.env.example` still contains names only.
- `npx supabase link --project-ref bjfrcyxaczqcxwccbuyx`: failed with AccessTokenRequiredError; no remote changes.
- Added `_shared/config.ts`, `cors.ts`, `errors.ts`, `context.ts`, `prompts.ts`, `gemini.ts`, and `gemini-check/index.ts`; explicit verify_jwt=true in config.toml.
- `npx --yes --package=deno deno check supabase/functions/gemini-check/index.ts`: passed. Deno is a verification tool, not an app dependency.
- Typecheck: passed; lint: passed; build: passed. Build warns about a 613 kB JS chunk (179 kB gzip); no build error.
- `npm test`: exit 0 with no test files. Rules tests n/a for step 1, not claimed passing tests.
- Browser reload shows email/password login with public environment configured; no console warnings/errors.
- No schema, RLS or step-2 work performed. No secrets written. No deployment, live model check or Vercel publication performed.
- Generation attempt ledger: **0/20**, no retries or fallback calls. Other team usage unknown.
- Docs used to normalize model IDs: https://ai.google.dev/gemini-api/docs/latest-model?hl=en and https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.5?hl=en.
- Remaining team setup: local Supabase CLI login; then link, deploy, perform exactly one operator-authorized check and record outcome; delete temporary function before step 2. iPhone verification stays with the team.
