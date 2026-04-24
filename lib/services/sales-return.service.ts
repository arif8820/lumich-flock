import * as salesOrderQueries from '@/lib/db/queries/sales-order.queries'
import * as salesReturnQueries from '@/lib/db/queries/sales-return.queries'
import * as invoiceQueries from '@/lib/db/queries/invoice.queries'
import { generateOrderNumber } from '@/lib/utils/order-number'
import type { NewSalesReturn, NewSalesReturnItem, NewInventoryMovement, NewInvoice, NewCustomerCredit } from '@/lib/db/schema'

const { findSalesOrderById, findSalesOrderItems } = salesOrderQueries
const { countInvoicesThisMonth, findInvoiceByOrderId } = invoiceQueries
const {
  findSalesReturnById,
  findSalesReturnItems,
  countSalesReturnsThisMonth,
  insertSalesReturnWithItems,
  approveSalesReturnTx,
  rejectSalesReturn: rejectSalesReturnQuery,
} = salesReturnQueries

type CreateReturnInput = {
  orderId: string
  returnDate: Date
  reasonType: 'wrong_grade' | 'damaged' | 'quantity_error' | 'other'
  items: Array<{
    itemType: 'egg_grade_a' | 'egg_grade_b' | 'flock' | 'other'
    itemRefId?: string
    quantity: number
    unit: 'butir' | 'ekor' | 'unit'
  }>
  notes?: string
}

export async function createSalesReturn(input: CreateReturnInput, userId: string, role: string) {
  if (!['supervisor', 'admin'].includes(role)) {
    throw new Error('Akses ditolak')
  }

  const so = await findSalesOrderById(input.orderId)
  if (!so) throw new Error('SO tidak ditemukan')

  if (so.status !== 'fulfilled') {
    throw new Error('Return hanya bisa dibuat untuk SO yang sudah fulfilled')
  }

  const soItems = await findSalesOrderItems(input.orderId)

  // Validate return quantities don't exceed original SO quantities
  for (const returnItem of input.items) {
    const soItem = soItems.find(
      (si) => si.itemType === returnItem.itemType && (si.itemRefId ?? null) === (returnItem.itemRefId ?? null)
    )

    if (!soItem || returnItem.quantity > soItem.quantity) {
      throw new Error('Jumlah return melebihi jumlah SO asli')
    }
  }

  // Generate return number
  const lastSeq = await countSalesReturnsThisMonth('RTN')
  const returnNumber = generateOrderNumber('RTN', lastSeq)

  const salesReturn: NewSalesReturn = {
    returnNumber,
    orderId: input.orderId,
    customerId: so.customerId,
    returnDate: input.returnDate,
    reasonType: input.reasonType,
    notes: input.notes || null,
    status: 'pending',
    submittedBy: userId,
  }

  const salesReturnItems: Omit<NewSalesReturnItem, 'returnId'>[] = input.items.map((item) => ({
    itemType: item.itemType,
    itemRefId: item.itemRefId || null,
    quantity: item.quantity,
    unit: item.unit,
  }))

  return insertSalesReturnWithItems(salesReturn, salesReturnItems)
}

export async function approveSalesReturn(returnId: string, userId: string, role: string) {
  if (role !== 'admin') {
    throw new Error('Akses ditolak')
  }

  const salesReturn = await findSalesReturnById(returnId)
  if (!salesReturn) throw new Error('Return tidak ditemukan')

  if (salesReturn.status !== 'pending') {
    throw new Error('Status return tidak valid untuk operasi ini')
  }

  const returnItems = await findSalesReturnItems(returnId)
  const soItems = await findSalesOrderItems(salesReturn.orderId)
  const originalInvoice = await findInvoiceByOrderId(salesReturn.orderId)

  // Calculate credit amount: sum returnQty * pricePerUnit * (1 - discount/100) per item
  let creditAmount = 0
  for (const returnItem of returnItems) {
    const soItem = soItems.find((si) => si.itemType === returnItem.itemType)
    if (soItem) {
      const priceAfterDiscount =
        Number(soItem.pricePerUnit) * (1 - Number(soItem.discountPct) / 100)
      creditAmount += returnItem.quantity * priceAfterDiscount
    }
  }

  // Build inventory movements (IN) for egg return items only
  const movements: NewInventoryMovement[] = returnItems
    .filter((item) => item.itemType === 'egg_grade_a' || item.itemType === 'egg_grade_b')
    .map((item) => ({
      flockId: null,
      movementType: 'in' as const,
      source: 'sale' as const,
      sourceType: 'sales_returns' as const,
      sourceId: returnId,
      grade: item.itemType === 'egg_grade_a' ? ('A' as const) : ('B' as const),
      quantity: item.quantity,
      movementDate: new Date(),
      createdBy: userId,
    }))

  // Generate credit note invoice number
  const invSeq = await countInvoicesThisMonth('CN')
  const creditNoteNumber = generateOrderNumber('CN', invSeq)

  const creditNoteInvoice: NewInvoice = {
    invoiceNumber: creditNoteNumber,
    type: 'credit_note',
    orderId: salesReturn.orderId,
    referenceInvoiceId: originalInvoice?.id ?? null,
    returnId: returnId,
    customerId: salesReturn.customerId,
    issueDate: new Date(),
    dueDate: new Date(),
    totalAmount: creditAmount.toString(),
    paidAmount: '0',
    status: 'sent',
    notes: null,
    createdBy: userId,
  }

  // Build customer credit entry
  const customerCredit: NewCustomerCredit = {
    customerId: salesReturn.customerId,
    amount: creditAmount.toString(),
    sourceType: 'credit_note',
    sourcePaymentId: null,
    sourceInvoiceId: '', // will be overwritten in tx with actual invoice id
    usedAmount: '0',
    notes: null,
  }

  await approveSalesReturnTx(returnId, userId, movements, creditNoteInvoice, customerCredit)

  return salesReturn
}

export async function rejectSalesReturn(returnId: string, userId: string, role: string) {
  if (role !== 'admin') {
    throw new Error('Akses ditolak')
  }

  const salesReturn = await findSalesReturnById(returnId)
  if (!salesReturn) throw new Error('Return tidak ditemukan')

  if (salesReturn.status !== 'pending') {
    throw new Error('Status return tidak valid untuk operasi ini')
  }

  await rejectSalesReturnQuery(returnId, userId)

  return salesReturn
}
