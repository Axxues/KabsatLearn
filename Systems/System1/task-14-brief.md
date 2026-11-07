# Task 14 — Remove Privacy Guarantee Card from Profile Screen

## Background

The user requested:
> "remove the 100% on privacy card here"

When clarified whether to remove the "100%" prefix or the entire privacy card, the user confirmed:
> "Remove the entire privacy card from the Profile screen"

In `Systems/System1/app/src/ui/Profile.jsx`, Section 3 rendered the Privacy Guarantee Card:
```jsx
{/* Section 3: Privacy Guarantee Card */}
<section className="flex items-start gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-sm">
  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-good-subtle)] text-[var(--color-good)]">
    <ShieldCheck className="size-5 stroke-[2.5]" aria-hidden="true" />
  </div>
  <div className="space-y-1">
    <p className="text-xs font-extrabold text-[var(--color-ink)]">
      {t.privacyTitle}
    </p>
    <p className="text-[11px] leading-relaxed text-[var(--color-muted)]">
      {t.privacy}
    </p>
  </div>
</section>
```

This card is to be completely removed from `Profile.jsx`.

---

## Required Changes

1. **`Systems/System1/app/src/ui/Profile.jsx`**:
   - Remove `<section className="flex items-start gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-sm">` containing the privacy notice and `ShieldCheck` icon.
   - Remove unused `ShieldCheck` icon from `lucide-react` imports.
   - Remove unused `privacyTitle` and `privacy` keys from `TEXT.tl` and `TEXT.en` dictionary objects.

2. **`Systems/System1/app/src/ui/Profile.test.jsx`**:
   - Add a test: `does not render privacy guarantee card` asserting that `container.textContent` does not contain `"Pribado sa Device"`, `"On-Device Privacy"`, or `"This profile is stored only on your phone"`.

---

## TDD Order

1. Update `app/src/ui/Profile.test.jsx` to add the assertion that the privacy card is not rendered.
2. Run `npx vitest run src/ui/Profile.test.jsx` and observe failure (RED).
3. Update `app/src/ui/Profile.jsx` to remove the privacy card, `ShieldCheck` import, and unused translation keys.
4. Run `npx vitest run src/ui/Profile.test.jsx` and observe pass (GREEN).
5. Run full test suite: `npx vitest run`.
6. Run `npx oxlint`.
7. Run `npx vite build`.

---

## Acceptance Criteria

- The Privacy Guarantee card is completely removed from the Profile screen.
- `ShieldCheck` is not imported or used in `Profile.jsx`.
- All tests in `src/ui/Profile.test.jsx` pass.
- All tests across the test suite pass (`npx vitest run`).
- `npx oxlint` reports 0 errors and no unused imports.
- `npx vite build` succeeds with exit code 0.

---

## Report

Write the full report to `Systems/System1/task-14-report.md` including:
- RED test failure output
- GREEN test success output
- Oxlint and Vite build output
- Changed files summary
- Reply with a short status: DONE, DONE_WITH_CONCERNS, NEEDS_CONTEXT, or BLOCKED.
