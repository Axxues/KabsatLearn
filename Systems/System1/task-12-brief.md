# Task 12 — Track and persist course reading page progress on device

## Background

The user requested:
> "On the courses, the system should be able to keep track of which page is the user and save it to the device"

Currently in `Systems/System1/app/src/ui/StoryReader.jsx`:
- `const [index, setIndex] = useState(0)` always starts at card index `0` (`Lesson 1 of N`).
- If the user leaves the course reader (via Back button or closing the app) while reading (e.g., at Lesson 3 or 4), their current page is lost and starts over at Lesson 1 upon reopening.

## Required Behaviour

1. For each course (`capsule.id`), the reader must persist the learner's current page index on the device using `localStorage`.
2. Storage key convention: `kabsat_course_page_${capsuleId}`.
3. When `StoryReader` mounts:
   - Reads the saved page index for `capsule.id`.
   - If a valid index exists (between `0` and `capsule.cards.length - 1`), starts on that page.
   - If no saved index or out of bounds, defaults to `0`.
4. When the user navigates:
   - Clicking "Next Lesson" updates state and persists the new index.
   - Clicking "Previous" updates state and persists the new index.
   - Completing a red-flag drill updates state and persists the new index.
5. When the user finishes the course (`isLast` click on "Finish Course" or completing the last drill):
   - Resets the saved page index to `0` for that course, then calls `onExit()`.
6. Clicking "Back" preserves the saved page so the user resumes where they left off when reopening.

## TDD Order

Write tests first and watch them fail (RED), then implement (GREEN).

1. Create `app/src/lib/courseProgress.test.js`:
   - `getCoursePage` returns `0` when nothing is stored.
   - `saveCoursePage` stores the page index in localStorage.
   - `getCoursePage` returns the stored page index.
   - `getCoursePage` bounds checks: returns `0` if stored index is negative or `>= totalCards`.
   - `clearCourseProgress` resets progress to `0`.
   - Different course IDs store progress independently.
2. Create `app/src/ui/StoryReader.test.jsx`:
   - Renders at Lesson 1 by default when no progress exists.
   - Renders at saved lesson (e.g., Lesson 3 of 6) when localStorage has saved index `2`.
   - Clicking "Next Lesson" updates localStorage.
   - Clicking "Previous" updates localStorage.
   - Clicking "Finish Course" resets saved progress to 0 and calls `onExit`.
3. Run `npx vitest run src/lib/courseProgress.test.js src/ui/StoryReader.test.jsx` from `app/` and observe failure (RED).

## Exact Changes

1. Create `app/src/lib/courseProgress.js`:
   - `getCoursePage(capsuleId, totalCards)`:
     Reads `localStorage.getItem('kabsat_course_page_' + capsuleId)`.
     Parses as integer; returns parsed value if `>= 0` and `< totalCards`; otherwise returns `0`.
   - `saveCoursePage(capsuleId, pageIndex)`:
     Sets `localStorage.setItem('kabsat_course_page_' + capsuleId, String(pageIndex))`.
   - `clearCourseProgress(capsuleId)`:
     Sets `localStorage.setItem('kabsat_course_page_' + capsuleId, '0')` (or `removeItem`).
   - Safely guards against `typeof window === 'undefined'`.

2. Update `app/src/ui/StoryReader.jsx`:
   - Import `{ getCoursePage, saveCoursePage, clearCourseProgress }` from `../lib/courseProgress.js`.
   - Initialize `index` state using lazy initializer:
     ```javascript
     const [index, setIndex] = useState(() => getCoursePage(capsule?.id, capsule?.cards?.length || 0))
     ```
   - Helper to advance/change page:
     ```javascript
     const goToPage = (nextIndex) => {
       const clamped = Math.max(0, Math.min(nextIndex, capsule.cards.length - 1))
       setIndex(clamped)
       saveCoursePage(capsule.id, clamped)
     }
     const handleFinish = () => {
       clearCourseProgress(capsule.id)
       onExit()
     }
     ```
   - Update navigation calls:
     - Previous: `onClick={() => goToPage(index - 1)}`
     - Next: `onClick={() => (isLast ? handleFinish() : goToPage(index + 1))}`
     - Drill `onComplete`: `() => (isLast ? handleFinish() : goToPage(index + 1))`

## Acceptance Criteria

- Course page index is tracked and persisted to `localStorage` per course id.
- Reopening a course resumes at the last viewed page.
- Finishing a course resets progress so future visits start from the beginning.
- Out-of-bounds saved indices safely default to 0.
- All unit and integration tests pass (`npx vitest run`).
- `npx oxlint` reports 0 errors and no new warnings.
- `npx vite build` succeeds with exit code 0.

## Report

Write the full report to `Systems/System1/task-12-report.md` with:
- Failing test output first (RED)
- Passing test output after (GREEN)
- Oxlint and Vite build output
- Changed files summary

Reply with a short status: DONE, DONE_WITH_CONCERNS, NEEDS_CONTEXT, or BLOCKED.
