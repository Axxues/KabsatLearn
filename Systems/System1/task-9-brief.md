# Task 9 — Collapse the "Available to download" section by default

## Background

The user asked:

> can you make the "Available to download when online" collapsable? it should be
> collapsed by default

This is the section under the installed courses in `CourseHub.jsx`. It currently
renders its heading row and then always shows the available course cards.

**Before editing, re-read these files. Another session changed `CourseHub.jsx`,
`App.jsx`, and the tests recently.** If the code below does not match what you
find, stop and reply `NEEDS_CONTEXT` with the current section pasted back.

- `app/src/ui/CourseHub.jsx`
- `app/src/ui/CourseHub.test.jsx`
- `app/src/CourseCatalog.test.jsx`

**Load skills before starting:** `test-driven-development` and
`frontend-design` (this is a UI interaction change).

## Behaviour

- The section header becomes a button.
- Default state: collapsed. The course cards are not visible.
- The heading and the `{n} available` count stay visible while collapsed.
- Tapping the header expands the list; tapping again collapses it.
- The page-load default is always collapsed, including after a remount.
- Do not change the installed section, the cards, the modals, or the download
  flow.

## Exact implementation

In `app/src/ui/CourseHub.jsx`:

1. Add `ChevronDown` to the `lucide-react` import.
2. In `CourseHub`, next to `confirmDownloadTarget`, add:
   ```js
   const [availableOpen, setAvailableOpen] = useState(false)
   ```
3. Replace the current available-section block with:

```jsx
{/* Available for Download Section */}
{available.length > 0 && (
  <section aria-labelledby="available-heading">
    <h2
      id="available-heading"
      className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]"
    >
      <button
        type="button"
        aria-expanded={availableOpen}
        aria-controls="available-course-list"
        onClick={() => setAvailableOpen((open) => !open)}
        className="btn-press flex min-h-11 w-full items-center justify-between gap-2 rounded-xl px-1 text-left hover:text-[var(--color-ink)]"
      >
        <span>{t('availableHeading')}</span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-[var(--color-surface-sunken)] px-2 py-0.5 text-[11px] font-medium normal-case tracking-normal text-[var(--color-muted)]">
            {t('availableCountTag', { n: available.length })}
          </span>
          <ChevronDown
            className={`size-4 stroke-[2.5] transition-transform duration-200 ${
              availableOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </span>
      </button>
    </h2>
    <ul id="available-course-list" hidden={!availableOpen} className="mt-2 space-y-3">
      {available.map((capsule) => (
        <CapsuleCard
          key={capsule.id}
          capsule={capsule}
          onOpen={onOpen}
          onDownload={setConfirmDownloadTarget}
          onShare={setShareTarget}
          downloading={downloadingId === capsule.id}
        />
      ))}
    </ul>
  </section>
)}
```

Notes:

- `hidden` is deliberate: it keeps the cards mounted so expansion is instant,
  while removing them from the accessibility tree and the visible page.
- Keep the `<h2>` wrapper so the page heading outline stays intact.
- Use the exact class names above, including `normal-case` on the count badge,
  because the `h2` is uppercase.
- Do not add new i18n keys.

## Tests (write first, watch them fail)

### `app/src/ui/CourseHub.test.jsx`

1. Add a helper inside the describe block:

```js
async function expandAvailable() {
  const section = container.querySelector('section[aria-labelledby="available-heading"]')
  const toggle = section.querySelector('h2 button')
  await act(async () => {
    toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
  return section
}
```

2. Add two tests:

```js
test('available section is collapsed by default', async () => {
  await renderComponent(oneInstalledOneAvailable, 'en')

  const section = container.querySelector('section[aria-labelledby="available-heading"]')
  const toggle = section.querySelector('h2 button')
  const list = section.querySelector('#available-course-list')

  expect(toggle.getAttribute('aria-expanded')).toBe('false')
  expect(list.hidden).toBe(true)
  expect(toggle.textContent).toContain('Available to download when online')
  expect(toggle.textContent).toContain('1 available')
})

test('available section expands and collapses on header click', async () => {
  await renderComponent(oneInstalledOneAvailable, 'en')

  const section = container.querySelector('section[aria-labelledby="available-heading"]')
  const toggle = section.querySelector('h2 button')
  const list = section.querySelector('#available-course-list')

  await act(async () => {
    toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
  expect(toggle.getAttribute('aria-expanded')).toBe('true')
  expect(list.hidden).toBe(false)

  await act(async () => {
    toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
  expect(toggle.getAttribute('aria-expanded')).toBe('false')
  expect(list.hidden).toBe(true)
})
```

3. Existing tests that read inside the available section must expand it first,
   and must no longer use `availableSection.querySelector('button')`, because
   the first button is now the collapse toggle. Call `await expandAvailable()` at
   the start of each, then select the card's own button with
   `availableSection.querySelector('li button')`.

   Update these tests:
   - `available card renders its KB size`
   - `card category tag and code come from the capsule when it carries a tone`
   - `download button uses high-contrast text and does not use variable ink
     color on white background`
   - `clicking an available course card opens download confirmation modal,
     cancel dismisses it`
   - `confirming download in modal triggers onDownload with capsule id`

   Do not weaken any assertion. The modal tests must still confirm that
   `onDownload` is not called until the modal is confirmed.

### `app/src/CourseCatalog.test.jsx`

In `the other catalogue courses wait under available to download`, expand the
section before asserting the titles:

```js
const toggle = available.querySelector('h2 button')
await act(async () => {
  toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }))
})
```

Then keep the existing title assertions.

## Acceptance criteria

- [ ] The available section is collapsed on first render, with
      `aria-expanded="false"` and the list `hidden`.
- [ ] Clicking the header toggles `aria-expanded` and the list's `hidden` state.
- [ ] The heading and count remain visible while collapsed.
- [ ] Tapping the header does not open a download modal or call `onDownload`.
- [ ] The installed section, card layout, and both modals are unchanged.
- [ ] `npx vitest run` from `app/` exits 0 with all tests passing.
- [ ] `npx oxlint` from `app/` exits 0.
- [ ] `npx vite build` from `app/` exits 0.
- [ ] No emoji in `app/src`.
- [ ] Only these files change: `app/src/ui/CourseHub.jsx`,
      `app/src/ui/CourseHub.test.jsx`, `app/src/CourseCatalog.test.jsx`.

## Report

Write the full report to `Systems/System1/task-9-report.md` with RED output,
GREEN output, lint/build output, and changed files. If another process changed
`CourseHub.jsx` while you worked, say so explicitly.

Reply with a short status: `DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or
`BLOCKED`.
