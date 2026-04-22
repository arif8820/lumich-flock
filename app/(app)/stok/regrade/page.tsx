import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { findAllActiveFlocks } from '@/lib/db/queries/flock.queries'
import { findPendingRegradeRequests } from '@/lib/db/queries/inventory.queries'
import { submitRegradeRequestAction } from '@/lib/actions/stock.actions'
import Link from 'next/link'

export default async function RegradePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/stok')

  const [flocks, pending] = await Promise.all([
    findAllActiveFlocks(),
    findPendingRegradeRequests(),
  ])
  const { error } = await searchParams

  async function handleSubmit(formData: FormData) {
    'use server'
    const result = await submitRegradeRequestAction(formData)
    if (result.success) redirect('/stok/regrade')
    else redirect(`/stok/regrade?error=${encodeURIComponent(result.error)}`)
  }

  const inputClass = 'mt-1 w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]'

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-xl font-semibold text-[var(--lf-text-dark)]">Regrade Telur</h1>

      {error && <div className="bg-[#fdeeed] text-[#e07a6a] rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form action={handleSubmit} className="bg-white rounded-xl p-5 shadow-lf-sm border border-[var(--lf-border)] space-y-4">
        <p className="text-sm font-medium text-[var(--lf-text-dark)]">Permintaan Regrade Baru</p>
        <div>
          <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Flock</label>
          <select name="flockId" className={inputClass} required>
            {flocks.map((f) => <option key={f.id} value={f.id}>{f.name} — {f.coopName}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Dari Grade</label>
            <select name="gradeFrom" className={inputClass} required>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Ke Grade</label>
            <select name="gradeTo" className={inputClass} required>
              <option value="B">Grade B</option>
              <option value="A">Grade A</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Jumlah</label>
            <input type="number" name="quantity" min="1" className={inputClass} required />
          </div>
        </div>
        <input type="hidden" name="requestDate" value={new Date().toISOString().split('T')[0]} />
        <div>
          <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Catatan</label>
          <input type="text" name="notes" className={inputClass} />
        </div>
        <button type="submit" className="w-full bg-gradient-to-r from-[#7aadd4] to-[#5090be] text-white font-medium rounded-xl py-3 shadow-lf-btn">
          Kirim Permintaan
        </button>
      </form>

      <div>
        <p className="text-sm font-medium text-[var(--lf-text-dark)] mb-3">Menunggu Persetujuan ({pending.length})</p>
        {pending.length === 0 ? (
          <p className="text-[var(--lf-text-soft)] text-sm">Tidak ada permintaan pending.</p>
        ) : (
          <div className="space-y-2">
            {pending.map((r) => (
              <div key={r.id} className="bg-white rounded-xl p-4 shadow-lf-sm border border-[var(--lf-border)] flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium text-[var(--lf-text-dark)]">Grade {r.gradeFrom} → {r.gradeTo}</span>
                  <span className="ml-2 text-[var(--lf-text-mid)]">{r.quantity.toLocaleString('id')} butir</span>
                </div>
                {session.role === 'admin' && (
                  <Link href={`/stok/regrade/${r.id}`} className="text-xs text-[var(--lf-blue-active)] hover:underline">
                    Tinjau →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
