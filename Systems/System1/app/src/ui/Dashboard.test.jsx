import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { I18nProvider } from '../lib/i18n.jsx'
import Dashboard from './Dashboard.jsx'
import { db, seedCapsule } from '../lib/capsuleStore.js'
import { queueEvent } from '../lib/telemetry.js'
import capsule101 from '../data/capsules/capsule-101.json'
import capsule102 from '../data/capsules/capsule-102.json'

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
})

describe('Dashboard Mastery by Competency', () => {
  let container
  let root

  beforeEach(async () => {
    localStorage.clear()
    await db.capsules.clear()
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
    await db.capsules.clear()
    await db.telemetry.clear()
  })

  async function renderDashboard(capsules) {
    await act(async () => {
      root.render(
        <I18nProvider>
          <Dashboard capsules={capsules} />
        </I18nProvider>
      )
    })
    // Give async Dexie queries time to resolve
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })
  }

  test('only displays competencies for downloaded courses (capsule-101 only)', async () => {
    await seedCapsule(capsule101)
    await renderDashboard([{ id: 'capsule-101', installed: true }])

    const masterySection = container.querySelector('section[aria-labelledby="mastery-heading"]')
    expect(masterySection).not.toBeNull()

    const text = masterySection.textContent
    // Capsule 101 teaches Cyber safety and Financial literacy
    expect(text).toContain('Cyber safety')
    expect(text).toContain('Financial literacy')

    // Not-downloaded courses competencies should NOT be displayed
    expect(text).not.toContain('Digital livelihood')
    expect(text).not.toContain('Disaster readiness')
    expect(text).not.toContain('Digital literacy')
    expect(text).not.toContain('Family planning')
    expect(text).not.toContain('Business operations')
  })

  test('displays additional competency when another course is downloaded', async () => {
    await seedCapsule(capsule101)
    await seedCapsule(capsule102)
    await renderDashboard([
      { id: 'capsule-101', installed: true },
      { id: 'capsule-102', installed: true },
    ])

    const masterySection = container.querySelector('section[aria-labelledby="mastery-heading"]')
    const text = masterySection.textContent

    expect(text).toContain('Cyber safety')
    expect(text).toContain('Financial literacy')
    expect(text).toContain('Digital livelihood')

    // Still not downloaded:
    expect(text).not.toContain('Disaster readiness')
    expect(text).not.toContain('Digital literacy')
    expect(text).not.toContain('Family planning')
    expect(text).not.toContain('Business operations')
  })

  test('displays telemetry mastery percentage for downloaded course competencies', async () => {
    await seedCapsule(capsule101)
    await queueEvent({ type: 'answer', competency: 'cyber_safety', correct: true })
    await queueEvent({ type: 'answer', competency: 'cyber_safety', correct: false })

    await renderDashboard([{ id: 'capsule-101', installed: true }])

    const masterySection = container.querySelector('section[aria-labelledby="mastery-heading"]')
    expect(masterySection.textContent).toContain('50%')
  })
})
