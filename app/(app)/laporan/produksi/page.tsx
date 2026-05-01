import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getSession } from '@/lib/auth/get-session'
import { getProductionReportData } from '@/lib/services/daily-record.service'
import type { Role } from '@/lib/services/daily-record.service'
import { KpiCard } from '@/components/ui/kpi-card'
import { ProductionReportFilter } from '@/components/forms/production-report-filter'

function formatDate(d: Date): string {
  return d.toLocaleDateString('id-ID')
}

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0]!
}

export default async function LaporanProduksiPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await getSession()
  if (!session || session.role === 'operator') redirect('/dashboard')

  const params = await searchParams
  const today = new Date()
  const defaultFrom = new Date(today)
  defaultFrom.setDate(defaultFrom.getDate() - 30)

  const fromStr = typeof params.from === 'string' ? params.from : toISODate(defaultFrom)
  const toStr = typeof params.to === 'string' ? params.to : toISODate(today)

  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
  const safeFrom = ISO_DATE.test(fromStr) ? fromStr : toISODate(defaultFrom)
  const safeTo   = ISO_DATE.test(toStr)   ? toStr   : toISODate(today)

  const from = new Date(safeFrom)
  const to = new Date(safeTo)

  let result: Awaited<ReturnType<typeof getProductionReportData>> = {
    rows: [],
    kpi: { avgHdp: 0, totalEggs: 0, totalFeedKg: 0, totalDeaths: 0 },
  }
  try {
    result = await getProductionReportData(from, to, session.role as Role)
  } catch {
    // DB error — render empty state
  }

  const { rows, kpi } = result

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-[18px] font-bold"
            style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}
          >
            Laporan Produksi
          </h1>
          <p className="text-[13px] mt-1" style={{ color: '#8fa08f' }}>
            Rekap produksi harian per kandang
          </p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <Suspense fallback={null}>
            <ProductionReportFilter defaultFrom={safeFrom} defaultTo={safeTo} />
          </Suspense>
          {(session.role === 'admin' || session.role === 'supervisor') && (
            <a
              href={`/api/laporan/produksi-csv?from=${safeFrom}&to=${safeTo}`}
              className="inline-flex items-center px-4 py-2 rounded-[10px] text-sm font-medium transition-colors"
              style={{ backgroundColor: 'var(--lf-teal)', color: '#ffffff' }}
            >
              Export CSV
            </a>
          )}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Rata-rata HDP%" value={`${kpi.avgHdp.toFixed(1)}%`} />
        <KpiCard label="Total Telur" value={kpi.totalEggs.toLocaleString('id-ID')} />
        <KpiCard label="Total Pakan (kg)" value={kpi.totalFeedKg.toFixed(1)} />
        <KpiCard label="Total Kematian" value={kpi.totalDeaths.toLocaleString('id-ID')} />
      </div>

      {/* Production Table */}
      <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--lf-border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: 'var(--lf-bg-soft)' }}>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--lf-text-soft)' }}>Tanggal</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--lf-text-soft)' }}>Kandang</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--lf-text-soft)' }}>Flock</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--lf-text-soft)' }}>Populasi</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--lf-text-soft)' }}>Telur A</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--lf-text-soft)' }}>Telur B</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--lf-text-soft)' }}>Total</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--lf-text-soft)' }}>HDP%</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--lf-text-soft)' }}>Pakan (kg)</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--lf-text-soft)' }}>FCR</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--lf-text-soft)' }}>Kematian</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--lf-text-soft)' }}>
                  Tidak ada data produksi untuk periode ini
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={`${row.flockId}-${String(row.recordDate)}-${i}`} className="border-t" style={{ borderColor: 'var(--lf-border)' }}>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--lf-text-mid)' }}>{formatDate(row.recordDate)}</td>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--lf-text-dark)' }}>{row.coopName}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--lf-text-mid)' }}>{row.flockName}</td>
                  <td className="px-4 py-3 text-sm text-right" style={{ color: 'var(--lf-text-dark)' }}>{row.activePopulation.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 text-sm text-right" style={{ color: 'var(--lf-text-dark)' }}>{row.eggsGradeA.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 text-sm text-right" style={{ color: 'var(--lf-text-dark)' }}>{row.eggsGradeB.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: 'var(--lf-text-dark)' }}>{row.totalEggs.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 text-sm text-right" style={{ color: 'var(--lf-text-dark)' }}>{row.hdp.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-sm text-right" style={{ color: 'var(--lf-text-mid)' }}>{row.feedKg.toFixed(1)}</td>
                  <td className="px-4 py-3 text-sm text-right" style={{ color: row.fcr > 2.1 ? '#e74c3c' : 'var(--lf-text-dark)' }}>{row.fcr.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-right" style={{ color: 'var(--lf-text-mid)' }}>{row.deaths}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
