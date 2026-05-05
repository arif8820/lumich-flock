import {
  getRecentDailyRecordsAcrossFlocks,
  getDailyProductionAgg,
  getActiveFlockPopulations,
  getStockSummary,
  type DashboardRecord,
  type DailyAggRow,
} from '@/lib/db/queries/dashboard.queries'

export type DashboardKpis = {
  productionToday: number
  stockTotalEggs: number
  activePopulation: number
  totalDeathsToday: number
}

export type DashboardChartPoint = {
  date: string
  deaths: number
  cumulativeDepletion: number
}

export type DashboardRecentRecord = {
  date: string
  deaths: number
  culled: number
  isLate: boolean
}

export async function getDashboardKpis(flockIds?: string[]): Promise<DashboardKpis> {
  const [popRows, stockSummary, recentRecords] = await Promise.all([
    getActiveFlockPopulations(flockIds),
    getStockSummary(),
    getRecentDailyRecordsAcrossFlocks(7, flockIds),
  ])

  const activePopulation = popRows.reduce(
    (acc, r) => acc + Math.max(0, r.totalCount - r.totalDeaths - r.totalCulled),
    0
  )

  const todayStr = new Date().toISOString().slice(0, 10)
  const todayRecords = recentRecords.filter((r) => r.recordDate === todayStr)
  const totalDeathsToday = todayRecords.reduce((acc, r) => acc + r.deaths, 0)

  return {
    productionToday: 0, // egg totals available in /stok and /laporan, not computed here for perf
    stockTotalEggs: stockSummary.totalEggs,
    activePopulation,
    totalDeathsToday,
  }
}

export async function getProductionChartData(days: number = 30, flockIds?: string[]): Promise<DashboardChartPoint[]> {
  const [aggRows, popRows] = await Promise.all([
    getDailyProductionAgg(days, flockIds),
    getActiveFlockPopulations(flockIds),
  ])

  const totalDepletion = popRows.reduce((acc, r) => acc + r.totalDeaths + r.totalCulled, 0)
  let cumulativeDepletion = totalDepletion

  return aggRows.map((r: DailyAggRow) => {
    cumulativeDepletion -= r.totalDeaths
    const d = new Date(r.date)
    const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
    return {
      date: label,
      deaths: r.totalDeaths,
      cumulativeDepletion: totalDepletion - cumulativeDepletion,
    }
  })
}

export async function getRecentDashboardRecords(limit: number = 7, flockIds?: string[]): Promise<DashboardRecentRecord[]> {
  const records: DashboardRecord[] = await getRecentDailyRecordsAcrossFlocks(limit, flockIds)
  return records.map((r) => {
    const d = new Date(r.recordDate)
    const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
    return {
      date: label,
      deaths: r.deaths,
      culled: r.culled,
      isLate: r.isLateInput ?? false,
    }
  })
}
