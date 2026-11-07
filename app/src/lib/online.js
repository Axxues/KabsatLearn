let listeners = 0

/**
 * Subscribe to connectivity changes. Returns an unsubscribe function.
 * Kept separate from the React hook so it can be tested without a renderer.
 */
export function subscribeOnline(callback) {
  const onChange = (event) => callback(event.type === 'online')
  window.addEventListener('online', onChange)
  window.addEventListener('offline', onChange)
  listeners += 1

  return () => {
    window.removeEventListener('online', onChange)
    window.removeEventListener('offline', onChange)
    listeners -= 1
  }
}

export function isOnline() {
  return navigator.onLine
}

export function listenerCount() {
  return listeners
}
