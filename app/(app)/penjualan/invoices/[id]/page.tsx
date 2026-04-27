import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth/get-session'
import { getInvoiceDetails } from '@/lib/services/invoice.service'
import { recordPaymentAction, applyCreditAction, sendInvoiceEmailAction } from '@/lib/actions/invoice.actions'
import { getAppSetting } from '@/lib/services/app-settings.service'
import { InvoiceStatusBadge } from '@/components/ui/invoice-status-badge'
import { Button } from '@/components/ui/button'

const invoiceTypeLabels: Record<string, string> = {
  sales_invoice: 'Invoice Penjualan',
  cash_receipt: 'Kwitansi Tunai',
  credit_note: 'Nota Kredit',
}

const paymentMethodLabels: Record<string, string> = {
  cash: 'Tunai',
  transfer: 'Transfer',
  cheque: 'Cek',
  credit: 'Kredit',
}

export default async function InvoiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const session = await getSession()
  if (!session || session.role === 'operator') redirect('/dashboard')

  const { id } = await params
  const { error, success } = await searchParams

  const invoice = await getInvoiceDetails(id).catch(() => null)
  if (!invoice) redirect('/penjualan/invoices')

  const isAdmin = session.role === 'admin'
  const canReceivePayment = !['paid', 'cancelled'].includes(invoice.status)
  const outstanding = Number(invoice.totalAmount) - Number(invoice.paidAmount)

  // WA share setup (admin only)
  const waTemplate = isAdmin ? (await getAppSetting('wa_invoice_template') ?? '') : ''
  const waMessage = waTemplate
    .replace('{customerName}', invoice.customer.name)
    .replace('{invoiceNumber}', invoice.invoiceNumber)
    .replace('{totalAmount}', Number(invoice.totalAmount).toLocaleString('id-ID'))
    .replace('{dueDate}', new Date(invoice.dueDate).toLocaleDateString('id-ID'))
    .replace('{pdfUrl}', invoice.pdfUrl ?? 'belum tersedia')
  const waUrl = (() => {
    if (!isAdmin || !waTemplate || !invoice.customer.phone) return null
    const stripped = invoice.customer.phone.replace(/\D/g, '')
    const waPhone = stripped.startsWith('0') ? '62' + stripped.slice(1) : stripped
    return `https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`
  })()

  // Inline server actions
  async function handleRecordPayment(formData: FormData) {
    'use server'
    formData.set('invoiceId', id)
    const res = await recordPaymentAction(formData)
    if (!res.success) {
      redirect(`/penjualan/invoices/${id}?error=${encodeURIComponent('Gagal mencatat pembayaran')}`)
    }
    redirect(`/penjualan/invoices/${id}?success=Pembayaran berhasil dicatat`)
  }

  async function handleSendEmail() {
    'use server'
    const res = await sendInvoiceEmailAction(id)
    if (!res.success) {
      redirect(`/penjualan/invoices/${id}?error=${encodeURIComponent(res.error ?? 'Gagal mengirim email')}`)
    }
    redirect(`/penjualan/invoices/${id}?success=Email+berhasil+dikirim`)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
          Detail Invoice
        </h1>
        <div className="flex items-center gap-2">
          {/* Download PDF button */}
          <a
            href={`/api/invoices/${id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 text-sm font-medium shadow-lf-btn"
            style={{ backgroundColor: '#e8f0fe', color: '#3d7cb0', borderRadius: '10px' }}
          >
            Unduh PDF
          </a>
          {/* WA share button — admin only, requires customer phone */}
          {isAdmin && waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium shadow-lf-btn"
              style={{ backgroundColor: '#25D366', color: '#fff', borderRadius: '10px' }}
            >
              Kirim WA
            </a>
          )}
          {/* Email send button — admin only, requires customer email */}
          {isAdmin && invoice.customer.email && (
            <form action={handleSendEmail}>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 text-sm font-medium shadow-lf-btn"
                style={{ backgroundColor: 'var(--lf-blue)', color: '#fff', borderRadius: '10px' }}
              >
                Kirim Email
              </button>
            </form>
          )}
          <Button variant="outline" href="/penjualan/invoices">
            Kembali
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div role="alert" className="px-4 py-3 rounded-lg text-sm" style={{ background: '#fde8e8', color: '#c0392b' }}>
          {decodeURIComponent(error)}
        </div>
      )}
      {success && (
        <div role="alert" className="px-4 py-3 rounded-lg text-sm" style={{ background: '#e8f8f5', color: '#1a7a5e' }}>
          {decodeURIComponent(success)}
        </div>
      )}

      {/* Invoice info */}
      <div className="border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">Nomor Invoice</label>
            <p className="text-lg font-semibold">{invoice.invoiceNumber}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Status</label>
            <div className="mt-1">
              <InvoiceStatusBadge status={invoice.status} />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500">Tipe</label>
            <p>{invoiceTypeLabels[invoice.type] ?? invoice.type}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Tanggal Terbit</label>
            <p>{new Date(invoice.issueDate).toLocaleDateString('id-ID')}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Jatuh Tempo</label>
            <p>{new Date(invoice.dueDate).toLocaleDateString('id-ID')}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Pelanggan</label>
            <p>{invoice.customer.name}</p>
            {invoice.customer.phone && (
              <p className="text-xs text-gray-400">{invoice.customer.phone}</p>
            )}
          </div>
          {invoice.orderId && (
            <div>
              <label className="text-sm text-gray-500">Sales Order</label>
              <Link
                href={`/penjualan/${invoice.orderId}`}
                className="font-medium hover:underline"
                style={{ color: 'var(--lf-blue)' }}
              >
                {invoice.orderNumber ?? invoice.orderId}
              </Link>
            </div>
          )}
          {invoice.notes && (
            <div className="col-span-2">
              <label className="text-sm text-gray-500">Catatan</label>
              <p>{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Financial summary */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
            <p className="text-xl font-bold mt-1">Rp {Number(invoice.totalAmount).toLocaleString('id-ID')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Terbayar</p>
            <p className="text-xl font-bold mt-1" style={{ color: 'var(--lf-teal)' }}>
              Rp {Number(invoice.paidAmount).toLocaleString('id-ID')}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Sisa</p>
            <p className="text-xl font-bold mt-1" style={{ color: outstanding > 0 ? '#e67e22' : 'var(--lf-teal)' }}>
              Rp {outstanding.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      {/* Payment history */}
      {invoice.payments.length > 0 && (
        <div>
          <h2 className="text-[16px] font-semibold mb-4">Riwayat Pembayaran</h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metode</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referensi</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {invoice.payments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-200">
                    <td className="px-4 py-3 text-sm">{new Date(p.paymentDate).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-3 text-sm">{paymentMethodLabels[p.method] ?? p.method}</td>
                    <td className="px-4 py-3 text-sm">{p.referenceNumber ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-right">Rp {Number(p.amount).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment form (admin only, status not paid/cancelled/draft) */}
      {isAdmin && canReceivePayment && (
        <div>
          <h2 className="text-[16px] font-semibold mb-4">Catat Pembayaran</h2>
          <div className="border border-gray-200 rounded-lg p-6">
            <form action={handleRecordPayment} className="space-y-4">
              <input type="hidden" name="invoiceId" value={id} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
                  <input
                    type="number"
                    name="amount"
                    min="1"
                    step="1"
                    required
                    className="w-full border border-gray-300 rounded-[10px] px-3 py-2 text-sm"
                    placeholder="Masukkan jumlah"
                    style={{ borderRadius: '10px' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Metode</label>
                  <select
                    name="method"
                    required
                    className="w-full border border-gray-300 rounded-[10px] px-3 py-2 text-sm"
                    style={{ borderRadius: '10px' }}
                  >
                    <option value="cash">Tunai</option>
                    <option value="transfer">Transfer</option>
                    <option value="cheque">Cek</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pembayaran</label>
                  <input
                    type="date"
                    name="paymentDate"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-[10px] px-3 py-2 text-sm"
                    style={{ borderRadius: '10px' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Referensi (opsional)</label>
                  <input
                    type="text"
                    name="referenceNumber"
                    className="w-full border border-gray-300 rounded-[10px] px-3 py-2 text-sm"
                    style={{ borderRadius: '10px' }}
                    placeholder="No. transfer / cek"
                  />
                </div>
              </div>
              <Button type="submit">Catat Pembayaran</Button>
            </form>
          </div>
        </div>
      )}

      {/* Available credits (admin only) */}
      {isAdmin && invoice.status !== 'paid' && invoice.availableCredits.length > 0 && (
        <div>
          <h2 className="text-[16px] font-semibold mb-4">Kredit Tersedia</h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Jumlah Kredit</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tersedia</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Terapkan</th>
                </tr>
              </thead>
              <tbody>
                {invoice.availableCredits.map((credit) => {
                  const available = Number(credit.amount) - Number(credit.usedAmount)
                  const maxApply = Math.min(available, outstanding)

                  async function handleApplyCredit(formData: FormData) {
                    'use server'
                    const amount = Number(formData.get('amount'))
                    const res = await applyCreditAction(id, credit.id, amount)
                    if (!res.success) {
                      redirect(`/penjualan/invoices/${id}?error=${encodeURIComponent('Gagal menerapkan kredit')}`)
                    }
                    redirect(`/penjualan/invoices/${id}?success=Kredit berhasil diterapkan`)
                  }

                  return (
                    <tr key={credit.id} className="border-b border-gray-200">
                      <td className="px-4 py-3 text-sm">
                        {credit.sourceType === 'overpayment' ? 'Kelebihan Bayar' : 'Nota Kredit'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        Rp {Number(credit.amount).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        Rp {available.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <form action={handleApplyCredit} className="flex gap-2 justify-end items-center">
                          <input
                            type="number"
                            name="amount"
                            min="1"
                            max={maxApply}
                            defaultValue={maxApply}
                            step="1"
                            className="w-32 border border-gray-300 rounded-[10px] px-2 py-1 text-sm"
                            style={{ borderRadius: '10px' }}
                          />
                          <Button type="submit" size="sm" variant="outline">
                            Terapkan
                          </Button>
                        </form>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
