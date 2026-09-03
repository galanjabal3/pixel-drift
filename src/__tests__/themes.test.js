import { describe, it, expect } from 'vitest'
import { createTheme, themes } from '../config/themes.js'
import { defaultTheme } from '../config/theme.js'

describe('createTheme', () => {
  it('returns default theme when no partial provided', () => {
    const theme = createTheme()
    expect(theme).toEqual(defaultTheme)
  })

  it('overrides top-level properties', () => {
    const theme = createTheme({ mode: 'dark' })
    expect(theme.mode).toBe('dark')
    expect(theme.accent).toBe(defaultTheme.accent)
  })

  it('merges nested bg colors', () => {
    const theme = createTheme({ bg: { top: '#000000' } })
    expect(theme.bg.top).toBe('#000000')
    expect(theme.bg.mid).toBe(defaultTheme.bg.mid)
  })

  it('merges nested brand colors', () => {
    const theme = createTheme({ brand: { title: 'CUSTOM' } })
    expect(theme.brand.title).toBe('CUSTOM')
    expect(theme.brand.glow).toBe(defaultTheme.brand.glow)
  })
})

describe('themes', () => {
  it('contains all preset themes', () => {
    expect(themes.default).toBeDefined()
    expect(themes.dark).toBeDefined()
    expect(themes.light).toBeDefined()
    expect(themes['sobat-pintar']).toBeDefined()
    expect(themes.kantin).toBeDefined()
  })

  it('each theme has required properties', () => {
    for (const [name, theme] of Object.entries(themes)) {
      expect(theme).toHaveProperty('mode')
      expect(theme).toHaveProperty('accent')
      expect(theme).toHaveProperty('bg')
      expect(theme).toHaveProperty('brand')
      expect(theme).toHaveProperty('core')
      expect(theme).toHaveProperty('trail')
    }
  })
})
