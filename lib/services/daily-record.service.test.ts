import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/queries/daily-record.queries', () => ({
  findDailyRecord: vi.fn(),
  upsertDailyRecordTx: vi.fn(),
  getTotalDepletionByFlock: vi.fn(),
  getCumulativeDepletionByFlockUpTo: vi.fn(),
  getProductionReport: vi.fn(),
}))

vi.mock('@/lib/db/queries/flock.queries', () => ({
  findAllActiveFlocks: vi.fn(),
  findFlockById: vi.fn(),
}))

vi.mock('@/lib/db/queries/user-coop-assignment.queries', () => ({
  findAssignedCoopIds: vi.fn(),
}))

vi.mock('@/lib/db/queries/inventory.queries', () => ({
  getStockBalance: vi.fn().mockResolvedValue(9999),
}))

vi.mock('@/lib/services/lock-period.service', () => ({
  assertCanEdit: vi.fn(), // no-op by default
}))

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: 'dr-1' }]),
  },
}))

import * as queries from '@/lib/db/queries/daily-record.queries'
import * as flockQueries from '@/lib/db/queries/flock.queries'
import {
  validateBackdate,
  computeIsLateInput,
  computeActivePopulation,
  saveDailyRecord,
  getProductionReportData,
} from './daily-record.service'

describe('daily-record.service — pure functions', () => {
  describe('validateBackdate', () => {
    it('operator cannot backdate more than 1 day', () => {
      const now = new Date('2026-04-21')
      expect(() => validateBackdate(new Date('2026-04-19'), now, 'operator')).toThrow()
    })

    it('operator can input H-1', () => {
      const now = new Date('2026-04-21')
      expect(() => validateBackdate(new Date('2026-04-20'), now, 'operator')).not.toThrow()
    })

    it('supervisor can backdate up to 3 days', () => {
      const now = new Date('2026-04-21')
      expect(() => validateBackdate(new Date('2026-04-18'), now, 'supervisor')).not.toThrow()
    })

    it('supervisor cannot backdate more than 3 days', () => {
      const now = new Date('2026-04-21')
      expect(() => validateBackdate(new Date('2026-04-17'), now, 'supervisor')).toThrow()
    })

    it('admin can backdate unlimited', () => {
      const now = new Date('2026-04-21')
      expect(() => validateBackdate(new Date('2025-01-01'), now, 'admin')).not.toThrow()
    })

    it('rejects future date for all roles', () => {
      const now = new Date('2026-04-21')
      expect(() => validateBackdate(new Date('2026-04-22'), now, 'admin')).toThrow()
    })
  })

  describe('computeIsLateInput', () => {
    it('returns false when submitted before midnight UTC on record date', () => {
      expect(computeIsLateInput(new Date('2026-04-20'), new Date('2026-04-20T22:00:00Z'))).toBe(false)
    })

    it('returns true when submitted on next calendar day', () => {
      expect(computeIsLateInput(new Date('2026-04-20'), new Date('2026-04-21T00:01:00Z'))).toBe(true)
    })
  })

  describe('computeActivePopulation', () => {
    it('subtracts total deaths and culled from initial count', () => {
      expect(computeActivePopulation(1000, [{ deaths: 5, culled: 2 }, { deaths: 3, culled: 0 }])).toBe(990)
    })

    it('returns 0 when depletion exceeds initial count', () => {
      expect(computeActivePopulation(10, [{ deaths: 15, culled: 0 }])).toBe(0)
    })
  })

  describe('getProductionReportData', () => {
    const mockRawRow = {
      recordDate: '2026-04-20',
      coopId: 'coop-1',
      coopName: 'Kandang A',
      flockId: 'flock-1',
      flockName: 'Batch 2026-01',
      flockTotalCount: 1000,
      deaths: 5,
      culled: 2,
    }

    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('throws Akses ditolak for operator role', async () => {
      await expect(
        getProductionReportData('2026-04-01', '2026-04-30', 'operator')
      ).rejects.toThrow('Akses ditolak')
    })

    it('happy path: correctly computes activePopulation and KPI aggregates', async () => {
      vi.mocked(queries.getProductionReport).mockResolvedValue([mockRawRow])
      vi.mocked(queries.getCumulativeDepletionByFlockUpTo).mockResolvedValue({ deaths: 5, culled: 2 })

      const result = await getProductionReportData('2026-04-01', '2026-04-30', 'supervisor')

      expect(result.rows).toHaveLength(1)

      const row = result.rows[0]!
      // activePopulation = 1000 - (5 + 2) = 993
      expect(row.activePopulation).toBe(993)
      expect(row.deaths).toBe(5)
      expect(row.culled).toBe(2)

      // KPI aggregates
      expect(result.kpi.totalDeaths).toBe(5)
      expect(result.kpi.totalCulled).toBe(2)
    })

    it('returns zero kpi when there are no rows', async () => {
      vi.mocked(queries.getProductionReport).mockResolvedValue([])

      const result = await getProductionReportData('2026-04-01', '2026-04-30', 'admin')

      expect(result.rows).toHaveLength(0)
      expect(result.kpi.totalDeaths).toBe(0)
      expect(result.kpi.totalCulled).toBe(0)
    })
  })

  describe('saveDailyRecord', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      vi.mocked(flockQueries.findFlockById).mockResolvedValue({ id: 'f1', initialCount: 5000 } as any) // any: partial mock
      vi.mocked(queries.getTotalDepletionByFlock).mockResolvedValue({ deaths: 0, culled: 0 })
      vi.mocked(queries.findDailyRecord).mockResolvedValue(null)
      vi.mocked(queries.upsertDailyRecordTx).mockResolvedValue({ id: 'dr-1' } as any) // any: partial mock
    })

    it('calls upsertDailyRecordTx with correct input', async () => {
      await saveDailyRecord(
        {
          flockId: 'f1',
          recordDate: '2026-04-20',
          deaths: 2,
          culled: 0,
          eggsCracked: 0,
          eggsAbnormal: 0,
          eggEntries: [],
          feedEntries: [],
          vaccineEntries: [],
        },
        'user-1', 'operator', new Date('2026-04-21')
      )

      expect(queries.upsertDailyRecordTx).toHaveBeenCalledWith(
        expect.objectContaining({
          record: expect.objectContaining({ flockId: 'f1', deaths: 2 }),
        })
      )
    })

    it('sets isLateInput true when submitted next calendar day', async () => {
      await saveDailyRecord(
        {
          flockId: 'f1',
          recordDate: '2026-04-20',
          deaths: 0,
          culled: 0,
          eggsCracked: 0,
          eggsAbnormal: 0,
          eggEntries: [],
          feedEntries: [],
          vaccineEntries: [],
        },
        'user-1', 'operator', new Date('2026-04-21T00:01:00Z')
      )

      expect(queries.upsertDailyRecordTx).toHaveBeenCalledWith(
        expect.objectContaining({
          record: expect.objectContaining({ isLateInput: true }),
        })
      )
    })

    it('throws when depletion exceeds active population on new record', async () => {
      vi.mocked(queries.getTotalDepletionByFlock).mockResolvedValue({ deaths: 4990, culled: 0 })

      await expect(
        saveDailyRecord(
          {
            flockId: 'f1',
            recordDate: '2026-04-20',
            deaths: 20,
            culled: 0,
            eggsCracked: 0,
            eggsAbnormal: 0,
            eggEntries: [],
            feedEntries: [],
            vaccineEntries: [],
          },
          'user-1', 'operator', new Date('2026-04-21')
        )
      ).rejects.toThrow('melebihi populasi aktif')
    })
  })
})
