# Task 4 Report — Remove the Ready tag from course cards and pluralize course counter

## Summary

Implemented the two requested UI changes on the CourseHub screen:
1. Removed the "Ready" / "Handa" badge with the `Check` icon from installed capsule cards in `CourseHub.jsx`. Installed capsule cards now show clean headers with no badge, while uninstalled cards continue displaying their size badge (`{capsule.kb} KB`).
2. Pluralized the course counter in the installed section header to display:
   - English (`en`): `"1 course"` for 1 installed capsule, `"{n} courses"` for multiple.
   - Filipino (`fil`): `"1 kurso"` for 1 installed capsule, `"{n} mga kurso"` for multiple.
3. Added translation keys `courseCountSingle` and `courseCountPlural` to `i18n.jsx` for both `fil` and `en`, maintaining backwards compatibility with `readyTag` and `readyCountTag`.
4. Created a comprehensive test suite in `app/src/ui/CourseHub.test.jsx`.

---

## 1. TDD Failing Test Output (RED Phase)

Ran `npx vitest run src/ui/CourseHub.test.jsx` from `Systems/System1/app` prior to implementation:

```
 RUN  v5.1.0 D:/Hackathon/Systems/System1/app

 ❯ src/ui/CourseHub.test.jsx (6 tests | 5 failed) 118ms
   ❯ CourseHub capsule cards and counters (6)
     × installed card does NOT render "Ready", "Handa", or Check icon 48ms
     ✓ available card renders its KB size 14ms
     × installed counter displays "1 course" in English when 1 capsule is installed 12ms
     × installed counter displays "2 courses" in English when 2 capsules are installed 15ms
     × installed counter displays "1 kurso" in Filipino when 1 capsule is installed 12ms
     × installed counter displays "2 mga kurso" in Filipino when 2 capsules are installed 13ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/ui/CourseHub.test.jsx > CourseHub capsule cards and counters > installed card does NOT render "Ready", "Handa", or Check icon
AssertionError: expected 'Digital SafetyDigital SafetyLigtas sa…' not to contain 'Ready'

Expected: "Ready"
Received: "Digital SafetyDigital SafetyLigtas sa online scamsReady5 lessons6 questions100% OfflineOpen CoursePass"

 ❯ src/ui/CourseHub.test.jsx:103:43

 FAIL  src/ui/CourseHub.test.jsx > CourseHub capsule cards and counters > installed counter displays "1 course" in English when 1 capsule is installed
AssertionError: expected '1 ready' to be '1 course' // Object.is equality

Expected: "1 course"
Received: "1 ready"

 ❯ src/ui/CourseHub.test.jsx:123:45

 FAIL  src/ui/CourseHub.test.jsx > CourseHub capsule cards and counters > installed counter displays "2 courses" in English when 2 capsules are installed
AssertionError: expected '2 ready' to be '2 courses' // Object.is equality

Expected: "2 courses"
Received: "2 ready"

 ❯ src/ui/CourseHub.test.jsx:132:45

 FAIL  src/ui/CourseHub.test.jsx > CourseHub capsule cards and counters > installed counter displays "1 kurso" in Filipino when 1 capsule is installed
AssertionError: expected '1 handa na' to be '1 kurso' // Object.is equality

Expected: "1 kurso"
Received: "1 handa na"

 ❯ src/ui/CourseHub.test.jsx:141:45

 FAIL  src/ui/CourseHub.test.jsx > CourseHub capsule cards and counters > installed counter displays "2 mga kurso" in Filipino when 2 capsules are installed
AssertionError: expected '2 handa na' to be '2 mga kurso' // Object.is equality

Expected: "2 mga kurso"
Received: "2 handa na"

 ❯ src/ui/CourseHub.test.jsx:150:45

 Test Files  1 failed (1)
      Tests  5 failed | 1 passed (6)
   Start at  11:05:43
   Duration  1.32s (environment 65%, import 16%, tests 10%, transform 5%, setup 3%, worker 1%)
```

---

## 2. Passing Test Output (GREEN Phase)

### Unit test suite for CourseHub:

```
cd Systems/System1/app; npx vitest run src/ui/CourseHub.test.jsx

 RUN  v5.1.0 D:/Hackathon/Systems/System1/app

 ✓ src/ui/CourseHub.test.jsx (6 tests) 141ms

 Test Files  1 passed (1)
      Tests  6 passed (6)
   Start at  11:11:10
   Duration  1.60s (environment 67%, import 15%, tests 10%, setup 4%, transform 3%, worker 1%)
```

### Full test suite run:

```
cd Systems/System1/app; npx vitest run

 RUN  v5.1.0 D:/Hackathon/Systems/System1/app

 ✓ src/lib/capsuleStore.test.js (8 tests) 51ms
 ✓ src/lib/share.test.js (4 tests) 53ms
 ✓ src/lib/i18n.test.jsx (3 tests) 117ms
 ✓ src/ui/CourseHub.test.jsx (6 tests) 358ms
 ✓ src/ui/QuizArena.test.jsx (3 tests) 379ms
 ✓ src/App.test.jsx (5 tests) 645ms
   ✓ bottom navigation (2)
     ✓ stays visible on the quiz intro and hides only while the quiz runs 367ms
 ✓ src/lib/telemetry.test.js (7 tests) 55ms
 ✓ src/no-emoji.test.js (1 test) 19ms
 ✓ src/QuizCoursePicker.test.jsx (6 tests) 1587ms
   ✓ quiz course picker (6)
     ✓ lists all courses and marks an uninstalled course locked 360ms
 ✓ src/ui/OfflineBanner.test.jsx (2 tests) 76ms
 ✓ src/lib/rag.test.js (10 tests) 13ms
 ✓ src/lib/adaptive.test.js (12 tests) 13ms
 ✓ src/lib/schema.test.js (7 tests) 9ms
 ✓ src/lib/bm25.test.js (7 tests) 7ms
 ✓ src/lib/persona.test.js (6 tests) 8ms
 ✓ src/lib/online.test.js (3 tests) 7ms
 ✓ src/theme.test.js (8 tests) 4ms
 ✓ src/lib/lang.test.js (6 tests) 4ms

 Test Files  18 passed (18)
      Tests  104 passed (104)
   Start at  11:10:21
   Duration  6.65s (environment 80%, tests 9%, import 6%, setup 3%, transform 1%, worker 1%)
```

---

## 3. Linter and Production Build Output

### Oxlint:

```
cd Systems/System1/app; npx oxlint

  ! eslint(no-unused-vars): Identifier 'SYSTEM_PROMPT' is imported but never used.
   ,-[src/lib/rag.test.js:3:39]
 2 | import capsule101 from '../data/capsules/capsule-101.json'
 3 | import { answerOffline, answerOnline, SYSTEM_PROMPT } from './rag.js'
   :                                       ^^^^^^|^^^^^^
   :                                             `-- 'SYSTEM_PROMPT' is imported here
 4 | 
   `----
  help: Consider removing this import.

  ! react(only-export-components): Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.
     ,-[src/lib/i18n.jsx:367:17]
 366 | 
 367 | export function useI18n() {
     :                 ^^^^^^^
 368 |   const ctx = useContext(I18nContext)
     `----

  ! eslint(no-unused-vars): Variable 'hash' is declared but never used. Unused variables should start with a '_'.
    ,-[src/lib/capsuleStore.js:17:11]
 16 | export async function hashCapsule(capsule) {
 17 |   const { hash, ...rest } = capsule
    :           ^^|^
    :             `-- 'hash' is declared here
 18 |   const data = new TextEncoder().encode(canonicalJson(rest))
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'hash' is declared but never used. Unused variables should start with a '_'.
    ,-[src/lib/capsuleStore.js:79:11]
 78 |   if (!capsule) return null
 79 |   const { hash, ...rest } = capsule
    :           ^^|^
    :             `-- 'hash' is declared here
 80 |   const withHash = { ...rest, hash: await hashCapsule(rest) }
    `----
  help: Consider removing this declaration.

  ! react(set-state-in-effect): Calling setState synchronously within an effect can trigger cascading renders
    ,-[src/ui/Dashboard.jsx:85:5]
 83 | 
 84 |   useEffect(() => {
    :   ^^^^|^^^^
    :       `-- This is the containing effect
 85 |     refresh()
    :     ^^^|^^^
    :        `-- Avoid calling setState() directly within an effect
 86 |   }, [refresh])
    `----
  help: Effects should synchronize React with external systems. Calling setState synchronously inside an effect starts another render and is usually unnecessary. Derive the value during render, initialize state directly, or update it from the event that caused the change. Use an effect only when synchronizing with an external system.
  note: React Compiler skipped optimizing this component or hook. Additional guidance: https://react.dev/reference/eslint-plugin-react-hooks/lints/set-state-in-effect

Found 5 warnings and 0 errors.
Finished in 32ms on 46 files with 104 rules using 8 threads.
```
*Note: No new warnings or errors were introduced.*

### Production Build:

```
cd Systems/System1/app; npx vite build

vite v8.3.6 building client environment for production...
transforming...
✓ 2096 modules transformed.
rendering chunks...
computing gzip size...
dist/manifest.webmanifest                            0.32 kB
dist/index.html                                      0.78 kB │ gzip:     0.42 kB
dist/assets/index-DeWYZ6i0.css                      46.74 kB │ gzip:     8.42 kB
dist/assets/web-CDrzILhA.js                          1.10 kB │ gzip:     0.54 kB
dist/assets/virtual_pwa-register-C_2jrzmG.js         1.12 kB │ gzip:     0.59 kB
dist/assets/workbox-window.prod.es5-Bd17z0YL.js      5.65 kB │ gzip:     2.20 kB
dist/assets/index-CWONLM8-.js                      455.68 kB │ gzip:   138.75 kB
dist/assets/llm-vnFUOiSV.js                      6,116.36 kB │ gzip: 2,190.21 kB

✓ built in 983ms

PWA v2.0.0
mode      generateSW
precache  14 entries (6478.52 KiB)
files generated
  dist/sw.js
  dist/workbox-9c191d2f.js
```
*Exit code 0.*

---

## 4. Changed Files Summary

1. `Systems/System1/app/src/lib/i18n.jsx`:
   - Added `courseCountSingle: '{n} kurso'` and `courseCountPlural: '{n} mga kurso'` in Filipino translations.
   - Added `courseCountSingle: '{n} course'` and `courseCountPlural: '{n} courses'` in English translations.
   - Maintained `readyTag` and `readyCountTag` for backwards compatibility.
   - No emoji added.

2. `Systems/System1/app/src/ui/CourseHub.jsx`:
   - Removed unused `Check` from `lucide-react` import.
   - Removed the `{installed ? (...) : (...)}` badge rendering in `CapsuleCard`.
   - Updated to only render the KB size badge when `!installed`.
   - Updated the installed section count badge to use `courseCountSingle` when `installed.length === 1` and `courseCountPlural` otherwise.

3. `Systems/System1/app/src/ui/CourseHub.test.jsx`:
   - Added 6 unit tests covering:
     - No "Ready", "Handa", or `Check` icon on installed cards.
     - Available capsule card displays KB size badge.
     - Counter badge displays "1 course" with 1 installed capsule in English.
     - Counter badge displays "2 courses" with 2 installed capsules in English.
     - Counter badge displays "1 kurso" with 1 installed capsule in Filipino.
     - Counter badge displays "2 mga kurso" with 2 installed capsules in Filipino.

4. `Systems/System1/app/src/QuizCoursePicker.test.jsx`:
   - Flushed Dexie async promises in `mount()` to ensure clean full-suite execution across concurrent test runs.

---

## 5. Acceptance Criteria Checklist

- [x] `CourseHub.jsx` no longer imports or renders `Check`.
- [x] Installed capsule cards have no "Ready" or "Handa" badge.
- [x] Available capsule cards still show their KB size badge.
- [x] Installed section counter badge renders:
  - `"1 course"` when 1 capsule is installed in English.
  - `"{n} courses"` when multiple capsules are installed in English.
  - `"1 kurso"` when 1 capsule is installed in Filipino.
  - `"{n} mga kurso"` when multiple capsules are installed in Filipino.
- [x] `npx vitest run` from `app/` passes all tests (104/104 passed, exit code 0).
- [x] `npx oxlint` from `app/` passes with no new warnings or errors (0 errors, 5 pre-existing warnings, exit code 0).
- [x] `npx vite build` from `app/` succeeds with exit code 0.
- [x] Zero emoji in `app/src` (`no-emoji.test.js` passed).
