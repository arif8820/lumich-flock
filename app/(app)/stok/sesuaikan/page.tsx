import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { findAllActiveFlocks } from '@/lib/db/queries/flock.queries'
import { createStockAdjustmentAction } from '@/lib/actions/stock.actions'

export default async function SesuaikanPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await getSession()
  if (!session || session.role === 'operator') redirect('/stok')

  const flocks = await findAllActiveFlocks()
  const { error } = await searchParams

  async function handleSubmit(formData: FormData) {
    'use server'
    const result = await createStockAdjustmentAction(formData)
    if (result.success) redirect('/stok')
    else redirect(`/stok/sesuaikan?error=${encodeURIComponent(result.error)}`)
  }

  const inputClass = 'mt-1 w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]'

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold text-[var(--lf-text-dark)] mb-6">Penyesuaian Stok</h1>
      {error && (
        <div className="mb-4 bg-[#fdeeed] text-[#e07a6a] rounded-lg px-4 py-3 text-sm">{error}</div>
      )}
      <form action={handleSubmit} className="bg-white rounded-xl p-5 shadow-lf-sm border border-[var(--lf-border)] space-y-4">
        <div>
          <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Flock</label>
          <select name="flockId" className={inputClass} required>
            {flocks.map((f) => <option key={f.id} value={f.id}>{f.name} — {f.coopName}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Tanggal</label>
          <input type="date" name="adjustmentDate" defaultValue={new Date().toISOString().split('T')[0]} className={inputClass} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Grade</label>
            <select name="grade" className={inputClass} required>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Kuantitas (+/-)</label>
            <input type="number" name="quantity" placeholder="-50 atau 100" className={inputClass} required />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Alasan</label>
          <input type="text" name="reason" className={inputClass} required />
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Catatan</label>
          <input type="text" name="notes" className={inputClass} />
        </div>
        <button type="submit" className="w-full bg-gradient-to-r from-[#7aadd4] to-[#5090be] text-white font-medium rounded-xl py-3 shadow-lf-btn">
          Simpan Penyesuaian
        </button>
      </form>
    </div>
  )
}
