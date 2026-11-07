# Task 10 Report: Move profile button to the rightmost side of the header

## Summary of Changes

In `Systems/System1/app/src/App.jsx`:
- Reordered the header action buttons inside `<div className="flex items-center gap-2">` so that the Profile button is placed after the Theme Toggle button (making it the rightmost button).
- Left-to-right order is now:
  1. Language Toggle button (`onClick={toggleLang}`)
  2. Theme Toggle button (`onClick={toggleTheme}`)
  3. Profile button (`onClick={() => setShowProfile(true)}`)

In `Systems/System1/app/src/App.test.jsx`:
- Added a unit test within `describe('app header', ...)` asserting that the header action buttons appear in the specified order: Language toggle, Theme toggle, and Profile button as rightmost.

---

## 1. Failing Test Output (RED)

Running `npx vitest run src/App.test.jsx` prior to reordering buttons:

```
 RUN  v5.1.0 D:/Hackathon/Systems/System1/app

 ❯ src/App.test.jsx (7 tests | 1 failed) 396ms
   ❯ app header (3)
     ✓ shows no connectivity status chip 20ms
     ✓ keeps the brand, page title and theme toggle, and no region badge 5ms
     × renders action buttons in order: Language toggle, Theme toggle, and Profile button as rightmost 12ms
   ✓ theme toggle (1)
     ✓ toggles theme to dark and sets data-theme and localStorage 90ms
   ✓ bottom navigation (3)
     ✓ stays visible on the Kabsat AI page 51ms
     ✓ Kabsat AI input is contained and not overlapped by bottom navigation 38ms
     ✓ stays visible on the quiz intro and hides only while the quiz runs 177ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/App.test.jsx > app header > renders action buttons in order: Language toggle, Theme toggle, and Profile button as rightmost
AssertionError: expected 1935 to be less than 598
 ❯ src/App.test.jsx:56:24
     54|
     55|     expect(langIndex).toBeLessThan(themeIndex)
     56|     expect(themeIndex).toBeLessThan(profileIndex)
       |                        ^
     57|   })
     58| })

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 6 passed (7)
   Start at  12:47:21
   Duration  1.95s (environment 43%, tests 22%, import 19%, transform 13%, setup 2%)
```

---

## 2. Passing Test Output (GREEN)

### Component Test (`src/App.test.jsx`)

```
 RUN  v5.1.0 D:/Hackathon/Systems/System1/app

 ✓ src/App.test.jsx (7 tests) 255ms

 Test Files  1 passed (1)
      Tests  7 passed (7)
   Start at  12:47:41
   Duration  1.65s (environment 46%, import 19%, tests 17%, transform 14%, setup 3%, worker 1%)
```

### Full Test Suite (`npx vitest run`)

```
 RUN  v5.1.0 D:/Hackathon/Systems/System1/app

 ✓ src/ui/KabsatAI.test.jsx (3 tests) 555ms
 ✓ src/ui/QuizArena.test.jsx (5 tests) 566ms
 ✓ src/kabsat-ai-background.test.jsx (2 tests) 989ms
   ✓ Kabsat AI ongoing query and rotating icon (2)
     ✓ Kabsat AI icon rotates during ongoing query even when navigated to another page, and query does not get interrupted 637ms
     ✓ form submission disables send button while processing and preserves query when navigating to Quiz 348ms
 ✓ src/App.test.jsx (7 tests) 899ms
   ✓ bottom navigation (3)
     ✓ stays visible on the quiz intro and hides only while the quiz runs 365ms
 ✓ src/CourseCatalog.test.jsx (3 tests) 1048ms
   ✓ course catalogue in the app (3)
     ✓ a fresh install seeds only capsule 101 480ms
     ✓ the other catalogue courses wait under available to download 459ms
 ✓ src/ui/CourseHub.test.jsx (14 tests) 1501ms
   ✓ CourseHub capsule cards and counters (14)
     ✓ installed card does NOT render "Ready", "Handa", or Check icon 314ms
 ✓ src/lib/telemetry.test.js (7 tests) 58ms
 ✓ src/QuizCoursePicker.test.jsx (10 tests) 3412ms
   ✓ quiz course picker (10)
     ✓ lists only installed courses in dropdown and does not show uninstalled courses 499ms
     ✓ installing a course makes it show up and its quiz uses its own question bank 356ms
     ✓ toggles dropdown open and closed on trigger click 323ms
     ✓ picker does not render Active or Ready badges or questions meta subtitle, and pluralizes course count in Filipino 509ms
     ✓ picker header count tag renders singular "1 course" and plural "2 courses" in English 484ms
 ✓ src/lib/i18n.test.jsx (3 tests) 221ms
 ✓ src/lib/capsuleStore.test.js (8 tests) 128ms
 ✓ src/data/catalogue.test.js (12 tests) 47ms
 ✓ src/ui/OfflineBanner.test.jsx (2 tests) 61ms
 ✓ src/lib/share.test.js (4 tests) 51ms
 ✓ src/no-emoji.test.js (1 test) 135ms
 ✓ src/lib/rag.test.js (10 tests) 44ms
 ✓ src/lib/online.test.js (3 tests) 23ms
 ✓ src/lib/persona.test.js (6 tests) 129ms
 ✓ src/lib/schema.test.js (7 tests) 74ms
 ✓ src/lib/adaptive.test.js (12 tests) 73ms
 ✓ src/lib/bm25.test.js (7 tests) 19ms
 ✓ src/lib/lang.test.js (6 tests) 8ms
 ✓ src/theme.test.js (8 tests) 8ms

 Test Files  22 passed (22)
      Tests  140 passed (140)
   Start at  12:47:54
   Duration  16.08s (environment 73%, tests 12%, import 6%, setup 4%, transform 3%, worker 2%)
```

---

## 3. Linter Output (`npx oxlint`)

```
Found 7 warnings and 0 errors.
Finished in 119ms on 55 files with 104 rules using 8 threads.
```
(All 7 warnings are pre-existing; 0 errors and 0 new warnings).

---

## 4. Build Output (`npx vite build`)

```
vite v8.3.6 building client environment for production...
transforming...
✓ 2104 modules transformed.
rendering chunks...
computing gzip size...
dist/manifest.webmanifest                            0.32 kB
dist/index.html                                      0.78 kB │ gzip:     0.41 kB
dist/assets/index--xbAV8C-.css                      53.61 kB │ gzip:     9.16 kB
dist/assets/web-BbTLHL3A.js                          1.10 kB │ gzip:     0.53 kB
dist/assets/virtual_pwa-register-BRJ117V-.js         1.12 kB │ gzip:     0.59 kB
dist/assets/workbox-window.prod.es5-Bd17z0YL.js      5.65 kB │ gzip:     2.20 kB
dist/assets/index-BVFwOrOO.js                      515.45 kB │ gzip:   155.03 kB
dist/assets/llm-BjkNT-Am.js                      6,116.56 kB │ gzip: 2,190.28 kB

[plugin builtin:vite-reporter] 
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rolldownOptions.output.codeSplitting to improve chunking: https://rolldown.rs/reference/OutputOptions.codeSplitting
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 2.18s

PWA v2.0.0
mode      generateSW
precache  14 entries (6543.80 KiB)
files generated
  dist/sw.js
  dist/workbox-9c191d2f.js
```
Exit code: 0.

---

## 5. Changed Files Summary

- `Systems/System1/app/src/App.jsx`: Reordered header action buttons container to: Language toggle -> Theme toggle -> Profile button.
- `Systems/System1/app/src/App.test.jsx`: Added unit test checking the visual order of the header action buttons.
