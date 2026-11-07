# Task 11 Report: Change course card "Pass" button text to "Share"

**Status: DONE**

## Executive Summary

The course capsule sharing button on installed course cards in `CourseHub.jsx` previously rendered the text "Pass" (`passCourse: 'Pass'`) in English and "Ipasa" (`passCourse: 'Ipasa'`) in Filipino. Per the brief, the button labels and tooltips/aria labels were updated in `Systems/System1/app/src/lib/i18n.jsx` so that:
- In English: `passCourse` is `"Share"`, `passTooltip` is `"Share with classmate via Bluetooth or Nearby Share"`, and `passAria` is `"Share {title} with classmate"`.
- In Filipino: `passCourse` is `"Ibahagi"`, `passTooltip` is `"Ibahagi sa kaklase via Bluetooth o Nearby Share"`, and `passAria` is `"Ibahagi ang {title} sa kaklase"`.
- No emojis are present in the translations.
- In `QuizArena.jsx`, the 2-player quiz game mode (`playPass: 'Pass and Play'`) remains untouched.
- All 150 vitest tests across 24 test files pass, oxlint reports 0 errors, and vite build succeeds with exit code 0.

---

## Changed Files Summary

| File | Changes Made |
|---|---|
| `Systems/System1/app/src/lib/i18n.jsx` | Updated `passCourse`, `passTooltip`, `passAria` in the `fil` dictionary to `'Ibahagi'`, `'Ibahagi sa kaklase via Bluetooth o Nearby Share'`, and `'Ibahagi ang {title} sa kaklase'`. Updated `passCourse`, `passTooltip`, `passAria` in the `en` dictionary to `'Share'`, `'Share with classmate via Bluetooth or Nearby Share'`, and `'Share {title} with classmate'`. |
| `Systems/System1/app/src/ui/CourseHub.test.jsx` | Added unit test `installed course card displays "Share" on the share button in English and "Ibahagi" in Filipino` asserting English renders `"Share"` (and not `"Pass"`) and Filipino renders `"Ibahagi"`. |

---

## 1. Failing Test Output (RED)

Prior to updating `i18n.jsx`, the new unit test was added to `Systems/System1/app/src/ui/CourseHub.test.jsx` and executed via `npx vitest run src/ui/CourseHub.test.jsx` from `Systems/System1/app`:

```
 RUN  v5.1.0 D:/Hackathon/Systems/System1/app

 ❯ src/ui/CourseHub.test.jsx (15 tests | 1 failed) 221ms
   ❯ CourseHub capsule cards and counters (15)
     ✓ installed card does NOT render "Ready", "Handa", or Check icon 39ms
     ✓ available card renders its KB size 19ms
     ✓ available section is collapsed by default 11ms
     ✓ available section expands and collapses on header click 18ms
     ✓ installed counter displays "1 course" in English when 1 capsule is installed 10ms
     ✓ installed counter displays "2 courses" in English when 2 capsules are installed 11ms
     ✓ installed counter displays "1 kurso" in Filipino when 1 capsule is installed 7ms
     ✓ installed counter displays "2 mga kurso" in Filipino when 2 capsules are installed 9ms
     ✓ card category tag and code come from the capsule when it carries a tone 10ms
     ✓ greeting card does not render small subtitle text below the welcome title in English 7ms
     ✓ greeting card does not render small subtitle text below the welcome title in Filipino 11ms
     ✓ download button uses high-contrast text and does not use variable ink color on white background 11ms
     ✓ clicking an available course card opens download confirmation modal, cancel dismisses it 20ms
     ✓ confirming download in modal triggers onDownload with capsule id 22ms
     × installed course card displays "Share" on the share button in English and "Ibahagi" in Filipino 13ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/ui/CourseHub.test.jsx > CourseHub capsule cards and counters > installed course card displays "Share" on the share button in English and "Ibahagi" in Filipino
AssertionError: expected 'Pass' to contain 'Share'

Expected: "Share"
Received: "Pass"

 ❯ src/ui/CourseHub.test.jsx:344:36
    342|     const installedSectionEn = container.querySelector('section[aria-labelledby="installed-heading"]')
    343|     const shareBtnEn = installedSectionEn.querySelector('li button')
    344|     expect(shareBtnEn.textContent).toContain('Share')
       |                                    ^
    345|     expect(shareBtnEn.textContent).not.toContain('Pass')
    346|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 14 passed (15)
   Start at  12:54:52
   Duration  1.20s (environment 57%, tests 21%, import 15%, transform 3%, setup 3%, worker 1%)
```

---

## 2. Passing Test Output (GREEN)

### Isolated CourseHub test run

Running `npx vitest run src/ui/CourseHub.test.jsx` from `Systems/System1/app`:

```
 RUN  v5.1.0 D:/Hackathon/Systems/System1/app

 ✓ src/ui/CourseHub.test.jsx (16 tests) 276ms

 Test Files  1 passed (1)
      Tests  16 passed (16)
   Start at  13:01:25
   Duration  1.39s (environment 59%, tests 22%, import 13%, transform 3%, setup 2%, worker 1%)
```

### Full test suite run

Running `npx vitest run` from `Systems/System1/app`:

```
 RUN  v5.1.0 D:/Hackathon/Systems/System1/app

 ✓ src/ui/QuizArena.test.jsx (5 tests) 267ms
 ✓ src/ui/Profile.test.jsx (5 tests) 526ms
 ✓ src/CourseCatalog.test.jsx (3 tests) 423ms
 ✓ src/ui/Dashboard.test.jsx (3 tests) 485ms
 ✓ src/kabsat-ai-background.test.jsx (2 tests) 485ms
 ✓ src/App.test.jsx (7 tests) 533ms
 ✓ src/QuizCoursePicker.test.jsx (10 tests) 1540ms
 ✓ src/lib/capsuleStore.test.js (8 tests) 52ms
 ✓ src/lib/i18n.test.jsx (3 tests) 61ms
 ✓ src/lib/share.test.js (4 tests) 49ms
 ✓ src/lib/telemetry.test.js (7 tests) 48ms
 ✓ src/ui/KabsatAI.test.jsx (3 tests) 440ms
 ✓ src/ui/CourseHub.test.jsx (16 tests) 856ms
 ✓ src/data/catalogue.test.js (12 tests) 39ms
 ✓ src/lib/rag.test.js (10 tests) 13ms
 ✓ src/no-emoji.test.js (1 test) 18ms
 ✓ src/lib/adaptive.test.js (12 tests) 10ms
 ✓ src/ui/OfflineBanner.test.jsx (2 tests) 18ms
 ✓ src/lib/online.test.js (3 tests) 10ms
 ✓ src/lib/schema.test.js (7 tests) 8ms
 ✓ src/theme.test.js (8 tests) 6ms
 ✓ src/lib/persona.test.js (6 tests) 7ms
 ✓ src/lib/lang.test.js (6 tests) 6ms
 ✓ src/lib/bm25.test.js (7 tests) 5ms

 Test Files  24 passed (24)
      Tests  150 passed (150)
   Start at  13:01:46
   Duration  7.75s (environment 72%, tests 14%, import 9%, setup 3%, transform 2%, worker 1%)
```

---

## 3. Oxlint Output

Running `npx oxlint` from `Systems/System1/app`:

```
  ! eslint(no-unused-vars): Identifier 'SYSTEM_PROMPT' is imported but never used.
   ,-[src/lib/rag.test.js:3:39]
 2 | import capsule101 from '../data/capsules/capsule-101.json'
 3 | import { answerOffline, answerOnline, SYSTEM_PROMPT } from './rag.js'
   :                                       ^^^^^^|^^^^^^
   :                                             `-- 'SYSTEM_PROMPT' is imported here
 4 | 
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Variable 'hash' is declared but never used. Unused variables should start with a '_'.
    ,-[src/lib/capsuleStore.js:23:11]
 22 | export async function hashCapsule(capsule) {
 23 |   const { hash, ...rest } = capsule
    :           ^^|^
    :             `-- 'hash' is declared here
 24 |   const data = new TextEncoder().encode(canonicalJson(rest))
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'hash' is declared but never used. Unused variables should start with a '_'.
    ,-[src/lib/capsuleStore.js:85:11]
 84 |   if (!capsule) return null
 85 |   const { hash, ...rest } = capsule
    :           ^^|^
    :             `-- 'hash' is declared here
 86 |   const withHash = { ...rest, hash: await hashCapsule(rest) }
    `----
  help: Consider removing this declaration.

  ! react(only-export-components): Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.
     ,-[src/lib/i18n.jsx:378:17]
 377 | 
 378 | export function useI18n() {
     :                 ^^^^^^^
 379 |   const ctx = useContext(I18nContext)
     `----

  ! eslint(no-unused-vars): Identifier 'Sparkles' is imported but never used.
    ,-[src/ui/CourseHub.jsx:17:3]
 16 |   ChevronDown,
 17 |   Sparkles,
    :   ^^^^|^^^
    :       `-- 'Sparkles' is imported here
 18 | } from 'lucide-react'
    `----
  help: Consider removing this import.

Found 5 warnings and 0 errors.
Finished in 43ms on 56 files with 104 rules using 8 threads.
```

---

## 4. Vite Build Output

Running `npx vite build` from `Systems/System1/app`:

```
vite v8.3.6 building client environment for production...
transforming...
✓ 2104 modules transformed.
rendering chunks...
computing gzip size...
dist/manifest.webmanifest                            0.32 kB
dist/index.html                                      0.78 kB │ gzip:     0.41 kB
dist/assets/index-CyrFBbLD.css                      54.55 kB │ gzip:     9.33 kB
dist/assets/web-u6wjOesc.js                          1.10 kB │ gzip:     0.54 kB
dist/assets/virtual_pwa-register-DG2_HVQd.js         1.12 kB │ gzip:     0.59 kB
dist/assets/workbox-window.prod.es5-Bd17z0YL.js      5.65 kB │ gzip:     2.20 kB
dist/assets/index-Z8ucofvb.js                      525.27 kB │ gzip:   156.48 kB
dist/assets/llm-DI1mN1Zl.js                      6,116.56 kB │ gzip: 2,190.28 kB

[plugin builtin:vite-reporter] 
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rolldownOptions.output.codeSplitting to improve chunking: https://rolldown.rs/reference/OutputOptions.codeSplitting
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 1.29s

PWA v2.0.0
mode      generateSW
precache  14 entries (6554.31 KiB)
files generated
  dist/sw.js
  dist/workbox-9c191d2f.js
```

Exit code: `0`.

---

## Acceptance Criteria Checklist

- [x] Installed course cards display `"Share"` on the share button in English.
- [x] Installed course cards display `"Ibahagi"` on the share button in Filipino.
- [x] `QuizArena.jsx` "Pass and Play" mode is unchanged (`playPass: 'Pass and Play'`).
- [x] `npx vitest run` from `app/` passes all tests (24 files, 150 tests passed).
- [x] `npx oxlint` from `app/` reports 0 errors and no new warnings.
- [x] `npx vite build` from `app/` succeeds with exit code 0.
