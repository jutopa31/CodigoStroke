import { describe, it, expect } from 'vitest'
import { getNihssSeverity, nihssItems } from './nihss'

describe('getNihssSeverity', () => {
  it('score 0 → sin déficit', () => {
    expect(getNihssSeverity(0).label).toBe('Sin déficit')
  })

  it('scores 1–4 → leve', () => {
    for (const score of [1, 2, 3, 4]) {
      expect(getNihssSeverity(score).label).toBe('Leve')
    }
  })

  it('scores 5–15 → moderado', () => {
    for (const score of [5, 10, 15]) {
      expect(getNihssSeverity(score).label).toBe('Moderado')
    }
  })

  it('scores 16–20 → moderado-severo', () => {
    for (const score of [16, 18, 20]) {
      expect(getNihssSeverity(score).label).toBe('Moderado-severo')
    }
  })

  it('scores 21–42 → severo', () => {
    for (const score of [21, 30, 42]) {
      expect(getNihssSeverity(score).label).toBe('Severo')
    }
  })

  it('returns an object with label, color, bg, and border keys', () => {
    const result = getNihssSeverity(10)
    expect(result).toHaveProperty('label')
    expect(result).toHaveProperty('color')
    expect(result).toHaveProperty('bg')
    expect(result).toHaveProperty('border')
  })
})

describe('nihssItems', () => {
  it('has exactly 15 items (standard NIHSS)', () => {
    expect(nihssItems).toHaveLength(15)
  })

  it('every item has an id, label, and at least 2 options', () => {
    for (const item of nihssItems) {
      expect(item.id).toBeTruthy()
      expect(item.label).toBeTruthy()
      expect(item.options.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('every option has a numeric score and a text description', () => {
    for (const item of nihssItems) {
      for (const opt of item.options) {
        expect(typeof opt.score).toBe('number')
        expect(opt.text).toBeTruthy()
      }
    }
  })

  it('all option scores start at 0 and are non-negative', () => {
    for (const item of nihssItems) {
      const scores = item.options.map((o) => o.score)
      expect(Math.min(...scores)).toBe(0)
    }
  })

  it('maximum possible total score is 42', () => {
    const maxScore = nihssItems.reduce((sum, item) => {
      return sum + Math.max(...item.options.map((o) => o.score))
    }, 0)
    expect(maxScore).toBe(42)
  })
})
