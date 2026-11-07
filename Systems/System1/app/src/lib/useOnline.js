import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { Network } from '@capacitor/network'
import { subscribeOnline } from './online.js'

/**
 * Connectivity state.
 *
 * In a browser, `online`/`offline` events are reliable. Inside a Capacitor
 * WebView they are not — the WebView keeps reporting "online" in airplane mode —
 * so on a native platform we ask the OS through the Network plugin.
 *
 * The plugin bridge can still be initialising when React mounts the app, and a
 * call made too early throws `Cannot read properties of undefined (reading
 * 'triggerEvent')`, which takes the whole tree down. So every bridge call is
 * deferred one tick and guarded.
 */
export function useOnline() {
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  )

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return subscribeOnline(setOnline)
    }

    let cancelled = false
    let handle = null

    const timer = setTimeout(() => {
      try {
        Network.getStatus()
          .then((status) => {
            if (!cancelled) setOnline(Boolean(status?.connected))
          })
          .catch(() => {})
      } catch {
        // bridge not ready; keep the last known value
      }

      try {
        Network.addListener('networkStatusChange', (status) => {
          setOnline(Boolean(status?.connected))
        })
          .then((listener) => {
            if (cancelled) listener?.remove?.()
            else handle = listener
          })
          .catch(() => {})
      } catch {
        // bridge not ready; keep the last known value
      }
    }, 0)

    return () => {
      cancelled = true
      clearTimeout(timer)
      try {
        handle?.remove?.()
      } catch {
        // removing a listener from a torn-down bridge is safe to ignore
      }
    }
  }, [])

  return online
}
