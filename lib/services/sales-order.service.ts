import * as customerQueries from '@/lib/db/queries/customer.queries'
import * as salesOrderQueries from '@/lib/db/queries/sales-order.queries'
import * as inventoryQueries from '@/lib/db/queries/inventory.queries'
import { generateOrderNumber } from '@/lib/utils/order-number'
import type { NewSalesOrder, NewSalesOrderItem } from '@/lib/db/schema'

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
const { getStockBalance } = inventoryQueries

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

  const salesOrderItems: NewSalesOrderItem[] = itemsWithSubtotal.map((item) => ({
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
      const available = await getStockBalance('', grade)
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

  await fulfillSOTx(orderId, userId)
  return so
}
