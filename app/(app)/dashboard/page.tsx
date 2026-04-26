import Link from 'next/link'
import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { KpiCard } from '@/components/ui/kpi-card'
import { DashboardCharts } from '@/components/ui/charts/dashboard-charts'
import { MOCK_KPI, MOCK_CHART_DATA, MOCK_RECENT_RECORDS } from '@/lib/mock/dashboard.mock'
import { getAgingData } from '@/lib/services/invoice.service'
import type { AgingRow } from '@/lib/db/queries/invoice.queries'

export default async function DashboardPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  let top5: AgingRow[] = []
  if (user.role !== 'operator') {
    try {
      const agingData = await getAgingData()
      top5 = agingData.slice(0, 5)
    } catch {
      top5 = []
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[var(--lf-text-dark)]">Dashboard</h1>
        <p className="text-sm text-[var(--lf-text-soft)] mt-0.5">Selamat datang, {user?.fullName}</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <KpiCard label="HDP%" value={`${MOCK_KPI.hdpPercent.toFixed(1)}%`} />
        <KpiCard label="FCR 7 Hari" value={MOCK_KPI.fcr7Day.toFixed(2)} />
        <KpiCard label="Produksi Hari Ini" value={MOCK_KPI.productionToday.toLocaleString('id')} unit="butir" />
        <KpiCard label="Stok Siap Jual" value={MOCK_KPI.stockReadyToSell.toLocaleString('id')} unit="butir" />
        <KpiCard label="Populasi Aktif" value={MOCK_KPI.activePopulation.toLocaleString('id')} unit="ekor" />
        <KpiCard label="Pakan/Ekor" value={MOCK_KPI.feedPerBirdGrams} unit="g" />
      </div>

      {/* Charts 2x2 */}
      <DashboardCharts data={MOCK_CHART_DATA} />

      {/* Recent records table */}
      <div className="bg-white rounded-2xl p-4 shadow-lf-sm border border-[var(--lf-border)]">
        <p className="text-xs font-medium text-[var(--lf-text-soft)] uppercase tracking-wide mb-3">7 Catatan Terakhir</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-[var(--lf-text-soft)] uppercase tracking-wide border-b border-[var(--lf-border)]">
                <th className="text-left pb-2">Tanggal</th>
                <th className="text-right pb-2">Grade A</th>
                <th className="text-right pb-2">Grade B</th>
                <th className="text-right pb-2">Kematian</th>
                <th className="text-right pb-2">FCR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lf-border)]">
              {MOCK_RECENT_RECORDS.map((r) => (
                <tr key={r.date} className="py-2">
                  <td className="py-2 text-[var(--lf-text-dark)]">
                    {r.date}
                    {r.isLate && (
                      <span className="ml-2 text-[10px] bg-[var(--lf-danger-bg)] rounded px-1.5 py-0.5" style={{ color: 'var(--lf-danger-text)' }}>Terlambat</span>
                    )}
                  </td>
                  <td className="py-2 text-right text-[var(--lf-text-dark)]">{r.gradeA.toLocaleString('id')}</td>
                  <td className="py-2 text-right text-[var(--lf-text-dark)]">{r.gradeB.toLocaleString('id')}</td>
                  <td className="py-2 text-right text-[var(--lf-text-mid)]">{r.deaths}</td>
                  <td className="py-2 text-right font-medium" style={{ color: r.fcr > 2.1 ? 'var(--lf-danger-text)' : 'var(--lf-text-dark)' }}>
                    {r.fcr.toFixed(2)}
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
                    const days = row.daysOverdue
                    let daysColor = 'var(--lf-text-dark)'
                    let fontWeight: React.CSSProperties['fontWeight'] = 400
                    if (days > 30) { daysColor = '#c0392b'; fontWeight = 700 }
                    else if (days > 14) { daysColor = '#e74c3c' }
                    else if (days > 7) { daysColor = '#e67e22' }
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
                          {days} hari
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
