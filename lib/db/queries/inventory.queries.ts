import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, desc, sql, sum } from 'drizzle-orm'

export type StockBalance = {
  stockItemId: string
  categoryId: string
  categoryName: string
  itemName: string
  unit: string
  balance: number
}

export async function getStockBalance(farmSchema: string, stockItemId: string): Promise<number> {
  const { inventoryMovements } = getFarmSchema(farmSchema)
  const [row] = await db
    .select({
      balance: sum(sql<number>`CASE WHEN ${inventoryMovements.movementType} = 'in' THEN ${inventoryMovements.quantity} ELSE -${inventoryMovements.quantity} END`),
    })
    .from(inventoryMovements)
    .where(eq(inventoryMovements.stockItemId, stockItemId))
  return Number(row?.balance ?? '0')
}

export async function getAllStockBalances(farmSchema: string): Promise<StockBalance[]> {
  const { inventoryMovements, stockItems, stockCategories } = getFarmSchema(farmSchema)
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

// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
export async function insertInventoryMovement(farmSchema: string, data: any): Promise<void> {
  const { inventoryMovements } = getFarmSchema(farmSchema)
  await db.insert(inventoryMovements).values(data)
}

// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
export async function insertStockAdjustmentWithMovement(
  farmSchema: string,
  adjustment: any,
  movement: any
) {
  const { stockAdjustments, inventoryMovements } = getFarmSchema(farmSchema)
  return db.transaction(async (tx) => {
    const [adj] = await tx.insert(stockAdjustments).values(adjustment).returning()
    await tx.insert(inventoryMovements).values({ ...movement, sourceId: adj!.id })
    return adj!
  })
}

export async function findPendingRegradeRequests(farmSchema: string) {
  const { regradeRequests } = getFarmSchema(farmSchema)
  return db
    .select()
    .from(regradeRequests)
    .where(eq(regradeRequests.status, 'PENDING'))
    .orderBy(desc(regradeRequests.createdAt))
}

export async function findRegradeRequestById(farmSchema: string, id: string) {
  const { regradeRequests } = getFarmSchema(farmSchema)
  const [req] = await db.select().from(regradeRequests).where(eq(regradeRequests.id, id)).limit(1)
  return req ?? null
}

// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
export async function insertRegradeRequest(farmSchema: string, data: any) {
  const { regradeRequests } = getFarmSchema(farmSchema)
  const [req] = await db.insert(regradeRequests).values(data).returning()
  return req!
}

export async function updateRegradeRequestStatus(
  farmSchema: string,
  id: string,
  status: 'APPROVED' | 'REJECTED',
  reviewedBy: string
): Promise<void> {
  const { regradeRequests } = getFarmSchema(farmSchema)
  await db
    .update(regradeRequests)
    .set({ status, reviewedBy, reviewedAt: new Date() })
    .where(eq(regradeRequests.id, id))
}

export async function approveRegradeRequestTx(farmSchema: string, requestId: string, reviewedBy: string): Promise<void> {
  const { regradeRequests, inventoryMovements } = getFarmSchema(farmSchema)
  // any: tx typed against public schema; farm schema tables need cast to use in transactions
  await db.transaction(async (tx: any) => {
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
