# TESTING.md

TDD only for date calculation (SRS 5.4) and the HP formula (SRS 6.2). Everything else is covered by the checklist in SRS 12, run by the team on a real iPhone.

## 1. The TDD part
- All date and HP logic lives in one pure module: `supabase/functions/_shared/rules.ts`. No imports, no I/O, no `Date.now()`: "now" is always passed in as an argument. Because it is pure, the same file runs in Node (Vitest) and in Deno (edge functions).
- Test cases are defined once in `_shared/rules.cases.ts` and run by `_shared/rules.test.ts` (Vitest).
- Loop: write the cases first → run them and see them fail → implement until all pass → refactor without changing behaviour.
- Cases come from the SRS: every example in 5.4 and 6.2 (including the 29 HP example) and the calculation items in SRS 12. Add the boundaries:
  - exactly 3 days before the due date, the due day itself, the day after (in Zagreb days);
  - streak bonus cap; the 4th task without proof in a day; rounding and the minimum of 1;
  - a date that crosses a daylight-saving change keeps the same calendar date;
  - month ends and leap years (e.g. 31 Aug + 6 months).
- If the SRS does not define a case (e.g. month-end handling, half of an odd interval) and docs/PROGRESS.md has no decision for it, stop and ask. Record the answer as a decision in PROGRESS.md and as a test case.

## 2. Running the tests
- `npm test` runs Vitest (set up in step 1) on `supabase/functions/_shared/**/*.test.ts` only.
- After every change to `rules.ts`, Codex runs `npm test` itself and puts the result (passed/total) in the report. Never report a test as passing without running it in the same task.
- Edge functions are not run locally (that needs Docker). They are checked after deploy, through the app.

## 3. Everything else
- The SRS 12 checklist, on a real iPhone, with the app added to the Home Screen and opened from the published Vercel URL. The team marks results in PROGRESS.md.
- The two-account security test after the schema step and after F12 (SRS 8.3). Also try, as a normal user with that user's own token (from the browser or with curl against the REST API): update `profiles.hp`, set `tasks.status` to `done`, insert into `hp_ledger`, insert any task. All four must fail.
- No other automated tests, except: a bug that comes back a second time gets a test.

## 4. Definition of done (per step in SRS 13)
- [ ] Its `rules.ts` tests pass (if the step touches dates or HP).
- [ ] Typecheck, lint and build pass.
- [ ] Its migrations are applied and its edge functions deployed (if it has any).
- [ ] Its SRS 12 items pass on the iPhone, on the deployed Vercel URL (marked by the team).
- [ ] No console errors.
- [ ] Nothing outside the step changed.
- [ ] PROGRESS.md updated and the step committed.
