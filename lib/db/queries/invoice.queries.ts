import { db, DrizzleTx } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, and, asc, desc, count, getTableColumns, sql, inArray } from 'drizzle-orm'

export type AgingBucket = '0-7' | '8-14' | '15-30' | '>30'

export type AgingRow = {
  invoiceId: string
  invoiceNumber: string
  customerId: string
  customerName: string
  issueDate: string
  dueDate: string
  totalAmount: number
  paidAmount: number
  outstanding: number
  daysOverdue: number
  bucket: AgingBucket
}

export async function countInvoicesThisMonth(farmSchema: string, prefix: string): Promise<number> {
  const { invoices } = getFarmSchema(farmSchema)
  const now = new Date()
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const pattern = `${prefix}-${yearMonth}-%`
  const [row] = await db
    .select({ maxSeq: sql<string>`MAX(CAST(SPLIT_PART(${invoices.invoiceNumber}, '-', 3) AS INTEGER))` })
    .from(invoices)
    .where(sql`${invoices.invoiceNumber} LIKE ${pattern}`)
  return row?.maxSeq ? parseInt(row.maxSeq) : 0
}

export async function findInvoiceByOrderId(farmSchema: string, orderId: string) {
  const { invoices } = getFarmSchema(farmSchema)
  const [row] = await db.select().from(invoices).where(eq(invoices.orderId, orderId)).limit(1)
  return row ?? null
}

export async function listInvoices(
  farmSchema: string,
  page: number = 1,
  pageSize: number = 20,
  status?: string,
  customerId?: string
) {
  const { invoices, customers, salesOrders } = getFarmSchema(farmSchema)
  const conditions = and(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    status ? eq(invoices.status, status as any) : undefined,
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { data: rows as any[], total: countRow?.cnt ?? 0 }
}

export async function getInvoiceWithDetails(farmSchema: string, id: string) {
  const { invoices, customers, salesOrders, payments, customerCredits } = getFarmSchema(farmSchema)

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
    customer,
    orderNumber: orderNumber ?? null,
    payments: invoicePayments,
    availableCredits,
  }
}

export type InvoiceDetails = NonNullable<Awaited<ReturnType<typeof getInvoiceWithDetails>>>

export async function updateInvoiceStatus(
  farmSchema: string,
  id: string,
  status: string,
  tx?: DrizzleTx
): Promise<void> {
  const { invoices } = getFarmSchema(farmSchema)
  const executor = tx ?? db
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await executor.update(invoices).set({ status: status as any }).where(eq(invoices.id, id))
}

export async function updateInvoicePaidAmount(
  farmSchema: string,
  id: string,
  paidAmount: number,
  tx?: DrizzleTx
): Promise<void> {
  const { invoices } = getFarmSchema(farmSchema)
  const executor = tx ?? db
  await executor.update(invoices).set({ paidAmount: paidAmount.toString() }).where(eq(invoices.id, id))
}

export async function getOverdueInvoices(farmSchema: string) {
  const { invoices, customers, salesOrders } = getFarmSchema(farmSchema)
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
        inArray(invoices.status, ['sent', 'partial']),
        sql`${invoices.dueDate} < CURRENT_DATE`
      )
    )
    .orderBy(asc(invoices.dueDate))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows as any[]
}

export async function updateInvoicePdfInfo(farmSchema: string, id: string, pdfUrl: string, pdfGeneratedAt: Date): Promise<void> {
  const { invoices } = getFarmSchema(farmSchema)
  await db.update(invoices).set({ pdfUrl, pdfGeneratedAt }).where(eq(invoices.id, id))
}

export async function getAgingReport(farmSchema: string): Promise<AgingRow[]> {
  const { invoices, customers } = getFarmSchema(farmSchema)
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
        inArray(invoices.status, ['sent', 'partial', 'overdue']),
        sql`${invoices.dueDate} < CURRENT_DATE`,
        sql`CAST(${invoices.totalAmount} AS NUMERIC) > 0`
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
