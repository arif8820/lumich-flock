import { db } from '@/lib/db'
import { invoices } from '@/lib/db/schema'
import { eq, sql, count } from 'drizzle-orm'
import type { Invoice } from '@/lib/db/schema'

export async function countInvoicesThisMonth(prefix: string): Promise<number> {
  const now = new Date()
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const pattern = `${prefix}-${yearMonth}-%`
  const [row] = await db
    .select({ cnt: count() })
    .from(invoices)
    .where(sql`${invoices.invoiceNumber} LIKE ${pattern}`)
  return row?.cnt ?? 0
}

export async function findInvoiceByOrderId(orderId: string): Promise<Invoice | null> {
  const [row] = await db.select().from(invoices).where(eq(invoices.orderId, orderId)).limit(1)
  return row ?? null
}
