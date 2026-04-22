import { db } from '@/lib/db'
import { inventoryMovements, stockAdjustments, regradeRequests } from '@/lib/db/schema'
import { eq, and, desc, sum } from 'drizzle-orm'
import type {
  InventoryMovement, NewInventoryMovement,
  StockAdjustment, NewStockAdjustment,
  RegradeRequest, NewRegradeRequest,
} from '@/lib/db/schema'

export async function getStockBalance(flockId: string, grade: 'A' | 'B'): Promise<number> {
  const [inRow] = await db
    .select({ total: sum(inventoryMovements.quantity) })
    .from(inventoryMovements)
    .where(and(eq(inventoryMovements.flockId, flockId), eq(inventoryMovements.grade, grade), eq(inventoryMovements.movementType, 'IN')))
  const [outRow] = await db
    .select({ total: sum(inventoryMovements.quantity) })
    .from(inventoryMovements)
    .where(and(eq(inventoryMovements.flockId, flockId), eq(inventoryMovements.grade, grade), eq(inventoryMovements.movementType, 'OUT')))
  return Number(inRow?.total ?? '0') - Number(outRow?.total ?? '0')
}

export async function findStockMovements(flockId: string, limit: number): Promise<InventoryMovement[]> {
  return db
    .select()
    .from(inventoryMovements)
    .where(eq(inventoryMovements.flockId, flockId))
    .orderBy(desc(inventoryMovements.createdAt))
    .limit(limit)
}

export async function insertStockAdjustmentWithMovement(
  adjustment: NewStockAdjustment,
  movement: NewInventoryMovement
): Promise<StockAdjustment> {
  return db.transaction(async (tx) => {
    const [adj] = await tx.insert(stockAdjustments).values(adjustment).returning()
    await tx.insert(inventoryMovements).values({ ...movement, referenceId: adj!.id })
    return adj!
  })
}

export async function findPendingRegradeRequests(): Promise<RegradeRequest[]> {
  return db
    .select()
    .from(regradeRequests)
    .where(eq(regradeRequests.status, 'PENDING'))
    .orderBy(desc(regradeRequests.createdAt))
}

export async function findRegradeRequestById(id: string): Promise<RegradeRequest | null> {
  const [req] = await db.select().from(regradeRequests).where(eq(regradeRequests.id, id)).limit(1)
  return req ?? null
}

export async function insertRegradeRequest(data: NewRegradeRequest): Promise<RegradeRequest> {
  const [req] = await db.insert(regradeRequests).values(data).returning()
  return req!
}

export async function updateRegradeRequestStatus(
  id: string,
  status: 'APPROVED' | 'REJECTED',
  reviewedBy: string
): Promise<void> {
  await db
    .update(regradeRequests)
    .set({ status, reviewedBy, reviewedAt: new Date() })
    .where(eq(regradeRequests.id, id))
}

export async function approveRegradeRequestTx(requestId: string, reviewedBy: string): Promise<void> {
  const request = await findRegradeRequestById(requestId)
  if (!request) throw new Error('Not found')

  await db.transaction(async (tx) => {
    await tx
      .update(regradeRequests)
      .set({ status: 'APPROVED', reviewedBy, reviewedAt: new Date() })
      .where(eq(regradeRequests.id, requestId))

    await tx.insert(inventoryMovements).values({
      flockId: request.flockId,
      movementType: 'OUT',
      grade: request.gradeFrom,
      quantity: request.quantity,
      referenceType: 'regrade',
      referenceId: requestId,
      movementDate: new Date(),
      createdBy: reviewedBy,
    })

    await tx.insert(inventoryMovements).values({
      flockId: request.flockId,
      movementType: 'IN',
      grade: request.gradeTo,
      quantity: request.quantity,
      referenceType: 'regrade',
      referenceId: requestId,
      movementDate: new Date(),
      createdBy: reviewedBy,
    })
  })
}
