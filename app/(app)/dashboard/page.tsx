import Link from 'next/link'
import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { KpiCard } from '@/components/ui/kpi-card'
import { DashboardCharts } from '@/components/ui/charts/dashboard-charts'
import {
  getDashboardKpis,
  getProductionChartData,
  getRecentDashboardRecords,
  getHdpChartData,
  getFcrChartData,
  getProductionBySkuChartData,
} from '@/lib/services/dashboard.service'
import { getAgingData } from '@/lib/services/invoice.service'
import { findAllActiveFlocks } from '@/lib/db/queries/flock.queries'
import FlockOnlyFilter from './flock-only-filter'
import type { AgingRow } from '@/lib/db/queries/invoice.queries'

function getPeriodRange(days: number): { since: string; until: string } {
  const todayMs = Date.now()
  const today = new Date(todayMs).toISOString().slice(0, 10)
  const yesterday = new Date(todayMs - 86400000).toISOString().slice(0, 10)
  if (days === 0) return { since: today, until: today }
  if (days === 1) return { since: yesterday, until: yesterday }
  const since = new Date(todayMs - days * 86400000).toISOString().slice(0, 10)
  return { since, until: yesterday }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ flockId?: string; days?: string }>
}) {
  const user = await getSession()
  if (!user) redirect('/login')

  const { flockId, days: daysParam } = await searchParams
  const parsedDays = daysParam !== undefined ? parseInt(daysParam, 10) : 0
  const days = Number.isFinite(parsedDays) && parsedDays >= 0 ? parsedDays : 0
  const { since, until } = getPeriodRange(days)

  const allFlocks = await findAllActiveFlocks(user.farmSchema)

  let flockIds: string[] | undefined
  if (flockId) {
    const match = allFlocks.find(f => f.id === flockId)
    flockIds = match ? [match.id] : undefined
  }

  const [kpis, depletionData, recentRecords, hdpData, fcrData, productionSkuData] = await Promise.all([
    getDashboardKpis(user.farmSchema, since, until, flockIds),
    getProductionChartData(user.farmSchema, since, until, flockIds),
    getRecentDashboardRecords(user.farmSchema, since, until, flockIds),
    getHdpChartData(user.farmSchema, since, until, flockIds),
    getFcrChartData(user.farmSchema, since, until, flockIds),
    getProductionBySkuChartData(user.farmSchema, since, until, flockIds),
  ])

  // Union all SKU keys across all rows to avoid missing SKUs absent from first row
  const skuKeySet = new Set<string>()
  for (const row of productionSkuData) {
    for (const k of Object.keys(row)) {
      if (k !== 'date') skuKeySet.add(k)
    }
  }
  const skuKeys = Array.from(skuKeySet).sort()

  let top5: AgingRow[] = []
  if (user.role !== 'operator') {
    try {
      const agingData = await getAgingData(user.farmSchema)
      top5 = agingData.slice(0, 5)
    } catch {
      top5 = []
    }
  }

  const periodLabel = days === 0 ? 'Hari Ini' : days === 1 ? 'Kemarin' : `${days} Hari Terakhir`

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[var(--lf-text-dark)]">Dashboard</h1>
        <p className="text-sm text-[var(--lf-text-soft)] mt-0.5">Selamat datang, {user?.fullName}</p>
      </div>

      <FlockOnlyFilter
        flocks={allFlocks.map(f => ({ id: f.id, name: f.name }))}
        selectedFlockId={flockId}
        selectedDays={days}
      />

      {/* KPI Grid — 2 cols mobile / 3 cols tablet / 6 cols desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          label="HDP"
          value={kpis.hdpToday.toFixed(1)}
          unit="%"
          subText="Target ≥ 80%"
        />
        <KpiCard
          label="FCR Kumulatif"
          value={kpis.fcrCumulative.toFixed(2)}
          subText="Target ≤ 2.0"
        />
        <KpiCard
          label="Produksi"
          value={kpis.productionToday.toLocaleString('id')}
          unit="butir"
          subText={periodLabel}
        />
        <KpiCard
          label="Stok Siap Jual"
          value={kpis.stockTotalEggs.toLocaleString('id')}
          unit="butir"
          subText="Grade A+B semua SKU"
        />
        <KpiCard
          label="Populasi Aktif"
          value={kpis.activePopulation.toLocaleString('id')}
          unit="ekor"
          subText={`Deplesi: ${kpis.depletionToday}`}
        />
        <KpiCard
          label="Pakan/Ekor"
          value={kpis.feedPerBirdToday.toFixed(0)}
          unit="g"
          subText="Standar 110g"
        />
      </div>

      {/* Charts 2x2 */}
      <DashboardCharts
        depletionData={depletionData}
        hdpData={hdpData}
        fcrData={fcrData}
        productionData={productionSkuData}
        skuKeys={skuKeys}
      />

      {/* Recent records table — 7 columns */}
      <div className="bg-white rounded-2xl p-4 shadow-lf-sm border border-[var(--lf-border)]">
        <p className="text-xs font-medium text-[var(--lf-text-soft)] uppercase tracking-wide mb-3">
          Catatan — {periodLabel}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-[var(--lf-text-soft)] uppercase tracking-wide border-b border-[var(--lf-border)]">
                <th className="text-left pb-2">Tanggal</th>
                <th className="text-right pb-2">HDP%</th>
                <th className="text-right pb-2">Total Produksi</th>
                <th className="text-right pb-2">FCR</th>
                <th className="text-right pb-2">Pakan/Ekor</th>
                <th className="text-right pb-2">Deplesi</th>
                <th className="text-right pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lf-border)]">
              {recentRecords.map((r, i) => (
                <tr key={i} className="py-2">
                  <td className="py-2 text-[var(--lf-text-dark)]">{r.date}</td>
                  <td className="py-2 text-right text-[var(--lf-text-mid)]">{r.hdp.toFixed(1)}</td>
                  <td className="py-2 text-right text-[var(--lf-text-mid)]">{r.totalEggs.toLocaleString('id')}</td>
                  <td className="py-2 text-right text-[var(--lf-text-mid)]">{r.fcr.toFixed(2)}</td>
                  <td className="py-2 text-right text-[var(--lf-text-mid)]">{r.feedGram}g</td>
                  <td className="py-2 text-right text-[var(--lf-text-mid)]">{r.deaths + r.culled}</td>
                  <td className="py-2 text-right">
                    {r.isLate ? (
                      <span
                        className="text-[10px] rounded px-1.5 py-0.5 font-medium"
                        style={{
                          backgroundColor: 'var(--lf-amber-light)',
                          color: 'var(--lf-amber)',
                        }}
                      >
                        ⚠ Telat
                      </span>
                    ) : (
                      <span
                        className="text-[10px] rounded px-1.5 py-0.5 font-medium"
                        style={{
                          backgroundColor: 'var(--lf-blue-pale)',
                          color: 'var(--lf-blue)',
                        }}
                      >
                        ✓ Tepat
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Aging widget — admin + supervisor only */}
      {user.role !== 'operator' && (
        <div className="bg-white rounded-[16px] p-6 shadow-lf-sm border border-[var(--lf-border)]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-[var(--lf-text-soft)] uppercase tracking-wide">5 Invoice Jatuh Tempo</p>
            <Link href="/laporan" className="text-xs font-medium" style={{ color: 'var(--lf-teal)' }}>Lihat semua</Link>
          </div>
          {top5.length === 0 ? (
            <p className="text-sm text-[var(--lf-text-soft)]">Tidak ada invoice jatuh tempo</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] text-[var(--lf-text-soft)] uppercase tracking-wide border-b border-[var(--lf-border)]">
                    <th className="text-left pb-2">Pelanggan</th>
                    <th className="text-left pb-2">No. Invoice</th>
                    <th className="text-right pb-2">Jatuh Tempo</th>
                    <th className="text-right pb-2">Sisa</th>
                    <th className="text-right pb-2">Hari Lewat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--lf-border)]">
                  {top5.map((row) => {
                    const daysOverdue = row.daysOverdue
                    let daysColor = 'var(--lf-text-dark)'
                    let fontWeight: React.CSSProperties['fontWeight'] = 400
                    if (daysOverdue > 30) { daysColor = '#c0392b'; fontWeight = 700 }
                    else if (daysOverdue > 14) { daysColor = '#e74c3c' }
                    else if (daysOverdue > 7) { daysColor = '#e67e22' }
                    return (
                      <tr key={row.invoiceId}>
                        <td className="py-2 text-[var(--lf-text-dark)]">{row.customerName}</td>
                        <td className="py-2 text-[var(--lf-text-dark)]">{row.invoiceNumber}</td>
                        <td className="py-2 text-right text-[var(--lf-text-mid)]">
                          {new Date(row.dueDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-2 text-right text-[var(--lf-text-dark)]">
                          Rp {Number(row.outstanding).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 text-right" style={{ color: daysColor, fontWeight }}>
                          {daysOverdue} hari
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
