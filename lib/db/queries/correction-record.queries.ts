import { db, DrizzleTx } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, desc, and } from 'drizzle-orm'

// USED BY: [lock-period.service] — count: 1

// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
export async function insertCorrectionRecord(
  farmSchema: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  tx?: DrizzleTx
) {
  const { correctionRecords } = getFarmSchema(farmSchema)
  const executor = tx ?? db
  const [row] = await executor.insert(correctionRecords).values(data).returning()
  return row!
}

export type CorrectionRecordWithUser = {
  id: string
  entityType: string
  entityId: string
  fieldName: string
  oldValue: string | null
  newValue: string | null
  reason: string
  correctedBy: string
  correctedAt: Date
  createdAt: Date
  correctedByName: string | null
}

export async function findCorrectionsByEntity(
  farmSchema: string,
  entityType: string,
  entityId: string
): Promise<CorrectionRecordWithUser[]> {
  const { correctionRecords, users } = getFarmSchema(farmSchema)
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        eq(correctionRecords.entityType, entityType as any),
        eq(correctionRecords.entityId, entityId)
      )
    )
    .orderBy(desc(correctionRecords.correctedAt))
  return rows as CorrectionRecordWithUser[]
}
