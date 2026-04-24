import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import {
  findSalesReturnById,
  findSalesReturnItems,
} from '@/lib/db/queries/sales-return.queries'
import { findSalesOrderById } from '@/lib/db/queries/sales-order.queries'
import {
  approveSalesReturnAction,
  rejectSalesReturnAction,
} from '@/lib/actions/sales-return.actions'
import { Button } from '@/components/ui/button'

const statusLabels: Record<'pending' | 'approved' | 'rejected', string> = {
  pending: 'Pending',
  approved: 'Disetujui',
  rejected: 'Ditolak',
}

const itemTypeLabels: Record<string, string> = {
  egg_grade_a: 'Telur Grade A',
  egg_grade_b: 'Telur Grade B',
  flock: 'Ayam',
  other: 'Lainnya',
}

// USED BY: [penjualan/page, return/[id]/page] — count: 2
const statusColors: Record<'pending' | 'approved' | 'rejected', string> = {
  pending: 'var(--lf-blue)',
  approved: 'var(--lf-teal)',
  rejected: 'var(--lf-danger-text)',
}

export default async function ReturnDetailPage({
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
  const salesReturn = await findSalesReturnById(id)
  if (!salesReturn) redirect('/penjualan')

  const items = await findSalesReturnItems(id)
  const so = await findSalesOrderById(salesReturn.orderId)

  async function approveAction() {
    'use server'
    const res = await approveSalesReturnAction(id)
    if (!res.success) redirect(`/penjualan/return/${id}?error=${encodeURIComponent(res.error ?? 'Gagal')}`)
    redirect(`/penjualan/return/${id}`)
  }
  async function rejectAction() {
    'use server'
    const res = await rejectSalesReturnAction(id)
    if (!res.success) redirect(`/penjualan/return/${id}?error=${encodeURIComponent(res.error ?? 'Gagal')}`)
    redirect(`/penjualan/return/${id}`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
          Detail Sales Return
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

      {/* Return Header */}
      <div className="border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">Nomor Return</label>
            <p className="text-lg font-semibold">{salesReturn.returnNumber}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Status</label>
            <div className="mt-1">
              <span
                className="inline-flex items-center-center px-3 py-1 rounded-full text-sm font-medium"
                style={{ color: statusColors[salesReturn.status], backgroundColor: `${statusColors[salesReturn.status]}20` }}
              >
                {statusLabels[salesReturn.status]}
              </span>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500">Tanggal Return</label>
            <p>{new Date(salesReturn.returnDate).toLocaleDateString('id-ID')}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Alasan</label>
            <p>
              {salesReturn.reasonType === 'wrong_grade' && 'Salah Grade'}
              {salesReturn.reasonType === 'damaged' && 'Rusak'}
              {salesReturn.reasonType === 'quantity_error' && 'Salah Jumlah'}
              {salesReturn.reasonType === 'other' && 'Lainnya'}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Sales Order</label>
            <p className="font-medium">
              {so?.orderNumber || salesReturn.orderId}
            </p>
          </div>
        </div>

        {salesReturn.notes && (
          <div>
            <label className="text-sm text-gray-500">Catatan</label>
            <p>{salesReturn.notes}</p>
          </div>
        )}

        {salesReturn.status !== 'pending' && salesReturn.reviewedAt && (
          <div>
            <label className="text-sm text-gray-500">Direview Pada</label>
            <p>{new Date(salesReturn.reviewedAt).toLocaleString('id-ID')}</p>
          </div>
        )}
      </div>

      {/* Return Items */}
      <div>
        <h2 className="text-[16px] font-semibold mb-4">Item Return</h2>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Satuan</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="px-4 py-3 text-sm">{index + 1}</td>
                  <td className="px-4 py-3 text-sm">{itemTypeLabels[item.itemType] ?? item.itemType}</td>
                  <td className="px-4 py-3 text-sm text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm">{item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Actions - only for pending returns */}
      {session.role === 'admin' && salesReturn.status === 'pending' && (
        <div className="flex gap-2">
          <form action={approveAction}>
            <Button type="submit">Setujui</Button>
          </form>
          <form action={rejectAction}>
            <Button type="submit" variant="destructive">
              Tolak
            </Button>
          </form>
        </div>
      )}

      {salesReturn.status !== 'pending' && (
        <div className="text-sm text-gray-500">
          Return ini sudah {salesReturn.status === 'approved' ? 'disetujui' : 'ditolak'}.
        </div>
      )}
    </div>
  )
}
