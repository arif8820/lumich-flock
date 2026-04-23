import * as salesOrderQueries from '@/lib/db/queries/sales-order.queries'
import * as salesReturnQueries from '@/lib/db/queries/sales-return.queries'
import { generateOrderNumber } from '@/lib/utils/order-number'
import type { NewSalesReturn, NewSalesReturnItem, NewInventoryMovement, NewInvoice, NewCustomerCredit } from '@/lib/db/schema'

const { findSalesOrderById, findSalesOrderItems } = salesOrderQueries
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
      (si) => si.itemType === returnItem.itemType && si.itemRefId === returnItem.itemRefId
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

  const salesReturnItems: NewSalesReturnItem[] = input.items.map((item) => ({
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

  // Build inventory movements (IN) for each return item
  const movements: NewInventoryMovement[] = returnItems.map((item) => ({
    flockId: null,
    movementType: 'in',
    source: 'sale',
    sourceType: 'sales_returns',
    sourceId: returnId,
    grade: item.itemType === 'egg_grade_a' ? 'A' : 'B',
    quantity: item.quantity,
    movementDate: new Date(),
    createdBy: userId,
  }))

  // Build credit note invoice (negative amount)
  const creditNoteInvoice: NewInvoice = {
    invoiceNumber: '', // Will be generated in transaction
    type: 'credit_note',
    orderId: salesReturn.orderId,
    referenceInvoiceId: null, // Would need to find original invoice
    returnId: returnId,
    customerId: salesReturn.customerId,
    issueDate: new Date(),
    dueDate: new Date(),
    totalAmount: '0', // Will be calculated in transaction
    paidAmount: '0',
    status: 'sent',
    notes: null,
  }

  // Build customer credit entry
  const customerCredit: NewCustomerCredit = {
    customerId: salesReturn.customerId,
    amount: '0', // Will be calculated in transaction
    sourceType: 'credit_note',
    sourcePaymentId: null,
    sourceInvoiceId: '', // Will be set after invoice creation
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
