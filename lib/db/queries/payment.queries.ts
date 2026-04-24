import { db, DrizzleTx } from '@/lib/db'
import { payments } from '@/lib/db/schema'
import { eq, sql, asc } from 'drizzle-orm'
import type { Payment, NewPayment } from '@/lib/db/schema'

export async function createPayment(payment: NewPayment, tx?: DrizzleTx): Promise<Payment> {
  const executor = tx ?? db
  const [row] = await executor.insert(payments).values(payment).returning()
  return row!
}

export async function listPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
  return db
    .select()
    .from(payments)
    .where(eq(payments.invoiceId, invoiceId))
    .orderBy(asc(payments.paymentDate), asc(payments.createdAt))
}

export async function sumPaymentsByInvoice(invoiceId: string, tx?: DrizzleTx): Promise<number> {
  const executor = tx ?? db
  const [row] = await executor
    .select({
      total: sql<number>`COALESCE(SUM(${payments.amount}), 0)`,
    })
    .from(payments)
    .where(eq(payments.invoiceId, invoiceId))
  return Number(row?.total ?? 0)
}
