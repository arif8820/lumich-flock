import { db, DrizzleTx } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, sql, asc } from 'drizzle-orm'

// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createPayment(farmSchema: string, payment: any, tx?: DrizzleTx) {
  const { payments } = getFarmSchema(farmSchema)
  const executor = tx ?? db
  const [row] = await executor.insert(payments).values(payment).returning()
  if (!row) throw new Error('Insert payment gagal')
  return row
}

export async function listPaymentsByInvoice(farmSchema: string, invoiceId: string) {
  const { payments } = getFarmSchema(farmSchema)
  return db
    .select()
    .from(payments)
    .where(eq(payments.invoiceId, invoiceId))
    .orderBy(asc(payments.paymentDate), asc(payments.createdAt))
}

export async function sumPaymentsByInvoice(farmSchema: string, invoiceId: string, tx?: DrizzleTx): Promise<number> {
  const { payments } = getFarmSchema(farmSchema)
  const executor = tx ?? db
  const [row] = await executor
    .select({
      total: sql<number>`COALESCE(SUM(${payments.amount}), 0)`,
    })
    .from(payments)
    .where(eq(payments.invoiceId, invoiceId))
  return Number(row?.total ?? 0)
}
