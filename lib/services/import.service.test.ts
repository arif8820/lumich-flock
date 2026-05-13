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

// Mock inventory queries untuk stock balance check
vi.mock('@/lib/db/queries/inventory.queries', () => ({
  getStockBalance: vi.fn().mockResolvedValue(0),
}))

// Mock schema-factory: return minimal table stubs with the fields we query
vi.mock('@/lib/db/schema-factory', () => ({
  getFarmSchema: vi.fn().mockReturnValue({
    flocks: { id: 'flocks.id' },
    dailyRecords: { id: 'dailyRecords.id', flockId: 'dailyRecords.flock_id', recordDate: 'dailyRecords.record_date' },
    dailyEggRecords: {},
    dailyFeedRecords: {},
    dailyVaccineRecords: {},
    inventoryMovements: {},
    customers: {},
  }),
}))

import * as dbModule from '@/lib/db'
import * as inventoryQueries from '@/lib/db/queries/inventory.queries'
import * as stockCatalog from '@/lib/services/stock-catalog.service'
import {
  parseDailyRecordsCsv,
  parseCustomersCsv,
  getCsvTemplate,
  commitImport,
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

describe('import.service -- parseDailyRecordsCsv stock validation', () => {
  const FARM = 'farm1'
  const FLOCK_ID = '00000000-0000-0000-0000-000000000001'

  beforeEach(() => {
    // Flock exists
    setWhereMock(() => Promise.resolve([{ id: FLOCK_ID }]))
  })

  it('passes when feed qtyUsed <= balance (running balance updated)', async () => {
    vi.mocked(stockCatalog.getActiveFeedItems).mockResolvedValue([
      { id: 'feed-1', name: 'Pakan Starter' } as any,
    ])
    vi.mocked(inventoryQueries.getStockBalance).mockResolvedValue(100)

    const header = `flock_id,record_date,deaths,culled,notes,feed_pakan_starter_kg\n`
    const csv = header + `${FLOCK_ID},2026-01-01,0,0,,50\n` + `${FLOCK_ID},2026-01-02,0,0,,40\n`
    const { valid, errors } = await parseDailyRecordsCsv(csv, FARM)
    // row1: balance 100-50=50, row2: balance 50-40=10 → both valid
    expect(errors).toHaveLength(0)
    expect(valid).toHaveLength(2)
  })

  it('returns valid:[] when one row causes negative balance', async () => {
    vi.mocked(stockCatalog.getActiveFeedItems).mockResolvedValue([
      { id: 'feed-1', name: 'Pakan Starter' } as any,
    ])
    vi.mocked(inventoryQueries.getStockBalance).mockResolvedValue(30)

    const header = `flock_id,record_date,deaths,culled,notes,feed_pakan_starter_kg\n`
    // row1: 20 ok (bal→10), row2: 50 > 10 → stock error
    const csv = header + `${FLOCK_ID},2026-01-01,0,0,,20\n` + `${FLOCK_ID},2026-01-02,0,0,,50\n`
    const { valid, errors } = await parseDailyRecordsCsv(csv, FARM)
    expect(valid).toHaveLength(0)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors.some(e => e.errors.some(msg => msg.includes('2026-01-02')))).toBe(true)
    expect(errors.some(e => e.errors.some(msg => msg.includes('tersedia')))).toBe(true)
  })

  it('error message includes tanggal, tersedia, dan dibutuhkan', async () => {
    vi.mocked(stockCatalog.getActiveFeedItems).mockResolvedValue([
      { id: 'feed-1', name: 'Pakan Starter' } as any,
    ])
    vi.mocked(inventoryQueries.getStockBalance).mockResolvedValue(10)

    const header = `flock_id,record_date,deaths,culled,notes,feed_pakan_starter_kg\n`
    const csv = header + `${FLOCK_ID},2026-03-15,0,0,,99\n`
    const { errors } = await parseDailyRecordsCsv(csv, FARM)
    const msg = errors[0]!.errors[0]!
    expect(msg).toContain('2026-03-15')
    expect(msg).toContain('10')   // tersedia
    expect(msg).toContain('99')   // dibutuhkan
    expect(msg).toContain('Pakan Starter')
  })

  it('error message for vaccine includes item name, tersedia, dan dibutuhkan', async () => {
    vi.mocked(stockCatalog.getActiveVaccineItems).mockResolvedValue([
      { id: 'vaccine-1', name: 'Newcastle ND' } as any,
    ])
    vi.mocked(inventoryQueries.getStockBalance).mockResolvedValue(5)

    const header = `flock_id,record_date,deaths,culled,notes,vaccine_newcastle_nd_dosis\n`
    const csv = header + `${FLOCK_ID},2026-03-15,0,0,,20\n`
    const { errors } = await parseDailyRecordsCsv(csv, FARM)
    const msg = errors[0]!.errors[0]!
    expect(msg).toContain('2026-03-15')
    expect(msg).toContain('5')
    expect(msg).toContain('20')
    expect(msg).toContain('Newcastle ND')
  })
})

describe('import.service -- commitImport inventory movements', () => {
  const FARM = 'farm1'
  const ADMIN_ID = 'admin-uuid-1'
  const FLOCK_ID = '00000000-0000-0000-0000-000000000001'
  const DR_ID = 'daily-record-uuid-1'

  beforeEach(() => {
    // INSERT daily_records returns the new record id
    mockDb.values.mockImplementation((vals: unknown) => {
      // First insert (daily_records) returns row with id
      if (Array.isArray(vals) && (vals[0] as any)?.flockId) {
        return { returning: () => Promise.resolve([{ id: DR_ID }]) }
      }
      return Promise.resolve([])
    })
    mockDb.insert.mockReturnValue(mockDb)
    mockDb.returning = vi.fn().mockResolvedValue([{ id: DR_ID }])
  })

  it('inserts inventory_movements for egg (in), feed (out), vaccine (out)', async () => {
    const insertSpy = vi.spyOn(mockDb, 'insert')

    const rows = [{
      rowNum: 2,
      data: {
        flockId: FLOCK_ID,
        recordDate: '2026-01-01',
        deaths: 0,
        culled: 0,
        notes: null,
        eggEntries: [{ stockItemId: 'egg-1', qtyButir: 100, qtyKg: 1.2 }],
        feedEntries: [{ stockItemId: 'feed-1', qtyUsed: 50 }],
        vaccineEntries: [{ stockItemId: 'vax-1', qtyUsed: 10 }],
      },
    }]

    await commitImport('daily_records', rows as any, ADMIN_ID, FARM)

    // inventoryMovements insert should have been called
    const insertCalls = insertSpy.mock.calls
    // At least one call should be to inventoryMovements (the schema stub is {})
    expect(insertCalls.length).toBe(5) // dailyRecords + egg + feed + vax + movements
  })

  it('does not insert movements when all qty = 0', async () => {
    const insertSpy = vi.spyOn(mockDb, 'insert')

    const rows = [{
      rowNum: 2,
      data: {
        flockId: FLOCK_ID,
        recordDate: '2026-01-01',
        deaths: 0,
        culled: 0,
        notes: null,
        eggEntries: [{ stockItemId: 'egg-1', qtyButir: 0, qtyKg: 0 }],
        feedEntries: [{ stockItemId: 'feed-1', qtyUsed: 0 }],
        vaccineEntries: [],
      },
    }]

    await commitImport('daily_records', rows as any, ADMIN_ID, FARM)

    // movements array is empty → insert(inventoryMovements) not called
    // Only dailyRecords insert should have happened (no egg/feed/vax child inserts either)
    const insertCalls = insertSpy.mock.calls
    // Should only be 1 insert: dailyRecords
    expect(insertCalls).toHaveLength(1)
  })
})
