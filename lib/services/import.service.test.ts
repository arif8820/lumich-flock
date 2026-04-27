import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/db', () => ({
  db: {
    transaction: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
  },
}))

import {
  parseFlockscsv,
  parseDailyRecordsCsv,
  parseCustomersCsv,
  parseOpeningStockCsv,
  getCsvTemplate,
} from './import.service'

describe('import.service — parseFlockscsv', () => {
  const HEADER = 'coop_id,name,arrival_date,initial_count,breed,notes\n'

  it('parses a valid row', () => {
    const csv = HEADER + 'uuid-coop-1,Flock A,2026-01-01,5000,Isa Brown,test\n'
    const { valid, errors } = parseFlockscsv(csv)
    expect(errors).toHaveLength(0)
    expect(valid).toHaveLength(1)
    expect(valid[0]!.data.name).toBe('Flock A')
    expect(valid[0]!.data.initialCount).toBe(5000)
  })

  it('rejects missing coop_id', () => {
    const csv = HEADER + ',Flock A,2026-01-01,5000,,\n'
    const { errors } = parseFlockscsv(csv)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0]!.errors[0]).toMatch(/coop_id/)
  })

  it('rejects invalid date', () => {
    const csv = HEADER + 'uuid-coop-1,Flock A,not-a-date,5000,,\n'
    const { errors } = parseFlockscsv(csv)
    expect(errors[0]!.errors[0]).toMatch(/arrival_date/)
  })

  it('rejects zero initial_count', () => {
    const csv = HEADER + 'uuid-coop-1,Flock A,2026-01-01,0,,\n'
    const { errors } = parseFlockscsv(csv)
    expect(errors[0]!.errors.some((e) => e.includes('initial_count'))).toBe(true)
  })

  it('separates valid and error rows', () => {
    const csv =
      HEADER +
      'uuid-coop-1,Flock A,2026-01-01,5000,,\n' +
      ',Invalid Row,,0,,\n'
    const { valid, errors } = parseFlockscsv(csv)
    expect(valid).toHaveLength(1)
    expect(errors).toHaveLength(1)
  })
})

describe('import.service — parseDailyRecordsCsv', () => {
  const HEADER = 'flock_id,record_date,deaths,culled,eggs_grade_a,eggs_grade_b,eggs_cracked,eggs_abnormal,avg_weight_kg,feed_kg\n'

  it('parses a valid row', () => {
    const csv = HEADER + 'uuid-flock-1,2026-04-01,2,0,4000,200,10,5,1.8,120\n'
    const { valid, errors } = parseDailyRecordsCsv(csv)
    expect(errors).toHaveLength(0)
    expect(valid[0]!.data.eggsGradeA).toBe(4000)
    expect(valid[0]!.data.feedKg).toBe('120')
  })

  it('rejects missing flock_id', () => {
    const csv = HEADER + ',2026-04-01,2,0,4000,200,10,5,,\n'
    const { errors } = parseDailyRecordsCsv(csv)
    expect(errors[0]!.errors[0]).toMatch(/flock_id/)
  })
})

describe('import.service — parseCustomersCsv', () => {
  const HEADER = 'name,type,phone,address,credit_limit,payment_terms\n'

  it('parses a valid row', () => {
    const csv = HEADER + 'Budi Santoso,wholesale,08123,Jl. Merdeka,5000000,30\n'
    const { valid, errors } = parseCustomersCsv(csv)
    expect(errors).toHaveLength(0)
    expect(valid[0]!.data.name).toBe('Budi Santoso')
    expect(valid[0]!.data.type).toBe('wholesale')
  })

  it('rejects invalid customer type', () => {
    const csv = HEADER + 'Budi Santoso,unknown,,,,\n'
    const { errors } = parseCustomersCsv(csv)
    expect(errors[0]!.errors.some((e) => e.includes('type'))).toBe(true)
  })
})

describe('import.service — parseOpeningStockCsv', () => {
  const HEADER = 'flock_id,grade,quantity,movement_date\n'

  it('parses a valid row', () => {
    const csv = HEADER + 'uuid-flock-1,A,10000,2026-01-01\n'
    const { valid, errors } = parseOpeningStockCsv(csv)
    expect(errors).toHaveLength(0)
    expect(valid[0]!.data.grade).toBe('A')
    expect(valid[0]!.data.quantity).toBe(10000)
  })

  it('rejects invalid grade', () => {
    const csv = HEADER + 'uuid-flock-1,C,10000,2026-01-01\n'
    const { errors } = parseOpeningStockCsv(csv)
    expect(errors[0]!.errors.some((e) => e.includes('grade'))).toBe(true)
  })

  it('rejects zero quantity', () => {
    const csv = HEADER + 'uuid-flock-1,A,0,2026-01-01\n'
    const { errors } = parseOpeningStockCsv(csv)
    expect(errors[0]!.errors.some((e) => e.includes('quantity'))).toBe(true)
  })
})

describe('import.service — getCsvTemplate', () => {
  it('returns header row for each entity', () => {
    expect(getCsvTemplate('flocks')).toContain('coop_id')
    expect(getCsvTemplate('daily_records')).toContain('flock_id')
    expect(getCsvTemplate('customers')).toContain('name')
    expect(getCsvTemplate('opening_stock')).toContain('grade')
  })
})
