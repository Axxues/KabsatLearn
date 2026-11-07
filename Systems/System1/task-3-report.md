# Task 3 report — Quiz course picker

Status: DONE_WITH_CONCERNS (implementation complete and verified; the full-suite
run exits 1 because of unrelated Kabsat AI tests being edited concurrently in the
same tree — see "Shared-tree interference").

## 1. RED (before implementation)

Created `app/src/QuizCoursePicker.test.jsx` first and ran it. 5 of the 6 tests
failed because the picker did not exist yet:

```
 RUN  v5.1.0 D:/Hackathon/Systems/System1/app

 ❯ src/QuizCoursePicker.test.jsx (6 tests | 5 failed) 315ms
   ❯ quiz course picker (6)
     × lists all courses and marks an uninstalled course locked 109ms
     × installing a course unlocks it and its quiz uses its own question bank 34ms
     × restores the last chosen course from storage 62ms
     × falls back to the first installed course without overwriting a stale saved id 29ms
     × a locked course routes to Aralin and keeps the saved choice 27ms

 FAIL  ... > lists all courses and marks an uninstalled course locked
AssertionError: expected 'BumalikLigtas na Digital WalletQuiz A…' to contain 'Pumili ng kurso'

Expected: "Pumili ng kurso"
Received: "BumalikLigtas na Digital WalletQuiz Arena10 tanong. ..."
 ❯ src/QuizCoursePicker.test.jsx:88:35

 FAIL  ... > installing a course unlocks it and its quiz uses its own question bank
TypeError: Cannot read properties of undefined (reading 'textContent')

 FAIL  ... > restores the last chosen course from storage
TypeError: Cannot read properties of undefined (reading 'getAttribute')

 FAIL  ... > falls back to the first installed course without overwriting a stale saved id
TypeError: Cannot read properties of undefined (reading 'getAttribute')

 FAIL  ... > a locked course routes to Aralin and keeps the saved choice
TypeError: Cannot read properties of undefined (reading 'dispatchEvent')

 Test Files  1 failed (1)
      Tests  5 failed | 1 passed (6)
```

The one test that passed ("starts the course that is selected") is a regression
guard for the existing default-101 behaviour; it also asserts the picker is gone
once the round starts. The other five failed for the expected reason: no picker,
no per-course bank, no locked routing.

## 2. GREEN

My four scoped test files (picker, App nav, QuizArena, no-emoji):

```
> npx vitest run src/QuizCoursePicker.test.jsx src/App.test.jsx src/ui/QuizArena.test.jsx src/no-emoji.test.js

 RUN  v5.1.0 D:/Hackathon/Systems/System1/app

 Test Files  4 passed (4)
      Tests  16 passed (16)
```

The picker file alone:

```
> npx vitest run src/QuizCoursePicker.test.jsx

 Test Files  1 passed (1)
      Tests  6 passed (6)
```

That includes `App.test.jsx`'s existing "stays visible on the quiz intro and
hides only while the quiz runs" test, so the bottom-nav behaviour is unchanged:
nav is visible on the intro, hidden during `question`/`reveal`, back on results.

## 3. Files changed

- `app/src/App.jsx`
  - `CAPSULE_BY_ID` map.
  - `quizCourseId` lazy state read from `kabsat_quiz_course`.
  - `quizCourses` built from `capsules`, with the documented pre-refresh
    fallback (`CATALOG` with only 101 installed).
  - `activeQuizCourse` derivation (saved+installed → first installed → first).
  - `selectQuizCourse(id)` only accepts installed ids, sets state and writes
    `localStorage` immediately.
  - `QuizArena` now gets `key`, `capsule`, `courses`, `selectedCourseId`,
    `onSelectCourse`, `onLockedCourse`.
  - When-running padding and `{!quizRunning && navigation}` untouched.
- `app/src/ui/QuizArena.jsx`
  - New props with defaults so existing callers without `courses` render no
    picker.
  - Intro-only picker above the trophy block: `chooseCourse` label, 2-column
    grid, `ShieldCheck`/`Briefcase`/`Lock` icons, `aria-pressed` on installed
    cards, locked card is a tappable button that calls `onLockedCourse` (falls
    back to `onExit`).
- `app/src/lib/i18n.jsx`
  - `chooseCourse` and `quizCourseLocked` added to both `fil` and `en`.
- `app/src/QuizCoursePicker.test.jsx` (new)
  - 6 tests: all courses listed + locked presentation, default 101 starts 101,
    installing 102 unlocks it and uses 102's bank, remembered choice restored,
    stale saved id falls back without overwriting, locked card routes to Aralin.
  - Test harness waits (polls up to ~1 s) for App's async Dexie refresh to
    replace the hub loading state before asserting installed flags. This is test
    timing only; no production behaviour was changed for it.

## 4. Command output

### `npx oxlint src/App.jsx src/ui/QuizArena.jsx src/lib/i18n.jsx src/QuizCoursePicker.test.jsx`

```
src/lib/i18n.jsx:369:17: warning react(only-export-components): Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.
```

This is the pre-existing warning listed in the brief; my additions add none.

Full `npx oxlint src` currently also reports warnings in files owned by
concurrent Kabsat AI work (`KabsatAI.test.jsx`, `KabsatAI.jsx`, `rag.test.js`,
`kabsat-ai-background.test.jsx`) plus the known `capsuleStore.js` `hash` (2),
`Dashboard.jsx` set-state-in-effect. No warning points at the quiz picker code.

### `npx vite build`

```
transforming...
✓ 2097 modules transformed.
dist/assets/index-BhHA91Vg.css                      46.66 kB │ gzip:     8.41 kB
dist/assets/index-Bjn7V2v4.js                      459.60 kB │ gzip:   139.48 kB
dist/assets/llm-B0ndigbc.js                      6,116.54 kB │ gzip: 2,190.27 kB
✓ built in 1.24s
PWA v2.0.0
mode      generateSW
precache  14 entries (6482.46 KiB)
files generated
  dist/sw.js
  dist/workbox-9c191d2f.js
EXIT=0
```

Exit 0. Only the standard chunk-size advisory.

### `npx vitest run` (full suite, current shared tree)

Latest run after the concurrent work advanced:

```
 ❯ src/kabsat-ai-background.test.jsx (2 tests | 1 failed) 766ms
   ❯ Kabsat AI ongoing query and rotating icon (2)
     × Kabsat AI icon rotates during ongoing query even when navigated to another page, and query does not get interrupted

AssertionError: expected 'lucide lucide-sparkles lucide-stars s…' not to contain 'animate-spin'
Expected: "animate-spin"
Received: "lucide lucide-sparkles lucide-stars size-4.5 stroke-[2] animate-spin origin-center text-[var(--color-accent)]"

 Test Files  1 failed | 19 passed (20)
      Tests  1 failed | 109 passed (110)
Exited with code 1
```

The only failure is in the concurrently added Kabsat AI background work: its own
test expects the tutor nav icon to stop spinning after its timer advances, and
the current shared-tree implementation still spins. `QuizCoursePicker`, `App`,
`QuizArena`, and `no-emoji` all pass in this same run. An earlier full run also
saw two `src/ui/KabsatAI.test.jsx` failures while that file was mid-edit; those
are now green. I did not touch `KabsatAI.jsx`, `useKabsatAiState.js`, or those
tests; the brief forbids editing them.

## 5. Deviations

1. **One extra test** beyond the five required: "falls back to the first
   installed course without overwriting a stale saved id". It directly covers
   requirement 5's fallback rule and requirement that the saved id is not
   overwritten.
2. **Test harness waits on real async loading.** My test `mount()` polls for the
   hub greeting (up to 100 × 10 ms) because App loads installed capsules from
   Dexie asynchronously; a bare `await act` returned while the hub still showed
   `Kinukuha ang iyong mga kurso…`. No production code was added to satisfy it.
3. **Icon fallback.** `COURSE_ICONS` maps 101→`ShieldCheck`, 102→`Briefcase`;
   any future installed course falls back to `ShieldCheck`. Locked cards always
   use `Lock`, per the brief.
4. **Locked card `aria-pressed`** is omitted (not `"false"`) since it is not a
   selectable state; installed cards always expose it.

## 6. Shared-tree interference (needs controller attention)

This system folder was being written by another worker while I ran:

- `src/kabsat-ai-background.test.jsx` appeared at 11:12 (it did not exist when I
  first listed the tests), and its content changed again between runs.
- `App.jsx` was modified at 11:20 by that work (`useKabsatAiState`, BottomNav
  `aiProcessing`, theme-color meta, tutor layout). My quiz changes are still
  present and the combined file passes my tests.
- My new test file's `mount()` was externally changed between my write and my
  next edit (a fixed 50 ms wait replaced what I wrote); I then replaced it with
  the condition-based poll described above.

I made no edits outside `Systems/System1/app/src/` and touched only the four
files listed. The full-suite red result is from the other in-flight task, not
from the course-picker change. Re-running the suite after that work lands should
be the final gate.

## 7. Status

DONE_WITH_CONCERNS — picker, per-course banks, locking, persistence, and nav
behaviour are implemented and green in scoped tests; full-suite exit 0 is
blocked by unrelated Kabsat AI work being edited concurrently in the same tree.
