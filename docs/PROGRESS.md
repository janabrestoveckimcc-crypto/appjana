# PROGRESS.md

Codex updates this file after every task, before the step's commit. Only the team fills in the **Verified on iPhone** column.

**Current step:** 2 — initial migration applied; profile and visual foundation implemented. Step 1 live Gemini check remains unverified.
**Phase:** building
**Push decision at 1:30 (SRS 13, step 3):** pending

## Build steps (SRS 13)
Status: `todo` · `in-progress` · `done` · `blocked`

| Step | Name | Status | Rules tests | Commit | Verified on iPhone (team) | Notes |
|---|---|---|---|---|---|---|
| 1 | Postavljanje | in-progress | n/a (no rules yet) | see git log | | CLI linked; gemini-check deployed; operator check returned 401 before Gemini; live model check outstanding |
| 2 | Temelj | in-progress | n/a | see git log | | Schema applied, generated types, transactional RLS checks passed; real profile/screens foundation implemented |
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
| 2026-10-08 | CLI login | User completed CLI browser login. Project link succeeded. No login tokens copied into the repo. |
| 2026-10-08 | Work continuation | User asked to continue making the app. Prepared step-2 migration while step-1 operator check remains unverified; no remote schema change without team confirmation. |

## Scope changes
| Time | Change | Decided by |
|---|---|---|

## Open questions
- Migration approval received and application completed.
- Run one operator-authorized gemini-check in Dashboard. Do not expose administrator credentials in chat or source.
- Design resolved: user explicitly requests approved 5188 visual design, colors, typography and animations.
- ZIP contains no designer assets. Required layered SVG and five backgrounds are absent; approved previous prototype assets are available separately.
- Confirm month-end clamp, half odd intervals in days rounded down, shared HP transaction for documents/tasks, omission of persons/children from assistant context.
- Further game details before implementation: first-day streak bonus, recurring task creation, boss completion snapshot and map-5 star persistence.
- Push test needs separate Supabase/Vercel project and real-iPhone outcome before selecting F17/F14.

## Known issues
| Step | Issue | Severity (blocks demo / annoying / cosmetic) |
|---|---|---|
| 1 | gemini-check is deployed but returned AUTH-0001 before generation. Auto-review rejected full administrator credential retrieval. Live Gemini connection is unverified. | blocks demo |
| 2 | Real user email-confirmed login/onboarding acceptance outstanding | blocks demo |
| 2 | Full layered avatar artwork and exact iPhone icon sizes unavailable | cosmetic |

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

## Latest continuation — linked project and initial schema

- `npx.cmd supabase link --project-ref bjfrcyxaczqcxwccbuyx`: succeeded.
- `npx.cmd supabase functions deploy gemini-check --project-ref bjfrcyxaczqcxwccbuyx --use-api`: succeeded.
- One operator smoke request returned HTTP 401 / AUTH-0001 before reaching Gemini. No model generation occurred.
- Automatic approval review rejected a subsequent command that would reveal the full service-role credential. Command did not execute. No alternate credential extraction attempted. Team can run the protected check in Dashboard.
- **Gemini generation attempts by this agent: 0/20**. Edge HTTP attempts: 1. Other team usage unknown.
- Created `supabase/migrations/20261008133212_initial_schema.sql`: eight SRS tables, private bucket, owner RLS, minimal column grants, protected-state triggers, signup profile trigger, notification daily deduplication, realtime notifications. Friendships remains inaccessible to clients pending F16 activation.
- Created `supabase/tests/rls.sql`: explicit transaction, two temporary account fixtures, ownership checks and four forbidden-write checks, final rollback. Not yet executed; does not replace signed-in HTTP/iPhone tests.
- `npx.cmd supabase db push --dry-run`: succeeded, reports only the prepared migration. This checks pending migration status, NOT PostgreSQL execution or RLS behavior.
- No migration applied, no database types fabricated, no step-2 frontend/backend queries implemented against an absent schema.
- Typecheck passed; lint passed; build passed with existing chunk-size warning. `npm test` exits 0 with no rules tests (n/a).
- Next: team approves `db push` (or runs it), generate database types, test security, continue profile/onboarding and real screens. Existing local app remains on localhost:5195.

## Current verified state — 2026-10-08 (supersedes earlier snapshots)

- Team explicitly approved applying the initial migration. `supabase db push --yes` succeeded; applied migration is immutable.
- Generated `src/lib/database.types.ts` from the linked database and typed the Supabase client.
- `supabase/tests/rls.sql` passed with two transactional account fixtures: owner isolation, forbidden HP/status/ledger writes, permitted own profile edits. Fixtures rolled back; remaining test users: 0. Linked database lint: no errors. This does not replace browser account or iPhone testing.
- Added real profile read/update and onboarding, gender/height/build avatar rendering, real document/task/chat-history queries and five-screen shell. No fake records or AI answers. Document upload/extraction, task completion/HP, chat sending and notifications remain later steps.
- User explicitly requires the approved localhost:5188 design, overriding conflicting visual defaults in the ZIP: blue/orange, Montserrat, existing human avatars, original hand intro and animations. Transferred intro-v6, letter/logo/hand fade animations, original login styling and welcome bubbles. Real auth uses email/password; profile details follow authentication.
- Browser at 390x844: intro visible, logo transitions to login, registration switch and HR/EN translations work. Real user registration/email confirmation/session and onboarding still need live user acceptance. No credentials entered during visual checks.
- Reused original approved icon unchanged (1254x1254); exact 192/512/180 assets and iPhone installation remain unverified. Hair/eyes/beard customization needs layered artwork; not simulated.
- Typecheck and lint passed. Build passed (236 modules; 642 kB JS chunk warning). Vitest exits 0 with no tests; date/HP rules not implemented. Windows sandbox initially blocked Vite child processes; checks succeeded with approved execution outside sandbox.
- Gemini generation attempts remain 0/20. Operator smoke check remains unverified; no credential extraction workaround.
- Next: user tests real email-confirmed login/onboarding, operator checks Gemini, then proceed in SRS step order. Map pan/zoom and full approved map interactions still need transfer.


## Fix — email confirmation redirect, 2026-10-08

- User reports confirmation link ends at an unreachable site. Signup had no `emailRedirectTo`, and local Supabase configuration still referenced port 3000. Hosted URL configuration and actual failed destination have not been inspected; requested only origin/device from user (no tokens).
- Signup now explicitly requests current app origin plus slash. Local Auth configuration updated to port 5195. No hosted settings, schema, keys or email templates changed.
- Team must allow `http://127.0.0.1:5195/` and `http://localhost:5195/` in hosted Authentication > URL Configuration, with Site URL set to the former for local testing. Dashboard management remains with team per AGENTS.md.
- Confirmation must be opened on the computer running Vite. Try direct login if email was already confirmed before the failed redirect. Existing messages are not rewritten.
- No Gemini calls or auth emails sent during this fix. End-to-end verification depends on the actual hosted redirect configuration and user confirmation.
- Checks: typecheck, lint and build passed; existing chunk-size warning remains. Vitest exits 0 with no rule tests (n/a). No migration or function deployment. iPhone and real email confirmation not verified.

## Approved experience transfer — 2026-10-08

- User explicitly replaces SRS UX/navigation with the complete original localhost:5188 prototype and nine screenshots. Source copied to `experience/`, assets to `public/`; original CSS load order retained. Native interactive DOM is hosted in an isolated same-origin frame, preventing Tailwind styles from changing approved visuals.
- Active navigation is Mapa / Zadaci / Ekipa / Avatar / Više. All original map camera controls, visible avatar, green completed fields, calendar views, categories, soap-bubble documents, rewards, themes, HR/EN, circle chat/podium and avatar assistant preview are retained.
- Main app remains gated by real Supabase auth. The signed-in account's username/language/avatar appearance edits are validated and saved through the parent's authenticated Supabase client. No access token is sent in frame messages. Messages validate origin and source; writable profile columns only, no HP/ledger writes.
- Original local tasks/documents/proofs/game state stay local, isolated by account ID (localStorage and IndexedDB). They are NOT synchronized with existing Supabase task/document rows. Empty account starts with no sample tasks. Original circle, assistant, password-change and Apple integrations remain explicitly labelled UX demonstrations, not real external integrations. Existing backend query modules retained for the next integration pass.
- No original 5188 user data was copied or deleted. Original app untouched. Standalone `/experience.html` is the explicitly labelled original UX preview; main `/` still requires real auth.
- Real profile found in signed-in browser; approved map successfully displayed after authentication. Tested zoom 100% to125%, task calendar, group chat and weekly podium at390px. More checks follow below.
- Existing prototype rule tests:26/26 passed. These validate LOCAL prototype behavior, not production HP transactions or SRS rules. Typecheck/lint/build passed. No Gemini calls (0/20), schema modifications or deployments.
- Final checks: `npm run typecheck`, `npm run lint`, `npm run build` passed; `npm run test:ux` 27/27 (includes account storage isolation). `npm test` exits0 with no server rule tests. Original JS syntax checks passed. Build warning: main JS637kB.
- Browser verified actual authenticated map, zoom, calendar, circle chat and weekly podium, avatar editor, More menu, documents bubble examples and settings. No test messages sent, no passwords entered, no real user tasks/files created. User device acceptance still required.
- Step/section: user-directed UX replacement of step2 / SRS5.1 and11. Changed files: `experience/`, `public/`, `src/pages/AppShell.tsx`, `src/app.css`, Vite multi-entry config, package test script, docs. Database/migrations/deploy commands:none. No new team setup for visual preview. Backend feature integration remains outstanding as documented above.

## Responsive desktop/tablet/mobile — 2026-10-08
- User requested desktop and responsive support. Added `experience/responsive.css` after original styles, preserving mobile layout below600px; tablet expands to760px and desktop to1280px.
- Desktop map has a separate quest panel, fixed camera controls, floating navigation and avatar chat. Avatar uses two columns; document bubbles use three, rewards four, and settings two. Intro/login now adapt to wider screens. Safe-area bottom spacing retained.
- Browser checked map at320x740,768x1024 and1440x1000, desktop avatar and documents. Horizontal scrollWidth equals viewport width at320/768 and desktop documents (1425px excluding scrollbar). Real iPhone testing remains with team. No auth/data/backend changes or API calls.
- Checks: typecheck/lint/build pass; UX27/27 pass; server rules n/a (0 tests). Existing bundle warning only. Files: responsive.css, experience/entry.js, src/entry.css, PROGRESS.md. Database/deploy/team setup: none. Step2 visual adaptation; iPhone verification pending.

## Persistent mobile preview — 2026-10-08
- Browser viewport override did not persist to the user-visible view. Added public/mobile.html with a phone-width iframe loading the real authenticated app, so mobile media queries remain active regardless of desktop panel width. No separate data or fake session. On actual narrow devices, preview fills viewport. No schema or API changes.
- Checks: typecheck/lint/build passed; server rules n/a (Vitest0 tests). Preview opened in Codex browser. Actual device verification remains pending.
