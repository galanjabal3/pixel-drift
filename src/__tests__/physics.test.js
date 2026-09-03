import { describe, it, expect } from 'vitest'
import { Physics } from '../engine/Physics.js'

describe('Physics', () => {
  describe('aabb', () => {
    it('detects overlapping rectangles', () => {
      const result = Physics.aabb(0, 0, 10, 10, 5, 5, 10, 10)
      expect(result).toBe(true)
    })

    it('detects non-overlapping rectangles', () => {
      const result = Physics.aabb(0, 0, 10, 10, 20, 20, 10, 10)
      expect(result).toBe(false)
    })

    it('detects exact edge touching as no collision', () => {
      const result = Physics.aabb(0, 0, 10, 10, 10, 0, 10, 10)
      expect(result).toBe(false)
    })

    it('detects partial overlap', () => {
      const result = Physics.aabb(0, 0, 10, 10, 8, 8, 10, 10)
      expect(result).toBe(true)
    })
  })

  describe('rects', () => {
    it('detects overlapping rect objects', () => {
      const a = { left: 0, right: 10, top: 0, bottom: 10 }
      const b = { left: 5, right: 15, top: 5, bottom: 15 }
      expect(Physics.rects(a, b)).toBe(true)
    })

    it('detects non-overlapping rect objects', () => {
      const a = { left: 0, right: 10, top: 0, bottom: 10 }
      const b = { left: 20, right: 30, top: 20, bottom: 30 }
      expect(Physics.rects(a, b)).toBe(false)
    })

    it('is symmetric', () => {
      const a = { left: 0, right: 10, top: 0, bottom: 10 }
      const b = { left: 5, right: 15, top: 5, bottom: 15 }
      expect(Physics.rects(a, b)).toBe(Physics.rects(b, a))
    })
  })
})
