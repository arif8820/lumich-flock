import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    transaction: vi.fn(),
  },
}))

vi.mock('@/lib/db/queries/correction-record.queries', () => ({
  insertCorrectionRecord: vi.fn(),
}))

import { canEdit, assertCanEdit, isLocked } from './lock-period.service'

const NOW = new Date('2026-04-27T10:00:00Z')

function daysAgo(n: number): Date {
  const d = new Date(NOW)
  d.setUTCDate(d.getUTCDate() - n)
  return d
}

describe('lock-period.service — canEdit', () => {
  it('admin can always edit', () => {
    expect(canEdit(daysAgo(100), 'admin', NOW)).toBe(true)
    expect(canEdit(daysAgo(0), 'admin', NOW)).toBe(true)
  })

  it('operator: can edit H+0', () => {
    expect(canEdit(daysAgo(0), 'operator', NOW)).toBe(true)
  })

  it('operator: can edit H+1', () => {
    expect(canEdit(daysAgo(1), 'operator', NOW)).toBe(true)
  })

  it('operator: cannot edit H+2', () => {
    expect(canEdit(daysAgo(2), 'operator', NOW)).toBe(false)
  })

  it('supervisor: can edit H+7', () => {
    expect(canEdit(daysAgo(7), 'supervisor', NOW)).toBe(true)
  })

  it('supervisor: cannot edit H+8', () => {
    expect(canEdit(daysAgo(8), 'supervisor', NOW)).toBe(false)
  })
})

describe('lock-period.service — assertCanEdit', () => {
  it('throws for locked record (operator, 2 days ago)', () => {
    expect(() => assertCanEdit(daysAgo(2), 'operator', NOW)).toThrow(/H\+1/)
  })

  it('throws for locked record (supervisor, 8 days ago)', () => {
    expect(() => assertCanEdit(daysAgo(8), 'supervisor', NOW)).toThrow(/H\+7/)
  })

  it('does not throw for admin regardless', () => {
    expect(() => assertCanEdit(daysAgo(365), 'admin', NOW)).not.toThrow()
  })
})

describe('lock-period.service — isLocked', () => {
  it('returns false when canEdit is true', () => {
    expect(isLocked(daysAgo(0), 'operator', NOW)).toBe(false)
  })

  it('returns true when canEdit is false', () => {
    expect(isLocked(daysAgo(5), 'operator', NOW)).toBe(true)
  })
})
