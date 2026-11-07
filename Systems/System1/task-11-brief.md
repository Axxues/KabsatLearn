# Task 11 — Change course card "Pass" button text to "Share"

## Background

The user requested:
> "change the Pass text here to Share"

In `Systems/System1/app/src/ui/CourseHub.jsx`, installed course cards render a share button next to the course title containing a `<Share2>` icon and `{t('passCourse')}`:
```jsx
<button
  type="button"
  onClick={(e) => {
    e.stopPropagation()
    onShare(capsule)
  }}
  title={t('passTooltip')}
  aria-label={t('passAria', { title: capsule.title })}
  className="btn-press shrink-0 flex items-center gap-1.5 rounded-xl border border-white/30 bg-black/30 hover:bg-black/50 px-3 py-1.5 text-xs font-bold text-white shadow-xs backdrop-blur-md transition-colors"
>
  <Share2 className="size-3.5 stroke-[2.2]" aria-hidden="true" />
  <span>{t('passCourse')}</span>
</button>
```

Currently in `Systems/System1/app/src/lib/i18n.jsx`:
- English: `passCourse: 'Pass'`
- Filipino: `passCourse: 'Ipasa'`

The user wants the button to say "Share".

Do **NOT** change the 2-player quiz game mode in `QuizArena.jsx` (`playPass: 'Pass and Play'`). Only the course capsule sharing action in CourseHub is in scope.

## TDD order

Write the test first and watch it fail, then edit.

1. In `app/src/ui/CourseHub.test.jsx`, add a test:
   - Render an installed capsule in English (`en`): assert that the share button contains the text `"Share"` and does NOT contain `"Pass"`.
   - Render an installed capsule in Filipino (`fil`): assert that the share button contains `"Ibahagi"`.
2. Run `npx vitest run src/ui/CourseHub.test.jsx` from `app/` and observe the failure (RED).

## Exact changes

In `app/src/lib/i18n.jsx`:
1. In `en` dictionary:
   - `passCourse`: `'Pass'` -> `'Share'`
   - `passTooltip`: `'Pass to classmate via Bluetooth or Nearby Share'` -> `'Share with classmate via Bluetooth or Nearby Share'`
   - `passAria`: `'Pass {title} to classmate'` -> `'Share {title} with classmate'`
2. In `fil` dictionary:
   - `passCourse`: `'Ipasa'` -> `'Ibahagi'`
   - `passTooltip`: `'Ipasa sa kaklase via Bluetooth o Nearby Share'` -> `'Ibahagi sa kaklase via Bluetooth o Nearby Share'`
   - `passAria`: `'Ipasa ang {title} sa kaklase'` -> `'Ibahagi ang {title} sa kaklase'`

No emojis in the translations.

## Acceptance criteria

- Installed course cards display `"Share"` on the share button in English.
- Installed course cards display `"Ibahagi"` on the share button in Filipino.
- `QuizArena.jsx` "Pass and Play" mode is unchanged.
- `npx vitest run` from `app/` passes all tests.
- `npx oxlint` from `app/` reports 0 errors and no new warnings.
- `npx vite build` from `app/` succeeds with exit code 0.

## Report

Write the full report to `Systems/System1/task-11-report.md` with:
- Failing test output first (RED)
- Passing test output after (GREEN)
- Oxlint and Vite build output
- Changed files summary

Reply with a short status: DONE, DONE_WITH_CONCERNS, NEEDS_CONTEXT, or BLOCKED.
