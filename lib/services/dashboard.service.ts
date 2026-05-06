import {
  getDailyProductionAgg,
  getActiveFlockPopulations,
  getStockSummary,
  getHdpTrend,
  getFcrTrend,
  getFeedPerBirdTrend,
  getProductionBySkuTrend,
  getExtendedDailyRecords,
  type DailyAggRow,
  type HdpPoint,
  type FcrPoint,
} from '@/lib/db/queries/dashboard.queries'

export type DashboardKpis = {
  hdpToday: number
  hdpDelta: number
  fcrCumulative: number
  productionToday: number
  productionDelta: number
  stockTotalEggs: number
  activePopulation: number
  depletionToday: number
  feedPerBirdToday: number
  feedPerBirdDelta: number
}

export type DashboardChartPoint = {
  date: string
  deaths: number
  cumulativeDepletion: number
}

export type DashboardRecentRecord = {
  date: string
  totalEggs: number
  totalFeedKg: number
  deaths: number
  culled: number
  hdp: number
  fcr: number
  feedGram: number
  isLate: boolean
}

export type ProductionChartPoint = {
  date: string
  [key: string]: string | number
}

function formatDate(dateStr: string): string {
  const [, month, day] = dateStr.split('-')
  return `${day}/${month}`
}

export async function getDashboardKpis(flockIds?: string[]): Promise<DashboardKpis> {
  const [popRows, stockSummary, hdpTrend, fcrTrend, feedTrend, extRecords] = await Promise.all([
    getActiveFlockPopulations(flockIds),
    getStockSummary(),
    getHdpTrend(2, flockIds),
    getFcrTrend(30, flockIds),
    getFeedPerBirdTrend(2, flockIds),
    getExtendedDailyRecords(2, flockIds),
  ])

  const activePopulation = popRows.reduce(
    (acc, r) => acc + Math.max(0, r.totalCount - r.totalDeaths - r.totalCulled),
    0
  )

  const todayStr = new Date().toISOString().slice(0, 10)

  const todayHdp = hdpTrend.find((r) => r.date === todayStr)?.hdp ?? 0
  const yesterdayHdp = hdpTrend.find((r) => r.date !== todayStr)?.hdp ?? 0
  const hdpDelta = Math.round((todayHdp - yesterdayHdp) * 10) / 10

  const fcrValues = fcrTrend.filter((r) => r.fcr > 0).map((r) => r.fcr)
  const fcrCumulative =
    fcrValues.length > 0
      ? Math.round((fcrValues.reduce((a, b) => a + b, 0) / fcrValues.length) * 100) / 100
      : 0

  const todayRecord = extRecords.find((r) => r.date === todayStr)
  const yesterdayRecord = extRecords.find((r) => r.date !== todayStr)
  const productionToday = todayRecord?.totalEggs ?? 0
  const productionDelta = productionToday - (yesterdayRecord?.totalEggs ?? 0)

  const todayFeed = feedTrend.find((r) => r.date === todayStr)?.feedGram ?? 0
  const yesterdayFeed = feedTrend.find((r) => r.date !== todayStr)?.feedGram ?? 0
  const feedPerBirdDelta = todayFeed - yesterdayFeed

  const depletionToday = (todayRecord?.deaths ?? 0) + (todayRecord?.culled ?? 0)

  return {
    hdpToday: todayHdp,
    hdpDelta,
    fcrCumulative,
    productionToday,
    productionDelta,
    stockTotalEggs: stockSummary.totalEggs,
    activePopulation,
    depletionToday,
    feedPerBirdToday: todayFeed,
    feedPerBirdDelta,
  }
}

export async function getHdpChartData(days: number, flockIds?: string[]): Promise<HdpPoint[]> {
  const raw = await getHdpTrend(days, flockIds)
  return raw.map((r) => ({ date: formatDate(r.date), hdp: r.hdp }))
}

export async function getFcrChartData(days: number, flockIds?: string[]): Promise<FcrPoint[]> {
  const raw = await getFcrTrend(days, flockIds)
  return raw.map((r) => ({ date: formatDate(r.date), fcr: r.fcr }))
}

export async function getProductionBySkuChartData(
  days: number,
  flockIds?: string[]
): Promise<ProductionChartPoint[]> {
  const raw = await getProductionBySkuTrend(days, flockIds)
  return raw.map((r) => ({ date: formatDate(r.date), ...r.skuBreakdown }))
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
    return {
      date: formatDate(r.date),
      deaths: r.totalDeaths,
      cumulativeDepletion: totalDepletion - cumulativeDepletion,
    }
  })
}

export async function getRecentDashboardRecords(
  limit: number = 7,
  flockIds?: string[]
): Promise<DashboardRecentRecord[]> {
  const [extRecords, popRows] = await Promise.all([
    getExtendedDailyRecords(limit, flockIds),
    getActiveFlockPopulations(flockIds),
  ])

  const totalPop = popRows.reduce(
    (acc, r) => acc + Math.max(0, r.totalCount - r.totalDeaths - r.totalCulled),
    0
  )

  return extRecords.map((r) => {
    const hdp = totalPop > 0 ? Math.round((r.totalEggs / totalPop) * 10000) / 100 : 0
    // FCR approximation: assume 60g average egg weight for dashboard table
    const eggKg = r.totalEggs * 0.06
    const fcr = eggKg > 0 ? Math.round((r.totalFeedKg / eggKg) * 100) / 100 : 0
    const feedGram = totalPop > 0 ? Math.round((r.totalFeedKg * 1000) / totalPop) : 0
    return {
      date: formatDate(r.date),
      totalEggs: r.totalEggs,
      totalFeedKg: r.totalFeedKg,
      deaths: r.deaths,
      culled: r.culled,
      hdp,
      fcr,
      feedGram,
      isLate: r.isLateInput,
    }
  })
}
