import { Zap } from 'lucide-react'

/**
 * Offline banner, rendered directly below the app header by App.
 *
 * It must not subscribe to connectivity itself — App owns the single
 * subscription in a Capacitor WebView.
 */
export default function OfflineBanner({ online }) {
  if (online) return null

  return (
    <div
      role="status"
      className="flex w-full items-center justify-center gap-1.5 bg-[var(--color-accent)] px-4 py-2 text-center text-xs font-bold uppercase tracking-wide text-[var(--color-on-accent)]"
    >
      <Zap className="size-3.5 stroke-[2.5]" aria-hidden="true" />
      <span>Offline — your courses still work</span>
    </div>
  )
}
