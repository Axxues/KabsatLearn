import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import App from './App.jsx'

vi.mock('./lib/llm.js', () => ({
  engineReady: vi.fn(() => true),
  isModelCached: vi.fn(async () => true),
  loadEngine: vi.fn(async () => ({})),
  explain: vi.fn(async () => ({ ok: true, text: 'Huwag maniwala sa pekeng ayuda.' })),
}))

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

describe('Kabsat AI ongoing query and rotating icon', () => {
  let container
  let root

  beforeEach(async () => {
    localStorage.clear()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    await act(async () => {
      root.render(<App />)
    })
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    vi.useRealTimers()
  })

  function buttonStartingWith(text) {
    return [...container.querySelectorAll('button')].find((button) =>
      button.textContent.replace(/\s+/g, ' ').trim().startsWith(text),
    )
  }

  function click(element) {
    act(() => {
      element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
  }

  test('Kabsat AI icon rotates during ongoing query even when navigated to another page, and query does not get interrupted', async () => {
    vi.useFakeTimers()

    // 1. Navigate to Kabsat AI tab
    const aiNavBtn = buttonStartingWith('Kabsat AI')
    expect(aiNavBtn).not.toBeNull()
    click(aiNavBtn)

    // Verify we are on Kabsat AI page
    expect(container.textContent).toContain('Kabsat AI')

    // Find the tutor nav icon SVG
    const getAiIcon = () => {
      const btn = buttonStartingWith('Kabsat AI')
      return btn ? btn.querySelector('svg') : null
    }

    expect(getAiIcon()).not.toBeNull()
    // Initially not rotating
    expect(getAiIcon().className.baseVal || getAiIcon().getAttribute('class')).not.toContain('animate-spin')

    // 2. Click a quick prompt chip to trigger a query
    const chip = [...container.querySelectorAll('main button')].find((b) =>
      b.textContent.includes('Sino ka'),
    )
    expect(chip).not.toBeNull()
    click(chip)

    // 3. Immediately, query is processing: the icon must be rotating
    const iconWhileProcessing = getAiIcon()
    const iconClass = iconWhileProcessing.className.baseVal || iconWhileProcessing.getAttribute('class')
    expect(iconClass).toContain('animate-spin')

    // 4. Move to another page while query is still processing (e.g. Courses / Aralin)
    const coursesNavBtn = buttonStartingWith('Aralin')
    expect(coursesNavBtn).not.toBeNull()
    click(coursesNavBtn)

    // Verify we are now on the Courses page
    expect(container.textContent).toContain('Aralin')

    // 5. On the Courses page, the Kabsat AI icon in the bottom nav must STILL be rotating!
    const aiIconOnCoursesPage = getAiIcon()
    expect(aiIconOnCoursesPage).not.toBeNull()
    const aiIconClassOnCourses = aiIconOnCoursesPage.className.baseVal || aiIconOnCoursesPage.getAttribute('class')
    expect(aiIconClassOnCourses).toContain('animate-spin')

    // 6. Fast-forward timers for the query to finish in the background
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500)
    })

    // 7. Once finished, icon should stop rotating
    const aiIconFinished = getAiIcon()
    const finishedClass = aiIconFinished.className.baseVal || aiIconFinished.getAttribute('class')
    expect(finishedClass).not.toContain('animate-spin')

    // 8. Return to Kabsat AI page: the query must NOT have been interrupted, answer must be present
    click(buttonStartingWith('Kabsat AI'))
    expect(container.textContent).toContain('Sino ka?')
    expect(container.textContent).toMatch(/Ako si Kabsat/i)
  })

  test('form submission disables send button while processing and preserves query when navigating to Quiz', async () => {
    vi.useFakeTimers()

    // Navigate to Kabsat AI
    click(buttonStartingWith('Kabsat AI'))

    const input = container.querySelector('input#ask')
    expect(input).not.toBeNull()

    // Type a question
    act(() => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
      nativeSetter.call(input, 'May nagtext ng ayuda totoo ba')
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })

    const form = container.querySelector('form')
    expect(form).not.toBeNull()

    // Submit form
    act(() => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })

    // Button should now be replaced by Stop button while processing
    const stopBtn = form.querySelector('button')
    expect(stopBtn).not.toBeNull()
    expect(stopBtn.textContent).toMatch(/Stop|Itigil/)

    // Tutor icon is rotating
    const getAiIcon = () => buttonStartingWith('Kabsat AI')?.querySelector('svg')
    expect(getAiIcon().className.baseVal || getAiIcon().getAttribute('class')).toContain('animate-spin')

    // Navigate to Quiz page
    click(buttonStartingWith('Quiz'))
    expect(container.textContent).toContain('Quiz')

    // Rotating icon still visible on Quiz page
    expect(getAiIcon().className.baseVal || getAiIcon().getAttribute('class')).toContain('animate-spin')

    // Finish query in background
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500)
    })

    // Finished
    expect(getAiIcon().className.baseVal || getAiIcon().getAttribute('class')).not.toContain('animate-spin')

    // Return to Kabsat AI
    click(buttonStartingWith('Kabsat AI'))
    expect(container.textContent).toContain('May nagtext ng ayuda totoo ba')
  })
})
