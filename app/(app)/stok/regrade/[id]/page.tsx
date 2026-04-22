import { getSession } from '@/lib/auth/get-session'
import { redirect, notFound } from 'next/navigation'
import { findRegradeRequestById } from '@/lib/db/queries/inventory.queries'
import { approveRegradeRequestAction, rejectRegradeRequestAction } from '@/lib/actions/stock.actions'

export default async function RegradeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/stok/regrade')

  const { id } = await params
  const req = await findRegradeRequestById(id)
  if (!req) notFound()

  async function approve() {
    'use server'
    const result = await approveRegradeRequestAction(id)
    if (result.success) redirect('/stok/regrade')
    else redirect(`/stok/regrade/${id}?error=${encodeURIComponent(result.error)}`)
  }

  async function reject() {
    'use server'
    const result = await rejectRegradeRequestAction(id)
    if (result.success) redirect('/stok/regrade')
    else redirect(`/stok/regrade/${id}?error=${encodeURIComponent(result.error)}`)
  }

  const statusColor = req.status === 'PENDING' ? 'text-[#d4a96a]' : req.status === 'APPROVED' ? 'text-[#7ab8b0]' : 'text-[#e07a6a]'

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-semibold text-[var(--lf-text-dark)] mb-6">Detail Regrade</h1>
      <div className="bg-white rounded-xl p-5 shadow-lf-sm border border-[var(--lf-border)] space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--lf-text-mid)]">Status</span>
          <span className={`font-medium ${statusColor}`}>{req.status}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--lf-text-mid)]">Dari → Ke</span>
          <span className="font-medium text-[var(--lf-text-dark)]">Grade {req.gradeFrom} → Grade {req.gradeTo}</span>
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
            <button type="submit" className="w-full border border-[#e07a6a] text-[#e07a6a] font-medium rounded-xl py-3">
              Tolak
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
