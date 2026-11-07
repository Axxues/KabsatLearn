# Task 4 — Remove the Ready tag from course cards and pluralize course counter

## Background

The user requested two UI changes on the CourseHub screen:
1. "remove the Ready tag here on each courses."
2. "Also, instead of counting 1 ready, it should be 1 course, and courses if plural"

Currently in `Systems/System1/app/src/ui/CourseHub.jsx`:
- `CapsuleCard` renders a green badge `{t('readyTag')}` (`Handa` / `Ready`) with a `Check` icon when `installed` is true.
- The installed section header badge displays `{t('readyCountTag', { n: installed.length })}` (`{n} handa na` / `{n} ready`).

## TDD order

Write the tests first and watch them fail, then edit.

1. Create `app/src/ui/CourseHub.test.jsx`:
   - Render `CourseHub` with mock capsules (1 installed capsule and 1 available capsule) under `I18nProvider`:
     - Assert that the installed capsule card does NOT render "Ready" or "Handa" or any `Check` icon (`svg.lucide-check`).
     - Assert that the available capsule card renders its KB size (`{capsule.kb} KB`).
     - In English (`en`), with 1 installed capsule: assert the counter badge in the installed header displays `"1 course"`.
     - In English (`en`), with 2 installed capsules: assert the counter badge in the installed header displays `"2 courses"`.
     - In Filipino (`fil`), with 1 installed capsule: assert the counter badge displays `"1 kurso"`.
     - In Filipino (`fil`), with 2 installed capsules: assert the counter badge displays `"2 mga kurso"`.
2. Run `npx vitest run src/ui/CourseHub.test.jsx` from `app/` and observe the test failure (RED).

## Exact changes

1. `app/src/lib/i18n.jsx`
   - In `fil` translations (Course Hub block):
     Add:
     ```javascript
     courseCountSingle: '{n} kurso',
     courseCountPlural: '{n} mga kurso',
     ```
     Keep `readyTag: 'Handa'` and update or keep `readyCountTag: '{n} kurso'` for backwards compatibility.
   - In `en` translations (Course Hub block):
     Add:
     ```javascript
     courseCountSingle: '{n} course',
     courseCountPlural: '{n} courses',
     ```
     Keep `readyTag: 'Ready'` and update or keep `readyCountTag: '{n} courses'` for backwards compatibility.
   - Ensure no emoji characters are added.

2. `app/src/ui/CourseHub.jsx`
   - Remove unused `Check` from `lucide-react` import.
   - In `CapsuleCard` (around lines 53–63):
     Remove the `{installed ? (...) : (...)}` block.
     When `installed` is true, render nothing.
     When `!installed`, render the existing size badge:
     ```jsx
     {!installed && (
       <span className="shrink-0 rounded-full border border-[var(--color-line)] bg-[var(--color-surface-sunken)] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[var(--color-muted)]">
         {capsule.kb} KB
       </span>
     )}
     ```
   - In `CourseHub` installed section header (around lines 220–225):
     Update the count badge:
     ```jsx
     <span className="rounded-full bg-[var(--color-good-subtle)] px-2 py-0.5 text-[11px] font-bold text-[var(--color-good)]">
       {installed.length === 1
         ? t('courseCountSingle', { n: installed.length })
         : t('courseCountPlural', { n: installed.length })}
     </span>
     ```

## Acceptance criteria

- `CourseHub.jsx` no longer imports or renders `Check`.
- Installed capsule cards have no "Ready" or "Handa" badge.
- Available capsule cards still show their KB size badge.
- Installed section counter badge renders:
  - `"1 course"` when 1 capsule is installed in English
  - `"{n} courses"` when multiple capsules are installed in English
  - `"1 kurso"` when 1 capsule is installed in Filipino
  - `"{n} mga kurso"` when multiple capsules are installed in Filipino
- `npx vitest run` from `app/` passes all tests (exit code 0).
- `npx oxlint` from `app/` passes with no new warnings or errors.
- `npx vite build` from `app/` succeeds with exit code 0.
- Zero emoji in `app/src`.

## Report

Write the full report to `Systems/System1/task-4-report.md` with:
- Failing test output first
- Passing test output after
- Oxlint and Vite build output
- Changed files summary

Reply with a short status: DONE, DONE_WITH_CONCERNS, NEEDS_CONTEXT, or BLOCKED.
