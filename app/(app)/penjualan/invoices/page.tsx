import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { listInvoices } from '@/lib/db/queries/invoice.queries'
import { InvoiceStatusBadge } from '@/components/ui/invoice-status-badge'
import { Button } from '@/components/ui/button'
import type { Invoice } from '@/lib/db/schema'

const PAGE_SIZE = 20

const statusOptions: Array<Invoice['status']> = ['sent', 'partial', 'paid', 'overdue', 'cancelled']

const statusLabels: Record<Invoice['status'], string> = {
  draft: 'Draft',
  sent: 'Terkirim',
  partial: 'Sebagian',
  paid: 'Lunas',
  overdue: 'Jatuh Tempo',
  cancelled: 'Dibatalkan',
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const session = await getSession()
  if (!session || session.role === 'operator') redirect('/dashboard')

  const { status, page } = await searchParams
  const currentPage = parseInt(page || '1', 10)

  const validStatuses: Invoice['status'][] = ['draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled']
  const statusFilter =
    status && validStatuses.includes(status as Invoice['status'])
      ? (status as Invoice['status'])
      : undefined

  const result = await listInvoices(currentPage, PAGE_SIZE, statusFilter)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
          Invoice
        </h1>
        <Button variant="outline" href="/penjualan">
          ← Penjualan
        </Button>
      </div>

      {/* Status filter buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === undefined ? 'default' : 'outline'}
          href="/penjualan/invoices"
          size="sm"
        >
          Semua
        </Button>
        {statusOptions.map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? 'default' : 'outline'}
            href={`/penjualan/invoices?status=${s}`}
            size="sm"
          >
            {statusLabels[s]}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nomor Invoice</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jatuh Tempo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelanggan</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Terbayar</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Detail</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((inv) => (
              <tr key={inv.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{inv.invoiceNumber}</td>
                <td className="px-4 py-3 text-sm">{new Date(inv.issueDate).toLocaleDateString('id-ID')}</td>
                <td className="px-4 py-3 text-sm">{new Date(inv.dueDate).toLocaleDateString('id-ID')}</td>
                <td className="px-4 py-3 text-sm">{inv.customerName ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-right">Rp {Number(inv.totalAmount).toLocaleString('id-ID')}</td>
                <td className="px-4 py-3 text-sm text-right">Rp {Number(inv.paidAmount).toLocaleString('id-ID')}</td>
                <td className="px-4 py-3 text-sm">
                  <InvoiceStatusBadge status={inv.status} />
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <Button variant="link" href={`/penjualan/invoices/${inv.id}`} size="sm">
                    Detail
                  </Button>
                </td>
              </tr>
            ))}
            {result.data.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  Tidak ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Halaman {currentPage} dari {Math.ceil(result.total / PAGE_SIZE) || 1}
        </span>
        <div className="flex gap-2">
          {currentPage > 1 && (
            <Button
              variant="outline"
              href={`/penjualan/invoices${status ? `?status=${status}&` : '?'}page=${currentPage - 1}`}
              size="sm"
            >
              Sebelumnya
            </Button>
          )}
          {currentPage * PAGE_SIZE < result.total && (
            <Button
              variant="outline"
              href={`/penjualan/invoices${status ? `?status=${status}&` : '?'}page=${currentPage + 1}`}
              size="sm"
            >
              Selanjutnya
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
