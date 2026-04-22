import {
  getStockBalance as _getStockBalance,
  insertStockAdjustmentWithMovement,
  findPendingRegradeRequests,
  findRegradeRequestById,
  insertRegradeRequest,
  updateRegradeRequestStatus,
  approveRegradeRequestTx,
} from '@/lib/db/queries/inventory.queries'
import type { StockAdjustment, RegradeRequest } from '@/lib/db/schema'

export { _getStockBalance as getStockBalance }

export function validateStockNotBelowZero(currentBalance: number, quantity: number): void {
  if (currentBalance + quantity < 0) throw new Error('Stok tidak mencukupi untuk operasi ini')
}

type AdjustmentInput = {
  flockId: string
  adjustmentDate: Date
  grade: 'A' | 'B'
  quantity: number // signed
  reason: string
  notes?: string
}

export async function createStockAdjustment(
  input: AdjustmentInput,
  userId: string
): Promise<StockAdjustment> {
  if (input.quantity < 0) {
    const balance = await _getStockBalance(input.flockId, input.grade)
    validateStockNotBelowZero(balance, input.quantity)
  }
  const movementType = input.quantity >= 0 ? 'IN' : 'OUT'
  const qty = Math.abs(input.quantity)
  return insertStockAdjustmentWithMovement(
    { ...input, createdBy: userId },
    {
      flockId: input.flockId,
      movementType,
      grade: input.grade,
      quantity: qty,
      referenceType: 'stock_adjustment',
      movementDate: input.adjustmentDate,
      createdBy: userId,
    }
  )
}

type RegradeInput = {
  flockId: string
  gradeFrom: 'A' | 'B'
  gradeTo: 'A' | 'B'
  quantity: number
  requestDate: Date
  notes?: string
}

export async function submitRegradeRequest(
  input: RegradeInput,
  userId: string
): Promise<RegradeRequest> {
  const balance = await _getStockBalance(input.flockId, input.gradeFrom)
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
