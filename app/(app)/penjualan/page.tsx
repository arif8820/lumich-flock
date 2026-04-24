import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth/get-session'
import { listSalesOrders } from '@/lib/db/queries/sales-order.queries'
import { listSalesReturnsWithOrder } from '@/lib/db/queries/sales-return.queries'
import { SOStatusBadge } from '@/components/ui/so-status-badge'
import { Button } from '@/components/ui/button'

const SO_PAGE_SIZE = 20
const RETURN_PAGE_SIZE = 20

const soStatusOptions: Array<'draft' | 'confirmed' | 'fulfilled' | 'cancelled'> = [
  'draft',
  'confirmed',
  'fulfilled',
  'cancelled',
]

const returnStatusOptions: Array<'pending' | 'approved' | 'rejected'> = [
  'pending',
  'approved',
  'rejected',
]

const returnStatusLabels: Record<'pending' | 'approved' | 'rejected', string> = {
  pending: 'Pending',
  approved: 'Disetujui',
  rejected: 'Ditolak',
}

// USED BY: [penjualan/page, return/[id]/page] — count: 2
const returnStatusColors: Record<'pending' | 'approved' | 'rejected', string> = {
  pending: 'var(--lf-blue)',
  approved: 'var(--lf-teal)',
  rejected: 'var(--lf-danger-text)',
}

const returnReasonLabels: Record<string, string> = {
  wrong_grade: 'Salah Grade',
  damaged: 'Rusak',
  quantity_error: 'Salah Jumlah',
  other: 'Lainnya',
}

const soStatusLabels: Record<string, string> = {
  draft: 'Draft',
  confirmed: 'Dikonfirmasi',
  fulfilled: 'Dipenuhi',
  cancelled: 'Dibatalkan',
}

export default async function PenjualanPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string
    status?: string
    page?: string
    returnStatus?: string
    returnPage?: string
  }>
}) {
  const session = await getSession()
  if (!session || session.role === 'operator') redirect('/dashboard')

  const { tab, status, page, returnStatus, returnPage } = await searchParams

  const activeTab = tab === 'return' ? 'return' : 'so'
  const currentSOPage = parseInt(page || '1', 10)
  const currentReturnPage = parseInt(returnPage || '1', 10)

  const soResult =
    activeTab === 'so'
      ? await listSalesOrders(currentSOPage, SO_PAGE_SIZE, status || undefined)
      : { data: [], total: 0 }

  const returnResult =
    activeTab === 'return'
      ? await listSalesReturnsWithOrder(currentReturnPage, RETURN_PAGE_SIZE, returnStatus || undefined)
      : { data: [], total: 0 }

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1
          className="text-[18px] font-bold"
          style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}
        >
          Penjualan
        </h1>
        {activeTab === 'so' && (
          <Button href="/penjualan/new">Buat SO Baru</Button>
        )}
      </div>

      {/* Tab strip */}
      <div className="flex gap-0 border-b" style={{ borderColor: '#e0e8df' }}>
        <Link
          href="/penjualan"
          className="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors"
          style={
            activeTab === 'so'
              ? { borderColor: 'var(--lf-teal)', color: 'var(--lf-teal)' }
              : { borderColor: 'transparent', color: '#8fa08f' }
          }
        >
          Sales Order
        </Link>
        <Link
          href="/penjualan?tab=return"
          className="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors"
          style={
            activeTab === 'return'
              ? { borderColor: 'var(--lf-teal)', color: 'var(--lf-teal)' }
              : { borderColor: 'transparent', color: '#8fa08f' }
          }
        >
          Return
        </Link>
      </div>

      {/* SO Tab Content */}
      {activeTab === 'so' && (
        <>
          {/* SO Status Filter */}
          <div className="flex gap-2">
            <Button
              variant={status === undefined ? 'default' : 'outline'}
              href="/penjualan"
              size="sm"
            >
              Semua
            </Button>
            {soStatusOptions.map((s) => (
              <Button
                key={s}
                variant={status === s ? 'default' : 'outline'}
                href={`/penjualan?status=${s}`}
                size="sm"
              >
                {soStatusLabels[s]}
              </Button>
            ))}
          </div>

          {/* SO Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nomor SO</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelanggan</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {soResult.data.map((so) => (
                  <tr key={so.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{so.orderNumber}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(so.orderDate).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-sm">{so.customerName}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      Rp {Number(so.totalAmount).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <SOStatusBadge status={so.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <Button variant="link" href={`/penjualan/${so.id}`} size="sm">
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))}
                {soResult.data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Tidak ada data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* SO Pagination */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Halaman {currentSOPage} dari {Math.ceil(soResult.total / SO_PAGE_SIZE) || 1}
            </span>
            <div className="flex gap-2">
              {currentSOPage > 1 && (
                <Button
                  variant="outline"
                  href={`/penjualan?status=${status || ''}&page=${currentSOPage - 1}`}
                  size="sm"
                >
                  Sebelumnya
                </Button>
              )}
              {currentSOPage * SO_PAGE_SIZE < soResult.total && (
                <Button
                  variant="outline"
                  href={`/penjualan?status=${status || ''}&page=${currentSOPage + 1}`}
                  size="sm"
                >
                  Selanjutnya
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Return Tab Content */}
      {activeTab === 'return' && (
        <>
          {/* Return Status Filter */}
          <div className="flex gap-2">
            <Button
              variant={returnStatus === undefined ? 'default' : 'outline'}
              href="/penjualan?tab=return"
              size="sm"
            >
              Semua
            </Button>
            {returnStatusOptions.map((s) => (
              <Button
                key={s}
                variant={returnStatus === s ? 'default' : 'outline'}
                href={`/penjualan?tab=return&returnStatus=${s}`}
                size="sm"
              >
                {returnStatusLabels[s]}
              </Button>
            ))}
          </div>

          {/* Return Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nomor Return</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nomor SO</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alasan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {returnResult.data.map((ret) => (
                  <tr key={ret.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{ret.returnNumber}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(ret.returnDate).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {ret.orderNumber ? (
                        <Link
                          href={`/penjualan/${ret.orderId}`}
                          className="font-medium hover:underline"
                          style={{ color: 'var(--lf-blue)' }}
                        >
                          {ret.orderNumber}
                        </Link>
                      ) : (
                        <span style={{ color: '#8fa08f' }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {returnReasonLabels[ret.reasonType] ?? ret.reasonType}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          color: returnStatusColors[ret.status],
                          backgroundColor: `${returnStatusColors[ret.status]}20`,
                        }}
                      >
                        {returnStatusLabels[ret.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <Button variant="link" href={`/penjualan/return/${ret.id}`} size="sm">
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))}
                {returnResult.data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Tidak ada data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Return Pagination */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Halaman {currentReturnPage} dari {Math.ceil(returnResult.total / RETURN_PAGE_SIZE) || 1}
            </span>
            <div className="flex gap-2">
              {currentReturnPage > 1 && (
                <Button
                  variant="outline"
                  href={`/penjualan?tab=return&returnStatus=${returnStatus || ''}&returnPage=${currentReturnPage - 1}`}
                  size="sm"
                >
                  Sebelumnya
                </Button>
              )}
              {currentReturnPage * RETURN_PAGE_SIZE < returnResult.total && (
                <Button
                  variant="outline"
                  href={`/penjualan?tab=return&returnStatus=${returnStatus || ''}&returnPage=${currentReturnPage + 1}`}
                  size="sm"
                >
                  Selanjutnya
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
