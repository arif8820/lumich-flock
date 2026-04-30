import {
  getRecentDailyRecordsAcrossFlocks,
  getDailyProductionAgg,
  getActiveFlockPopulations,
  getStockSummary,
  type DashboardRecord,
  type DailyAggRow,
} from '@/lib/db/queries/dashboard.queries'
import { computeHDP, computeFCR, computeFeedPerBird } from './daily-record.service'

export type DashboardKpis = {
  hdpPercent: number
  fcr7Day: number
  productionToday: number
  stockReadyToSell: number
  activePopulation: number
  feedPerBirdGrams: number
}

export type DashboardChartPoint = {
  date: string
  hdp: number
  fcr: number
  gradeA: number
  gradeB: number
  cumulativeDepletion: number
}

export type DashboardRecentRecord = {
  date: string
  gradeA: number
  gradeB: number
  deaths: number
  feedKg: number
  fcr: number
  isLate: boolean
}

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const [popRows, stockSummary, recentRecords] = await Promise.all([
    getActiveFlockPopulations(),
    getStockSummary(),
    getRecentDailyRecordsAcrossFlocks(7),
  ])

  const activePopulation = popRows.reduce(
    (acc, r) => acc + Math.max(0, r.initialCount - r.totalDeaths - r.totalCulled),
    0
  )

  const todayStr = new Date().toISOString().slice(0, 10)
  const todayRecords = recentRecords.filter(
    (r) => new Date(r.recordDate).toISOString().slice(0, 10) === todayStr
  )
  const productionToday = todayRecords.reduce((acc, r) => acc + r.eggsGradeA + r.eggsGradeB, 0)

  const last7EggsA = recentRecords.reduce((acc, r) => acc + r.eggsGradeA, 0)
  const last7EggsB = recentRecords.reduce((acc, r) => acc + r.eggsGradeB, 0)
  const last7FeedKg = recentRecords.reduce((acc, r) => acc + Number(r.feedKg ?? 0), 0)

  const hdpPercent = computeHDP(last7EggsA, last7EggsB, activePopulation * 7)
  const fcr7Day = computeFCR(last7FeedKg, last7EggsA, last7EggsB)
  const feedPerBirdGrams = computeFeedPerBird(last7FeedKg / 7, activePopulation)

  return {
    hdpPercent,
    fcr7Day,
    productionToday,
    stockReadyToSell: stockSummary.totalGradeA + stockSummary.totalGradeB,
    activePopulation,
    feedPerBirdGrams,
  }
}

export async function getProductionChartData(days: number = 30): Promise<DashboardChartPoint[]> {
  const [aggRows, popRows] = await Promise.all([
    getDailyProductionAgg(days),
    getActiveFlockPopulations(),
  ])

  const totalInitial = popRows.reduce((acc, r) => acc + r.initialCount, 0)
  const totalDepletion = popRows.reduce((acc, r) => acc + r.totalDeaths + r.totalCulled, 0)

  let cumulativeDepletion = totalDepletion
  return aggRows.map((r: DailyAggRow) => {
    const population = Math.max(0, totalInitial - cumulativeDepletion)
    const hdp = computeHDP(r.totalEggsA, r.totalEggsB, population)
    const fcr = computeFCR(r.totalFeedKg, r.totalEggsA, r.totalEggsB)
    cumulativeDepletion -= r.totalDeaths

    const d = new Date(r.date)
    const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`

    return {
      date: label,
      hdp: Math.round(hdp * 10) / 10,
      fcr: Math.round(fcr * 100) / 100,
      gradeA: r.totalEggsA,
      gradeB: r.totalEggsB,
      cumulativeDepletion: totalDepletion - cumulativeDepletion,
    }
  })
}

export async function getRecentDashboardRecords(limit: number = 7): Promise<DashboardRecentRecord[]> {
  const records: DashboardRecord[] = await getRecentDailyRecordsAcrossFlocks(limit)
  return records.map((r) => {
    const feedKg = Number(r.feedKg ?? 0)
    const d = new Date(r.recordDate)
    const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
    return {
      date: label,
      gradeA: r.eggsGradeA,
      gradeB: r.eggsGradeB,
      deaths: r.deaths,
      feedKg,
      fcr: computeFCR(feedKg, r.eggsGradeA, r.eggsGradeB),
      isLate: r.isLateInput ?? false,
    }
  })
}
