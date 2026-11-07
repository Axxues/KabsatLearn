# Tasks 5–6 — independent review and verification

Transcribed by the controller from the verifier and reviewer subagents, which
are read-only and could not write their own files. Findings are theirs; the
controller's checks are marked separately.

## Verifier verdict: PASS (DONE_WITH_CONCERNS)

Commands reproduced independently from `Systems/System1/app`:

- `npx vitest run` — 22 files, 127 tests passed, exit 0 (at the time of the
  Task 5/6 verification; Task 7 later raised this to 134).
- `npx oxlint` — exit 0, nine pre-existing warnings, none from the new files.
- `npx vite build` — exit 0.
- Production bundle contains `Kumpiyansa sa Smartphone`, `Perang May Plano`,
  `Plano ng Pamilya`, and `Tindahang Maayos`.

Acceptance criteria for both briefs: PASS, except literal file-list compliance
for Task 6. `Systems/System1/pitch/kabsatlearn-debug.apk` changed at 12:21:45,
outside the brief's file list. Its bundle contained capsules 103 and 104 but not
105 and 106, which shows it was built from the Task 5 source state by a
concurrent process. The controller rebuilt it after Task 7.

Registry checks confirmed independently:

- `SEEDED_IDS = ['capsule-101']`; a fresh IndexedDB contains exactly
  `capsule-101`.
- `CATALOG` has six entries; 102–106 render under "Available to download".
- All four new capsules have 6 cards, 10 questions (4/3/3 bands), 12 chunks,
  four options per question, card-backed `source_id`s, and 12 English
  translations per capsule.

Contrast, recomputed by the verifier after Task 6:

| tone | stops | white-on-stop |
|---|---|---|
| family | `#134e4a`, `#0f766e`, `#0f766e` | 9.48:1, 5.47:1, 5.47:1 |
| business | `#064e3b`, `#065f46`, `#047857` | 9.72:1, 7.68:1, 5.48:1 |

Task 7 then changed the family stops to `#134e4a`, `#115e59`, `#0f766e`
(`#115e59` = 7.58:1), removing the duplicate stop.

## Reviewer verdict: DONE_WITH_CONCERNS

Spec compliance: PASS. The four requested courses exist, are catalog-only, and
match the briefs.

Findings and disposition:

1. **Important — tutor is not course-scoped.** Kabsat AI always grounds on
   Capsule 101, so questions about 103–106 are refused. Pre-existing behaviour,
   outside the change's file list. Documented in `DESIGN.md` as an honest limit.
2. **Important — artwork reuse.** Capsules 104, 105, and 106 share
   `OnlineWorkArt`. Accepted for this task; the tones, category tags, and codes
   distinguish them.
3. **Minor — duplicate family gradient stop.** Fixed in Task 7.
4. **Minor — unused imports in `CourseHub.jsx`.** Pre-existing; left alone.
5. **Minor — seed-list typo could hang the hub.** Guard added in Task 7.
6. **Minor — content precision nits.** Capsule 106 `q2` now includes balance
   and expiry. The 103 `q8` wording and the 105 `c4` title were left as written
   in the briefs.
7. **Health review.** Family-planning content is accurate against the brief but
   has not been clinically reviewed. Recorded in `DESIGN.md` and the pitch must
   not imply sign-off.
8. **Test hygiene gaps.** Task 7 added guards for seeded ids, chunk difficulty,
   and the 4–6 lowercase keyword rule.
9. **Stale copy outside scope.** `persona.js` still names only two courses, and
   the dashboard summary in `DESIGN.md` still said "four pillars". The latter is
   fixed; the persona copy is not false ("like ...") and was left alone.

## Controller checks

- Task 7: `npx vitest run` — 22 files, 134 tests passed, exit 0.
- Task 7: `npx oxlint` and `npx vite build` — exit 0.
- APK rebuilt with `C:\AndroidDev\jdk21` and `C:\AndroidDev\sdk`; Gradle
  `assembleDebug` succeeded. Copied to `pitch/kabsatlearn-debug.apk`
  (7,101,956 bytes). The APK bundle was opened and all four course titles were
  found inside `assets/public/assets/index-HHr56qHi.js`.
