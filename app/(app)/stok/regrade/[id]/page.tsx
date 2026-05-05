import { getSession } from '@/lib/auth/get-session'
import { redirect, notFound } from 'next/navigation'
import { findRegradeRequestById } from '@/lib/db/queries/inventory.queries'
import { findItemById } from '@/lib/db/queries/stock-catalog.queries'
import { approveRegradeRequestAction, rejectRegradeRequestAction } from '@/lib/actions/stock.actions'

export default async function RegradeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/stok/regrade')

  const { id } = await params
  const { error } = await searchParams
  const req = await findRegradeRequestById(id)
  if (!req) notFound()

  const [fromItem, toItem] = await Promise.all([
    findItemById(req.fromItemId),
    findItemById(req.toItemId),
  ])

  async function approve() {
    'use server'
    const result = await approveRegradeRequestAction(id)
    if (result.success) redirect('/stok/regrade')
    else redirect(`/stok/regrade/${id}?error=${encodeURIComponent(result.error ?? 'Terjadi kesalahan')}`)
  }

  async function reject() {
    'use server'
    const result = await rejectRegradeRequestAction(id)
    if (result.success) redirect('/stok/regrade')
    else redirect(`/stok/regrade/${id}?error=${encodeURIComponent(result.error ?? 'Terjadi kesalahan')}`)
  }

  const statusStyle =
    req.status === 'PENDING'
      ? { color: 'var(--lf-amber)' }
      : req.status === 'APPROVED'
      ? { color: 'var(--lf-teal)' }
      : { color: 'var(--lf-rose)' }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-semibold text-[var(--lf-text-dark)] mb-6">Detail Regrade</h1>

      {error && (
        <div className="mb-4 bg-[var(--lf-rose-pale)] rounded-lg px-4 py-3 text-sm" style={{ color: 'var(--lf-rose)' }}>{error}</div>
      )}

      <div className="bg-white rounded-xl p-5 shadow-lf-sm border border-[var(--lf-border)] space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--lf-text-mid)]">Status</span>
          <span className="font-medium" style={statusStyle}>{req.status}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--lf-text-mid)]">Dari → Ke</span>
          <span className="font-medium text-[var(--lf-text-dark)]">{fromItem?.name ?? req.fromItemId} → {toItem?.name ?? req.toItemId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--lf-text-mid)]">Jumlah</span>
          <span className="font-medium text-[var(--lf-text-dark)]">{req.quantity.toLocaleString('id')} butir</span>
        </div>
        {req.notes && (
          <div className="flex justify-between">
            <span className="text-[var(--lf-text-mid)]">Catatan</span>
            <span className="text-[var(--lf-text-dark)]">{req.notes}</span>
          </div>
        )}
      </div>

      {req.status === 'PENDING' && (
        <div className="mt-6 flex gap-3">
          <form action={approve} className="flex-1">
            <button type="submit" className="w-full bg-gradient-to-r from-[#7aadd4] to-[#5090be] text-white font-medium rounded-xl py-3 shadow-lf-btn">
              Setujui
            </button>
          </form>
          <form action={reject} className="flex-1">
            <button type="submit" className="w-full font-medium rounded-xl py-3 border" style={{ borderColor: 'var(--lf-rose)', color: 'var(--lf-rose)' }}>
              Tolak
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
