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
      if (normalize(container.textContent).includes('Kabsat!')) return
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

  function normalize(text) {
    return text.replace(/\s+/g, ' ').trim()
  }

  function openQuiz() {
    click(buttonStartingWith('Quiz'))
  }

  function openPicker() {
    const trigger = container.querySelector('button[aria-haspopup="listbox"]')
    if (trigger && trigger.getAttribute('aria-expanded') !== 'true') {
      click(trigger)
    }
  }

  function courseOption(text) {
    return [...container.querySelectorAll('[role="option"]')].find((el) =>
      normalize(el.textContent).includes(text)
    )
  }

  test('lists only installed courses in dropdown and does not show uninstalled courses', async () => {
    await removeCapsule('capsule-102')
    await mount()
    openQuiz()

    const trigger = container.querySelector('button[aria-haspopup="listbox"]')
    expect(trigger).toBeTruthy()
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.textContent).toContain('Ligtas na Digital Wallet')

    openPicker()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    expect(container.textContent).toContain('Pumili ng kurso')
    expect(container.textContent).toContain('Ligtas na Digital Wallet')
    expect(container.textContent).not.toContain('Unang Hakbang sa Online Trabaho')

    const card101 = courseOption('Ligtas na Digital Wallet')
    expect(card101).toBeTruthy()
    expect(card101.getAttribute('aria-pressed')).toBe('true')

    const uninstalledCard = courseOption('Unang Hakbang sa Online Trabaho')
    expect(uninstalledCard).toBeUndefined()
  })

  test('starts the course that is selected', async () => {
    await removeCapsule('capsule-102')
    await mount()
    openQuiz()

    click(buttonStartingWith('Isahang Laro'))

    expect(container.textContent).toContain(Q101_CORE)
    expect(container.textContent).not.toContain('Pumili ng kurso')
  })

  test('installing a course makes it show up and its quiz uses its own question bank', async () => {
    await seedCapsule(clone(capsule102))
    await mount()
    openQuiz()

    openPicker()
    const card102 = courseOption('Unang Hakbang sa Online Trabaho')
    expect(card102).toBeTruthy()
    click(card102)

    openPicker()
    expect(courseOption('Unang Hakbang sa Online Trabaho').getAttribute('aria-pressed')).toBe(
      'true'
    )
    expect(courseOption('Ligtas na Digital Wallet').getAttribute('aria-pressed')).toBe('false')

    click(buttonStartingWith('Isahang Laro'))

    expect(container.textContent).toContain(Q102_CORE)
    expect(container.textContent).not.toContain(Q101_CORE)
  })

  test('restores the last chosen course from storage', async () => {
    await seedCapsule(clone(capsule102))
    localStorage.setItem(STORAGE_KEY, 'capsule-102')
    await mount()
    openQuiz()

    const trigger = container.querySelector('button[aria-haspopup="listbox"]')
    expect(trigger.textContent).toContain('Unang Hakbang sa Online Trabaho')

    openPicker()
    expect(courseOption('Unang Hakbang sa Online Trabaho').getAttribute('aria-pressed')).toBe(
      'true'
    )
    expect(courseOption('Ligtas na Digital Wallet').getAttribute('aria-pressed')).toBe('false')
  })

  test('falls back to the first installed course without overwriting a stale saved id', async () => {
    await removeCapsule('capsule-102')
    localStorage.setItem(STORAGE_KEY, 'capsule-102')
    await mount()
    openQuiz()

    const trigger = container.querySelector('button[aria-haspopup="listbox"]')
    expect(trigger.textContent).toContain('Ligtas na Digital Wallet')

    openPicker()
    expect(courseOption('Ligtas na Digital Wallet').getAttribute('aria-pressed')).toBe('true')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('capsule-102')
  })

  test('uninstalled courses never show up in the dropdown and no lock icons appear', async () => {
    await removeCapsule('capsule-102')
    await mount()
    openQuiz()

    openPicker()
    const options = container.querySelectorAll('[role="option"]')
    expect(options.length).toBe(1)
    expect(options[0].textContent).toContain('Ligtas na Digital Wallet')
    expect(container.querySelector('[role="listbox"] svg.lucide-lock')).toBeNull()
  })

  test('toggles dropdown open and closed on trigger click', async () => {
    await mount()
    openQuiz()

    const trigger = container.querySelector('button[aria-haspopup="listbox"]')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(container.querySelector('[role="listbox"]')).toBeNull()

    click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(container.querySelector('[role="listbox"]')).not.toBeNull()

    click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(container.querySelector('[role="listbox"]')).toBeNull()
  })

  test('picker does not render Active or Ready badges or questions meta subtitle, and pluralizes course count in Filipino', async () => {
    await seedCapsule(clone(capsule102))
    await mount()
    openQuiz()

    const trigger = container.querySelector('button[aria-haspopup="listbox"]')
    expect(trigger.textContent).not.toMatch(/Aktibo|Active/)

    openPicker()
    expect(trigger.textContent).not.toMatch(/Aktibo|Active/)

    const options = container.querySelectorAll('[role="option"]')
    expect(options.length).toBe(2)
    for (const opt of options) {
      expect(opt.textContent).not.toMatch(/Aktibo|Active|Handa|Ready/)
      expect(opt.textContent).not.toMatch(/tanong|questions/)
    }

    const headerBadge = container.querySelector('[role="listbox"] > div:first-child span.rounded-full')
    expect(headerBadge.textContent.trim()).toBe('2 mga kurso')
  })

  test('picker header count tag renders singular "kurso" when only 1 course installed', async () => {
    await removeCapsule('capsule-102')
    await mount()
    openQuiz()
    openPicker()

    const trigger = container.querySelector('button[aria-haspopup="listbox"]')
    expect(trigger.textContent).not.toMatch(/Aktibo|Active/)

    const options = container.querySelectorAll('[role="option"]')
    expect(options.length).toBe(1)
    expect(options[0].textContent).not.toMatch(/Aktibo|Active|Handa|Ready/)
    expect(options[0].textContent).not.toMatch(/tanong|questions/)

    const headerBadge = container.querySelector('[role="listbox"] > div:first-child span.rounded-full')
    expect(headerBadge.textContent.trim()).toBe('1 kurso')
  })

  test('picker header count tag renders singular "1 course" and plural "2 courses" in English', async () => {
    localStorage.setItem('kabsat_lang', 'en')
    await removeCapsule('capsule-102')
    await mount()
    openQuiz()
    openPicker()

    const trigger = container.querySelector('button[aria-haspopup="listbox"]')
    expect(trigger.textContent).not.toMatch(/Aktibo|Active/)

    let headerBadge = container.querySelector('[role="listbox"] > div:first-child span.rounded-full')
    expect(headerBadge.textContent.trim()).toBe('1 course')

    // Now re-mount with second capsule installed
    act(() => {
      root.unmount()
    })
    container.innerHTML = ''
    await seedCapsule(clone(capsule102))
    localStorage.setItem('kabsat_lang', 'en')
    await mount()
    openQuiz()
    openPicker()

    headerBadge = container.querySelector('[role="listbox"] > div:first-child span.rounded-full')
    expect(headerBadge.textContent.trim()).toBe('2 courses')
  })
})
