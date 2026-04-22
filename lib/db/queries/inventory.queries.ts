import { db } from '@/lib/db'
import { inventoryMovements, stockAdjustments, regradeRequests } from '@/lib/db/schema'
import { eq, and, desc, sql, sum } from 'drizzle-orm'
import type {
  NewInventoryMovement,
  StockAdjustment, NewStockAdjustment,
  RegradeRequest, NewRegradeRequest,
} from '@/lib/db/schema'

export async function getStockBalance(flockId: string, grade: 'A' | 'B'): Promise<number> {
  const [row] = await db
    .select({
      balance: sum(sql<number>`CASE WHEN ${inventoryMovements.movementType} = 'IN' THEN ${inventoryMovements.quantity} ELSE -${inventoryMovements.quantity} END`),
    })
    .from(inventoryMovements)
    .where(and(eq(inventoryMovements.flockId, flockId), eq(inventoryMovements.grade, grade)))
  return Number(row?.balance ?? '0')
}

export async function getAllStockBalances(): Promise<{ flockId: string; grade: 'A' | 'B'; balance: number }[]> {
  const rows = await db
    .select({
      flockId: inventoryMovements.flockId,
      grade: inventoryMovements.grade,
      balance: sum(sql<number>`CASE WHEN ${inventoryMovements.movementType} = 'IN' THEN ${inventoryMovements.quantity} ELSE -${inventoryMovements.quantity} END`),
    })
    .from(inventoryMovements)
    .groupBy(inventoryMovements.flockId, inventoryMovements.grade)
  return rows.map((r) => ({ flockId: r.flockId, grade: r.grade as 'A' | 'B', balance: Number(r.balance ?? '0') }))
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
  await db.transaction(async (tx) => {
    const [request] = await tx
      .select()
      .from(regradeRequests)
      .where(eq(regradeRequests.id, requestId))
      .limit(1)
    if (!request) throw new Error('Not found')
    if (request.status !== 'PENDING') throw new Error('Permintaan sudah diproses')

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
