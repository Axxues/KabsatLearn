/**
 * Compact connectivity chip, rendered inside the app header.
 *
 * This is a chip rather than a full-width bar because the header is a
 * `justify-between` flex row: a block element there overflows and overlaps the
 * title. Keep it `shrink-0` and `whitespace-nowrap` so it can never wrap into
 * the theme button.
 *
 * The value comes from App's single subscription; this component must not
 * subscribe again.
 */
export default function OfflineBanner({ online }) {
  if (online) return null

  return (
    <span
      role="status"
      className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-[var(--color-accent)] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--color-on-accent)]"
    >
      <span aria-hidden="true">⚡</span>
      Offline
    </span>
  )
}
