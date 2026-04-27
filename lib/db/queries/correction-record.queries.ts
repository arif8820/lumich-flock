import { db, DrizzleTx } from '@/lib/db'
import { correctionRecords, users } from '@/lib/db/schema'
import type { CorrectionRecord, NewCorrectionRecord } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'

// USED BY: [lock-period.service] — count: 1

export async function insertCorrectionRecord(
  data: NewCorrectionRecord,
  tx?: DrizzleTx
): Promise<CorrectionRecord> {
  const executor = tx ?? db
  const [row] = await executor.insert(correctionRecords).values(data).returning()
  return row!
}

export type CorrectionRecordWithUser = CorrectionRecord & { correctedByName: string | null }

export async function findCorrectionsByEntity(
  entityType: CorrectionRecord['entityType'],
  entityId: string
): Promise<CorrectionRecordWithUser[]> {
  const rows = await db
    .select({
      id: correctionRecords.id,
      entityType: correctionRecords.entityType,
      entityId: correctionRecords.entityId,
      fieldName: correctionRecords.fieldName,
      oldValue: correctionRecords.oldValue,
      newValue: correctionRecords.newValue,
      reason: correctionRecords.reason,
      correctedBy: correctionRecords.correctedBy,
      correctedAt: correctionRecords.correctedAt,
      createdAt: correctionRecords.createdAt,
      correctedByName: users.fullName,
    })
    .from(correctionRecords)
    .leftJoin(users, eq(correctionRecords.correctedBy, users.id))
    .where(
      and(
        eq(correctionRecords.entityType, entityType),
        eq(correctionRecords.entityId, entityId)
      )
    )
    .orderBy(desc(correctionRecords.correctedAt))
  return rows
}
