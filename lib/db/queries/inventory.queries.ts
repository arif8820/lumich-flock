import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, desc, sql, sum, and } from 'drizzle-orm'

export type StockBalance = {
  stockItemId: string
  categoryId: string
  categoryName: string
  itemName: string
  unit: string
  totalIn: number
  totalOut: number
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
      totalIn: sql<number>`COALESCE(SUM(CASE WHEN ${inventoryMovements.movementType} = 'in' THEN ${inventoryMovements.quantity} ELSE 0 END), 0)`,
      totalOut: sql<number>`COALESCE(SUM(CASE WHEN ${inventoryMovements.movementType} != 'in' THEN ${inventoryMovements.quantity} ELSE 0 END), 0)`,
      balance: sql<number>`COALESCE(SUM(CASE WHEN ${inventoryMovements.movementType} = 'in' THEN ${inventoryMovements.quantity} ELSE -${inventoryMovements.quantity} END), 0)`,
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
  return rows.map((r) => ({
    ...r,
    totalIn: Number(r.totalIn ?? '0'),
    totalOut: Number(r.totalOut ?? '0'),
    balance: Number(r.balance ?? '0'),
  }))
}

// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function insertInventoryMovement(farmSchema: string, data: any): Promise<void> {
  const { inventoryMovements } = getFarmSchema(farmSchema)
  await db.insert(inventoryMovements).values(data)
}

// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
export async function insertStockAdjustmentWithMovement(
  farmSchema: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adjustment: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export type StockMovementRow = {
  id: string
  movementDate: string
  itemName: string
  categoryName: string
  movementType: string
  quantity: number
  source: string
  sourceType: string | null
}

export async function getStockMovementReport(
  farmSchema: string,
  from: string,
  to: string,
  stockItemId?: string
): Promise<StockMovementRow[]> {
  const { inventoryMovements, stockItems, stockCategories } = getFarmSchema(farmSchema)

  const conditions = [
    sql`${inventoryMovements.movementDate} >= ${from}`,
    sql`${inventoryMovements.movementDate} <= ${to}`,
    ...(stockItemId ? [eq(inventoryMovements.stockItemId, stockItemId)] : []),
  ]

  const rows = await db
    .select({
      id: inventoryMovements.id,
      movementDate: inventoryMovements.movementDate,
      itemName: stockItems.name,
      categoryName: stockCategories.name,
      movementType: inventoryMovements.movementType,
      quantity: inventoryMovements.quantity,
      source: inventoryMovements.source,
      sourceType: inventoryMovements.sourceType,
    })
    .from(inventoryMovements)
    .innerJoin(stockItems, eq(inventoryMovements.stockItemId, stockItems.id))
    .innerJoin(stockCategories, eq(stockItems.categoryId, stockCategories.id))
    .where(and(...conditions))
    .orderBy(desc(inventoryMovements.movementDate))

  return rows.map((r) => ({
    id: r.id,
    movementDate: r.movementDate instanceof Date
      ? r.movementDate.toISOString().split('T')[0]!
      : String(r.movementDate),
    itemName: r.itemName,
    categoryName: r.categoryName,
    movementType: r.movementType,
    quantity: Number(r.quantity),
    source: r.source,
    sourceType: r.sourceType ?? null,
  }))
}

export async function approveRegradeRequestTx(farmSchema: string, requestId: string, reviewedBy: string): Promise<void> {
  const { regradeRequests, inventoryMovements } = getFarmSchema(farmSchema)
  // any: tx typed against public schema; farm schema tables need cast to use in transactions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
