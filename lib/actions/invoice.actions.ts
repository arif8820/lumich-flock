'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth/get-session'
import { recordPayment, applyCredit, getInvoiceForPdf, markInvoiceSent } from '@/lib/services/invoice.service'
import { sendInvoiceEmail } from '@/lib/services/email.service'
import { InvoicePdfDocument } from '@/components/pdf/invoice-pdf-document'

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string }

async function requireAdmin(): Promise<
  { success: false; error: string; session?: never } | { success: true; session: NonNullable<Awaited<ReturnType<typeof getSession>>> }
> {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return { success: false, error: 'Akses ditolak' }
  }
  return { success: true, session }
}

const recordPaymentSchema = z.object({
  invoiceId: z.string().uuid('ID invoice tidak valid'),
  amount: z.coerce.number().positive('Jumlah harus lebih dari 0'),
  method: z.enum(['cash', 'transfer', 'cheque', 'credit']),
  referenceNumber: z.string().max(500).trim().optional(),
  paymentDate: z.coerce.date(),
})

export async function recordPaymentAction(
  formData: FormData
): Promise<ActionResult<{ overpayment: boolean; overpaymentAmount?: number }>> {
  const auth = await requireAdmin()
  if (!auth.success) return auth

  const parsed = recordPaymentSchema.safeParse({
    invoiceId: formData.get('invoiceId'),
    amount: formData.get('amount'),
    method: formData.get('method'),
    referenceNumber: formData.get('referenceNumber') || undefined,
    paymentDate: formData.get('paymentDate'),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }
  }

  try {
    const result = await recordPayment(
      parsed.data.invoiceId,
      {
        amount: parsed.data.amount,
        method: parsed.data.method,
        referenceNumber: parsed.data.referenceNumber,
        paymentDate: parsed.data.paymentDate,
      },
      auth.session.id
    )
    revalidatePath(`/penjualan/invoices/${parsed.data.invoiceId}`)
    revalidatePath('/penjualan/invoices')
    revalidatePath('/laporan')
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Gagal mencatat pembayaran' }
  }
}

export async function applyCreditAction(
  invoiceId: string,
  creditId: string,
  amount: number
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if (!auth.success) return auth

  const parsed = z
    .object({
      invoiceId: z.string().uuid('ID invoice tidak valid'),
      creditId: z.string().uuid('ID kredit tidak valid'),
      amount: z.number().positive('Jumlah harus lebih dari 0'),
    })
    .safeParse({ invoiceId, creditId, amount })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }
  }

  try {
    await applyCredit(invoiceId, creditId, amount, auth.session.id)
    revalidatePath(`/penjualan/invoices/${invoiceId}`)
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Gagal menerapkan kredit' }
  }
}

export async function sendInvoiceEmailAction(invoiceId: string): Promise<ActionResult> {
  const auth = await requireAdmin()
  if (!auth.success) return auth

  const parsed = z.string().uuid('ID invoice tidak valid').safeParse(invoiceId)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }

  try {
    const invoice = await getInvoiceForPdf(invoiceId)

    if (!invoice.customer.email) {
      return { success: false, error: 'Pelanggan tidak memiliki email' }
    }

    const { renderToBuffer } = await import('@react-pdf/renderer')
    const React = await import('react')
    // any: renderToBuffer expects ReactElement<DocumentProps> but InvoicePdfDocument
    // returns a <Document> wrapper — the runtime shape is correct, cast is safe.
    const element = React.createElement(InvoicePdfDocument, { invoice })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await renderToBuffer(element as any)

    await sendInvoiceEmail(invoice.customer.email, invoice, pdfBuffer as Buffer)

    if (invoice.status === 'draft') {
      await markInvoiceSent(invoiceId)
    }

    revalidatePath(`/penjualan/invoices/${invoiceId}`)
    revalidatePath('/penjualan/invoices')
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Gagal mengirim email' }
  }
}
