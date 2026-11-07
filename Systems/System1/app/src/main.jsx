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
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .catch(() => {})
  }
} else {
  import('virtual:pwa-register')
    .then(({ registerSW }) => registerSW({ immediate: true }))
    .catch(() => {})
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// TEMPORARY capability probe: remove after reading logcat.
if (typeof navigator !== 'undefined' && navigator.gpu) {
  navigator.gpu
    .requestAdapter()
    .then((adapter) => {
      console.log('WEBGPU_PROBE adapter=' + (adapter ? 'YES' : 'NULL'))
    })
    .catch((error) => console.log('WEBGPU_PROBE error=' + error.message))
} else {
  console.log('WEBGPU_PROBE navigator.gpu=NONE')
}
console.log('WEBGPU_PROBE ua=' + navigator.userAgent)
