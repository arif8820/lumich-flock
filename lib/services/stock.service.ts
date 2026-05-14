import {
  getStockBalance as _getStockBalance,
  getAllStockBalances as _getAllStockBalances,
  insertInventoryMovement,
  insertStockAdjustmentWithMovement,
  findPendingRegradeRequests,
  findRegradeRequestById,
  insertRegradeRequest,
  updateRegradeRequestStatus,
  approveRegradeRequestTx,
  type StockBalance,
} from '@/lib/db/queries/inventory.queries'
import { assertCanEdit } from '@/lib/services/lock-period.service'
import type { StockAdjustment, RegradeRequest } from '@/lib/db/schema'

export type { StockBalance }

type Role = 'operator' | 'supervisor' | 'admin'

export async function getStockBalance(farmSchema: string, stockItemId: string): Promise<number> {
  return _getStockBalance(farmSchema, stockItemId)
}

export async function getAllStockBalances(farmSchema: string): Promise<StockBalance[]> {
  return _getAllStockBalances(farmSchema)
}

export function validateStockNotBelowZero(currentBalance: number, quantity: number): void {
  if (currentBalance + quantity < 0) throw new Error('Stok tidak mencukupi untuk operasi ini')
}

type AdjustmentInput = {
  stockItemId: string
  adjustmentDate: string // YYYY-MM-DD
  quantity: number // signed
  reason: string
  notes?: string
}

export async function createStockAdjustment(
  farmSchema: string,
  input: AdjustmentInput,
  userId: string,
  role: Role = 'admin',
  now: Date = new Date()
): Promise<StockAdjustment> {
  assertCanEdit(new Date(input.adjustmentDate), role, now)

  const balance = await _getStockBalance(farmSchema, input.stockItemId)
  validateStockNotBelowZero(balance, input.quantity)
  const movementType = input.quantity >= 0 ? 'in' : 'out'
  const qty = Math.abs(input.quantity)

  // any: farm schema date fields (adjustmentDate: Date) differ from public StockAdjustment (adjustmentDate: string)
  return insertStockAdjustmentWithMovement(
    farmSchema,
    {
      stockItemId: input.stockItemId,
      adjustmentDate: input.adjustmentDate,
      quantity: input.quantity,
      reason: input.reason,
      notes: input.notes,
      createdBy: userId,
    },
    {
      stockItemId: input.stockItemId,
      movementType,
      source: 'adjustment',
      sourceType: 'stock_adjustments',
      sourceId: null,
      quantity: qty,
      movementDate: input.adjustmentDate,
      createdBy: userId,
    }
  ) as unknown as StockAdjustment
}

type RegradeInput = {
  fromItemId: string
  toItemId: string
  quantity: number
  requestDate: string // YYYY-MM-DD
  notes?: string
}

export async function submitRegradeRequest(
  farmSchema: string,
  input: RegradeInput,
  userId: string
): Promise<RegradeRequest> {
  if (input.fromItemId === input.toItemId) throw new Error('Item asal dan tujuan tidak boleh sama')
  const balance = await _getStockBalance(farmSchema, input.fromItemId)
  validateStockNotBelowZero(balance, -input.quantity)
  // any: farm schema date fields (requestDate: Date) differ from public RegradeRequest (requestDate: string)
  return insertRegradeRequest(farmSchema, { ...input, status: 'PENDING', createdBy: userId }) as unknown as RegradeRequest
}

export async function approveRegradeRequest(farmSchema: string, requestId: string, adminId: string): Promise<void> {
  const req = await findRegradeRequestById(farmSchema, requestId)
  if (!req) throw new Error('Permintaan regrade tidak ditemukan')
  if (req.status !== 'PENDING') throw new Error('Permintaan sudah diproses')
  await approveRegradeRequestTx(farmSchema, requestId, adminId)
}

export async function rejectRegradeRequest(farmSchema: string, requestId: string, adminId: string): Promise<void> {
  const req = await findRegradeRequestById(farmSchema, requestId)
  if (!req) throw new Error('Permintaan regrade tidak ditemukan')
  if (req.status !== 'PENDING') throw new Error('Permintaan sudah diproses')
  await updateRegradeRequestStatus(farmSchema, requestId, 'REJECTED', adminId)
}

export async function getPendingRegradeRequests(farmSchema: string): Promise<RegradeRequest[]> {
  // any: farm schema date fields (requestDate: Date) differ from public RegradeRequest (requestDate: string)
  return findPendingRegradeRequests(farmSchema) as unknown as Promise<RegradeRequest[]>
}

type StockPurchaseInput = {
  stockItemId: string
  quantity: number
  purchaseDate: string // YYYY-MM-DD
  notes?: string
}

export async function createStockPurchase(
  farmSchema: string,
  input: StockPurchaseInput,
  userId: string
): Promise<void> {
  await insertInventoryMovement(farmSchema, {
    stockItemId: input.stockItemId,
    movementType: 'in',
    source: 'purchase',
    quantity: input.quantity,
    movementDate: new Date(input.purchaseDate),
    createdBy: userId,
  })
}
