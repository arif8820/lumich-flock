import { db, DrizzleTx } from '@/lib/db'
import { invoices, customers, salesOrders, payments, customerCredits } from '@/lib/db/schema'
import { eq, and, asc, desc, count, getTableColumns, sql } from 'drizzle-orm'
import type { Invoice, Customer, Payment, CustomerCredit } from '@/lib/db/schema'

export async function countInvoicesThisMonth(prefix: string): Promise<number> {
  const now = new Date()
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const pattern = `${prefix}-${yearMonth}-%`
  const [row] = await db
    .select({ maxSeq: sql<string>`MAX(CAST(SPLIT_PART(${invoices.invoiceNumber}, '-', 3) AS INTEGER))` })
    .from(invoices)
    .where(sql`${invoices.invoiceNumber} LIKE ${pattern}`)
  return row?.maxSeq ? parseInt(row.maxSeq) : 0
}

export async function findInvoiceByOrderId(orderId: string): Promise<Invoice | null> {
  const [row] = await db.select().from(invoices).where(eq(invoices.orderId, orderId)).limit(1)
  return row ?? null
}

export type InvoiceWithCustomer = Invoice & { customerName: string | null; orderNumber: string | null }

export type InvoiceDetails = Invoice & {
  customer: Customer
  orderNumber: string | null
  payments: Payment[]
  availableCredits: CustomerCredit[]
}

export type AgingBucket = '0-7' | '8-14' | '15-30' | '>30'

export type AgingRow = {
  invoiceId: string
  invoiceNumber: string
  customerId: string
  customerName: string
  issueDate: Date
  dueDate: Date
  totalAmount: number
  paidAmount: number
  outstanding: number
  daysOverdue: number
  bucket: AgingBucket
}

export async function listInvoices(
  page: number = 1,
  pageSize: number = 20,
  status?: Invoice['status'],
  customerId?: string
): Promise<{ data: InvoiceWithCustomer[]; total: number }> {
  const conditions = and(
    status ? eq(invoices.status, status) : undefined,
    customerId ? eq(invoices.customerId, customerId) : undefined
  )
  const whereClause = conditions ?? sql`1=1`

  const [countRow] = await db
    .select({ cnt: count() })
    .from(invoices)
    .where(whereClause)

  const rows = await db
    .select({
      ...getTableColumns(invoices),
      customerName: customers.name,
      orderNumber: salesOrders.orderNumber,
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .leftJoin(salesOrders, eq(invoices.orderId, salesOrders.id))
    .where(whereClause)
    .orderBy(desc(invoices.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)

  return { data: rows as InvoiceWithCustomer[], total: countRow?.cnt ?? 0 }
}

export async function getInvoiceWithDetails(id: string): Promise<InvoiceDetails | null> {
  // Query 1: invoice + customer join + SO join
  const [invoiceRow] = await db
    .select({
      ...getTableColumns(invoices),
      customer: getTableColumns(customers),
      orderNumber: salesOrders.orderNumber,
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .leftJoin(salesOrders, eq(invoices.orderId, salesOrders.id))
    .where(eq(invoices.id, id))
    .limit(1)

  if (!invoiceRow || !invoiceRow.customer) return null

  // Query 2: all payments for this invoice
  const invoicePayments = await db
    .select()
    .from(payments)
    .where(eq(payments.invoiceId, id))
    .orderBy(asc(payments.paymentDate))

  // Query 3: available customer credits (amount > usedAmount)
  const availableCredits = await db
    .select()
    .from(customerCredits)
    .where(
      and(
        eq(customerCredits.customerId, invoiceRow.customer.id),
        sql`${customerCredits.amount} > ${customerCredits.usedAmount}`
      )
    )
    .orderBy(asc(customerCredits.createdAt))

  const { customer, orderNumber, ...invoiceData } = invoiceRow

  return {
    ...invoiceData,
    customer: customer as Customer,
    orderNumber: orderNumber ?? null,
    payments: invoicePayments,
    availableCredits,
  }
}

export async function updateInvoiceStatus(
  id: string,
  status: Invoice['status'],
  tx?: DrizzleTx
): Promise<void> {
  const executor = tx ?? db
  await executor.update(invoices).set({ status }).where(eq(invoices.id, id))
}

export async function updateInvoicePaidAmount(
  id: string,
  paidAmount: string,
  tx?: DrizzleTx
): Promise<void> {
  const executor = tx ?? db
  await executor.update(invoices).set({ paidAmount }).where(eq(invoices.id, id))
}

export async function getOverdueInvoices(): Promise<InvoiceWithCustomer[]> {
  const rows = await db
    .select({
      ...getTableColumns(invoices),
      customerName: customers.name,
      orderNumber: salesOrders.orderNumber,
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .leftJoin(salesOrders, eq(invoices.orderId, salesOrders.id))
    .where(
      and(
        sql`${invoices.status} IN ('sent', 'partial')`,
        sql`${invoices.dueDate} < CURRENT_DATE`
      )
    )
    .orderBy(asc(invoices.dueDate))

  return rows as InvoiceWithCustomer[]
}

export async function getAgingReport(): Promise<AgingRow[]> {
  const rows = await db
    .select({
      ...getTableColumns(invoices),
      customerName: customers.name,
      daysOverdue: sql<number>`CAST(CURRENT_DATE - ${invoices.dueDate} AS INTEGER)`,
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .where(
      and(
        sql`${invoices.status} IN ('sent', 'partial', 'overdue')`,
        sql`${invoices.dueDate} < CURRENT_DATE`
      )
    )
    .orderBy(desc(sql`CURRENT_DATE - ${invoices.dueDate}`))

  return rows.map((row) => {
    const daysOverdue = Number(row.daysOverdue)
    const totalAmount = Number(row.totalAmount)
    const paidAmount = Number(row.paidAmount)
    const outstanding = totalAmount - paidAmount

    let bucket: AgingBucket
    if (daysOverdue <= 7) {
      bucket = '0-7'
    } else if (daysOverdue <= 14) {
      bucket = '8-14'
    } else if (daysOverdue <= 30) {
      bucket = '15-30'
    } else {
      bucket = '>30'
    }

    return {
      invoiceId: row.id,
      invoiceNumber: row.invoiceNumber,
      customerId: row.customerId,
      customerName: row.customerName ?? '',
      issueDate: row.issueDate,
      dueDate: row.dueDate,
      totalAmount,
      paidAmount,
      outstanding,
      daysOverdue,
      bucket,
    }
  })
}
