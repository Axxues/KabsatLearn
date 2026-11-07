# Task 2 — Remove the remaining emoji from the UI

## Background

The user pointed at the CourseHub card meta row (`6 aralin`, `10 tanong`,
`100% Offline`) and asked for emoji to be removed in favour of `lucide-react`
icons.

Verify first: that row **already** renders `BookOpen`, `HelpCircle`, and `Zap`
from `lucide-react` (`app/src/ui/CourseHub.jsx`, the "Meta counters" block).
Do not restyle or replace those three icons. Do not touch `CourseHub.jsx` unless
you find an actual emoji character in it.

The scan below is the current state. These four strings are the only emoji left
in `app/src`:

```
src/lib/i18n.jsx:89   turnIndicator: '👉 Turn ni Manlalaro {n}',
src/lib/i18n.jsx:90   streakIndicator: '🔥 {n}x Streak (+Puntos!)',
src/lib/i18n.jsx:241  turnIndicator: "👉 Player {n}'s Turn",
src/lib/i18n.jsx:242  streakIndicator: '🔥 {n}x Streak (+Points!)',
```

`QuizArena.jsx` already renders a `<Flame>` lucide icon next to the streak text,
so the `🔥` in the string is a duplicate. The two-player turn label has no icon.

## TDD order

Write the tests first and watch them fail, then edit.

1. `app/src/lib/i18n.test.jsx` (new) — assert that every translated string in
   both `fil` and `en` contains no `\p{Extended_Pictographic}` character. The
   four strings above make it fail.
2. `app/src/ui/QuizArena.test.jsx` (new or extend an existing one) — render the
   two-player header and assert the turn label starts with a lucide icon
   (`svg.lucide-users`) and contains no emoji.

If a suitable test harness already exists, reuse its helpers. If
`QuizArena.test.jsx` is hard to set up, at minimum cover the i18n scan; say so
in the report.

## Exact changes

1. `app/src/lib/i18n.jsx`
   - `turnIndicator` (fil): `'👉 Turn ni Manlalaro {n}'` → `'Turn ni Manlalaro {n}'`
   - `streakIndicator` (fil): `'🔥 {n}x Streak (+Puntos!)'` → `'{n}x Streak (+Puntos!)'`
   - `turnIndicator` (en): `"👉 Player {n}'s Turn"` → `"Player {n}'s Turn"`
   - `streakIndicator` (en): `'🔥 {n}x Streak (+Points!)'` → `'{n}x Streak (+Points!)'`
   - Keep the `{n}` placeholders exactly as they are.
2. `app/src/ui/QuizArena.jsx`
   - In the `players === 2` branch (~line 466), render the existing imported
     `<Users>` icon before the label, matching the Flame treatment:
     `<Users className="size-3.5 text-[var(--color-accent)] stroke-[2]" aria-hidden="true" />`
     Put the icon and the `t('turnIndicator', …)` text in a flex row
     (`inline-flex items-center gap-1`) so the icon sits inline.
   - Leave the `<Flame>` in the streak branch as-is; only the string loses `🔥`.

Do not change the Kahoot tile glyphs `▲ ◆ ● ■` — they are intentional shapes,
not emoji. Do not touch any other component.

## Acceptance criteria

- Node scan reports zero `\p{Extended_Pictographic}` characters under
  `app/src/**/*.{js,jsx,css,html}`.
- `npx vitest run` from `app/` — all tests pass, exit code 0.
- `npx oxlint` from `app/` — no new warnings/errors.
- `npx vite build` from `app/` — succeeds.
- `app/src/ui/CourseHub.jsx` still imports `BookOpen`, `HelpCircle`, `Zap`
  from `lucide-react` and renders all three in the meta row.

## Report

Write the full report to `Systems/System1/task-2-report.md` with the failing
test output first, the passing output after, and the node scan result. Reply with
a short status: DONE, DONE_WITH_CONCERNS, NEEDS_CONTEXT, or BLOCKED.
