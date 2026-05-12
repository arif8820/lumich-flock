import { describe, it, expect, vi, beforeEach } from 'vitest'

// Module-level state to control mock return values per test
let _limitResult: unknown[] = []
let _whereNoLimitResult: unknown[] = []

vi.mock('@/lib/db', () => {
  const chain = {
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
    transaction: vi.fn(),
    insert: vi.fn(),
    values: vi.fn(),
  }
  chain.select.mockReturnValue(chain)
  chain.from.mockReturnValue(chain)
  chain.insert.mockReturnValue(chain)
  chain.values.mockReturnValue(Promise.resolve([]))
  chain.transaction.mockImplementation((cb: (tx: unknown) => unknown) => cb(chain))
  // where() must return something awaitable AND support .limit()
  // Reads from module-level vars at call-time (not at factory-time)
  chain.where.mockImplementation(() => {
    const p = Promise.resolve(_whereNoLimitResult)
    // any: attaching .limit to Promise
    ;(p as any).limit = () => Promise.resolve(_limitResult)
    return p
  })
  chain.limit.mockImplementation(() => Promise.resolve(_limitResult))
  return { db: chain }
})

// Mock stock-catalog.service so parseDailyRecordsCsv tests don't need real DB
vi.mock('@/lib/services/stock-catalog.service', () => ({
  getActiveEggItems: vi.fn().mockResolvedValue([]),
  getActiveFeedItems: vi.fn().mockResolvedValue([]),
  getActiveVaccineItems: vi.fn().mockResolvedValue([]),
}))

// Mock schema-factory: return minimal table stubs with the fields we query
vi.mock('@/lib/db/schema-factory', () => ({
  getFarmSchema: vi.fn().mockReturnValue({
    flocks: { id: 'flocks.id' },
    dailyRecords: { id: 'dailyRecords.id', flockId: 'dailyRecords.flock_id', recordDate: 'dailyRecords.record_date' },
    dailyEggRecords: {},
    dailyFeedRecords: {},
    dailyVaccineRecords: {},
    customers: {},
  }),
}))

import * as dbModule from '@/lib/db'
import {
  parseDailyRecordsCsv,
  parseCustomersCsv,
  getCsvTemplate,
} from './import.service'

// any: vitest mock type
const mockDb = dbModule.db as any

function setWhereMock(fn: () => Promise<unknown[]>) {
  mockDb.where.mockImplementation(() => {
    // Capture result once; both awaiting where() and calling .limit() return same result
    let resultP: Promise<unknown[]> | null = null
    const getResult = () => {
      if (!resultP) resultP = fn()
      return resultP
    }
    const p = getResult()
    ;(p as any).limit = () => getResult()
    return p
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  _limitResult = []
  _whereNoLimitResult = []
  // Restore chain after clearAllMocks
  mockDb.select.mockReturnValue(mockDb)
  mockDb.from.mockReturnValue(mockDb)
  mockDb.insert.mockReturnValue(mockDb)
  mockDb.values.mockReturnValue(Promise.resolve([]))
  mockDb.transaction.mockImplementation((cb: (tx: unknown) => unknown) => cb(mockDb))
  mockDb.where.mockImplementation(() => {
    const p = Promise.resolve(_whereNoLimitResult)
    ;(p as any).limit = () => Promise.resolve(_limitResult)
    return p
  })
  mockDb.limit.mockImplementation(() => Promise.resolve(_limitResult))
})

describe('import.service -- parseDailyRecordsCsv', () => {
  const FARM = 'farm1'
  const HEADER = 'flock_id,record_date,deaths,culled,notes\n'

  it('parses a valid row when flock exists and no duplicate', async () => {
    let callCount = 0
    setWhereMock(() => {
      const result = callCount === 0 ? [{ id: 'uuid-flock-1' }] : []
      callCount++
      return Promise.resolve(result)
    })
    const csv = HEADER + 'uuid-flock-1,2026-04-01,2,0,catatan\n'
    const { valid, errors } = await parseDailyRecordsCsv(csv, FARM)
    expect(errors).toHaveLength(0)
    expect(valid[0]!.data.deaths).toBe(2)
    expect(valid[0]!.data.notes).toBe('catatan')
    expect(valid[0]!.data.eggEntries).toEqual([])
    expect(valid[0]!.data.feedEntries).toEqual([])
    expect(valid[0]!.data.vaccineEntries).toEqual([])
  })

  it('rejects missing flock_id', async () => {
    const csv = HEADER + ',2026-04-01,2,0,\n'
    const { errors } = await parseDailyRecordsCsv(csv, FARM)
    expect(errors[0]!.errors[0]).toMatch(/flock_id/)
  })

  it('rejects flock_id not in DB', async () => {
    _limitResult = []
    const csv = HEADER + 'nonexistent-flock,2026-04-01,2,0,\n'
    const { errors } = await parseDailyRecordsCsv(csv, FARM)
    expect(errors[0]!.errors[0]).toMatch(/flock_id/)
  })

  it('parses valid row even if duplicate exists (duplicate check deferred to commitImport)', async () => {
    // Duplicate detection moved from parse to commitImport (unique constraint catch).
    // Parse only validates flock existence and field formats.
    setWhereMock(() => Promise.resolve([{ id: 'uuid-flock-1' }]))
    const csv = HEADER + 'uuid-flock-1,2026-04-01,2,0,\n'
    const { valid, errors } = await parseDailyRecordsCsv(csv, FARM)
    expect(errors).toHaveLength(0)
    expect(valid).toHaveLength(1)
  })

  it('returns empty entries when no dynamic columns are present', async () => {
    let callCount = 0
    setWhereMock(() => {
      const result = callCount === 0 ? [{ id: 'uuid-flock-1' }] : []
      callCount++
      return Promise.resolve(result)
    })
    const csv = HEADER + 'uuid-flock-1,2026-04-01,1,0,\n'
    const { valid } = await parseDailyRecordsCsv(csv, FARM)
    expect(valid[0]!.data.eggEntries).toHaveLength(0)
    expect(valid[0]!.data.feedEntries).toHaveLength(0)
    expect(valid[0]!.data.vaccineEntries).toHaveLength(0)
  })
})

describe('import.service -- parseCustomersCsv', () => {
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

describe('import.service -- getCsvTemplate', () => {
  it('returns header row for customers', () => {
    expect(getCsvTemplate('customers')).toContain('name')
  })
})
