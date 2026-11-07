import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

const SRC = path.dirname(fileURLToPath(import.meta.url))
const EMOJI = /\p{Extended_Pictographic}/u

function sourceFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules') sourceFiles(full, out)
    } else if (/\.(js|jsx)$/.test(entry.name)) {
      out.push(full)
    }
  }
  return out
}

describe('source emoji scan', () => {
  test('no .js or .jsx file under src contains an emoji', () => {
    const offenders = []

    for (const file of sourceFiles(SRC)) {
      fs.readFileSync(file, 'utf8')
        .split(/\r?\n/)
        .forEach((line, index) => {
          if (EMOJI.test(line)) {
            offenders.push(`${path.relative(SRC, file)}:${index + 1}: ${line.trim()}`)
          }
        })
    }

    expect(offenders).toEqual([])
  })
})
