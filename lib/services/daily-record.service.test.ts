import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/queries/daily-record.queries', () => ({
  findDailyRecord: vi.fn(),
  insertDailyRecordWithMovements: vi.fn(),
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
  computeHDP,
  computeFeedPerBird,
  computeFCR,
  createDailyRecord,
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

  describe('computeHDP', () => {
    it('calculates egg lay rate correctly', () => {
      expect(computeHDP(850, 50, 1000)).toBeCloseTo(90)
    })

    it('returns 0 when population is 0', () => {
      expect(computeHDP(100, 50, 0)).toBe(0)
    })
  })

  describe('computeFCR', () => {
    it('calculates kg feed per dozen eggs', () => {
      // 12 kg feed, 120 eggs = 10 dozen → 1.2
      expect(computeFCR(12, 120, 0)).toBeCloseTo(1.2)
    })

    it('returns 0 when no eggs produced', () => {
      expect(computeFCR(10, 0, 0)).toBe(0)
    })
  })

  describe('computeFeedPerBird', () => {
    it('converts kg to grams per bird', () => {
      expect(computeFeedPerBird(10, 1000)).toBeCloseTo(10)
    })

    it('returns 0 when population is 0', () => {
      expect(computeFeedPerBird(5, 0)).toBe(0)
    })
  })

  describe('getProductionReportData', () => {
    const mockRawRow = {
      recordDate: new Date('2026-04-20'),
      coopId: 'coop-1',
      coopName: 'Kandang A',
      flockId: 'flock-1',
      flockName: 'Batch 2026-01',
      flockInitialCount: 1000,
      deaths: 5,
      culled: 2,
      eggsGradeA: 850,
      eggsGradeB: 50,
      feedKg: '120',
    }

    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('throws Akses ditolak for operator role', async () => {
      await expect(
        getProductionReportData(new Date('2026-04-01'), new Date('2026-04-30'), 'operator')
      ).rejects.toThrow('Akses ditolak')
    })

    it('happy path: correctly computes activePopulation, hdp, fcr, totalEggs and KPI aggregates', async () => {
      vi.mocked(queries.getProductionReport).mockResolvedValue([mockRawRow])
      // Cumulative depletion up to recordDate: 5 deaths, 2 culled (same as the single row)
      vi.mocked(queries.getCumulativeDepletionByFlockUpTo).mockResolvedValue({ deaths: 5, culled: 2 })

      const result = await getProductionReportData(
        new Date('2026-04-01'),
        new Date('2026-04-30'),
        'supervisor'
      )

      expect(result.rows).toHaveLength(1)

      const row = result.rows[0]!
      // activePopulation = 1000 - (5 + 2) = 993
      expect(row.activePopulation).toBe(993)
      // totalEggs = 850 + 50 = 900
      expect(row.totalEggs).toBe(900)
      // hdp = (900 / 993) * 100 ≈ 90.63
      expect(row.hdp).toBeCloseTo((900 / 993) * 100, 4)
      // fcr = 120 / (900 / 12) = 120 / 75 = 1.6
      expect(row.fcr).toBeCloseTo(1.6, 4)
      expect(row.feedKg).toBe(120)
      expect(row.deaths).toBe(5)
      expect(row.culled).toBe(2)

      // KPI aggregates
      expect(result.kpi.totalEggs).toBe(900)
      expect(result.kpi.totalFeedKg).toBe(120)
      expect(result.kpi.totalDeaths).toBe(5)
      expect(result.kpi.avgHdp).toBeCloseTo((900 / 993) * 100, 4)
    })

    it('returns zero avgHdp when there are no rows', async () => {
      vi.mocked(queries.getProductionReport).mockResolvedValue([])

      const result = await getProductionReportData(
        new Date('2026-04-01'),
        new Date('2026-04-30'),
        'admin'
      )

      expect(result.rows).toHaveLength(0)
      expect(result.kpi.avgHdp).toBe(0)
      expect(result.kpi.totalEggs).toBe(0)
    })
  })

  describe('createDailyRecord', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      // Default: flock exists, no depletion
      vi.mocked(flockQueries.findFlockById).mockResolvedValue({ id: 'f1', initialCount: 5000 } as any) // any: partial mock
      vi.mocked(queries.getTotalDepletionByFlock).mockResolvedValue({ deaths: 0, culled: 0 })
    })

    it('throws when record already exists for that date', async () => {
      vi.mocked(queries.findDailyRecord).mockResolvedValue({ id: 'existing' } as any) // any: partial mock

      await expect(
        createDailyRecord(
          { flockId: 'f1', recordDate: new Date('2026-04-20'), deaths: 0, culled: 0, eggsGradeA: 100, eggsGradeB: 10, eggsCracked: 0, eggsAbnormal: 0 },
          'user-1', 'operator', new Date('2026-04-21')
        )
      ).rejects.toThrow('Data untuk tanggal ini sudah ada')
    })

    it('inserts record with IN movements for grade A and B', async () => {
      vi.mocked(queries.findDailyRecord).mockResolvedValue(null)
      vi.mocked(queries.insertDailyRecordWithMovements).mockResolvedValue({ id: 'r1' } as any) // any: partial mock

      await createDailyRecord(
        { flockId: 'f1', recordDate: new Date('2026-04-20'), deaths: 2, culled: 0, eggsGradeA: 900, eggsGradeB: 50, eggsCracked: 0, eggsAbnormal: 0 },
        'user-1', 'operator', new Date('2026-04-21')
      )

      expect(queries.insertDailyRecordWithMovements).toHaveBeenCalledWith(
        expect.objectContaining({ flockId: 'f1', eggsGradeA: 900 }),
        expect.arrayContaining([
          expect.objectContaining({ grade: 'A', quantity: 900, movementType: 'IN' }),
          expect.objectContaining({ grade: 'B', quantity: 50, movementType: 'IN' }),
        ])
      )
    })

    it('sets isLateInput true when submitted next calendar day', async () => {
      vi.mocked(queries.findDailyRecord).mockResolvedValue(null)
      vi.mocked(queries.insertDailyRecordWithMovements).mockResolvedValue({ id: 'r1' } as any) // any: partial mock

      await createDailyRecord(
        { flockId: 'f1', recordDate: new Date('2026-04-20'), deaths: 0, culled: 0, eggsGradeA: 100, eggsGradeB: 0, eggsCracked: 0, eggsAbnormal: 0 },
        'user-1', 'operator', new Date('2026-04-21T00:01:00Z')
      )

      expect(queries.insertDailyRecordWithMovements).toHaveBeenCalledWith(
        expect.objectContaining({ isLateInput: true }),
        expect.any(Array)
      )
    })
  })
})
