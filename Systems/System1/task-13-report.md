# Task 13 Report: Course Progress Integration in Mastery by Competency & Dashboard

## Status
DONE

## Summary of Changes
Task 13 integrated course reading progress and completion into the learner mastery calculation and Insights Dashboard. Previously, "Mastery by Competency" was driven exclusively by `event.type === 'answer'` telemetry records from the Quiz Arena, ignoring course reading activity and showing `—` (or 0% Needs Help) even if learners completed courses. Additionally, finishing a course previously wiped bookmarks to 0 without recording completion.

### 1. `Systems/System1/app/src/lib/courseProgress.js`
- **Max Page Tracking**: Updated `saveCoursePage(capsuleId, pageIndex, totalCards)` to maintain `kabsat_course_max_page_${capsuleId}` alongside the current bookmark `kabsat_course_page_${capsuleId}`.
- **Course Completion**: Added `markCourseCompleted(capsuleId)` which sets `kabsat_course_completed_${capsuleId}` to `'true'` and resets the bookmark to `'0'` so subsequent reviews start from lesson 1 while maintaining completed status.
- **Course Progress Lookup**: Added `getCourseProgress(capsuleId, totalCards)` which returns `{ page, maxPage, completed, percent }`. Returns 100% when marked completed, 0% when untouched, or calculates percentage based on cards seen.
- **Competency Course Progress**: Added `getCompetencyCourseProgress(competency, installedCapsules)` to filter installed capsules teaching that competency and calculate average course progress and `hasActivity` status.
- **Progress Reset**: Updated `clearCourseProgress(capsuleId)` to clear bookmark, completion, and max-page keys.

### 2. `Systems/System1/app/src/ui/StoryReader.jsx`
- Imported `markCourseCompleted` from `../lib/courseProgress.js` and `queueEvent` from `../lib/telemetry.js`.
- Updated `handleFinish`:
  - Calls `markCourseCompleted(capsule?.id)`.
  - Dispatches `queueEvent({ type: 'course_completed', capsuleId: capsule?.id, competency: capsule?.competency })`.
  - Calls `onExit()`.
- Updated `goToPage`:
  - Passes `totalCards` to `saveCoursePage(capsule?.id, clamped, totalCards)`.

### 3. `Systems/System1/app/src/lib/mastery.js`
- Imported `getCompetencyCourseProgress` from `./courseProgress.js`.
- Updated `masteryByCompetency(events, activeCompetencies = null, installedCapsules = [])`:
  - Calculates `quizScore = bucket.attempts === 0 ? null : Math.round((bucket.correct / bucket.attempts) * 100)`.
  - Queries `courseProg = getCompetencyCourseProgress(competency, installedCapsules)`.
  - If both `attempts > 0` and `courseProg?.hasActivity`: combines `Math.round(courseProg.percent * 0.5 + quizScore * 0.5)`.
  - If only `attempts > 0`: uses `quizScore`.
  - If only `courseProg?.hasActivity`: uses `courseProg.percent`.
  - Otherwise: returns `mastery: null`.
  - Returns `quizMastery` and `courseProgress` alongside `mastery`.
- Updated `proposedRemediations`:
  - Passes `installedCapsules` into `masteryByCompetency`.
  - Sets reason string dynamically: `${row.label} mastery at ${row.mastery}% across ${row.attempts} answers` when `row.attempts > 0`, or `${row.label} course progress at ${row.mastery}%` when `row.attempts === 0`.

### 4. `Systems/System1/app/src/ui/Dashboard.jsx`
- Passed `installedList` into `masteryByCompetency` and `proposedRemediations`.
- Updated `Bar` component to accept `{ label, value, courseProgress, quizMastery }`.
- Added subtitle breakdown when progress or quiz data exists:
  - Both: `${t('courseProgressLabel')}: ${courseProgress}% · ${t('quizScoreLabel')}: ${quizMastery}%`
  - Course only: `${t('courseProgressLabel')}: ${courseProgress}%`
  - Quiz only: `${t('quizScoreLabel')}: ${quizMastery}%`
  - Styled with `text-[10px] text-[var(--color-muted)] font-medium mt-0.5`.

### 5. `Systems/System1/app/src/lib/i18n.jsx`
- Added Filipino keys:
  - `courseProgressLabel`: `'Kurso'`
  - `quizScoreLabel`: `'Pagsusulit'`
- Added English keys:
  - `courseProgressLabel`: `'Course'`
  - `quizScoreLabel`: `'Quiz'`
- Confirmed zero emoji characters used.

### 6. Tests & Test Suite Additions
- `src/lib/courseProgress.test.js`:
  - Added tests for `markCourseCompleted`, `getCourseProgress` (0%, partial, and 100% completed), `clearCourseProgress` all-keys reset, and `getCompetencyCourseProgress` averaging and activity detection.
- `src/ui/StoryReader.test.jsx`:
  - Verified clicking "Finish Course" sets `kabsat_course_completed_*` to `'true'`, resets bookmark to `'0'`, and queues a `course_completed` event in telemetry.
- `src/ui/Dashboard.test.jsx`:
  - Added test verifying course reading progress alone shows percentage in Mastery by Competency even with 0 quiz attempts (100% Kurso: 100%).
  - Added test verifying course progress (100%) and quiz score (0%) combine properly to 50% (`Kurso: 100% · Pagsusulit: 0%`).
  - Verified existing telemetry-only test still passes (50% with 1/2 correct and no course progress).
- `src/lib/telemetry.test.js`:
  - Added tests for 50/50 combination, course reading progress alone, and course-progress remediation reason string formatting.

## Verification Evidence
1. `npx vitest run`:
   - 26 test files passed (26/26).
   - 187 tests passed (187/187, 0 failed).
2. `npx oxlint`:
   - 0 errors (5 pre-existing warnings in untouched areas).
3. `npx vite build`:
   - Built successfully in 1.22s without errors.
4. `no-emoji.test.js` & `i18n.test.jsx`:
   - All passed, 0 emoji characters present.
