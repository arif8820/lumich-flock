import {
  findDailyRecord,
  insertDailyRecordWithMovements,
} from '@/lib/db/queries/daily-record.queries'
import type { DailyRecord, NewDailyRecord, NewInventoryMovement } from '@/lib/db/schema'

type Role = 'operator' | 'supervisor' | 'admin'

export function validateBackdate(recordDate: Date, now: Date, role: Role): void {
  if (recordDate > now) throw new Error('Tidak dapat input untuk tanggal masa depan')
  const nowDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const recDay = Date.UTC(recordDate.getUTCFullYear(), recordDate.getUTCMonth(), recordDate.getUTCDate())
  const diffDays = Math.round((nowDay - recDay) / 86_400_000)
  const max = role === 'operator' ? 1 : role === 'supervisor' ? 3 : Infinity
  if (diffDays > max) {
    const limit = role === 'operator' ? 'H-1' : 'H-3'
    throw new Error(`Input hanya diizinkan sampai ${limit} untuk role ini`)
  }
}

export function computeIsLateInput(recordDate: Date, submittedAt: Date): boolean {
  const endOfDay = new Date(recordDate)
  endOfDay.setUTCHours(23, 59, 59, 999)
  return submittedAt > endOfDay
}

export function computeActivePopulation(
  initialCount: number,
  records: { deaths: number; culled: number }[]
): number {
  const depletion = records.reduce((acc, r) => acc + r.deaths + r.culled, 0)
  return Math.max(0, initialCount - depletion)
}

export function computeHDP(eggsA: number, eggsB: number, population: number): number {
  if (population <= 0) return 0
  return ((eggsA + eggsB) / population) * 100
}

export function computeFeedPerBird(feedKg: number, population: number): number {
  if (population <= 0) return 0
  return (feedKg / population) * 1000 // grams per bird
}

export function computeFCR(feedKg: number, eggsA: number, eggsB: number): number {
  const total = eggsA + eggsB
  if (total <= 0) return 0
  return feedKg / (total / 12) // kg feed per dozen eggs; threshold >2.1 = inefficient
}

type CreateDailyRecordInput = {
  flockId: string
  recordDate: Date
  deaths: number
  culled: number
  eggsGradeA: number
  eggsGradeB: number
  eggsCracked: number
  eggsAbnormal: number
  avgWeightKg?: number
  feedKg?: number
}

export async function createDailyRecord(
  input: CreateDailyRecordInput,
  userId: string,
  role: Role,
  now: Date = new Date()
): Promise<DailyRecord> {
  validateBackdate(input.recordDate, now, role)

  const existing = await findDailyRecord(input.flockId, input.recordDate)
  if (existing) throw new Error('Data untuk tanggal ini sudah ada')

  const isLateInput = computeIsLateInput(input.recordDate, now)

  const record: NewDailyRecord = {
    flockId: input.flockId,
    recordDate: input.recordDate,
    deaths: input.deaths,
    culled: input.culled,
    eggsGradeA: input.eggsGradeA,
    eggsGradeB: input.eggsGradeB,
    eggsCracked: input.eggsCracked,
    eggsAbnormal: input.eggsAbnormal,
    avgWeightKg: input.avgWeightKg != null ? input.avgWeightKg : null,
    feedKg: input.feedKg != null ? input.feedKg : null,
    isLateInput,
    createdBy: userId,
  }

  const movements: NewInventoryMovement[] = []
  if (input.eggsGradeA > 0) {
    movements.push({
      flockId: input.flockId,
      movementType: 'IN',
      grade: 'A',
      quantity: input.eggsGradeA,
      referenceType: 'daily_record',
      movementDate: input.recordDate,
      createdBy: userId,
    })
  }
  if (input.eggsGradeB > 0) {
    movements.push({
      flockId: input.flockId,
      movementType: 'IN',
      grade: 'B',
      quantity: input.eggsGradeB,
      referenceType: 'daily_record',
      movementDate: input.recordDate,
      createdBy: userId,
    })
  }

  return insertDailyRecordWithMovements(record, movements)
}
