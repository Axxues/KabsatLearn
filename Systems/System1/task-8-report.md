# Task 8 Report — Remove Active/Ready medals and small texts from Quiz course picker, pluralize course count

## Overview
- Removed the `Active` / `Aktibo` badge from the dropdown trigger button in `QuizArena.jsx`.
- Replaced `{installedCourses.length} {lang === 'en' ? 'ready' : 'handa'}` in the dropdown header with pluralized course count strings using `t('courseCountSingle', { n })` and `t('courseCountPlural', { n })` (`1 course` / `2 courses` in English; `1 kurso` / `2 mga kurso` in Filipino).
- Removed the `{t('questionsMeta', { n: course.questions })}` subtitle text and the right-hand Active / Ready medal badges from the course list options in `QuizArena.jsx`.
- Cleaned up unused `lang` destructured variable from `useI18n()` in `QuizArena.jsx`.
- Added unit and integration tests to `QuizCoursePicker.test.jsx` verifying these criteria under both singular and plural installed counts, and in both Filipino and English.

## Changed Files
- `Systems/System1/app/src/ui/QuizArena.jsx`
- `Systems/System1/app/src/QuizCoursePicker.test.jsx`

## TDD Verification

### 1. Initial Test Run (RED - Failing Output)
Command: `cd Systems/System1/app; npx vitest run src/QuizCoursePicker.test.jsx`

```
 RUN  v5.1.0 D:/Hackathon/Systems/System1/app

 ❯ src/QuizCoursePicker.test.jsx (10 tests | 3 failed) 704ms
   ❯ quiz course picker (10)
     ✓ lists only installed courses in dropdown and does not show uninstalled courses 122ms
     ✓ starts the course that is selected 86ms
     ✓ installing a course makes it show up and its quiz uses its own question bank 76ms
     ✓ restores the last chosen course from storage 58ms
     ✓ falls back to the first installed course without overwriting a stale saved id 54ms
     ✓ uninstalled courses never show up in the dropdown and no lock icons appear 51ms
     ✓ toggles dropdown open and closed on trigger click 57ms
     × picker does not render Active or Ready badges or questions meta subtitle, and pluralizes course count in Filipino 58ms
     × picker header count tag renders singular "kurso" when only 1 course installed 52ms
     × picker header count tag renders singular "1 course" and plural "2 courses" in English 88ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/QuizCoursePicker.test.jsx > quiz course picker > picker does not render Active or Ready badges or questions meta subtitle, and pluralizes course count in Filipino
AssertionError: expected 'Pumili ng kurso:Ligtas na Digital Wal…' not to match /Aktibo|Active/

- Expected:
/Aktibo|Active/

+ Received:
"Pumili ng kurso:Ligtas na Digital WalletAktibo"

 ❯ src/QuizCoursePicker.test.jsx:221:37
    219|
    220|     const trigger = container.querySelector('button[aria-haspopup="lis…
    221|     expect(trigger.textContent).not.toMatch(/Aktibo|Active/)
       |                                     ^
    222|
    223|     openPicker()

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  src/QuizCoursePicker.test.jsx > quiz course picker > picker header count tag renders singular "kurso" when only 1 course installed
AssertionError: expected 'Pumili ng kurso:Ligtas na Digital Wal…' not to match /Aktibo|Active/

- Expected:
/Aktibo|Active/

+ Received:
"Pumili ng kurso:Ligtas na Digital WalletAktibo"

 ❯ src/QuizCoursePicker.test.jsx:244:37
    242|
    243|     const trigger = container.querySelector('button[aria-haspopup="lis…
    244|     expect(trigger.textContent).not.toMatch(/Aktibo|Active/)
       |                                     ^
    245|
    246|     const options = container.querySelectorAll('[role="option"]')

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  src/QuizCoursePicker.test.jsx > quiz course picker > picker header count tag renders singular "1 course" and plural "2 courses" in English
AssertionError: expected 'Choose a course:Ligtas na Digital Wal…' not to match /Aktibo|Active/

- Expected:
/Aktibo|Active/

+ Received:
"Choose a course:Ligtas na Digital WalletActive"

 ❯ src/QuizCoursePicker.test.jsx:263:37
    261|
    262|     const trigger = container.querySelector('button[aria-haspopup="lis…
    263|     expect(trigger.textContent).not.toMatch(/Aktibo|Active/)
       |                                     ^
    264|
    265|     let headerBadge = container.querySelector('[role="listbox"] > div:…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 7 passed (10)
```

### 2. Passing Test Run (GREEN)
Command: `cd Systems/System1/app; npx vitest run src/QuizCoursePicker.test.jsx`

```
 RUN  v5.1.0 D:/Hackathon/Systems/System1/app

 ✓ src/QuizCoursePicker.test.jsx (10 tests) 707ms

 Test Files  1 passed (1)
      Tests  10 passed (10)
   Start at  12:42:01
   Duration  1.85s (tests 41%, environment 37%, import 12%, transform 8%, setup 2%)
```

### 3. Full Suite Test Run
Command: `cd Systems/System1/app; npx vitest run`

```
 RUN  v5.1.0 D:/Hackathon/Systems/System1/app

 ✓ src/ui/KabsatAI.test.jsx (3 tests) 260ms
 ✓ src/ui/QuizArena.test.jsx (5 tests) 302ms
 ✓ src/ui/CourseHub.test.jsx (12 tests) 427ms
 ✓ src/kabsat-ai-background.test.jsx (2 tests) 446ms
 ✓ src/CourseCatalog.test.jsx (3 tests) 459ms
 ✓ src/App.test.jsx (6 tests) 524ms
 ✓ src/QuizCoursePicker.test.jsx (10 tests) 1705ms
 ✓ src/lib/telemetry.test.js (7 tests) 48ms
 ✓ src/lib/capsuleStore.test.js (8 tests) 47ms
 ✓ src/lib/i18n.test.jsx (3 tests) 127ms
 ✓ src/lib/share.test.js (4 tests) 63ms
 ✓ src/data/catalogue.test.js (12 tests) 41ms
 ✓ src/no-emoji.test.js (1 test) 17ms
 ✓ src/lib/rag.test.js (10 tests) 14ms
 ✓ src/lib/adaptive.test.js (12 tests) 17ms
 ✓ src/ui/OfflineBanner.test.jsx (2 tests) 18ms
 ✓ src/lib/schema.test.js (7 tests) 12ms
 ✓ src/lib/persona.test.js (6 tests) 11ms
 ✓ src/lib/online.test.js (3 tests) 9ms
 ✓ src/lib/bm25.test.js (7 tests) 9ms
 ✓ src/theme.test.js (8 tests) 6ms
 ✓ src/lib/lang.test.js (6 tests) 6ms

 Test Files  22 passed (22)
      Tests  137 passed (137)
   Start at  12:42:45
   Duration  7.89s (environment 75%, tests 11%, import 7%, setup 3%, transform 2%, worker 1%)
```

## Linter Results
Command: `cd Systems/System1/app; npx oxlint`
Exit code: 0
Output: 0 errors, 5 pre-existing warnings (0 new warnings introduced).

## Build Results
Command: `cd Systems/System1/app; npx vite build`
Exit code: 0
Output:
```
vite v8.3.6 building client environment for production...
transforming...
✓ 2102 modules transformed.
rendering chunks...
computing gzip size...
dist/manifest.webmanifest                            0.32 kB
dist/index.html                                      0.78 kB │ gzip:     0.41 kB
dist/assets/index-CsHJguGq.css                      53.21 kB │ gzip:     9.11 kB
dist/assets/web-Blg3u_jT.js                          1.10 kB │ gzip:     0.54 kB
dist/assets/virtual_pwa-register-CjBpyQjf.js         1.12 kB │ gzip:     0.59 kB
dist/assets/workbox-window.prod.es5-Bd17z0YL.js      5.65 kB │ gzip:     2.20 kB
dist/assets/index-C040R1dN.js                      507.50 kB │ gzip:   152.78 kB
dist/assets/llm-vdoiSPd2.js                      6,116.56 kB │ gzip: 2,190.28 kB

PWA v2.0.0
mode      generateSW
precache  14 entries (6535.64 KiB)
files generated
  dist/sw.js
  dist/workbox-9c191d2f.js
✓ built in 1.11s
```

## Acceptance Criteria Summary
- [x] Trigger button does not display any "Active" or "Aktibo" badge.
- [x] Course list options do not display any "Active", "Aktibo", "Ready", or "Handa" badges.
- [x] Course list options do not display the "questions" / "tanong" subtitle text.
- [x] Header count badge displays "1 course" (singular) or "{n} courses" (plural) in English (and "1 kurso" / "{n} mga kurso" in Filipino).
- [x] `npx vitest run` passes all 137 tests across 22 test files.
- [x] `npx oxlint` reports 0 errors and no new warnings.
- [x] `npx vite build` succeeds with exit code 0.
