import { describe, it, expect, vi } from 'vitest'
import { generateOrderNumber } from './order-number'

describe('generateOrderNumber', () => {
  it('formats with prefix, YYYYMM, and 4-digit padding', () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-04-15'))
    expect(generateOrderNumber('SO', 0)).toBe('SO-202604-0001')
    expect(generateOrderNumber('RTN', 9)).toBe('RTN-202604-0010')
    expect(generateOrderNumber('CN', 999)).toBe('CN-202604-1000')
    vi.useRealTimers()
  })

  it('handles different months correctly', () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-01-01'))
    expect(generateOrderNumber('INV', 0)).toBe('INV-202601-0001')
    vi.useRealTimers()
  })

  it('handles all prefixes', () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-12-31'))
    expect(generateOrderNumber('SO', 0)).toBe('SO-202612-0001')
    expect(generateOrderNumber('RTN', 0)).toBe('RTN-202612-0001')
    expect(generateOrderNumber('INV', 0)).toBe('INV-202612-0001')
    expect(generateOrderNumber('RCP', 0)).toBe('RCP-202612-0001')
    expect(generateOrderNumber('CN', 0)).toBe('CN-202612-0001')
    vi.useRealTimers()
  })

  it('pads sequence to 4 digits', () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-04-15'))
    expect(generateOrderNumber('SO', 9999)).toBe('SO-202604-10000')
    vi.useRealTimers()
  })
})
