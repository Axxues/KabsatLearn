import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import App from './App.jsx'
import { db } from './lib/capsuleStore.js'

const AVAILABLE_TITLES = [
  'Unang Hakbang sa Online Trabaho',
  'Kumpiyansa sa Smartphone',
  'Perang May Plano',
  'Plano ng Pamilya',
  'Tindahang Maayos',
]

beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
    })
  }
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {}
  }
})

function normalize(text) {
  return text.replace(/\s+/g, ' ').trim()
}

describe('course catalogue in the app', () => {
  let container
  let root

  beforeEach(async () => {
    localStorage.clear()
    await db.capsules.clear()
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(async () => {
    act(() => {
      root.unmount()
    })
    container.remove()
    await db.capsules.clear()
  })

  async function mount() {
    root = createRoot(container)
    await act(async () => {
      root.render(<App />)
    })
    // The hub swaps its loading state for the greeting once the seed + refresh settle.
    for (let attempt = 0; attempt < 100; attempt += 1) {
      if (normalize(container.textContent).includes('Naimbag nga aldaw')) return
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
      })
    }
    throw new Error('App did not finish loading installed courses')
  }

  test('a fresh install seeds only capsule 101', async () => {
    await mount()

    const stored = await db.capsules.toArray()
    expect(stored.map((capsule) => capsule.id)).toEqual(['capsule-101'])
  })

  test('the other catalogue courses wait under available to download', async () => {
    await mount()

    const available = container.querySelector('section[aria-labelledby="available-heading"]')
    expect(available).not.toBeNull()
    const toggle = available.querySelector('h2 button')
    await act(async () => {
      toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    const availableText = normalize(available.textContent)
    for (const title of AVAILABLE_TITLES) {
      expect(availableText, title).toContain(title)
    }
  })

  test('uninstalled courses are not listed as installed', async () => {
    await mount()

    const installed = container.querySelector('section[aria-labelledby="installed-heading"]')
    expect(installed).not.toBeNull()
    const installedText = normalize(installed.textContent)
    expect(installedText).toContain('Ligtas na Digital Wallet')
    expect(installedText).not.toContain('Kumpiyansa sa Smartphone')
    expect(installedText).not.toContain('Perang May Plano')
    expect(installedText).not.toContain('Plano ng Pamilya')
    expect(installedText).not.toContain('Tindahang Maayos')
  })
})
