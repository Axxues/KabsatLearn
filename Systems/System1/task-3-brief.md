# Task 3 — Course picker on the Quiz page, one quiz per course

## Background

The user wants the Quiz tab to let a learner choose a course, and each course
must use its own question bank. This design was approved in conversation.

Decisions already made:

- Picker is inline on the existing Quiz Arena intro. No extra screen.
- Show every catalog course. Not-installed courses are visibly locked.
- Remember the last chosen course in `localStorage`.
- Questions only are per course. Scores, streak, and adaptive difficulty reset
  when the quiz starts or the course changes. No persistent score history.

## Current state (read the files; line numbers drift)

- `app/src/App.jsx` passes `capsule={capsule101}` to `QuizArena`.
- `capsules` is state built from `CATALOG` plus an `installed` flag:
  `[{ id, title, subtitle, cards, questions, kb, installed }]`.
  It is `[]` until the async `refresh()` finishes.
- `QuizArena` reads `capsule.title` and `capsule.questions`; all round state is
  internal. It already reports `onRunningChange(phase === 'question' || 'reveal')`.
- Bottom nav is fixed, and the quiz shell hides it while `quizRunning` is true.
  **Do not change that behaviour.**
- Catalog values:
  - `capsule-101` — title `Ligtas na Digital Wallet`, 10 questions.
  - `capsule-102` — title `Unang Hakbang sa Online Trabaho`, 10 questions.
- Existing i18n key `questionsMeta` is `'{n} tanong'` / `'{n} questions'`.
  Reuse it in the picker (pass `{ n: course.questions }`).
- The first `core` question of 101 is
  `May nagpakita ng screenshot na naipadala na ang refund. Ano ang susunod mong gagawin?`
  The first `core` question of 102 is
  `Paano mo ipapakita na kaya mo ang trabaho kahit walang experience?`
  These are useful, stable test anchors.
- Dexie DB: `kabsatlearn`, table `capsules`. Helpers live in
  `app/src/lib/capsuleStore.js` (`seedCapsule`, `removeCapsule`).

## Required behaviour

1. On the Quiz **intro only**, render a picker labelled with the new
   `chooseCourse` string. It lists **all** catalog courses.
2. An installed course card is a button:
   - `aria-pressed={course.id === selectedCourseId}`.
   - Shows the course title and `questionsMeta`.
   - Selected card uses the accent border/background; unselected uses the normal
     surface and border.
   - Clicking it calls `onSelectCourse(course.id)`.
3. A not-installed course card:
   - Shows a `Lock` lucide icon, the course title, and the new
     `quizCourseLocked` string.
   - Is still a button, but clicking it navigates to Aralin by calling
     `onLockedCourse()` (App passes `() => selectTab('hub')`).
   - Do not use `disabled`; it must be tappable.
4. Selecting a different installed course resets that quiz to the intro with
   zero score/streak and uses the selected course's `questions` and `title`.
   An easy, reliable way: App gives `QuizArena` a `key={activeQuizCourse.id}`.
5. Remember the selection:
   - Storage key: `kabsat_quiz_course`.
   - First visit defaults to `capsule-101`.
   - If the saved id is not installed, fall back to the first installed course
     for display/play. Do not overwrite the saved id during fallback.
   - Selecting a course writes the id immediately (no effect-based persistence;
     the repo lints `set-state-in-effect`).
6. The picker is not rendered while a round is running (`question` / `reveal`)
   or on the results screen. It is part of the intro only.
7. Locked course selection never starts a quiz and never changes
   `kabsat_quiz_course`.
8. No download flow on the Quiz page. Do not touch `CourseHub`, `Dashboard`,
   `StoryReader`, or the bottom-nav markup.

## Exact implementation

### `app/src/App.jsx`

- Add a raw map:
  `const CAPSULE_BY_ID = { 'capsule-101': capsule101, 'capsule-102': capsule102 }`.
- Add lazy state:
  `const [quizCourseId, setQuizCourseId] = useState(() => typeof window === 'undefined' ? null : localStorage.getItem('kabsat_quiz_course'))`.
- Build `quizCourses` from `capsules`; if `capsules` is empty, use
  `CATALOG.map((c) => ({ ...c, installed: c.id === 'capsule-101' }))` so the
  intro works before the async refresh. Map to:
  `{ id, title, questions, installed, capsule: CAPSULE_BY_ID[id] }`.
- Derive `activeQuizCourse`:
  1. a course whose id equals `quizCourseId` and is installed,
  2. else the first installed course,
  3. else `quizCourses[0]`.
- Add `selectQuizCourse(id)`: find an **installed** course with that id; if none,
  return. Otherwise `setQuizCourseId(id)` and
  `localStorage.setItem('kabsat_quiz_course', id)`.
- Render:

```jsx
<QuizArena
  key={activeQuizCourse.id}
  capsule={activeQuizCourse.capsule}
  courses={quizCourses}
  selectedCourseId={activeQuizCourse.id}
  onSelectCourse={selectQuizCourse}
  onLockedCourse={() => selectTab('hub')}
  onExit={() => selectTab('hub')}
  onRunningChange={setQuizRunning}
/>
```

- Keep the existing when-running bottom padding logic untouched.

### `app/src/ui/QuizArena.jsx`

- Signature:
  `export default function QuizArena({ capsule, onExit, onRunningChange, courses = [], selectedCourseId, onSelectCourse, onLockedCourse })`.
- In the intro, above the trophy block, render the picker only when
  `courses.length > 0`:
  - Label: `t('chooseCourse')`, small uppercase, muted, left aligned.
  - Grid: `grid grid-cols-2 gap-2`, wrapping naturally on a 430px screen.
  - Installed card and locked card markup as described in "Required behaviour".
  - Icons: `ShieldCheck` for `capsule-101`, `Briefcase` for `capsule-102`,
    `Lock` for locked cards. Import them from `lucide-react`; they already exist
    in the library.
  - Locked click: `onLockedCourse?.()` (fall back to `onExit?.()` if not given).
  - Keep the cards compact: title `text-[11px] font-bold leading-snug`, meta
    `text-[10px] text-[var(--color-muted)]`.
- Do not move the picker into the running/done branches.
- Existing callers that do not pass `courses` (e.g. `QuizArena.test.jsx`) must
  keep working with no picker.

### `app/src/lib/i18n.jsx`

Add to both `fil` and `en` in the Quiz Arena block:

| key | fil | en |
|---|---|---|
| `chooseCourse` | `Pumili ng kurso` | `Choose a course` |
| `quizCourseLocked` | `I-download sa Aralin` | `Download in Aralin` |

No emoji. Keep the existing `questionsMeta` key and placeholders.

## Tests (TDD — write and watch fail first)

Create `app/src/QuizCoursePicker.test.jsx` using the same `createRoot`/`act`
pattern as `App.test.jsx` (`globalThis.IS_REACT_ACT_ENVIRONMENT = true`, stub
`Element.prototype.scrollIntoView`, `localStorage.clear()` before each test).

Use `removeCapsule('capsule-102')` before tests that need it locked, and
`await seedCapsule(capsule102)` before tests that need it installed. Import the
raw capsule from `./data/capsules/capsule-102.json`.

Required tests:

1. **Lists all courses and marks 102 locked** — with 102 removed, open Quiz.
   Assert both course titles appear, `chooseCourse` appears, the 101 card has
   `aria-pressed="true"`, and the 102 card contains `I-download sa Aralin` and a
   `lucide-lock` icon.
2. **Selecting 101 starts 101** — open Quiz, tap `Isahang Laro`, assert the
   visible question stem is the 101 core anchor above.
3. **Installing 102 unlocks it and its quiz uses 102's bank** — seed 102, mount,
   open Quiz, tap the 102 card, assert it becomes `aria-pressed="true"`, tap
   `Isahang Laro`, assert the visible question stem is the 102 core anchor above.
4. **Remembered choice is restored** — seed 102, set
   `localStorage.setItem('kabsat_quiz_course', 'capsule-102')`, mount, open Quiz,
   assert 102 is pressed/selected and 101 is not.
5. **Locked card routes to Aralin** — with 102 removed, open Quiz, tap the 102
   locked card, assert the Quiz intro (`Quiz Arena`) is gone and the hub greeting
   `Naimbag nga aldaw` is present.

Keep the existing `App.test.jsx` nav tests passing. They prove nav stays visible
on the intro and hides while running.

## Acceptance criteria

Run from `app/`:

- `npx vitest run` → all tests pass, exit 0. Report the count.
- `npx oxlint src` → no **new** warnings. Pre-existing warnings:
  `capsuleStore.js` unused `hash` (2), `i18n.test.jsx` global `latest`,
  `i18n.jsx` only-export-components, `Dashboard.jsx` set-state-in-effect.
- `npx vite build` → succeeds.
- No emoji anywhere in the new UI strings.
- The nav still hides while a quiz is running and returns on the results screen.
- Only these files change:
  `app/src/App.jsx`, `app/src/ui/QuizArena.jsx`, `app/src/lib/i18n.jsx`,
  `app/src/QuizCoursePicker.test.jsx`.
  Do not edit other systems or unrelated components.

## Report

Write the full report to `Systems/System1/task-3-report.md`, including:

1. The failing test output first (RED), then the passing output (GREEN).
2. Files changed and why.
3. Quoted command output for the suite, lint, and build.
4. Any deviation from this brief, and why.
5. A short status: DONE, DONE_WITH_CONCERNS, NEEDS_CONTEXT, or BLOCKED.
