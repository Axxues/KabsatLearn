import { useOnline } from '../lib/useOnline.js'

export default function OfflineBanner({ online: onlineProp }) {
  const hookValue = useOnline()
  const online = onlineProp ?? hookValue

  if (online) {
    return (
      <p className="flex items-center gap-2 text-sm text-[var(--color-good)]">
        <span aria-hidden="true" className="inline-block size-2 rounded-full bg-[var(--color-good)]" />
        Online
      </p>
    )
  }

  return (
    <p
      role="status"
      className="flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-3 py-1 text-xs font-semibold text-[var(--color-on-accent)]"
    >
      <span aria-hidden="true" className="inline-block size-2 rounded-full bg-[var(--color-on-accent)]" />
      Offline
    </p>
  )
}
