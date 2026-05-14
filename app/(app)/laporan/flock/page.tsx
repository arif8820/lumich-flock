import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getFlockPerformanceData } from '@/lib/services/daily-record.service'
import { LaporanFilter } from '@/components/forms/laporan-filter'
import { KpiCard } from '@/components/ui/kpi-card'
import { findAllActiveFlocks } from '@/lib/db/queries/flock.queries'

function toISODate(d: Date) {
  return d.toISOString().split('T')[0]!
}
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
function parseSafe(s: string, d: Date) {
  if (!ISO_DATE.test(s)) return toISODate(d)
  const p = new Date(s)
  return isNaN(p.getTime()) ? toISODate(d) : s
}

export default async function LaporanFlockPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await getSession()
  if (!session || !hasPermission(session, PERMISSIONS.LAPORAN.FLOCK.VIEW)) redirect('/laporan')

  const params = await searchParams
  const today = new Date()
  const defaultFrom = new Date(today)
  defaultFrom.setDate(defaultFrom.getDate() - 30)

  const safeFrom = parseSafe(typeof params.from === 'string' ? params.from : '', defaultFrom)
  const safeTo = parseSafe(typeof params.to === 'string' ? params.to : '', today)
  const flockId = typeof params.flock === 'string' ? params.flock : undefined

  const [rows, flocks] = await Promise.all([
    getFlockPerformanceData(session.farmSchema, safeFrom, safeTo, flockId).catch(() => []),
    findAllActiveFlocks(session.farmSchema).catch(() => []),
  ])

  const flockOptions = flocks.map((f) => ({ id: f.id, label: f.name }))
  const avgHdp =
    rows.length > 0 ? rows.reduce((s, r) => s + r.avgHdp, 0) / rows.length : 0
  const totalEggs = rows.reduce((s, r) => s + r.totalEggsButir, 0)
  const totalDeaths = rows.reduce((s, r) => s + r.totalDeaths, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-[18px] font-bold"
            style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}
          >
            Performa Flock
          </h1>
          <p className="text-[13px] mt-1" style={{ color: '#8fa08f' }}>
            HDP%, mortalitas, dan FCR per flock
          </p>
        </div>
        <div className="flex items-center gap-4 flex-wrap no-print">
          <Suspense fallback={null}>
            <LaporanFilter
              defaultFrom={safeFrom}
              defaultTo={safeTo}
              entityType="flock"
              entities={flockOptions}
              entityParamName="flock"
            />
          </Suspense>
          {hasPermission(session, PERMISSIONS.LAPORAN.EXPORT) && (
            <a
              href={`/api/laporan/flock-csv?from=${safeFrom}&to=${safeTo}${flockId ? `&flock=${flockId}` : ''}`}
              download="laporan-flock.csv"
              className="inline-flex items-center px-4 py-2 rounded-[10px] text-sm font-medium"
              style={{ backgroundColor: 'var(--lf-teal)', color: '#ffffff' }}
            >
              Export CSV
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Avg HDP%" value={`${avgHdp.toFixed(1)}%`} />
        <KpiCard label="Total Telur" value={totalEggs.toLocaleString('id-ID')} />
        <KpiCard label="Total Kematian" value={totalDeaths.toLocaleString('id-ID')} />
      </div>

      <div
        className="border rounded-lg overflow-hidden"
        style={{ borderColor: 'var(--lf-border)' }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: 'var(--lf-bg-soft)' }}>
              {[
                'Flock',
                'Kandang',
                'Umur (mgg)',
                'Pop. Awal',
                'HDP%',
                'Total Telur',
                'Kematian',
                'Mortalitas%',
                'FCR',
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--lf-text-soft)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-sm"
                  style={{ color: 'var(--lf-text-soft)' }}
                >
                  Tidak ada data untuk periode ini
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.flockId}
                  className="border-t"
                  style={{ borderColor: 'var(--lf-border)' }}
                >
                  <td
                    className="px-4 py-3 text-sm font-medium"
                    style={{ color: 'var(--lf-text-dark)' }}
                  >
                    {row.flockName}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--lf-text-mid)' }}>
                    {row.coopName}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-right"
                    style={{ color: 'var(--lf-text-dark)' }}
                  >
                    {row.ageWeeks}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-right"
                    style={{ color: 'var(--lf-text-dark)' }}
                  >
                    {row.initialCount.toLocaleString('id-ID')}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-right font-medium"
                    style={{
                      color:
                        row.avgHdp >= 70 ? '#27ae60' : row.avgHdp >= 50 ? '#e67e22' : '#e74c3c',
                    }}
                  >
                    {row.avgHdp.toFixed(1)}%
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-right"
                    style={{ color: 'var(--lf-text-dark)' }}
                  >
                    {row.totalEggsButir.toLocaleString('id-ID')}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-right"
                    style={{ color: 'var(--lf-text-mid)' }}
                  >
                    {row.totalDeaths}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-right"
                    style={{ color: 'var(--lf-text-mid)' }}
                  >
                    {row.mortalityPct.toFixed(1)}%
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-right"
                    style={{ color: 'var(--lf-text-dark)' }}
                  >
                    {row.fcr.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
