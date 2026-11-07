/**
 * Full-width connectivity bar, rendered below the header by App.
 * Nothing is shown while online, so the offline state is unmissable on stage.
 *
 * The value comes from App's single subscription. This component must not
 * subscribe again: two Network listeners in the WebView is what produced the
 * teardown error on device.
 */
export default function OfflineBanner({ online }) {
  if (online) return null

  return (
    <div
      role="status"
      className="w-full bg-[var(--color-accent)] px-4 py-2 text-center text-sm font-semibold text-[var(--color-on-accent)]"
    >
      ⚡ Offline mode — your courses still work
    </div>
  )
}
