# Task 8 — Remove Active/Ready medals and small texts from Quiz course picker, pluralize course count

## Background

The user requested UI adjustments to the Quiz course picker (shown in the screenshot):
1. "Remove the Active and Ready medals here, as well as the small texts."
2. "For the 2 Ready, it should instead be 2 courses, and course when singular"

Currently in `Systems/System1/app/src/ui/QuizArena.jsx`:
- The dropdown trigger button displays an `Active` / `Aktibo` badge (`{t('quizCourseActive')}`) next to the chevron down icon.
- Each course option in the dropdown list displays:
  - Under the title: a small text subtitle showing `{t('questionsMeta', { n: course.questions })}` (e.g. `10 questions`).
  - On the right: an `Active` / `Aktibo` badge with a checkmark for the selected course, or a `Ready` / `Handa` badge (`{t('quizCourseReady')}`) for other courses.
- The dropdown header pill currently renders `{installedCourses.length} {lang === 'en' ? 'ready' : 'handa'}`.

## TDD order

Write the tests first and watch them fail, then edit.

1. Add tests in `app/src/QuizCoursePicker.test.jsx` (or `app/src/ui/QuizArena.test.jsx`):
   - With the picker open:
     - Assert that the trigger button does NOT contain "Active" or "Aktibo".
     - Assert that no course option in the list contains "Active", "Aktibo", "Ready", or "Handa".
     - Assert that no course option in the list contains "questions" or "tanong" (the questionsMeta small text subtitle).
     - Assert that the header count tag renders `"course"` when singular (e.g. `1 course` / `1 kurso`) and `"courses"` when plural (e.g. `2 courses` / `2 mga kurso`).
2. Run `npx vitest run src/QuizCoursePicker.test.jsx` from `app/` and observe failures (RED).

## Exact changes

In `Systems/System1/app/src/ui/QuizArena.jsx`:

1. **Trigger button**:
   - In `<button type="button" aria-haspopup="listbox" ...>`:
   - Remove `<span className="rounded-full bg-[var(--color-accent)]/10 px-1.5 py-0.5 text-[9px] font-extrabold text-[var(--color-accent)]">{t('quizCourseActive')}</span>`.
   - Keep `ChevronDown`.

2. **Dropdown header course count**:
   - In the dropdown header (around line 342):
     Replace:
     ```jsx
     <span className="rounded-full bg-[var(--color-surface-sunken)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--color-muted)] border border-[var(--color-line)]">
       {installedCourses.length} {lang === 'en' ? 'ready' : 'handa'}
     </span>
     ```
     With:
     ```jsx
     <span className="rounded-full bg-[var(--color-surface-sunken)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--color-muted)] border border-[var(--color-line)]">
       {installedCourses.length === 1
         ? t('courseCountSingle', { n: installedCourses.length })
         : t('courseCountPlural', { n: installedCourses.length })}
     </span>
     ```

3. **Dropdown list course items**:
   - In `installedCourses.map((course) => ...)`:
   - Remove the small text subtitle block:
     ```jsx
     <div className="flex items-center gap-1.5 mt-0.5">
       <span className="text-[10px] text-[var(--color-muted)] font-mono">
         {t('questionsMeta', { n: course.questions })}
       </span>
     </div>
     ```
     So the course title is rendered cleanly without the questions meta subtitle.
   - Remove the right-hand medal container entirely:
     ```jsx
     <div className="shrink-0 pl-2">
       {selected ? (
         <span className="flex items-center gap-1 rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-[9px] font-extrabold text-[var(--color-on-accent)] shadow-xs">
           <Check className="size-2.5 stroke-[3]" aria-hidden="true" />
           <span>{t('quizCourseActive')}</span>
         </span>
       ) : (
         <span className="rounded-full bg-[var(--color-surface-sunken)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--color-muted)]">
           {t('quizCourseReady')}
         </span>
       )}
     </div>
     ```
   - Keep the item selection styling (`selected ? 'bg-[var(--color-accent-subtle)]/70 text-[var(--color-ink)]' : ...`) and `aria-selected` / `aria-pressed`.

## Acceptance criteria

- Trigger button does not display any "Active" or "Aktibo" badge.
- Course list options do not display any "Active", "Aktibo", "Ready", or "Handa" badges.
- Course list options do not display the "questions" / "tanong" subtitle text.
- Header count badge displays `"1 course"` (singular) or `"{n} courses"` (plural) in English (and `"1 kurso"` / `"{n} mga kurso"` in Filipino).
- `npx vitest run` from `app/` passes all tests.
- `npx oxlint` from `app/` reports 0 errors and no new warnings.
- `npx vite build` from `app/` succeeds with exit code 0.

## Report

Write the full report to `Systems/System1/task-8-report.md` with failing test output first, passing test output after, linter/build results, and changed files.
Reply with a short status: DONE, DONE_WITH_CONCERNS, NEEDS_CONTEXT, or BLOCKED.
