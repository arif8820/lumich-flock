import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import {
  findSalesOrderById,
  findSalesOrderItems,
} from '@/lib/db/queries/sales-order.queries'
import {
  confirmSOAction,
  cancelSOAction,
  deleteDraftSOAction,
  fulfillSOAction,
} from '@/lib/actions/sales-order.actions'
import { SOStatusBadge } from '@/components/ui/so-status-badge'
import { Button } from '@/components/ui/button'

export default async function SODetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session || session.role === 'operator') redirect('/dashboard')

  const { id } = await params
  const so = await findSalesOrderById(id)
  if (!so) redirect('/penjualan')

  const items = await findSalesOrderItems(id)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
          Detail Sales Order
        </h1>
        <Button variant="outline" href="/penjualan">
          Kembali
        </Button>
      </div>

      {/* SO Header */}
      <div className="border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">Nomor SO</label>
            <p className="text-lg font-semibold">{so.orderNumber}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Status</label>
            <div className="mt-1">
              <SOStatusBadge status={so.status} />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500">Tanggal</label>
            <p>{new Date(so.orderDate).toLocaleDateString('id-ID')}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Metode Pembayaran</label>
            <p>{so.paymentMethod === 'cash' ? 'Tunai' : 'Kredit'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Pelanggan</label>
            <p>{so.customerName}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Total</label>
            <p className="text-lg font-semibold">
              Rp {Number(so.totalAmount).toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {so.notes && (
          <div>
            <label className="text-sm text-gray-500">Catatan</label>
            <p>{so.notes}</p>
          </div>
        )}
      </div>

      {/* SO Items */}
      <div>
        <h2 className="text-[16px] font-semibold mb-4">Item</h2>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Harga</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Diskon</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="px-4 py-3 text-sm">{index + 1}</td>
                  <td className="px-4 py-3 text-sm">{item.itemType}</td>
                  <td className="px-4 py-3 text-sm">{item.description || '-'}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    Rp {Number(item.pricePerUnit).toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">{item.discountPct}%</td>
                  <td className="px-4 py-3 text-sm text-right">
                    Rp {Number(item.subtotal).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={6} className="px-4 py-3 text-right font-medium">
                  Subtotal:
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  Rp {Number(so.subtotal).toLocaleString('id-ID')}
                </td>
              </tr>
              <tr>
                <td colSpan={6} className="px-4 py-3 text-right font-medium">
                  PPN ({so.taxPct}%):
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  Rp {Number(so.taxAmount).toLocaleString('id-ID')}
                </td>
              </tr>
              <tr className="bg-gray-100 font-bold">
                <td colSpan={6} className="px-4 py-3 text-right" style={{ color: 'var(--lf-teal)' }}>
                  Total:
                </td>
                <td className="px-4 py-3 text-right" style={{ color: 'var(--lf-teal)' }}>
                  Rp {Number(so.totalAmount).toLocaleString('id-ID')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Status Actions */}
      <div className="flex gap-2">
        {so.status === 'draft' && (
          <>
            <form action={confirmSOAction.bind(null, id)}>
              <Button type="submit">Konfirmasi</Button>
            </form>
            {['supervisor', 'admin'].includes(session.role) && (
              <form action={deleteDraftSOAction.bind(null, id)}>
                <Button type="submit" variant="destructive">
                  Hapus Draft
                </Button>
              </form>
            )}
          </>
        )}

        {so.status === 'confirmed' && (
          <>
            <form action={fulfillSOAction.bind(null, id)}>
              <Button type="submit">Fulfill</Button>
            </form>
            <form action={cancelSOAction.bind(null, id)}>
              <Button type="submit" variant="destructive">
                Batalkan
              </Button>
            </form>
          </>
        )}

        {so.status === 'fulfilled' && ['supervisor', 'admin'].includes(session.role) && (
          <Button href={`/penjualan/${id}/return/new`}>Buat Return</Button>
        )}

        {so.status === 'cancelled' && (
          <span className="text-gray-500 text-sm">SO dibatalkan</span>
        )}
      </div>
    </div>
  )
}
