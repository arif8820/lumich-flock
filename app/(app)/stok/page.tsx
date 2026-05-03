import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { findAllActiveFlocks } from '@/lib/db/queries/flock.queries'
import { getAllStockBalances } from '@/lib/db/queries/inventory.queries'
import Link from 'next/link'

export default async function StokPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [flocks, balances] = await Promise.all([findAllActiveFlocks(), getAllStockBalances()])
  const balanceMap = new Map(balances.map((b) => [`${b.flockId}:${b.grade}`, b.balance]))
  const stockData = flocks.map((f) => ({
    ...f,
    gradeA: balanceMap.get(`${f.id}:A`) ?? 0,
    gradeB: balanceMap.get(`${f.id}:B`) ?? 0,
  }))

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--lf-text-dark)]">Stok Telur</h1>
        {session.role !== 'operator' && (
          <div className="flex gap-2">
            <Link href="/stok/sesuaikan" className="press-feedback text-sm px-3 py-2 bg-gradient-to-r from-[#7aadd4] to-[#5090be] text-white rounded-lg shadow-lf-btn">
              Penyesuaian
            </Link>
            <Link href="/stok/regrade" className="press-feedback text-sm px-3 py-2 border border-[var(--lf-border)] rounded-lg text-[var(--lf-text-mid)]">
              Regrade
            </Link>
          </div>
        )}
      </div>

      <div className="grid gap-3">
        {stockData.length === 0 && (
          <p className="text-[var(--lf-text-soft)] text-center py-16">Tidak ada flock aktif.</p>
        )}
        {stockData.map((f) => (
          <div key={f.id} className="bg-white rounded-xl p-4 shadow-lf-sm border border-[var(--lf-border)] flex items-center justify-between">
            <div>
              <p className="font-medium text-[var(--lf-text-dark)]">{f.name}</p>
              <p className="text-xs text-[var(--lf-text-soft)] mt-0.5">{f.coopName}</p>
            </div>
            <div className="flex gap-6 text-right">
              <div>
                <p className="text-[10px] text-[var(--lf-text-soft)] uppercase tracking-wide">Grade A</p>
                <p className="font-semibold text-[var(--lf-text-dark)]">{f.gradeA.toLocaleString('id')}</p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--lf-text-soft)] uppercase tracking-wide">Grade B</p>
                <p className="font-semibold text-[var(--lf-text-dark)]">{f.gradeB.toLocaleString('id')}</p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--lf-text-soft)] uppercase tracking-wide">Total</p>
                <p className="font-semibold text-[var(--lf-blue-active)]">{(f.gradeA + f.gradeB).toLocaleString('id')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
