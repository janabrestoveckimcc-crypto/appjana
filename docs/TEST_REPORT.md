# CODEX_TESTS — 2026-10-08

## Item 1: Document recognition and categories (SRS 5.2, 9.2)

**Status: still broken**

What was wrong: The active document library saves files locally, uses their filenames as titles and allows manual categories/expiry dates. There is no `extract-document` function or recognition integration; only `gemini-check` exists. Duplicate uploads were also accepted by the local library.

| Acceptance criterion | Finding |
|---|---|
| Correct SRS category | Not implemented: category is manually selected from the approved UX categories. |
| Sensible extracted title | Not implemented: original filename is stored. |
| Document date and expiry date | No extraction: creation timestamp is upload time; expiry is manually editable. |
| Literal follow-up quote | Not implemented: no extraction request or validated extraction response. |
| Reject same file twice | Fixed for the existing local library using SHA-256, including renamed files and sequential batch uploads. Cloud integration remains absent. |

Evidence: `experience/documents.js` contains the upload handler; `src/features/documents/services/documents.service.ts` only reads cloud documents. The applied initial migration already has a unique `(user_id, file_hash)` constraint, but the active upload flow does not write cloud documents.

Changed files:
- `experience/documents.js`: reject duplicates before saving; derive hashes for older local blobs; HR/EN error through existing translation helper.
- `experience/document-fingerprint.mjs`: content hashing and duplicate matching.
- `experience/tests/document-fingerprint.test.mjs`: five pure-logic tests.
- `docs/CODEX_TESTS.md`: supplied checklist copied unchanged into repository.
- `docs/TEST_REPORT.md` and `docs/PROGRESS.md`: results and stopping point.

Migrations: none. Dependencies: none. Cloud changes/deployments: none. Gemini calls in this pass: 0.

Tests: **32/32 UX tests passing**, including five new fingerprint tests. Typecheck, lint, JavaScript syntax check and production build pass. `npm test` exits successfully but finds **zero server rule tests**; it is not evidence of backend correctness. Build retains the existing >500 kB chunk warning. The tests cover hashing and matching, not browser persistence end to end. Existing prototype tests do not establish compliance with the later SRS items.

Manual check (not executed in this pass; use synthetic documents):
1. In a test account open Više → Dokumenti. Upload a valid PDF named `relai-duplicate-check.pdf` containing `Kontrola za 6 mjeseci.` Record the file count.
2. Upload the exact same file again: count must remain unchanged and the HR duplicate message must appear. Rename a byte-identical copy and repeat; it must also be rejected.
3. Reload, repeat the upload, then switch to EN and repeat: duplicate rejection must survive reload and show the English message.
4. Upload a different valid PDF under the same filename: it must be accepted. Select two identical copies in one batch: only one new entry should be saved.
5. Repeat with a synthetic JPEG, and with a file saved before this fix. Older photos only retain normalized bytes; original-source matching cannot be reconstructed if normalization changes.
6. Recognition acceptance remains blocked: the current UI cannot extract category, dates or a literal quote from the sample. Do not interpret manual edits as an extraction pass.

Items 2–11: **not started**. CODEX_TESTS rule 0 says “Do not start a new item while an earlier one is broken.” Implementing the missing recognition/cloud pipeline would add a feature, which the current request explicitly forbids. No missing feature was implemented, and no existing visual layout was changed.

Team setup/commands: none for this local fix. iPhone acceptance remains pending; repeat the manual steps there. This report does not mark team acceptance as verified.
