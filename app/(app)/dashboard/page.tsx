import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { KpiCard } from '@/components/ui/kpi-card'
import { DashboardCharts } from '@/components/ui/charts/dashboard-charts'
import { MOCK_KPI, MOCK_CHART_DATA, MOCK_RECENT_RECORDS } from '@/lib/mock/dashboard.mock'

export default async function DashboardPage() {
  const user = await getSession()
  if (!user) redirect('/login')

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
    </div>
  )
}
