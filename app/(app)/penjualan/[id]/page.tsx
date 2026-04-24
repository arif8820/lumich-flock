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
import { findSalesReturnsByOrderId } from '@/lib/db/queries/sales-return.queries'
import { SOStatusBadge } from '@/components/ui/so-status-badge'
import { Button } from '@/components/ui/button'

const itemTypeLabels: Record<string, string> = {
  egg_grade_a: 'Telur Grade A',
  egg_grade_b: 'Telur Grade B',
  flock: 'Ayam',
  other: 'Lainnya',
}

const returnStatusLabels: Record<string, string> = {
  pending: 'Pending',
  approved: 'Disetujui',
  rejected: 'Ditolak',
}

export default async function SODetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const session = await getSession()
  if (!session || session.role === 'operator') redirect('/dashboard')

  const { id } = await params
  const { error } = await searchParams
  const so = await findSalesOrderById(id)
  if (!so) redirect('/penjualan')

  const items = await findSalesOrderItems(id)
  const returns = await findSalesReturnsByOrderId(id)

  async function confirmAction() {
    'use server'
    const res = await confirmSOAction(id)
    if (!res.success) redirect(`/penjualan/${id}?error=${encodeURIComponent(res.error ?? 'Gagal')}`)
  }
  async function cancelAction() {
    'use server'
    const res = await cancelSOAction(id)
    if (!res.success) redirect(`/penjualan/${id}?error=${encodeURIComponent(res.error ?? 'Gagal')}`)
  }
  async function deleteAction() {
    'use server'
    const res = await deleteDraftSOAction(id)
    if (!res.success) redirect(`/penjualan/${id}?error=${encodeURIComponent(res.error ?? 'Gagal')}`)
  }
  async function fulfillAction() {
    'use server'
    const res = await fulfillSOAction(id)
    if (!res.success) redirect(`/penjualan/${id}?error=${encodeURIComponent(res.error ?? 'Gagal')}`)
  }

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

      {error && (
        <div role="alert" className="px-4 py-3 rounded-lg text-sm" style={{ background: '#fde8e8', color: '#c0392b' }}>
          {decodeURIComponent(error)}
        </div>
      )}

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
                  <td className="px-4 py-3 text-sm">{itemTypeLabels[item.itemType] ?? item.itemType}</td>
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

      {/* Sales Returns */}
      {returns.length > 0 && (
        <div>
          <h2 className="text-[16px] font-semibold mb-4">Sales Return</h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nomor Return</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((ret) => (
                  <tr key={ret.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{ret.returnNumber}</td>
                    <td className="px-4 py-3 text-sm">{new Date(ret.returnDate).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-3 text-sm">{returnStatusLabels[ret.status] ?? ret.status}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <Button variant="link" href={`/penjualan/return/${ret.id}`} size="sm">
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status Actions */}
      <div className="flex gap-2">
        {so.status === 'draft' && (
          <>
            <form action={confirmAction}>
              <Button type="submit">Konfirmasi</Button>
            </form>
            {['supervisor', 'admin'].includes(session.role) && (
              <form action={deleteAction}>
                <Button type="submit" variant="destructive">
                  Hapus Draft
                </Button>
              </form>
            )}
          </>
        )}

        {so.status === 'confirmed' && (
          <>
            <form action={fulfillAction}>
              <Button type="submit">Fulfill</Button>
            </form>
            <form action={cancelAction}>
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
