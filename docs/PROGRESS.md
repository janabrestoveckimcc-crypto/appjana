# PROGRESS.md

Codex updates this file after every task, before the step's commit. Only the team fills in the **Verified on iPhone** column.

**Current step:** 1 — local scaffold complete; cloud connection and Gemini check blocked on team inputs
**Phase:** building
**Push decision at 1:30 (SRS 13, step 3):** pending

## Build steps (SRS 13)
Status: `todo` · `in-progress` · `done` · `blocked`

| Step | Name | Status | Rules tests | Commit | Verified on iPhone (team) | Notes |
|---|---|---|---|---|---|---|
| 1 | Postavljanje | in-progress | n/a (no rules yet) | see git log | | CLI initialized, local app builds; backend login/project/model IDs missing |
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

## Scope changes
| Time | Change | Decided by |
|---|---|---|

## Open questions
- Supabase project ref/URL and public anon or publishable key; schema/migration state of the existing database.
- Team must sign in using `npx supabase login`; CLI project listing returned AccessTokenRequiredError.
- Exact Gemini main and fallback model IDs; team sets GEMINI_API_KEY through Supabase Secrets.
- Confirm retaining the approved blue/orange Montserrat design and human avatar assets instead of SRS 11 magenta/system-font/layered calendar ghost.
- ZIP contains no designer assets. Required layered SVG and five backgrounds are absent; approved previous prototype assets are available separately.
- Confirm month-end clamp, half odd intervals in days rounded down, shared HP transaction for documents/tasks, omission of persons/children from assistant context.
- Further game details before implementation: first-day streak bonus, recurring task creation, boss completion snapshot and map-5 star persistence.
- Push test needs separate Supabase/Vercel project and real-iPhone outcome before selecting F17/F14.

## Known issues
| Step | Issue | Severity (blocks demo / annoying / cosmetic) |
|---|---|---|
| 1 | No backend config or CLI login; no live auth, RLS, storage, AI or iPhone checks possible yet | blocks demo |
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
