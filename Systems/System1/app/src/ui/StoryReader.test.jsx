import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import { I18nProvider } from '../lib/i18n.jsx'
import StoryReader from './StoryReader.jsx'
import { db } from '../lib/capsuleStore.js'

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
})

const sampleCapsule = {
  id: 'capsule-test',
  title: 'Test Capsule',
  competency: 'cyber_safety',
  cards: [
    { id: 'card-1', title: 'Lesson 1', body: 'Lesson 1 Body' },
    { id: 'card-2', title: 'Lesson 2', body: 'Lesson 2 Body' },
    { id: 'card-3', title: 'Lesson 3', body: 'Lesson 3 Body' },
    { id: 'card-4', title: 'Lesson 4', body: 'Lesson 4 Body' },
    { id: 'card-5', title: 'Lesson 5', body: 'Lesson 5 Body' },
    { id: 'card-6', title: 'Lesson 6', body: 'Lesson 6 Body' },
  ],
}

describe('StoryReader page persistence', () => {
  let container
  let root

  beforeEach(async () => {
    localStorage.clear()
    await db.telemetry.clear()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    act(() => {
      root.unmount()
    })
    container.remove()
    localStorage.clear()
    await db.telemetry.clear()
  })

  async function renderReader(capsule = sampleCapsule, onExit = vi.fn()) {
    await act(async () => {
      root.render(
        <I18nProvider initialLang="en">
          <StoryReader capsule={capsule} onExit={onExit} />
        </I18nProvider>
      )
    })
  }

  test('renders at Lesson 1 by default when no progress exists', async () => {
    await renderReader()
    expect(container.textContent).toContain('Lesson 1 of 6')
    expect(container.textContent).toContain('Lesson 1 Body')
  })

  test('renders at saved lesson (e.g., Lesson 3 of 6) when localStorage has saved index 2', async () => {
    localStorage.setItem('kabsat_course_page_capsule-test', '2')
    await renderReader()
    expect(container.textContent).toContain('Lesson 3 of 6')
    expect(container.textContent).toContain('Lesson 3 Body')
  })

  test('clicking "Next Lesson" updates localStorage', async () => {
    await renderReader()
    expect(container.textContent).toContain('Lesson 1 of 6')

    const buttons = Array.from(container.querySelectorAll('button'))
    const nextButton = buttons.find((btn) => btn.textContent.includes('Next Lesson'))
    expect(nextButton).toBeDefined()

    await act(async () => {
      nextButton.click()
    })

    expect(container.textContent).toContain('Lesson 2 of 6')
    expect(localStorage.getItem('kabsat_course_page_capsule-test')).toBe('1')
  })

  test('clicking "Previous" updates localStorage', async () => {
    localStorage.setItem('kabsat_course_page_capsule-test', '2')
    await renderReader()
    expect(container.textContent).toContain('Lesson 3 of 6')

    const buttons = Array.from(container.querySelectorAll('button'))
    const prevButton = buttons.find((btn) => btn.textContent.includes('Previous'))
    expect(prevButton).toBeDefined()

    await act(async () => {
      prevButton.click()
    })

    expect(container.textContent).toContain('Lesson 2 of 6')
    expect(localStorage.getItem('kabsat_course_page_capsule-test')).toBe('1')
  })

  test('clicking "Finish Course" marks course completed, logs event, resets bookmark to 0 and calls onExit', async () => {
    const onExit = vi.fn()
    // Start at last card (index 5)
    localStorage.setItem('kabsat_course_page_capsule-test', '5')
    await renderReader(sampleCapsule, onExit)

    expect(container.textContent).toContain('Lesson 6 of 6')

    const buttons = Array.from(container.querySelectorAll('button'))
    const finishButton = buttons.find((btn) => btn.textContent.includes('Finish Course'))
    expect(finishButton).toBeDefined()

    await act(async () => {
      finishButton.click()
    })

    expect(onExit).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem('kabsat_course_completed_capsule-test')).toBe('true')
    expect(localStorage.getItem('kabsat_course_page_capsule-test')).toBe('0')

    const events = await db.telemetry.toArray()
    const completedEvent = events.find((e) => e.type === 'course_completed')
    expect(completedEvent).toBeDefined()
    expect(completedEvent.capsuleId).toBe('capsule-test')
    expect(completedEvent.competency).toBe('cyber_safety')
  })

  test('clicking "Back" button preserves saved progress and calls onExit', async () => {
    const onExit = vi.fn()
    localStorage.setItem('kabsat_course_page_capsule-test', '3')
    await renderReader(sampleCapsule, onExit)

    expect(container.textContent).toContain('Lesson 4 of 6')

    const buttons = Array.from(container.querySelectorAll('button'))
    const backButton = buttons.find((btn) => btn.textContent.includes('Back'))
    expect(backButton).toBeDefined()

    await act(async () => {
      backButton.click()
    })

    expect(onExit).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem('kabsat_course_page_capsule-test')).toBe('3')
  })

  test('completing a red-flag drill updates localStorage and advances page', async () => {
    const capsuleWithDrill = {
      id: 'capsule-drill',
      title: 'Drill Capsule',
      cards: [
        {
          id: 'card-d1',
          title: 'Drill Lesson',
          body: 'Pay attention to red flags',
          drill: {
            prompt: 'Select the suspicious item',
            hint: 'Look for urgent requests',
            segments: [
              { text: 'Safe message', flag: false },
              { text: 'Send money now!', flag: true },
            ],
          },
        },
        {
          id: 'card-d2',
          title: 'Next Lesson',
          body: 'Safe practices',
        },
      ],
    }

    await renderReader(capsuleWithDrill)
    expect(container.textContent).toContain('Lesson 1 of 2')

    // Find and click the red flag segment
    const buttons = Array.from(container.querySelectorAll('button'))
    const flagSegment = buttons.find((btn) => btn.textContent.includes('Send money now!'))
    expect(flagSegment).toBeDefined()

    await act(async () => {
      flagSegment.click()
    })

    // Now continue button should be enabled
    const continueButton = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent.includes('Continue Lesson')
    )
    expect(continueButton).toBeDefined()
    expect(continueButton.disabled).toBe(false)

    await act(async () => {
      continueButton.click()
    })

    expect(container.textContent).toContain('Lesson 2 of 2')
    expect(localStorage.getItem('kabsat_course_page_capsule-drill')).toBe('1')
  })

  test('clicking unlocked progress segment navigates to that card', async () => {
    // Start at Lesson 3 (index 2) so lessons 1, 2, and 3 are unlocked/blue
    localStorage.setItem('kabsat_course_page_capsule-test', '2')
    await renderReader()

    expect(container.textContent).toContain('Lesson 3 of 6')

    // Find progress segment for Lesson 1 (index 0)
    const segment1 = container.querySelector('button[data-progress-segment="0"]')
    expect(segment1).not.toBeNull()
    expect(segment1.getAttribute('data-unlocked')).toBe('true')

    await act(async () => {
      segment1.click()
    })

    expect(container.textContent).toContain('Lesson 1 of 6')
    expect(container.textContent).toContain('Lesson 1 Body')
    expect(localStorage.getItem('kabsat_course_page_capsule-test')).toBe('0')
  })

  test('clicking uncompleted white progress segment shows top popup notification and prevents navigation', async () => {
    // Start at Lesson 1 (index 0). Lessons 2-6 are uncompleted/white
    await renderReader()
    expect(container.textContent).toContain('Lesson 1 of 6')

    // Click segment for Lesson 4 (index 3)
    const segment4 = container.querySelector('button[data-progress-segment="3"]')
    expect(segment4).not.toBeNull()
    expect(segment4.getAttribute('data-unlocked')).toBe('false')

    await act(async () => {
      segment4.click()
    })

    // Navigation did not happen
    expect(container.textContent).toContain('Lesson 1 of 6')
    expect(container.textContent).not.toContain('Lesson 4 Body')

    // Top popup notification appears with in-animation
    const popup = container.querySelector('.animate-toast-down')
    expect(popup).not.toBeNull()
    expect(popup.textContent).toContain('This page is still not completed.')

    // Close button dismisses popup with out-animation
    const closeBtn = popup.querySelector('button')
    expect(closeBtn).not.toBeNull()

    act(() => {
      closeBtn.click()
    })

    expect(container.querySelector('.animate-toast-down-out')).not.toBeNull()

    // Unmounts once exit animation duration finishes
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 60))
    })
    expect(container.querySelector('.animate-toast-down-out')).toBeNull()
  })
})
