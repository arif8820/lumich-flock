import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { findAllFlocks } from '@/lib/db/queries/flock.queries'
import { findRecentDailyRecordsMultiFlocks } from '@/lib/db/queries/daily-record.queries'
import Link from 'next/link'
import FlockFilter from './flock-filter'

function isWithinLockWindow(recordDate: Date, now: Date, days: number): boolean {
  const recDay = Date.UTC(recordDate.getUTCFullYear(), recordDate.getUTCMonth(), recordDate.getUTCDate())
  const nowDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return Math.round((nowDay - recDay) / 86_400_000) <= days
}

export default async function ProduksiPage({
  searchParams,
}: {
  searchParams: Promise<{ flockId?: string; coopId?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { flockId, coopId } = await searchParams
  const allFlocks = await findAllFlocks(session.farmSchema)

  let targetFlockIds: string[]
  if (flockId) {
    targetFlockIds = allFlocks.filter(f => f.id === flockId).map(f => f.id)
  } else if (coopId) {
    targetFlockIds = allFlocks.filter(f => f.coopId === coopId).map(f => f.id)
  } else {
    targetFlockIds = allFlocks.map(f => f.id)
  }

  const records = await findRecentDailyRecordsMultiFlocks(session.farmSchema, targetFlockIds, 50)
  const now = new Date()

  return (
    <div className="p-3 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[var(--lf-text-dark)]">Produksi</h1>
        <Link
          href="/produksi/input"
          className="text-sm px-4 py-2 min-h-[44px] flex items-center bg-gradient-to-r from-[#7aadd4] to-[#5090be] text-white rounded-lg shadow-lf-btn"
        >
          + Input Harian
        </Link>
      </div>

      <FlockFilter
        flocks={allFlocks.map(f => ({
          id: f.id,
          name: f.name,
          coopId: f.coopId,
          coopName: f.coopName,
          isActive: f.retiredAt == null,
          arrivalDate: String(f.arrivalDate),
        }))}
        selectedFlockId={flockId}
        selectedCoopId={coopId}
      />

      {records.length === 0 ? (
        <p className="text-[var(--lf-text-soft)] text-center py-16">Belum ada data produksi.</p>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="md:hidden space-y-2">
            {records.map((r) => {
              const recordDate = new Date(r.recordDate)
              const isAdmin = session.isAdmin
              const lockDays = session.roleSlug === 'operator' ? 1 : 7
              const withinLockWindow = isWithinLockWindow(recordDate, now, lockDays)
              const editable = isAdmin || withinLockWindow
              const showCorrection = isAdmin && !withinLockWindow

              return (
                <div key={r.id} className="bg-white rounded-xl p-4 shadow-lf-sm border border-[var(--lf-border)]">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: 'var(--lf-text-dark)' }}>
                          {recordDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        {r.isLateInput && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--lf-danger-bg)]" style={{ color: 'var(--lf-danger-text)' }}>
                            Terlambat
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--lf-text-soft)' }}>
                        {r.coopName} · {r.flockName}
                      </p>
                    </div>
                    {editable && (
                      <Link
                        href={`/produksi/${r.id}/edit`}
                        className="text-xs px-3 py-2 rounded-lg min-h-[44px] flex items-center flex-shrink-0 ml-2"
                        style={{
                          background: showCorrection ? '#fff3cd' : 'var(--lf-blue-pale)',
                          color: showCorrection ? '#856404' : 'var(--lf-blue-active)',
                        }}
                      >
                        {showCorrection ? 'Koreksi' : 'Edit'}
                      </Link>
                    )}
                    {!editable && (
                      <span
                        className="text-xs px-3 py-2 rounded-lg flex items-center flex-shrink-0 ml-2"
                        style={{ background: '#f0f0f0', color: '#aaa' }}
                      >
                        Terkunci
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="rounded-lg p-2 text-center" style={{ background: '#fef2f2' }}>
                      <p className="text-lg font-bold tabular-nums" style={{ color: '#e05252' }}>-{r.deaths + r.culled}</p>
                      <p className="text-[10px] uppercase font-medium" style={{ color: '#e05252' }}>Flock</p>
                    </div>
                    <div className="rounded-lg p-2 text-center" style={{ background: '#e8f7f3' }}>
                      <p className="text-lg font-bold tabular-nums" style={{ color: '#3da88a' }}>+{r.totalEggsButir.toLocaleString('id-ID')}</p>
                      <p className="text-[10px] uppercase font-medium" style={{ color: '#3da88a' }}>Telur</p>
                    </div>
                    <div className="rounded-lg p-2 text-center" style={{ background: '#fef2f2' }}>
                      <p className="text-lg font-bold tabular-nums" style={{ color: '#e05252' }}>-{r.totalFeedKg.toLocaleString('id-ID')}</p>
                      <p className="text-[10px] uppercase font-medium" style={{ color: '#e05252' }}>Pakan kg</p>
                    </div>
                    <div className="rounded-lg p-2 text-center" style={{ background: '#fff8e1' }}>
                      <p className="text-lg font-bold tabular-nums" style={{ color: '#b07c1a' }}>{r.totalVaccineQty > 0 ? `-${r.totalVaccineQty.toLocaleString('id-ID')}` : '—'}</p>
                      <p className="text-[10px] uppercase font-medium" style={{ color: '#b07c1a' }}>Vaksin</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-y-1">
              <thead>
                <tr className="text-xs text-[var(--lf-text-soft)] uppercase tracking-wide text-left">
                  <th className="px-3 py-2">Tanggal</th>
                  <th className="px-3 py-2">Kandang · Flock</th>
                  <th className="px-3 py-2 text-right">Flock (-)</th>
                  <th className="px-3 py-2 text-right">Telur</th>
                  <th className="px-3 py-2 text-right">Pakan (kg)</th>
                  <th className="px-3 py-2 text-right">Vaksin</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => {
                  const recordDate = new Date(r.recordDate)
                  const isAdmin = session.isAdmin
                  const lockDays = session.roleSlug === 'operator' ? 1 : 7
                  const withinLockWindow = isWithinLockWindow(recordDate, now, lockDays)
                  const editable = isAdmin || withinLockWindow
                  const showCorrection = isAdmin && !withinLockWindow

                  return (
                    <tr key={r.id} className="bg-white rounded-xl shadow-lf-sm">
                      <td className="px-3 py-3 rounded-l-xl font-medium text-[var(--lf-text-dark)]">
                        {recordDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                        {r.isLateInput && (
                          <span className="ml-2 text-[10px] bg-[var(--lf-danger-bg)] rounded px-1.5 py-0.5" style={{ color: 'var(--lf-danger-text)' }}>Terlambat</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs" style={{ color: 'var(--lf-text-soft)' }}>
                        <span>{r.coopName}</span>
                        <span className="mx-1 opacity-40">·</span>
                        <span>{r.flockName}</span>
                      </td>
                      <td className="px-3 py-3 text-right font-medium tabular-nums" style={{ color: '#e05252' }}>
                        -{r.deaths + r.culled}
                      </td>
                      <td className="px-3 py-3 text-right font-medium tabular-nums" style={{ color: '#3da88a' }}>
                        +{r.totalEggsButir.toLocaleString('id-ID')}
                      </td>
                      <td className="px-3 py-3 text-right font-medium tabular-nums" style={{ color: '#e05252' }}>
                        -{r.totalFeedKg.toLocaleString('id-ID')}
                      </td>
                      <td className="px-3 py-3 text-right font-medium tabular-nums" style={{ color: '#b07c1a' }}>
                        {r.totalVaccineQty > 0 ? `-${r.totalVaccineQty.toLocaleString('id-ID')}` : '—'}
                      </td>
                      <td className="px-3 py-3 text-right rounded-r-xl">
                        {editable ? (
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
        </>
      )}
    </div>
  )
}
