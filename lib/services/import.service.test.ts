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

import * as dbModule from '@/lib/db'
import {
  parseFlockscsv,
  parseDailyRecordsCsv,
  parseCustomersCsv,
  parseOpeningStockCsv,
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

describe('import.service -- parseFlockscsv', () => {
  const HEADER = 'coop_id,name,arrival_date,quantity,breed,notes\n'

  it('parses a valid row when coop exists', async () => {
    _limitResult = [{ id: 'uuid-coop-1' }]
    const csv = HEADER + 'uuid-coop-1,Flock A,2026-01-01,5000,Isa Brown,test\n'
    const { valid, errors } = await parseFlockscsv(csv)
    expect(errors).toHaveLength(0)
    expect(valid).toHaveLength(1)
    expect(valid[0]!.data.name).toBe('Flock A')
    expect(valid[0]!.data.quantity).toBe(5000)
  })

  it('rejects missing coop_id', async () => {
    const csv = HEADER + ',Flock A,2026-01-01,5000,,\n'
    const { errors } = await parseFlockscsv(csv)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0]!.errors[0]).toMatch(/coop_id/)
  })

  it('rejects coop_id not in DB', async () => {
    _limitResult = []
    const csv = HEADER + 'nonexistent,Flock A,2026-01-01,5000,,\n'
    const { errors } = await parseFlockscsv(csv)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0]!.errors[0]).toMatch(/coop_id/)
  })

  it('rejects invalid date', async () => {
    _limitResult = [{ id: 'uuid-coop-1' }]
    const csv = HEADER + 'uuid-coop-1,Flock A,not-a-date,5000,,\n'
    const { errors } = await parseFlockscsv(csv)
    expect(errors[0]!.errors[0]).toMatch(/arrival_date/)
  })

  it('rejects zero quantity', async () => {
    _limitResult = [{ id: 'uuid-coop-1' }]
    const csv = HEADER + 'uuid-coop-1,Flock A,2026-01-01,0,,\n'
    const { errors } = await parseFlockscsv(csv)
    expect(errors[0]!.errors.some((e) => e.includes('quantity'))).toBe(true)
  })

  it('separates valid and error rows', async () => {
    _limitResult = [{ id: 'uuid-coop-1' }]
    const csv =
      HEADER +
      'uuid-coop-1,Flock A,2026-01-01,5000,,\n' +
      ',Invalid Row,,0,,\n'
    const { valid, errors } = await parseFlockscsv(csv)
    expect(valid).toHaveLength(1)
    expect(errors).toHaveLength(1)
  })
})

describe('import.service -- parseDailyRecordsCsv', () => {
  const HEADER = 'flock_id,record_date,deaths,culled,eggs_cracked,eggs_abnormal\n'

  it('parses a valid row when flock exists and no duplicate', async () => {
    let callCount = 0
    setWhereMock(() => {
      const result = callCount === 0 ? [{ id: 'uuid-flock-1' }] : []
      callCount++
      return Promise.resolve(result)
    })
    const csv = HEADER + 'uuid-flock-1,2026-04-01,2,0,10,5\n'
    const { valid, errors } = await parseDailyRecordsCsv(csv)
    expect(errors).toHaveLength(0)
    expect(valid[0]!.data.deaths).toBe(2)
    expect(valid[0]!.data.eggsCracked).toBe(10)
    expect(valid[0]!.data.eggsAbnormal).toBe(5)
  })

  it('rejects missing flock_id', async () => {
    const csv = HEADER + ',2026-04-01,2,0,,\n'
    const { errors } = await parseDailyRecordsCsv(csv)
    expect(errors[0]!.errors[0]).toMatch(/flock_id/)
  })

  it('rejects flock_id not in DB', async () => {
    _limitResult = []
    const csv = HEADER + 'nonexistent-flock,2026-04-01,2,0,,\n'
    const { errors } = await parseDailyRecordsCsv(csv)
    expect(errors[0]!.errors[0]).toMatch(/flock_id/)
  })

  it('rejects duplicate (flockId, recordDate)', async () => {
    let callCount = 0
    setWhereMock(() => {
      const result = callCount === 0 ? [{ id: 'uuid-flock-1' }] : [{ id: 'existing-record' }]
      callCount++
      return Promise.resolve(result)
    })
    const csv = HEADER + 'uuid-flock-1,2026-04-01,2,0,,\n'
    const { errors } = await parseDailyRecordsCsv(csv)
    expect(errors[0]!.errors[0]).toMatch(/sudah ada/)
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

describe('import.service -- parseOpeningStockCsv', () => {
  const HEADER = 'stock_item_id,quantity,movement_date\n'

  it('parses a valid row when stock item exists and no prior import', async () => {
    let callCount = 0
    setWhereMock(() => {
      // first call: stockItems lookup → found; second call: existing import count → 0
      const result = callCount === 0 ? [{ id: 'uuid-item-1' }] : [{ count: '0' }]
      callCount++
      return Promise.resolve(result)
    })
    const csv = HEADER + 'uuid-item-1,10000,2026-01-01\n'
    const { valid, errors } = await parseOpeningStockCsv(csv)
    expect(errors).toHaveLength(0)
    expect(valid[0]!.data.stockItemId).toBe('uuid-item-1')
    expect(valid[0]!.data.quantity).toBe(10000)
    expect(valid[0]!.data.movementType).toBe('in')
    expect(valid[0]!.data.source).toBe('import')
  })

  it('rejects when prior import exists for same date', async () => {
    let callCount = 0
    setWhereMock(() => {
      const result = callCount === 0 ? [{ id: 'uuid-item-1' }] : [{ count: '3' }]
      callCount++
      return Promise.resolve(result)
    })
    const csv = HEADER + 'uuid-item-1,10000,2026-01-01\n'
    const { errors } = await parseOpeningStockCsv(csv)
    expect(errors[0]!.errors[0]).toMatch(/sudah ada/)
  })

  it('rejects missing stock_item_id', async () => {
    _whereNoLimitResult = [{ count: '0' }]
    const csv = HEADER + ',10000,2026-01-01\n'
    const { errors } = await parseOpeningStockCsv(csv)
    expect(errors[0]!.errors[0]).toMatch(/stock_item_id/)
  })

  it('rejects zero quantity', async () => {
    let callCount = 0
    setWhereMock(() => {
      const result = callCount === 0 ? [{ id: 'uuid-item-1' }] : [{ count: '0' }]
      callCount++
      return Promise.resolve(result)
    })
    const csv = HEADER + 'uuid-item-1,0,2026-01-01\n'
    const { errors } = await parseOpeningStockCsv(csv)
    expect(errors[0]!.errors.some((e) => e.includes('quantity'))).toBe(true)
  })
})

describe('import.service -- getCsvTemplate', () => {
  it('returns header row for each entity', () => {
    expect(getCsvTemplate('flocks')).toContain('coop_id')
    expect(getCsvTemplate('daily_records')).toContain('flock_id')
    expect(getCsvTemplate('customers')).toContain('name')
    expect(getCsvTemplate('opening_stock')).toContain('stock_item_id')
  })
})
