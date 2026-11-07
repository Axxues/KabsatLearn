# Task 17 — Course card 3-dots menu is clipped: Archive option invisible

## Bug report

On the Courses hub (`Aralin` tab), open the 3-dots menu on an installed course
card. The white menu shows **Share** but **Archive** is missing. Screenshot from
the device shows the menu sheet cut off exactly at the card's bottom edge.

## Root cause (already confirmed — do not re-diagnose)

`CapsuleCard` in `app/src/ui/CourseHub.jsx` renders the dropdown **inside** the
`<li>` card, and the card has Tailwind's `overflow-hidden`. That class exists
only to clip the decorative `<Art />` SVG to the rounded card, but it also clips
the absolutely positioned menu.

Chromium evidence from the running dev server (1140x796 viewport, one installed
course):

```
menuRect:  { top: 433.30, bottom: 510.88, height: 77.58 }
cardRect:  { top: 335.99, bottom: 471.99, height: 136.00 }
cardOverflow: "hidden"
menuClippedBelowCardBy: 38.9
```

The Share row fits inside the card; the Archive row is 38.9px below the card's
bottom edge and is clipped. Existing tests pass because they assert on
`textContent`, which still includes clipped DOM nodes.

The second, latent half of the bug: even with clipping removed, the open card
creates a stacking context (`.card-tactile` sets `transform: translateZ(0)`), so
the *next* card in the list (later DOM order, same stacking level) would paint
over an overflowing menu. The open card must be raised above its siblings.

## Required change

File: `Systems/System1/app/src/ui/CourseHub.jsx` (only this file for the fix).

1. On the `<li>` in `CapsuleCard` (`className` currently starts with
   `card-tactile group relative overflow-hidden rounded-2xl ...`):
   - Remove `overflow-hidden`.
   - Add `z-30` conditionally when the menu is open, e.g.
     `${menuOpen ? 'z-30' : ''}` in the template string. Keep every other class.
2. Render the artwork inside its own clipping wrapper so the rounded cards still
   hide the SVG's overhang:
   ```jsx
   <div
     className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
     aria-hidden="true"
   >
     <Art />
   </div>
   ```
   Place it exactly where `<Art />` currently is. `<Art />` stays unchanged and
   remains absolutely positioned relative to this wrapper.
3. Keep the dropdown markup, `z-30`, `top-10`, `right-0`, `min-w-[140px]` as is.
4. Do not change `App.jsx`, the share modal, or the download modal.

## Tests (TDD — write these first, watch them fail)

File: `Systems/System1/app/src/ui/CourseHub.test.jsx`

Add one regression test, in the style of the existing tests (use
`renderComponent`, `oneInstalledOneAvailable`, `act`, `MouseEvent`):

1. Open the installed card's 3-dots menu.
2. Locate the dropdown container (the menu div that directly contains the Share
   and Archive buttons) and only then assert:
   - It contains both `Share` and `Archive`.
   - **No ancestor of the dropdown has the class `overflow-hidden`** — walk
     `parentElement` up to `document.body`.
   - The card `<li>` className does not contain `overflow-hidden` and does
     contain `z-30` while open.
   - A sibling clipping wrapper exists for the artwork: the card has a direct
     child `div` whose className contains both `overflow-hidden` and
     `rounded-2xl`.
3. Close the menu (click the 3-dots button again or click the card) and assert
   the card no longer has `z-30`.

The ancestor assertion must fail on the current code (card has
`overflow-hidden`) and pass after the fix. If jsdom makes an assertion
meaningless, keep the structural assertion but say so in the report.

## Verification commands

Run from `Systems/System1/app`:

1. `npx vitest run src/ui/CourseHub.test.jsx` — observe RED before the fix.
2. Apply the fix.
3. `npx vitest run src/ui/CourseHub.test.jsx` — GREEN.
4. `npx vitest run` — full suite, all pass (currently 55 tests; expect 56).
5. `npx oxlint` — 0 errors.
6. `npx vite build` — exit code 0, report the output.

Do **not** claim a browser check; the orchestrator verifies the rendering in
Chromium afterwards. State in the report that visual verification is pending.

## Acceptance criteria

- Installed-card 3-dots menu is no longer clipped; both Share and Archive are
  reachable in the DOM and no `overflow-hidden` ancestor clips the menu.
- Card artwork still clips to the rounded corners (wrapper present).
- Open card is `z-30` so the menu paints over the following card.
- Full suite passes; oxlint clean; production build succeeds.
- Only `CourseHub.jsx` and `CourseHub.test.jsx` are modified.

## Report

Write the full report to `Systems/System1/task-17-report.md`:
- RED test output (quoted)
- GREEN test output and full-suite output
- oxlint and build output
- files changed
- confirm visual check is left to the orchestrator
- short status: DONE, DONE_WITH_CONCERNS, NEEDS_CONTEXT, or BLOCKED
