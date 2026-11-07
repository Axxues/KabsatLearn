import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import App from './App.jsx'
import capsule102 from './data/capsules/capsule-102.json'
import { db, removeCapsule, seedCapsule } from './lib/capsuleStore.js'

const Q101_CORE = 'May nagpakita ng screenshot na naipadala na ang refund. Ano ang susunod mong gagawin?'
const Q102_CORE = 'Paano mo ipapakita na kaya mo ang trabaho kahit walang experience?'
const STORAGE_KEY = 'kabsat_quiz_course'

const clone = (value) => JSON.parse(JSON.stringify(value))

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

describe('quiz course picker', () => {
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
    // App loads installed capsules from Dexie asynchronously; the hub swaps its
    // loading state for the greeting once refresh() settles.
    for (let attempt = 0; attempt < 100; attempt += 1) {
      if (normalize(container.textContent).includes('Naimbag nga aldaw')) return
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
      })
    }
    throw new Error('App did not finish loading installed courses')
  }

  function click(element) {
    act(() => {
      element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
  }

  function buttonStartingWith(text) {
    return [...container.querySelectorAll('button')].find((button) =>
      normalize(button.textContent).startsWith(text)
    )
  }

  function buttonContaining(text) {
    return [...container.querySelectorAll('button')].find((button) =>
      normalize(button.textContent).includes(text)
    )
  }

  function normalize(text) {
    return text.replace(/\s+/g, ' ').trim()
  }

  function openQuiz() {
    click(buttonStartingWith('Quiz'))
  }

  test('lists all courses and marks an uninstalled course locked', async () => {
    await removeCapsule('capsule-102')
    await mount()
    openQuiz()

    expect(container.textContent).toContain('Pumili ng kurso')
    expect(container.textContent).toContain('Ligtas na Digital Wallet')
    expect(container.textContent).toContain('Unang Hakbang sa Online Trabaho')

    const card101 = buttonContaining('Ligtas na Digital Wallet')
    expect(card101).toBeTruthy()
    expect(card101.getAttribute('aria-pressed')).toBe('true')

    const lockedCard = buttonContaining('Unang Hakbang sa Online Trabaho')
    expect(lockedCard).toBeTruthy()
    expect(lockedCard.textContent).toContain('I-download sa Aralin')
    expect(lockedCard.querySelector('svg.lucide-lock')).not.toBeNull()
    expect(lockedCard.hasAttribute('disabled')).toBe(false)
  })

  test('starts the course that is selected', async () => {
    await removeCapsule('capsule-102')
    await mount()
    openQuiz()

    click(buttonStartingWith('Isahang Laro'))

    expect(container.textContent).toContain(Q101_CORE)
    expect(container.textContent).not.toContain('Pumili ng kurso')
  })

  test('installing a course unlocks it and its quiz uses its own question bank', async () => {
    await seedCapsule(clone(capsule102))
    await mount()
    openQuiz()

    const card102 = buttonContaining('Unang Hakbang sa Online Trabaho')
    expect(card102.textContent).not.toContain('I-download sa Aralin')
    click(card102)

    expect(buttonContaining('Unang Hakbang sa Online Trabaho').getAttribute('aria-pressed')).toBe(
      'true'
    )
    expect(buttonContaining('Ligtas na Digital Wallet').getAttribute('aria-pressed')).toBe('false')

    click(buttonStartingWith('Isahang Laro'))

    expect(container.textContent).toContain(Q102_CORE)
    expect(container.textContent).not.toContain(Q101_CORE)
  })

  test('restores the last chosen course from storage', async () => {
    await seedCapsule(clone(capsule102))
    localStorage.setItem(STORAGE_KEY, 'capsule-102')
    await mount()
    openQuiz()

    expect(buttonContaining('Unang Hakbang sa Online Trabaho').getAttribute('aria-pressed')).toBe(
      'true'
    )
    expect(buttonContaining('Ligtas na Digital Wallet').getAttribute('aria-pressed')).toBe('false')
  })

  test('falls back to the first installed course without overwriting a stale saved id', async () => {
    await removeCapsule('capsule-102')
    localStorage.setItem(STORAGE_KEY, 'capsule-102')
    await mount()
    openQuiz()

    expect(buttonContaining('Ligtas na Digital Wallet').getAttribute('aria-pressed')).toBe('true')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('capsule-102')
  })

  test('a locked course routes to Aralin and keeps the saved choice', async () => {
    await removeCapsule('capsule-102')
    await mount()
    openQuiz()

    const quizIntro = container.textContent
    expect(quizIntro).toContain('Quiz Arena')

    click(buttonContaining('Unang Hakbang sa Online Trabaho'))

    expect(container.textContent).not.toContain('Quiz Arena')
    expect(container.textContent).toContain('Naimbag nga aldaw')
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
