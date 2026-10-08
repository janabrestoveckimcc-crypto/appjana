# SCOPE_GUARD.md

These rules keep the build on track for every prompt. If a prompt seems to conflict with them, point out the conflict and ask before acting.

## 1. Sources of truth
| Question | Source |
|---|---|
| What the app does: features, data, AI, game, design, build order, tests | `docs/SRS.md` (wins over all other docs) |
| Rules for every task, commands, git, secrets | `AGENTS.md` |
| How code is structured | `docs/ARCHITECTURE.md` |
| How data and security rules are enforced | `docs/DATA_SECURITY.md` |
| How AI calls are made | `docs/AI_RULES.md` |
| What is tested and how | `docs/TESTING.md` |
| Extra rules for Web Push (push test and F17) | `docs/PUSH.md` |
| Where we are, and decisions already made | `docs/PROGRESS.md` |

- If any doc conflicts with the SRS, the SRS wins.
- A decision recorded in PROGRESS.md (section Decisions) is the team's answer to an open question. It fills a gap or resolves an SRS contradiction; it never overrides a clear SRS rule.
- If the SRS contradicts itself, or is silent on something the current step needs, and PROGRESS.md has no decision for it, **stop and ask** with a recommended default. Never choose silently.
- Every change must serve the core value (SRS 2).

## 2. Scope
- Build only the MVP from SRS 3, in the order of SRS 13, one step or section per prompt.
- F17 and F14 follow the push decision at 1:30 (SRS 3, 13). F16 is built only after a prompt explicitly activates it. Roadmap items (R1–R6) and everything under "Izvan opsega" are never built.
- Never do this without an explicit request:
  - new screens, fields, buttons, settings, onboarding steps, animations or effects not described in the SRS;
  - extras such as social login, admin panels, analytics, languages other than Croatian and English, exports other than `.ics`;
  - mock or placeholder functionality, including placeholder images or icons;
  - changing, refactoring or "cleaning up" code outside the current step, or changing a finished step;
  - new libraries (anything not in ARCHITECTURE.md section 2) or schema changes;
  - applying migrations, deploying edge functions, or touching Secrets, Vault or Vercel settings.
- Ideas go into ONE line at the end of the report: `Suggestion (not implemented): …`. Do not build them.

## 3. How to work
1. Start only when a prompt names an SRS section or SRS 13 step (e.g. `Implement docs/SRS.md section 5.2 only.`). Read docs/PROGRESS.md first.
2. Give a short plan: files, migrations, edge functions, tests, and the commands and setup the team must run.
3. **Stop after the plan, write no files, and wait for approval** if the step touches the schema, RLS or auth, an edge function, an AI call, or more than ~6 files. Otherwise continue.
4. TDD where TESTING.md requires it.
5. If a fix fails twice, stop and follow SRS 13: report what failed and name the last good commit (`git log --oneline`). The team reverts; never run destructive git commands yourself.
6. Run typecheck, lint, test and build (AGENTS.md). Update PROGRESS.md, make one commit, and finish with the report (section 5).

## 4. Freeze
After a prompt says `FEATURE FREEZE` (SRS 13, Stop): only bug fixes, text corrections and visual polish of existing functionality. Anything else requires explicit confirmation.

## 5. Report after every task
```
Step / section: SRS 13 step N, sections x.y
Done: <what now works, 1–3 sentences>
Changed files: <list>
Database: <new migration files, or "none">
Commands: <db push / type generation / function deploys: "ran: <command> → <result>" or "for the team: <command>"; or "none">
Team setup: <secrets, Vault, Vercel env vars, Dashboard settings, designer files, with placeholders; or "none">
Checks: typecheck <ok/fail> · lint <ok/fail> · build <ok/fail>
Rules tests: <x/y passing, or "n/a">
Commit: <short hash and message>
Check on iPhone: <which SRS 12 items to check, with what data>
Known issues: <list or "none">
Questions: <list or "none">
Suggestion (not implemented): <optional, one line>
```
Never mark a step as verified. Only the team does, in PROGRESS.md.
