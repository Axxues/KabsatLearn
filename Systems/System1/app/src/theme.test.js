import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

const SRC = path.dirname(fileURLToPath(import.meta.url))
const INDEX_CSS = path.join(SRC, 'index.css')

describe('dark mode Facebook color palette', () => {
  const css = fs.readFileSync(INDEX_CSS, 'utf8')
  const darkMatch = css.match(/\[data-theme="dark"\]\s*\{([^}]+)\}/)

  test('declares a [data-theme="dark"] block in index.css', () => {
    expect(darkMatch).not.toBeNull()
  })

  const darkTokens = {}
  if (darkMatch) {
    for (const line of darkMatch[1].split(';')) {
      const [key, val] = line.split(':').map((s) => s.trim())
      if (key && val) {
        darkTokens[key] = val
      }
    }
  }

  test('uses Facebook dark mode canvas background #18191a', () => {
    expect(darkTokens['--color-bg']?.toLowerCase()).toBe('#18191a')
  })

  test('uses Facebook dark mode surface #242526', () => {
    expect(darkTokens['--color-surface']?.toLowerCase()).toBe('#242526')
  })

  test('uses Facebook dark mode surface hover #3a3b3c', () => {
    expect(darkTokens['--color-surface-hover']?.toLowerCase()).toBe('#3a3b3c')
  })

  test('uses Facebook dark mode primary text #e4e6eb and secondary text #b0b3b8', () => {
    expect(darkTokens['--color-ink']?.toLowerCase()).toBe('#e4e6eb')
    expect(darkTokens['--color-muted']?.toLowerCase()).toBe('#b0b3b8')
  })

  test('uses Facebook dark mode divider line #393a3b', () => {
    expect(darkTokens['--color-line']?.toLowerCase()).toBe('#393a3b')
  })

  test('uses Facebook dark mode primary blue accent #2d88ff', () => {
    expect(darkTokens['--color-accent']?.toLowerCase()).toBe('#2d88ff')
  })

  test('uses Facebook dark mode status colors (green #31a24c, yellow #f7b125, red #fa383e)', () => {
    expect(darkTokens['--color-good']?.toLowerCase()).toBe('#31a24c')
    expect(darkTokens['--color-warn']?.toLowerCase()).toBe('#f7b125')
    expect(darkTokens['--color-danger']?.toLowerCase()).toBe('#fa383e')
  })
})
