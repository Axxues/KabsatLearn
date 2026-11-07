# Task 17 report — Course card 3-dots menu clipped

Status: **DONE**

## Files changed

- `Systems/System1/app/src/ui/CourseHub.jsx`
- `Systems/System1/app/src/ui/CourseHub.test.jsx`

No other source files modified. (`npx vite build` regenerated `app/dist/` as a
required build artifact.)

## The change

`CapsuleCard`'s `<li>`:

- removed `overflow-hidden` from the card className,
- added `${menuOpen ? 'z-30' : ''}` so the open card paints above the next card,
- wrapped `<Art />` in a direct child clipping wrapper exactly as specified:

```jsx
<div
  className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
  aria-hidden="true"
>
  <Art />
</div>
```

Dropdown markup (`absolute right-0 top-10 z-30 min-w-[140px] ...`), modals, and
`App.jsx` untouched.

## TDD — RED first

Test added: `open 3-dots menu is not clipped by overflow-hidden on the card or any ancestor`.
It opens the menu via the 3-dots button, locates the dropdown from the Share
button's parent, then asserts: Share + Archive present in the dropdown, no
`overflow-hidden` ancestor (walking `parentElement` to `document.body`), the
card has no `overflow-hidden` and has `z-30` while open, a direct child div with
both `overflow-hidden` and `rounded-2xl` exists as the artwork clip wrapper, and
`z-30` disappears after closing.

Command (from `Systems/System1/app`):

```
npx vitest run src/ui/CourseHub.test.jsx
```

Output before the fix (excerpt, quoted verbatim):

```
 ❯ src/ui/CourseHub.test.jsx (19 tests | 1 failed) 549ms
   ❯ CourseHub capsule cards and counters (19)
     × open 3-dots menu is not clipped by overflow-hidden on the card or any ancestor 34ms
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯
 FAIL  src/ui/CourseHub.test.jsx > CourseHub capsule cards and counters > open 3-dots menu is not clipped by
overflow-hidden on the card or any ancestor
AssertionError: expected [ Array(1) ] to deeply equal []
- Expected
+ Received
- []
+ [
+   "card-tactile group relative overflow-hidden rounded-2xl cursor-pointer p-4 sm:p-5 text-white shadow-md
 transition-all hover:shadow-xl hover:scale-[1.01] bg-gradient-to-br from-[#0c2a5e] via-[#1d4ed8] to-[#0284c7]",
+ ]
 ❯ src/ui/CourseHub.test.jsx:464:31
    462|       node = node.parentElement
    463|     }
    464|     expect(clippingAncestors).toEqual([])
 Test Files  1 failed (1)
      Tests  1 failed | 18 passed (19)
```

The failure is the expected one: the card's own `overflow-hidden` is the clipping
ancestor.

## GREEN

```
npx vitest run src/ui/CourseHub.test.jsx
```

```
 RUN  v5.1.0 D:/Hackathon/Systems/System1/app

 Test Files  1 passed (1)
      Tests  19 passed (19)
```

## Full suite

```
npx vitest run
```

```
 Test Files  28 passed (28)
      Tests  216 passed (216)
```

Note: the brief said the suite was 55 tests and expected 56; the repository has
grown since then. 216/216 pass, including the 19 in `CourseHub.test.jsx`.

## Lint

```
npx oxlint
```

Exit code 0. Four warnings, all in files I did not touch and all pre-existing
(`capsuleStore.js` x2 no-unused-vars, `i18n.jsx` only-export-components,
`useKabsatAiState.js` set-state-in-effect). No warnings or errors in
`CourseHub.jsx` or `CourseHub.test.jsx`.

## Build

```
npx vite build
```

Exit code 0:

```
dist/assets/index-DqoAFdJG.js     557.26 kB │ gzip:   164.17 kB
dist/assets/llm-9HAciw3d.js     6,116.56 kB │ gzip: 2,190.28 kB
(!) Some chunks are larger than 500 kB after minification. ...
✓ built in 1.46s
PWA v2.0.0
mode      generateSW
precache  14 entries (6586.20 KiB)
files generated
  dist/sw.js
  dist/workbox-9c191d2f.js
```

The chunk-size and PWA notes are pre-existing build warnings, not failures.

## jsdom caveat

jsdom does not do layout, so the test proves the structural cause (no
`overflow-hidden` ancestor, clip wrapper present, `z-30` toggled) rather than
measuring pixels. The original pixel evidence (menu clipped 38.9px below the
card) was supplied in the brief from Chromium.

## Visual verification

Not performed by me and not claimed. Chromium/browser verification of the
rendered menu, the rounded artwork clipping, and the open card painting over the
following card is left to the orchestrator.
