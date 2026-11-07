import { describe, expect, it, vi } from 'vitest'
import { isOnline, listenerCount, subscribeOnline } from './online.js'

describe('subscribeOnline', () => {
  it('reports offline when the browser goes offline', () => {
    const callback = vi.fn()
    const unsubscribe = subscribeOnline(callback)

    window.dispatchEvent(new Event('offline'))

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(false)
    unsubscribe()
  })

  it('unsubscribes cleanly and leaves no listeners behind', () => {
    const before = listenerCount()
    const unsubscribe = subscribeOnline(() => {})

    expect(listenerCount()).toBe(before + 1)
    unsubscribe()
    expect(listenerCount()).toBe(before)
  })

  it('reads the current value from navigator', () => {
    expect(isOnline()).toBe(navigator.onLine)
  })
})
