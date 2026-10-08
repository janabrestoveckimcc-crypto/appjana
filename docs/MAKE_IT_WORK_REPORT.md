# MAKE_IT_WORK — progress, 8 October 2026

The new supplied plan supersedes CODEX_TESTS for this pass. Existing approved UI remains in place.

## Step 0 — blocked by missing Gemini secret

Works: gemini-check is deployed and accepts the signed-in user's JWT, validated by Supabase Auth.getUser. A request without a JWT returns 401. The former operator-only service-role comparison has been removed. The platform legacy JWT gate is disabled only for this handler; user authentication remains mandatory inside the function.

Blocked/cut: the project's secret-name listing contains neither GEMINI_API_KEY nor gemini_api_key. Two Google models.list requests returned 403; the sanitized response identifies an unregistered caller. A server-side guard now returns AI-0001 / 503 before contacting Google when the key is absent. No successful Gemini answer or model discovery has occurred. Unverified model IDs were removed; main/fallback IDs are empty until actual model discovery succeeds.

How to check: sign in at http://127.0.0.1:5195/?ai-check and click Dostupni AI modeli. The diagnostic is visible only with that query parameter. After the project owner saves a valid Gemini key in the project's Edge Functions Secrets, list available models, set a returned Flash model ID in config.ts, deploy gemini-check, then use Testiraj Gemini. No key goes into the browser or chat.

## Preparation while blocked — not deployed, not end-to-end verified

- Pure date/HP functions and 13 tests: six-month follow-up, exact expiry minus 30 days, month-end clamping/leap years, Zagreb DST, no invented missing dates, SRS 29 HP example, no-proof factor 0.3, time boundaries, streak cap, minimum one, map surplus and relative weekdays/weeks.
- Explicit thin-demo date conventions: clamp to the last valid day of the target month; an odd half-month interval uses whole months plus 15 calendar days; a weekday named without a date means the next occurrence (same weekday means next week). These conventions are implemented in code and covered by tests, not decided by AI.
- Prepared extraction schema/prompt, bounded structured JSON call with one retry only for invalid output, JWT-authenticated extract-document source, server-computed file hash, owner-scoped private Storage read and duplicate check.
- Prepared additive migration 20261008152000_demo_document_transaction.sql: service-role-only RPC atomically saves a document and its follow-up task. Only dry-run was performed; migration is NOT applied. No RLS policies were removed or widened.
- Prepared frontend cloud adapter and presentation mapping, not wired into the active UI. Current task/document state is still local. No assistant-chat or complete-task function has been built/deployed.
- Synthetic follow-up.pdf fixture and exact expected dates are in supabase/tests/fixtures. It has not been uploaded or sent to Gemini.

Checks: typecheck, lint, production build, Deno checks of gemini-check/extract-document all pass. Date/HP tests 13/13; existing UX tests 32/32. Build retains the existing large-chunk warning. Migration dry-run identifies the prepared migration only and does not verify SQL execution. No iPhone end-to-end acceptance claimed.

Usage this pass: 2 unsuccessful Google model-list requests, 0 generation requests. Further signed-in checks stop locally at the missing-secret guard. No personal document content was sent to Google, no user data rows were changed, and no secrets were read or printed.

Next after unblocking: discover an actually available Flash model, complete Step 0's real answer check, then deploy/verify Step 1 and wire the cloud adapter to the existing screens. Proceed to Step 2 and Step 3 in order. Hourly jobs, push, proofs, friends, decay and stars remain cut.
