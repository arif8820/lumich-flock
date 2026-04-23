import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { listSalesOrders } from '@/lib/db/queries/sales-order.queries'
import { SOStatusBadge } from '@/components/ui/so-status-badge'
import { Button } from '@/components/ui/button'

const statusOptions: Array<'draft' | 'confirmed' | 'fulfilled' | 'cancelled'> = [
  'draft',
  'confirmed',
  'fulfilled',
  'cancelled',
]

export default async function PenjualanPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const session = await getSession()
  if (!session || session.role === 'operator') redirect('/dashboard')

  const { status, page } = await searchParams
  const currentPage = parseInt(page || '1', 10)

  const { data, total } = await listSalesOrders(
    currentPage,
    20,
    status || undefined
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
          Penjualan
        </h1>
        <Button href="/penjualan/new">Buat SO Baru</Button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        <Button
          variant={status === undefined ? 'default' : 'outline'}
          href="/penjualan"
          size="sm"
        >
          Semua
        </Button>
        {statusOptions.map((s) => (
          <Button
            key={s}
            variant={status === s ? 'default' : 'outline'}
            href={`/penjualan?status=${s}`}
            size="sm"
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
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
            {data.map((so) => (
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
                  <Button
                    variant="link"
                    href={`/penjualan/${so.id}`}
                    size="sm"
                  >
                    Detail
                  </Button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
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
          Halaman {currentPage} dari {Math.ceil(total / 20) || 1}
        </span>
        <div className="flex gap-2">
          {currentPage > 1 && (
            <Button
              variant="outline"
              href={`/penjualan?status=${status || ''}&page=${currentPage - 1}`}
              size="sm"
            >
              Sebelumnya
            </Button>
          )}
          {currentPage * 20 < total && (
            <Button
              variant="outline"
              href={`/penjualan?status=${status || ''}&page=${currentPage + 1}`}
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
