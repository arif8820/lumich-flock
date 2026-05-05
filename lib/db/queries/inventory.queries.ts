import { db } from '@/lib/db'
import { inventoryMovements, stockAdjustments, regradeRequests, stockItems, stockCategories } from '@/lib/db/schema'
import { eq, desc, sql, sum } from 'drizzle-orm'
import type {
  NewInventoryMovement,
  StockAdjustment, NewStockAdjustment,
  RegradeRequest, NewRegradeRequest,
} from '@/lib/db/schema'

export type StockBalance = {
  stockItemId: string
  categoryId: string
  categoryName: string
  itemName: string
  unit: string
  balance: number
}

export async function getStockBalance(stockItemId: string): Promise<number> {
  const [row] = await db
    .select({
      balance: sum(sql<number>`CASE WHEN ${inventoryMovements.movementType} = 'in' THEN ${inventoryMovements.quantity} ELSE -${inventoryMovements.quantity} END`),
    })
    .from(inventoryMovements)
    .where(eq(inventoryMovements.stockItemId, stockItemId))
  return Number(row?.balance ?? '0')
}

export async function getAllStockBalances(): Promise<StockBalance[]> {
  const rows = await db
    .select({
      stockItemId: inventoryMovements.stockItemId,
      categoryId: stockItems.categoryId,
      categoryName: stockCategories.name,
      itemName: stockItems.name,
      unit: stockCategories.unit,
      balance: sum(sql<number>`CASE WHEN ${inventoryMovements.movementType} = 'in' THEN ${inventoryMovements.quantity} ELSE -${inventoryMovements.quantity} END`),
    })
    .from(inventoryMovements)
    .innerJoin(stockItems, eq(inventoryMovements.stockItemId, stockItems.id))
    .innerJoin(stockCategories, eq(stockItems.categoryId, stockCategories.id))
    .groupBy(
      inventoryMovements.stockItemId,
      stockItems.categoryId,
      stockCategories.name,
      stockItems.name,
      stockCategories.unit
    )
  return rows.map((r) => ({ ...r, balance: Number(r.balance ?? '0') }))
}

export async function insertInventoryMovement(data: NewInventoryMovement): Promise<void> {
  await db.insert(inventoryMovements).values(data)
}

export async function insertStockAdjustmentWithMovement(
  adjustment: NewStockAdjustment,
  movement: NewInventoryMovement
): Promise<StockAdjustment> {
  return db.transaction(async (tx) => {
    const [adj] = await tx.insert(stockAdjustments).values(adjustment).returning()
    await tx.insert(inventoryMovements).values({ ...movement, sourceId: adj!.id })
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

    const today = new Date().toISOString().slice(0, 10)

    await tx.insert(inventoryMovements).values({
      stockItemId: request.fromItemId,
      movementType: 'out',
      source: 'regrade',
      sourceType: 'regrade_requests',
      sourceId: requestId,
      quantity: request.quantity,
      movementDate: today,
      createdBy: reviewedBy,
    })

    await tx.insert(inventoryMovements).values({
      stockItemId: request.toItemId,
      movementType: 'in',
      source: 'regrade',
      sourceType: 'regrade_requests',
      sourceId: requestId,
      quantity: request.quantity,
      movementDate: today,
      createdBy: reviewedBy,
    })
  })
}
