# Task 15 — Remove Accessibility Section from Profile Screen

## Background

The user requested:
> "remove the accessibility section in profile"

In `Systems/System1/app/src/ui/Profile.jsx`, Section 2 (Preferences & Accessibility) currently renders a segmented toggle for language, followed by a divider and an Accessibility Options section:
```jsx
{/* Accessibility Options */}
<div className="space-y-1.5 pt-2 border-t border-[var(--color-line)]">
  <span className="text-xs font-bold text-[var(--color-ink)]">
    {t.access}
  </span>

  <div className="space-y-2 pt-0.5">
    {[
      { key: 'voice', label: t.voice, icon: Volume2, desc: t.voiceDesc },
      { key: 'largeText', label: t.largeText, icon: Type, desc: t.largeDesc },
      { key: 'highContrast', label: t.contrast, icon: Eye, desc: t.contrastDesc },
    ].map(...)
  </div>
</div>
```

The user wants this entire Accessibility options block removed from `Profile.jsx`.

---

## Required Changes

1. **`Systems/System1/app/src/ui/Profile.jsx`**:
   - Remove the Accessibility Options JSX block (`{/* Accessibility Options */}` div, headings, checkboxes, and map loop).
   - Update `sectionPref` in `TEXT`:
     - In `tl`: `'Wika'` (previously `'Wika at Accessibility'`)
     - In `en`: `'Language'` (previously `'Language & Accessibility'`)
   - Remove unused `access`, `voice`, `voiceDesc`, `largeText`, `largeDesc`, `contrast`, `contrastDesc` keys from `TEXT.tl` and `TEXT.en`.
   - Remove unused icons (`Volume2`, `Type`, `Eye`) from `lucide-react` import.
   - Remove the unused `updateAccess` helper function.
   - Keep saving profile data compatible (`accessibility` object passed in `profile` prop remains preserved in state or saved output).

2. **`Systems/System1/app/src/ui/Profile.test.jsx`**:
   - Add a test: `does not render accessibility section` asserting that `container.textContent` does not contain `"Accessibility"`, `"Read aloud"`, `"Large text"`, `"High contrast"`, `"Basahin nang malakas"`, `"Malaking teksto"`, or `"Mataas na kontrast"`.

---

## TDD Order

1. Update `app/src/ui/Profile.test.jsx` to add the assertion that the accessibility section is not rendered.
2. Run `npx vitest run src/ui/Profile.test.jsx` and observe failure (RED).
3. Update `app/src/ui/Profile.jsx` to remove the accessibility options block, unused icons, helper, and translation keys.
4. Run `npx vitest run src/ui/Profile.test.jsx` and observe pass (GREEN).
5. Run full test suite: `npx vitest run`.
6. Run `npx oxlint`.
7. Run `npx vite build`.

---

## Acceptance Criteria

- The Accessibility section is completely removed from the Profile screen.
- `Volume2`, `Type`, `Eye` are not imported or used in `Profile.jsx`.
- No unused helper functions (`updateAccess`) in `Profile.jsx`.
- All tests in `src/ui/Profile.test.jsx` pass.
- All tests across the test suite pass (`npx vitest run`).
- `npx oxlint` reports 0 errors and no new warnings.
- `npx vite build` succeeds with exit code 0.

---

## Report

Write the full report to `Systems/System1/task-15-report.md` including:
- RED test failure output
- GREEN test success output
- Oxlint and Vite build output
- Changed files summary
- Reply with a short status: DONE, DONE_WITH_CONCERNS, NEEDS_CONTEXT, or BLOCKED.
