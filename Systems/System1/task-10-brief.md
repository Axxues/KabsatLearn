# Task 10 — Move profile button to the rightmost side of the header

## Background

The user requested:
> "The profile button should be at the right most side, after the theme button"

Currently in `Systems/System1/app/src/App.jsx`, the header action buttons container (`<div className="flex items-center gap-2">`) renders:
1. Profile button (`aria-label="Profile"`)
2. Language toggle button (`aria-label="Switch language to..."`)
3. Theme toggle button (`aria-label="Switch to ... mode"`)

The requested order from left to right:
1. Language toggle button
2. Theme toggle button
3. Profile button (right-most)

## TDD order

Write the test first and watch it fail, then edit.

1. In `app/src/App.test.jsx`, add a test in `describe('app header', ...)`:
   - Verify that in the header action buttons, the buttons appear in order: Language toggle, Theme toggle, and Profile button as the rightmost button.
2. Run `npx vitest run src/App.test.jsx` from `app/` and observe the test failure (RED).

## Exact changes

In `app/src/App.jsx`:
Inside `<header ...>` within `<div className="flex items-center gap-2">` (around lines 353–388):
Reorder the buttons so that:
- First: Language Toggle button (`<button onClick={toggleLang} ...>`)
- Second: Theme Toggle button (`<button onClick={toggleTheme} ...>`)
- Third (right-most): Profile button (`<button onClick={() => setShowProfile(true)} aria-label="Profile" ...>`)

Keep all classes, icons, props, and click handlers of the buttons intact.

## Acceptance criteria

- In `app/src/App.jsx`, the profile button is rendered after the theme toggle button inside the header actions container.
- `npx vitest run` from `app/` passes all tests.
- `npx oxlint` from `app/` reports 0 errors and no new warnings.
- `npx vite build` from `app/` succeeds with exit code 0.

## Report

Write the full report to `Systems/System1/task-10-report.md` with:
- Failing test output first (RED)
- Passing test output after (GREEN)
- Oxlint and Vite build output
- Changed files summary

Reply with a short status: DONE, DONE_WITH_CONCERNS, NEEDS_CONTEXT, or BLOCKED.
