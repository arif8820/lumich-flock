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
  fcrCumulative: number
  productionToday: number
  stockTotalEggs: number
  activePopulation: number
  depletionToday: number
  feedPerBirdToday: number
}

export type DepletionPoint = {
  date: string
  deaths: number
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

export async function getDashboardKpis(farmSchema: string, since: string, until: string, flockIds?: string[]): Promise<DashboardKpis> {
  const [popRows, stockSummary, hdpTrend, fcrTrend, feedTrend, extRecords] = await Promise.all([
    getActiveFlockPopulations(farmSchema, flockIds),
    getStockSummary(farmSchema),
    getHdpTrend(farmSchema, since, until, flockIds),
    getFcrTrend(farmSchema, since, until, flockIds),
    getFeedPerBirdTrend(farmSchema, since, until, flockIds),
    getExtendedDailyRecords(farmSchema, since, until, flockIds),
  ])

  const activePopulation = popRows.reduce(
    (acc, r) => acc + Math.max(0, r.totalCount - r.totalDeaths - r.totalCulled),
    0
  )

  // Aggregate HDP over the period (average of daily values)
  const hdpValues = hdpTrend.filter((r) => r.hdp > 0).map((r) => r.hdp)
  const hdpToday = hdpValues.length > 0
    ? Math.round((hdpValues.reduce((a, b) => a + b, 0) / hdpValues.length) * 10) / 10
    : 0

  // FCR cumulative over the period
  const fcrValues = fcrTrend.filter((r) => r.fcr > 0).map((r) => r.fcr)
  const fcrCumulative = fcrValues.length > 0
    ? Math.round((fcrValues.reduce((a, b) => a + b, 0) / fcrValues.length) * 100) / 100
    : 0

  // Production total over the period
  const productionToday = extRecords.reduce((acc, r) => acc + r.totalEggs, 0)

  // Feed per bird: average over period
  const feedValues = feedTrend.filter((r) => r.feedGram > 0).map((r) => r.feedGram)
  const feedPerBirdToday = feedValues.length > 0
    ? Math.round(feedValues.reduce((a, b) => a + b, 0) / feedValues.length)
    : 0

  // Depletion: total over period
  const depletionToday = extRecords.reduce((acc, r) => acc + r.deaths + r.culled, 0)

  return {
    hdpToday,
    fcrCumulative,
    productionToday,
    stockTotalEggs: stockSummary.totalEggs,
    activePopulation,
    depletionToday,
    feedPerBirdToday,
  }
}

export async function getHdpChartData(farmSchema: string, since: string, until: string, flockIds?: string[]): Promise<HdpPoint[]> {
  const raw = await getHdpTrend(farmSchema, since, until, flockIds)
  return raw.map((r) => ({ date: formatDate(r.date), hdp: r.hdp }))
}

export async function getFcrChartData(farmSchema: string, since: string, until: string, flockIds?: string[]): Promise<FcrPoint[]> {
  const raw = await getFcrTrend(farmSchema, since, until, flockIds)
  return raw.map((r) => ({ date: formatDate(r.date), fcr: r.fcr }))
}

export async function getProductionBySkuChartData(
  farmSchema: string,
  since: string,
  until: string,
  flockIds?: string[]
): Promise<ProductionChartPoint[]> {
  const raw = await getProductionBySkuTrend(farmSchema, since, until, flockIds)
  return raw.map((r) => ({ date: formatDate(r.date), ...r.skuBreakdown }))
}

export async function getProductionChartData(farmSchema: string, since: string, until: string, flockIds?: string[]): Promise<DepletionPoint[]> {
  const aggRows = await getDailyProductionAgg(farmSchema, since, until, flockIds)
  return aggRows.map((r: DailyAggRow) => ({
    date: formatDate(r.date),
    deaths: r.totalDeaths,
  }))
}

export async function getRecentDashboardRecords(
  farmSchema: string,
  since: string,
  until: string,
  flockIds?: string[]
): Promise<DashboardRecentRecord[]> {
  const [extRecords, popRows] = await Promise.all([
    getExtendedDailyRecords(farmSchema, since, until, flockIds),
    getActiveFlockPopulations(farmSchema, flockIds),
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
