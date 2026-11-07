import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import './index.css'
import App from './App.jsx'

/**
 * Service worker policy.
 *
 * Web: cache the shell so the PWA works offline.
 *
 * Native: do NOT register one. The APK already bundles every asset, so a
 * service worker adds nothing — and it actively breaks updates, because a
 * cached shell keeps being served after the APK is replaced. That is exactly
 * what happened on device: a rebuilt APK still showed the previous UI.
 * On native we also unregister and clear any cache left by an older build.
 */
if (Capacitor.isNativePlatform()) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => registrations.forEach((registration) => registration.unregister()))
      .catch(() => {})
  }
  if (typeof caches !== 'undefined') {
    // Only clear the service-worker precache. Clearing every cache also deletes
    // the downloaded on-device model, forcing a 400 MB re-download on each launch.
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('workbox') || key.includes('precache'))
            .map((key) => caches.delete(key)),
        ),
      )
      .catch(() => {})
  }
} else if (import.meta.env.PROD) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                window.location.reload()
              }
            })
          }
        })
      })
      .catch(() => {})
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
