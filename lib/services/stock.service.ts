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

export async function getStockBalance(stockItemId: string): Promise<number> {
  return _getStockBalance(stockItemId)
}

export async function getAllStockBalances(): Promise<StockBalance[]> {
  return _getAllStockBalances()
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
  input: AdjustmentInput,
  userId: string,
  role: Role = 'admin',
  now: Date = new Date()
): Promise<StockAdjustment> {
  assertCanEdit(new Date(input.adjustmentDate), role, now)

  const balance = await _getStockBalance(input.stockItemId)
  validateStockNotBelowZero(balance, input.quantity)
  const movementType = input.quantity >= 0 ? 'in' : 'out'
  const qty = Math.abs(input.quantity)

  return insertStockAdjustmentWithMovement(
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
  )
}

type RegradeInput = {
  fromItemId: string
  toItemId: string
  quantity: number
  requestDate: string // YYYY-MM-DD
  notes?: string
}

export async function submitRegradeRequest(
  input: RegradeInput,
  userId: string
): Promise<RegradeRequest> {
  if (input.fromItemId === input.toItemId) throw new Error('Item asal dan tujuan tidak boleh sama')
  const balance = await _getStockBalance(input.fromItemId)
  validateStockNotBelowZero(balance, -input.quantity)
  return insertRegradeRequest({ ...input, status: 'PENDING', createdBy: userId })
}

export async function approveRegradeRequest(requestId: string, adminId: string): Promise<void> {
  const req = await findRegradeRequestById(requestId)
  if (!req) throw new Error('Permintaan regrade tidak ditemukan')
  if (req.status !== 'PENDING') throw new Error('Permintaan sudah diproses')
  await approveRegradeRequestTx(requestId, adminId)
}

export async function rejectRegradeRequest(requestId: string, adminId: string): Promise<void> {
  const req = await findRegradeRequestById(requestId)
  if (!req) throw new Error('Permintaan regrade tidak ditemukan')
  if (req.status !== 'PENDING') throw new Error('Permintaan sudah diproses')
  await updateRegradeRequestStatus(requestId, 'REJECTED', adminId)
}

export async function getPendingRegradeRequests(): Promise<RegradeRequest[]> {
  return findPendingRegradeRequests()
}

type StockPurchaseInput = {
  stockItemId: string
  quantity: number
  purchaseDate: string // YYYY-MM-DD
  notes?: string
}

export async function createStockPurchase(
  input: StockPurchaseInput,
  userId: string
): Promise<void> {
  await insertInventoryMovement({
    stockItemId: input.stockItemId,
    movementType: 'in',
    source: 'purchase',
    sourceType: 'stock_adjustments',
    sourceId: null,
    quantity: input.quantity,
    movementDate: input.purchaseDate,
    createdBy: userId,
  })
}
