'use client'
// client: dynamic ssr:false requires Client Component in Next.js 15

import type { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import type { DashboardChartPoint, ProductionChartPoint } from '@/lib/services/dashboard.service'
import type { HdpPoint, FcrPoint } from '@/lib/db/queries/dashboard.queries'

const HdpLineChart = dynamic(
  () => import('./hdp-line-chart').then((m) => m.HdpLineChart),
  { ssr: false }
)
const FcrLineChart = dynamic(
  () => import('./fcr-line-chart').then((m) => m.FcrLineChart),
  { ssr: false }
)
const ProductionBarChart = dynamic(
  () => import('./production-bar-chart').then((m) => m.ProductionBarChart),
  { ssr: false }
)
const DepletionAreaChart = dynamic(
  () => import('./depletion-area-chart').then((m) => m.DepletionAreaChart),
  { ssr: false }
)

type DashboardChartsProps = {
  depletionData: DashboardChartPoint[]
  hdpData: HdpPoint[]
  fcrData: FcrPoint[]
  productionData: ProductionChartPoint[]
  skuKeys: string[]
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-lf-sm border border-[var(--lf-border)]">
      <p className="text-xs font-medium text-[var(--lf-text-soft)] uppercase tracking-wide mb-3">{title}</p>
      {children}
    </div>
  )
}

export function DashboardCharts({
  depletionData,
  hdpData,
  fcrData,
  productionData,
  skuKeys,
}: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ChartCard title="Tren HDP (%)">
        <HdpLineChart data={hdpData} />
      </ChartCard>
      <ChartCard title="Tren FCR">
        <FcrLineChart data={fcrData} />
      </ChartCard>
      <ChartCard title="Total Produksi per Hari">
        {/* any: ProductionChartPoint index sig is string|number; chart expects number values only — safe at runtime */}
        <ProductionBarChart data={productionData as Array<{ date: string } & Record<string, number>>} skuKeys={skuKeys} />
      </ChartCard>
      <ChartCard title="Deplesi Kumulatif">
        <DepletionAreaChart data={depletionData} />
      </ChartCard>
    </div>
  )
}
