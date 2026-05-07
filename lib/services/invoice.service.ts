import * as invoiceQueries from '@/lib/db/queries/invoice.queries'
import * as paymentQueries from '@/lib/db/queries/payment.queries'
import * as creditQueries from '@/lib/db/queries/customer-credit.queries'
import * as notificationQueries from '@/lib/db/queries/notification.queries'
import { findSalesOrderItems } from '@/lib/db/queries/sales-order.queries'
import { db } from '@/lib/db'
import type { InvoiceDetails, AgingRow } from '@/lib/db/queries/invoice.queries'
import type { Invoice, SalesOrderItem } from '@/lib/db/schema'

export async function getInvoiceDetails(farmSchema: string, id: string): Promise<InvoiceDetails> {
  const invoice = await invoiceQueries.getInvoiceWithDetails(farmSchema, id)
  if (!invoice) throw new Error('Invoice tidak ditemukan')
  return invoice
}

type RecordPaymentInput = {
  amount: number
  method: 'cash' | 'transfer' | 'cheque' | 'credit'
  referenceNumber?: string
  paymentDate: Date
}

export async function recordPayment(
  farmSchema: string,
  invoiceId: string,
  input: RecordPaymentInput,
  userId: string
): Promise<{ overpayment: boolean; overpaymentAmount?: number }> {
  const invoice = await invoiceQueries.getInvoiceWithDetails(farmSchema, invoiceId)
  if (!invoice) throw new Error('Invoice tidak ditemukan')

  if (!['sent', 'partial', 'overdue'].includes(invoice.status)) {
    throw new Error('Invoice tidak dapat dibayar pada status ini')
  }

  const result = await db.transaction(async (tx) => {
    await paymentQueries.createPayment(
      farmSchema,
      {
        invoiceId,
        paymentDate: input.paymentDate,
        amount: input.amount.toString(),
        method: input.method,
        referenceNumber: input.referenceNumber ?? null,
        createdBy: userId,
      },
      tx
    )

    const newPaidAmount = await paymentQueries.sumPaymentsByInvoice(farmSchema, invoiceId, tx)
    const totalAmount = Number(invoice.totalAmount)

    const newStatus: Invoice['status'] =
      newPaidAmount >= totalAmount - 1 ? 'paid' : 'partial'

    await invoiceQueries.updateInvoicePaidAmount(farmSchema, invoiceId, newPaidAmount, tx)
    await invoiceQueries.updateInvoiceStatus(farmSchema, invoiceId, newStatus, tx)

    if (newPaidAmount > totalAmount) {
      const overpaymentAmt = newPaidAmount - totalAmount

      await creditQueries.createCustomerCredit(
        farmSchema,
        {
          customerId: invoice.customer.id,
          amount: overpaymentAmt.toString(),
          sourceType: 'overpayment',
          sourceInvoiceId: invoiceId,
          usedAmount: '0',
          notes: null,
        },
        tx
      )

      await notificationQueries.createNotification(
        farmSchema,
        {
          type: 'other',
          title: 'Kelebihan Bayar',
          body: `Invoice ${invoice.invoiceNumber} dibayar lebih Rp ${overpaymentAmt.toLocaleString('id-ID')}`,
          targetRole: 'admin',
          relatedEntityType: 'invoices',
          relatedEntityId: invoiceId,
        },
        tx
      )

      return { overpayment: true, overpaymentAmount: overpaymentAmt }
    }

    return { overpayment: false }
  })

  return result
}

export async function applyCredit(
  farmSchema: string,
  invoiceId: string,
  creditId: string,
  amount: number,
  userId: string
): Promise<void> {
  const invoice = await invoiceQueries.getInvoiceWithDetails(farmSchema, invoiceId)
  if (!invoice) throw new Error('Invoice tidak ditemukan')

  if (!['sent', 'partial', 'overdue'].includes(invoice.status)) {
    throw new Error('Invoice tidak dapat dibayar pada status ini')
  }

  if (amount <= 0) throw new Error('Jumlah kredit tidak valid')

  // Pre-validation outside transaction (fast fail)
  const credit = await creditQueries.findCreditById(farmSchema, creditId)
  if (!credit) throw new Error('Kredit tidak ditemukan')

  const available = Number(credit.amount) - Number(credit.usedAmount)
  if (available < amount) throw new Error('Kredit tidak mencukupi')

  await db.transaction(async (tx) => {
    // Re-check inside transaction to prevent TOCTOU race
    const creditInTx = await creditQueries.findCreditById(farmSchema, creditId, tx)
    if (!creditInTx) throw new Error('Kredit tidak ditemukan')
    const availableInTx = Number(creditInTx.amount) - Number(creditInTx.usedAmount)
    if (availableInTx < amount) throw new Error('Kredit tidak mencukupi')

    await paymentQueries.createPayment(
      farmSchema,
      {
        invoiceId,
        paymentDate: new Date(),
        amount: amount.toString(),
        method: 'credit',
        referenceNumber: null,
        createdBy: userId,
      },
      tx
    )

    await creditQueries.updateCreditUsedAmount(farmSchema, creditId, amount, tx)

    const newPaidAmount = await paymentQueries.sumPaymentsByInvoice(farmSchema, invoiceId, tx)
    const totalAmount = Number(invoice.totalAmount)
    const newStatus: Invoice['status'] =
      newPaidAmount >= totalAmount - 1 ? 'paid' : 'partial'

    await invoiceQueries.updateInvoicePaidAmount(farmSchema, invoiceId, newPaidAmount, tx)
    await invoiceQueries.updateInvoiceStatus(farmSchema, invoiceId, newStatus, tx)
  })
}

export async function getAgingData(farmSchema: string): Promise<AgingRow[]> {
  return invoiceQueries.getAgingReport(farmSchema)
}

export async function savePdfMetadata(farmSchema: string, id: string, pdfUrl: string, pdfGeneratedAt: Date): Promise<void> {
  await invoiceQueries.updateInvoicePdfInfo(farmSchema, id, pdfUrl, pdfGeneratedAt)
}

export async function getInvoiceForPdf(
  farmSchema: string,
  id: string
): Promise<InvoiceDetails & { items: SalesOrderItem[] }> {
  const invoice = await getInvoiceDetails(farmSchema, id)

  const items: SalesOrderItem[] =
    invoice.orderId == null ? [] : await findSalesOrderItems(farmSchema, invoice.orderId)

  return { ...invoice, items }
}

export async function markInvoiceSent(farmSchema: string, id: string): Promise<void> {
  const invoice = await invoiceQueries.getInvoiceWithDetails(farmSchema, id)
  if (!invoice) throw new Error('Invoice tidak ditemukan')
  if (invoice.status !== 'draft') return
  await invoiceQueries.updateInvoiceStatus(farmSchema, id, 'sent')
}
