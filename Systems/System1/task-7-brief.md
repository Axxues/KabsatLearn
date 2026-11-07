# Task 7 — Review follow-ups for the six-course catalogue

## Background

Tasks 5 and 6 shipped capsules 103–106. Independent verification passed all
acceptance criteria, and the reviewer raised four small issues plus one
documentation gap. This task closes them. It is deliberately narrow: no layout
rewrites, no tutor feature work, no new capsules.

**Load skills before starting:** `test-driven-development`. Load
`frontend-design` for the gradient change.

## Deliverable 1 — Family gradient depth

`app/src/ui/CourseHub.jsx` currently has `family` equal to:

```
from-[#134e4a] via-[#0f766e] to-[#0f766e]
```

The `via` and `to` stops are identical, so half the card is flat. Change it to:

```
from-[#134e4a] via-[#115e59] to-[#0f766e]
```

Leave `business`, `safety`, and `work` unchanged. In your report, state the
white-on-stop contrast for `#115e59`; it must be at least 4.5:1.

## Deliverable 2 — Seed guard

`app/src/App.jsx` seeds `CAPSULE_BY_ID[id]` for each `SEEDED_IDS` entry. A typo
in that list would pass `undefined` to `seedCapsule`, throw during hashing, and
leave the hub in its loading state forever.

Change the loop body to skip a missing capsule:

```js
for (const id of SEEDED_IDS) {
  const capsule = CAPSULE_BY_ID[id]
  if (!capsule) continue
  if (!(await getCapsule(id))) {
    await seedCapsule(capsule)
  }
}
```

## Deliverable 3 — Stronger catalogue guards

In `app/src/data/catalogue.test.js`, add:

1. A test that every id in `SEEDED_IDS` exists in `CAPSULE_BY_ID`.
2. Inside the existing new-capsule checks (for `NEW_IDS` only, because the
   older 101/102 keywords exceed six), assert:
   - every chunk `difficulty` is in `BANDS` from `../lib/schema.js`;
   - every chunk has 4–6 keywords;
   - every keyword is a lowercase string.

## Deliverable 4 — Capsule 106 question precision

In `app/src/data/capsules/capsule-106.json`, question `q2` asks what belongs on
a stock card. Its correct option currently says `"Item, bilang, presyo, at
petsa"`, which omits the balance and expiry fields taught in card c2 and chunk
k2.

Change that option to:

```
"Item, unit cost, presyo, stock in at out, balanse, at expiry"
```

Keep the answer index pointing at it and leave the distractors alone.

## Deliverable 5 — Documentation

Edit `Systems/System1/DESIGN.md`:

1. In "Features (v1)", item 6, change `mastery radar across four pillars` to
   `mastery bars across seven competencies`.
2. In "Honest limits", add:

```
- Kabsat AI grounds on Capsule 101 only. Questions about capsules 102–106 are
  refused with the out-of-scope message, even after those capsules are
  downloaded. The tutor is not course-scoped in v1.
```

Do not add or remove any other honest limit.

## Deliverable 6 — Report

Create `Systems/System1/task-7-report.md` with the RED output for the new tests,
the GREEN output, the contrast ratio, and the changed files.

## Acceptance criteria

- [ ] `npx vitest run` from `app/` exits 0 with all tests passing.
- [ ] `npx oxlint` from `app/` exits 0.
- [ ] `npx vite build` from `app/` exits 0.
- [ ] Only these files change: `app/src/ui/CourseHub.jsx`, `app/src/App.jsx`,
      `app/src/data/catalogue.test.js`,
      `app/src/data/capsules/capsule-106.json`, `DESIGN.md`.
- [ ] The family gradient has three distinct stops and every stop is at least
      4.5:1 for white body text.
- [ ] A seeded id that does not exist in `CAPSULE_BY_ID` cannot crash startup.
- [ ] Capsule 106 `q2` still has exactly four options and its `answer` index is
      still correct.

Reply with a short status: `DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or
`BLOCKED`.
