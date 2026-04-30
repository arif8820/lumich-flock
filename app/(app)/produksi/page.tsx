import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { findAllActiveFlocks } from '@/lib/db/queries/flock.queries'
import { findRecentDailyRecords } from '@/lib/db/queries/daily-record.queries'
import Link from 'next/link'

function isWithinLockWindow(recordDate: Date, now: Date, days: number): boolean {
  const recDay = Date.UTC(recordDate.getUTCFullYear(), recordDate.getUTCMonth(), recordDate.getUTCDate())
  const nowDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return Math.round((nowDay - recDay) / 86_400_000) <= days
}

export default async function ProduksiPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const flocks = await findAllActiveFlocks()
  const firstFlock = flocks[0]
  const records = firstFlock ? await findRecentDailyRecords(firstFlock.id, 14) : []
  const now = new Date()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--lf-text-dark)]">Produksi</h1>
        <Link
          href="/produksi/input"
          className="text-sm px-4 py-2 bg-gradient-to-r from-[#7aadd4] to-[#5090be] text-white rounded-lg shadow-lf-btn"
        >
          + Input Harian
        </Link>
      </div>

      {records.length === 0 ? (
        <p className="text-[var(--lf-text-soft)] text-center py-16">Belum ada data produksi.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-y-1">
            <thead>
              <tr className="text-xs text-[var(--lf-text-soft)] uppercase tracking-wide text-left">
                <th className="px-3 py-2">Tanggal</th>
                <th className="px-3 py-2 text-right">Grade A</th>
                <th className="px-3 py-2 text-right">Grade B</th>
                <th className="px-3 py-2 text-right">Kematian</th>
                <th className="px-3 py-2 text-right">Pakan (kg)</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const recordDate = new Date(r.recordDate)
                const isAdmin = session.role === 'admin'
                const lockDays = session.role === 'operator' ? 1 : 7
                const withinLockWindow = isWithinLockWindow(recordDate, now, lockDays)
                const editable = isAdmin || withinLockWindow
                const showEdit = editable
                const showCorrection = isAdmin && !withinLockWindow

                return (
                  <tr key={r.id} className="bg-white rounded-xl shadow-lf-sm">
                    <td className="px-3 py-3 rounded-l-xl font-medium text-[var(--lf-text-dark)]">
                      {recordDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                      {r.isLateInput && (
                        <span className="ml-2 text-[10px] bg-[var(--lf-danger-bg)] rounded px-1.5 py-0.5" style={{ color: 'var(--lf-danger-text)' }}>Terlambat</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right text-[var(--lf-text-dark)]">{r.eggsGradeA.toLocaleString('id')}</td>
                    <td className="px-3 py-3 text-right text-[var(--lf-text-dark)]">{r.eggsGradeB.toLocaleString('id')}</td>
                    <td className="px-3 py-3 text-right text-[var(--lf-text-mid)]">{r.deaths}</td>
                    <td className="px-3 py-3 text-right text-[var(--lf-text-mid)]">
                      {r.feedKg != null ? Number(r.feedKg).toFixed(1) : '—'}
                    </td>
                    <td className="px-3 py-3 text-right rounded-r-xl">
                      {showEdit ? (
                        <Link
                          href={`/produksi/${r.id}/edit`}
                          className="text-xs px-2.5 py-1 rounded-lg"
                          style={{
                            background: showCorrection ? '#fff3cd' : '#e3f0f9',
                            color: showCorrection ? '#856404' : '#3d7cb0',
                          }}
                          title={showCorrection ? 'Koreksi (wajib isi alasan)' : 'Edit'}
                        >
                          {showCorrection ? 'Koreksi' : 'Edit'}
                        </Link>
                      ) : (
                        <span
                          className="text-xs px-2.5 py-1 rounded-lg cursor-not-allowed"
                          style={{ background: '#f0f0f0', color: '#aaa' }}
                          title="Periode koreksi telah berakhir"
                        >
                          Terkunci
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
