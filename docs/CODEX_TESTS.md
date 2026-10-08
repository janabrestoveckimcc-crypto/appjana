# CODEX_TESTS.md: relAI test and fix pass

You are working on relAI, an existing app. Read `docs/SRS.md` and the other files in `docs/` (and `AGENTS.md` if present) before you change anything. The SRS is the source of truth. This file is a test-and-fix pass only: do not add features. New features are in `docs/CODEX_FEATURES.md` and start only after this pass is finished.

## 0. Rules for this whole task
- Use the stack, structure and conventions that already exist in the repo. Do not add dependencies unless a task below cannot be done without one; if so, say which and why before adding it.
- Work through the items in order. Do not start a new item while an earlier one is broken.
- Small, focused changes. Never refactor code that an item does not need.
- Dates and HP are calculated by code, never by AI. AI returns only validated JSON. Every AI prompt contains today's date, weekday, time and the time zone Europe/Zagreb.
- The client never writes HP, the HP ledger, map/presence/streak or task status `done`; only server code does.
- Database changes: additive migrations only, RLS on every new table or column, user taken from the session, never from the request body.
- Every UI text in both Croatian (default) and English through the existing i18n dictionary.
- Pure logic (dates, HP, map position, presence, budget sums) gets automated tests. Everything else gets a manual check described in the report.
- After each item, run the full test suite and the build. Nothing is "done" while either fails.

## Items: verify and fix (in this order)

For each item: find the code, check it against the acceptance criteria, write or run tests where the logic is pure, fix what fails, then report.

| # | Item | Acceptance criteria |
|---|---|---|
| 1 | Document recognition and categories (SRS 5.2, 9.2) | Each test document gets the right category from the SRS 5.2 list, a sensible title, the document date and expiry date, and the follow-up sentence quoted literally. The same file uploaded twice is rejected. |
| 2 | Calendar auto-fill (SRS 5.3, 5.4, 5.5) | A document with a follow-up creates a task automatically with the correct `remind_at` and `due_date` (interval rules incl. even/odd months, month ends, exact expiry −30 days). The notification shows the quote, Poništi deletes the task, Uredi opens edit. The task appears on the right calendar day. |
| 3 | HP growth (SRS 6.2) | Formula matches the SRS exactly, including the 29 HP example, time factors at their boundaries, proof ×1.0/×0.3 and the 3-per-day limit, streak cap, rounding and minimum 1, +1 HP per new document (max 5/day, duplicates 0). `profiles.hp` always matches the ledger. All covered by automated tests. |
| 4 | Character movement on the map (SRS 6.3) | Ghost stands on field `floor(HP/10)+1` and visibly moves to the new field after a task is completed. |
| 5 | Map change (SRS 6.3) | At 100 HP: unlock animation, next map, HP restarts from the surplus, ghost moves to the next phase. After map 5 the ghost stays on the last map and every 100 HP adds a star. Tested. |
| 6 | Character build by solved tasks (SRS 6.3, 6.5) | The ghost's phase (Sjena → Iskra → Srebrni trag → Sjaj → Legenda) follows the map index; aura and trail change per phase; gold only in the last phase; avatar options from onboarding stay applied. |
| 7 | Character fade (SRS 6.4) | Presence starts at 60; −5 % once per Zagreb day without a solved task (`presence_decayed_on`); missed-deadline penalty once per task; +10 % per solved task, max 100; opacity = 0.25 + 0.75 × presence; flicker below 30 %. Presence never changes HP or maps. Tested. |
| 8 | Chatbot (SRS 5.6, 9.3) | Answers in the ghost's voice, in the user's tone and language. Creates tasks through its tool (with Poništi/Uredi), resolves relative dates ("u četvrtak", "za 2 tjedna") correctly against today in Zagreb, searches documents, never receives files, uses at most the last 10 messages. |
| 9 | Personal questions (SRS 9.1 rule 5, 9.3) | "Koji mi je OIB?" and similar are answered only from the user's own documents. If the data is not there, it says so. Never invents data, never shows another user's data (check with two accounts). |
| 10 | Notifications and tone (SRS 7) | Right template per trigger, tone and language; max 3 per day; never 21:00–9:00 Zagreb; no duplicates (unique key per user, task, template, Zagreb day); changing the tone in Profil changes the next notification; Blago versions used for the gentle tone; the "Pošalji test obavijest" button works. Templates: `docs/NOTIFICATIONS.md` if present. |
| 11 | Friends on a shared map (F16, SRS 8.3). Skip if F16 was never built; it is built in CODEX_FEATURES.md F1. | Unique friend code per user; adding a friend by code; friends' ghosts visible on the map; only the public fields allowed by SRS 8.3 are ever returned; no documents, tasks or chat of a friend reachable. |

## Report after every item
```
Item: <Phase/number and name>
Status: works / fixed / still broken
What was wrong: <1–2 sentences, or "nothing">
Changed files: <list>
Migrations: <list or "none">
Tests: <added/updated, all passing yes/no>
Manual check: <exact steps and test data for the team>
```
