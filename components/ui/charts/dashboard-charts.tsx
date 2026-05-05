'use client'
// client: dynamic ssr:false requires Client Component in Next.js 15

import dynamic from 'next/dynamic'
import type { DashboardChartPoint } from '@/lib/services/dashboard.service'

const DeathsBarChart = dynamic(
  () => import('./deaths-bar-chart').then((m) => m.DeathsBarChart),
  { ssr: false }
)
const DepletionAreaChart = dynamic(
  () => import('./depletion-area-chart').then((m) => m.DepletionAreaChart),
  { ssr: false }
)

export function DashboardCharts({ data }: { data: DashboardChartPoint[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white rounded-2xl p-4 shadow-lf-sm border border-[var(--lf-border)]">
        <p className="text-xs font-medium text-[var(--lf-text-soft)] uppercase tracking-wide mb-3">Kematian Harian</p>
        <DeathsBarChart data={data} />
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-lf-sm border border-[var(--lf-border)]">
        <p className="text-xs font-medium text-[var(--lf-text-soft)] uppercase tracking-wide mb-3">Kumulatif Depletion</p>
        <DepletionAreaChart data={data} />
      </div>
    </div>
  )
}
