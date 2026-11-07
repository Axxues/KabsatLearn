import { useOnline } from '../lib/useOnline.js'

export default function OfflineBanner() {
  const online = useOnline()

  if (online) {
    return (
      <p className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-good)]">
        <span aria-hidden="true" className="inline-block size-2 rounded-full bg-[var(--color-good)]" />
        Online
      </p>
    )
  }

  return (
    <div
      role="status"
      className="flex items-center gap-2 border-b border-[var(--color-line)] bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-on-accent)]"
    >
      <span aria-hidden="true" className="inline-block size-2 rounded-full bg-[var(--color-on-accent)]" />
      Offline mode — your courses still work
    </div>
  )
}
