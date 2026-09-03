import { describe, it, expect } from 'vitest'
import { Player } from '../entities/Player.js'

describe('Player', () => {
  const defaults = {
    x: 50,
    ground: 400,
    minAlt: 50,
    maxAlt: 350,
    cell: 4,
    startY: 340,
  }

  it('initializes with correct defaults', () => {
    const p = new Player(defaults)
    expect(p.x).toBe(50)
    expect(p.py).toBe(340)
    expect(p.vy).toBe(0)
    expect(p.holding).toBe(false)
    expect(p.shield).toBe(false)
  })

  it('reset restores initial state', () => {
    const p = new Player(defaults)
    p.py = 100
    p.vy = -200
    p.holding = true
    p.shield = true
    p.reset()
    expect(p.py).toBe(defaults.startY)
    expect(p.vy).toBe(0)
    expect(p.holding).toBe(false)
    expect(p.shield).toBe(false)
  })

  it('update moves up when holding', () => {
    const p = new Player(defaults)
    p.holding = true
    const startY = p.py
    p.update(0.016)
    expect(p.py).toBeLessThan(startY)
  })

  it('update moves down when not holding', () => {
    const p = new Player(defaults)
    p.py = defaults.minAlt + 50
    p.holding = false
    const startY = p.py
    p.update(0.016)
    expect(p.py).toBeGreaterThan(startY)
  })

  it('clamp to minAlt boundary', () => {
    const p = new Player(defaults)
    p.py = defaults.minAlt + 1
    p.vy = -300
    p.holding = true
    p.update(1)
    expect(p.py).toBe(defaults.minAlt)
  })

  it('clamp to maxAlt boundary', () => {
    const p = new Player(defaults)
    p.py = defaults.maxAlt - 1
    p.vy = 300
    p.holding = false
    p.update(1)
    expect(p.py).toBe(defaults.maxAlt)
  })

  it('hitbox returns correct dimensions', () => {
    const p = new Player(defaults)
    const h = p.hitbox()
    expect(h.left).toBeLessThan(h.right)
    expect(h.top).toBeLessThan(h.bottom)
    expect(h.left).toBe(defaults.x - (6 * defaults.cell - 4))
    expect(h.right).toBe(defaults.x + (6 * defaults.cell - 4))
  })
})
