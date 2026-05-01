import * as customerQueries from '@/lib/db/queries/customer.queries'
import * as salesOrderQueries from '@/lib/db/queries/sales-order.queries'
import * as inventoryQueries from '@/lib/db/queries/inventory.queries'
import * as invoiceQueries from '@/lib/db/queries/invoice.queries'
import { generateOrderNumber } from '@/lib/utils/order-number'
import { assertCanEdit } from '@/lib/services/lock-period.service'
import type { NewSalesOrder, NewSalesOrderItem, NewInventoryMovement, NewInvoice } from '@/lib/db/schema'

const { findCustomerById } = customerQueries
const {
  findSalesOrderById,
  findSalesOrderItems,
  countSalesOrdersThisMonth,
  insertSalesOrderWithItems,
  updateSalesOrderStatus,
  deleteDraftSO: deleteDraftSOQuery,
  fulfillSOTx,
  getCustomerOutstandingCredit,
} = salesOrderQueries
const { getStockBalanceByGrade } = inventoryQueries
const { countInvoicesThisMonth } = invoiceQueries

type CreateDraftInput = {
  customerId: string
  orderDate: Date
  paymentMethod: 'cash' | 'credit'
  items: Array<{
    itemType: 'egg_grade_a' | 'egg_grade_b' | 'flock' | 'other'
    itemRefId?: string
    description?: string
    quantity: number
    unit: 'butir' | 'ekor' | 'unit'
    pricePerUnit: number
    discountPct?: number
  }>
  taxPct?: number
  notes?: string
  overrideReason?: string
}

export async function createDraftSO(input: CreateDraftInput, userId: string, role: string) {
  if (!['supervisor', 'admin'].includes(role)) {
    throw new Error('Akses ditolak')
  }

  if (input.items.length === 0) {
    throw new Error('Item tidak boleh kosong')
  }

  const customer = await findCustomerById(input.customerId)
  if (!customer) throw new Error('Pelanggan tidak ditemukan')

  if (customer.status === 'blocked' && !input.overrideReason) {
    throw new Error('Pelanggan diblokir')
  }

  if (customer.status === 'blocked' && input.overrideReason && role !== 'admin') {
    throw new Error('Hanya admin bisa override pelanggan diblokir')
  }

  // Calculate totals
  const itemsWithSubtotal = input.items.map((item) => {
    const discount = item.discountPct || 0
    const priceAfterDiscount = item.pricePerUnit * (1 - discount / 100)
    const subtotal = item.quantity * priceAfterDiscount
    return { ...item, subtotal }
  })

  const subtotal = itemsWithSubtotal.reduce((sum, item) => sum + item.subtotal, 0)
  const taxPct = input.taxPct || 0
  const taxAmount = subtotal * (taxPct / 100)
  const totalAmount = subtotal + taxAmount

  // Generate order number
  const lastSeq = await countSalesOrdersThisMonth('SO')
  const orderNumber = generateOrderNumber('SO', lastSeq)

  const notes = input.overrideReason
    ? `${input.notes || ''} [Override: ${input.overrideReason}]`.trim()
    : input.notes

  const salesOrder: NewSalesOrder = {
    orderNumber,
    orderDate: input.orderDate,
    customerId: input.customerId,
    paymentMethod: input.paymentMethod,
    status: 'draft',
    taxPct: taxPct.toString(),
    subtotal: subtotal.toString(),
    taxAmount: taxAmount.toString(),
    totalAmount: totalAmount.toString(),
    notes: notes || null,
    createdBy: userId,
  }

  const salesOrderItems: Omit<NewSalesOrderItem, 'orderId'>[] = itemsWithSubtotal.map((item) => ({
    itemType: item.itemType,
    itemRefId: item.itemRefId || null,
    description: item.description || null,
    quantity: item.quantity,
    unit: item.unit,
    pricePerUnit: item.pricePerUnit.toString(),
    discountPct: (item.discountPct || 0).toString(),
    subtotal: item.subtotal.toString(),
  }))

  return insertSalesOrderWithItems(salesOrder, salesOrderItems)
}

export async function confirmSO(orderId: string, userId: string, role: string) {
  if (!['supervisor', 'admin'].includes(role)) {
    throw new Error('Akses ditolak')
  }

  const so = await findSalesOrderById(orderId)
  if (!so) throw new Error('SO tidak ditemukan')
  if (so.status !== 'draft') throw new Error('Status SO tidak valid untuk operasi ini')

  // Lock period check — use orderDate as the record date
  assertCanEdit(new Date(so.orderDate), role as 'operator' | 'supervisor' | 'admin')

  // Stock availability check before confirming
  const items = await findSalesOrderItems(orderId)
  for (const item of items) {
    if (item.itemType === 'egg_grade_a' || item.itemType === 'egg_grade_b') {
      const grade = item.itemType === 'egg_grade_a' ? 'A' : 'B'
      const available = await getStockBalanceByGrade(grade)
      if (available < item.quantity) {
        throw new Error(`Stok tidak mencukupi: Grade ${grade} tersedia ${available} butir, dibutuhkan ${item.quantity} butir`)
      }
    }
  }

  await updateSalesOrderStatus(orderId, 'confirmed', userId)
  return so
}

export async function cancelSO(orderId: string, userId: string, role: string) {
  if (!['supervisor', 'admin'].includes(role)) {
    throw new Error('Akses ditolak')
  }

  const so = await findSalesOrderById(orderId)
  if (!so) throw new Error('SO tidak ditemukan')
  if (so.status !== 'confirmed') throw new Error('Status SO tidak valid untuk operasi ini')

  // Lock period check — use orderDate as the record date
  assertCanEdit(new Date(so.orderDate), role as 'operator' | 'supervisor' | 'admin')

  await updateSalesOrderStatus(orderId, 'cancelled', userId)
  return so
}

export async function deleteDraftSO(orderId: string, userId: string, role: string) {
  if (!['supervisor', 'admin'].includes(role)) {
    throw new Error('Akses ditolak')
  }

  const so = await findSalesOrderById(orderId)
  if (!so) throw new Error('SO tidak ditemukan')
  if (so.status !== 'draft') throw new Error('Status SO tidak valid untuk operasi ini')

  await deleteDraftSOQuery(orderId)
  return so
}

export async function fulfillSO(orderId: string, userId: string, role: string) {
  if (!['supervisor', 'admin'].includes(role)) {
    throw new Error('Akses ditolak')
  }

  const so = await findSalesOrderById(orderId)
  if (!so) throw new Error('SO tidak ditemukan')
  if (so.status !== 'confirmed') throw new Error('Status SO tidak valid untuk operasi ini')

  const items = await findSalesOrderItems(orderId)
  const customer = await findCustomerById(so.customerId)

  if (!customer) throw new Error('Pelanggan tidak ditemukan')

  // Check stock for egg items
  for (const item of items) {
    if (item.itemType === 'egg_grade_a' || item.itemType === 'egg_grade_b') {
      const grade = item.itemType === 'egg_grade_a' ? 'A' : 'B'
      const available = await getStockBalanceByGrade(grade)
      if (available < item.quantity) {
        throw new Error('Stok tidak mencukupi saat transaksi diproses')
      }
    }
  }

  // Check credit limit for credit orders
  if (so.paymentMethod === 'credit') {
    const outstanding = await getCustomerOutstandingCredit(so.customerId)
    const creditLimit = Number(customer.creditLimit)
    const remaining = creditLimit - Number(outstanding)
    if (remaining < Number(so.totalAmount)) {
      throw new Error('Credit limit pelanggan terlampaui')
    }
  }

  // Build inventory OUT movements for egg items
  const movements: NewInventoryMovement[] = items
    .filter((item) => item.itemType === 'egg_grade_a' || item.itemType === 'egg_grade_b')
    .map((item) => ({
      flockId: null,
      movementType: 'out' as const,
      source: 'sale' as const,
      sourceType: 'sales_order_items' as const,
      sourceId: orderId,
      grade: item.itemType === 'egg_grade_a' ? 'A' as const : 'B' as const,
      quantity: item.quantity,
      movementDate: new Date(),
      createdBy: userId,
    }))

  // Assertion: movements filter uses same predicate — fires only if predicates diverge in future refactors
  const hasEggItems = items.some(
    (i) => i.itemType === 'egg_grade_a' || i.itemType === 'egg_grade_b'
  )
  if (hasEggItems && movements.length === 0) {
    throw new Error('Gagal membuat movement inventory — periksa tipe item SO')
  }

  // Build invoice
  const prefix = so.paymentMethod === 'cash' ? 'RCP' : 'INV'
  const invSeq = await countInvoicesThisMonth(prefix)
  const invoiceNumber = generateOrderNumber(prefix, invSeq)

  // Guard: invoice number must be non-empty and total must be > 0
  if (!invoiceNumber || invoiceNumber.trim() === '') {
    throw new Error('Gagal generate nomor invoice')
  }
  if (Number(so.totalAmount) <= 0) {
    throw new Error('Total SO harus lebih dari Rp 0 sebelum dapat diproses')
  }

  const today = new Date()
  const dueDate = new Date(today)
  dueDate.setDate(dueDate.getDate() + (customer.paymentTerms || 0))

  const invoice: NewInvoice = {
    invoiceNumber,
    type: so.paymentMethod === 'cash' ? 'cash_receipt' : 'sales_invoice',
    orderId,
    referenceInvoiceId: null,
    returnId: null,
    customerId: so.customerId,
    issueDate: today,
    dueDate,
    totalAmount: so.totalAmount,
    paidAmount: so.paymentMethod === 'cash' ? so.totalAmount : '0',
    status: so.paymentMethod === 'cash' ? 'paid' : 'sent',
    notes: null,
    createdBy: userId,
  }

  // Build flock retirement updates for flock items
  const flockUpdates = items
    .filter((item) => item.itemType === 'flock' && item.itemRefId)
    .map((item) => ({
      flockId: item.itemRefId!,
      retiredAt: new Date(),
    }))

  await fulfillSOTx(orderId, userId, movements, invoice, flockUpdates)
  return so
}
