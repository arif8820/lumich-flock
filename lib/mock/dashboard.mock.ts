export type DailyChartPoint = {
  date: string
  hdp: number
  fcr: number
  gradeA: number
  gradeB: number
  cumulativeDepletion: number
}

export type RecentRecord = {
  date: string
  gradeA: number
  gradeB: number
  deaths: number
  feedKg: number
  fcr: number
  isLate: boolean
}

export const MOCK_KPI = {
  hdpPercent: 87.5,
  fcr7Day: 1.80,
  productionToday: 2340,
  stockReadyToSell: 18750,
  activePopulation: 2680,
  feedPerBirdGrams: 115,
}

export const MOCK_CHART_DATA: DailyChartPoint[] = [
  { date: '15/04', hdp: 85.2, fcr: 1.85, gradeA: 2100, gradeB: 180, cumulativeDepletion: 120 },
  { date: '16/04', hdp: 86.1, fcr: 1.82, gradeA: 2150, gradeB: 170, cumulativeDepletion: 128 },
  { date: '17/04', hdp: 84.8, fcr: 1.90, gradeA: 2050, gradeB: 160, cumulativeDepletion: 135 },
  { date: '18/04', hdp: 87.3, fcr: 1.79, gradeA: 2200, gradeB: 190, cumulativeDepletion: 142 },
  { date: '19/04', hdp: 88.1, fcr: 1.75, gradeA: 2260, gradeB: 200, cumulativeDepletion: 148 },
  { date: '20/04', hdp: 87.9, fcr: 1.77, gradeA: 2250, gradeB: 185, cumulativeDepletion: 155 },
  { date: '21/04', hdp: 87.5, fcr: 1.80, gradeA: 2220, gradeB: 120, cumulativeDepletion: 160 },
]

export const MOCK_RECENT_RECORDS: RecentRecord[] = [
  { date: '21/04', gradeA: 2220, gradeB: 120, deaths: 3, feedKg: 310, fcr: 1.80, isLate: false },
  { date: '20/04', gradeA: 2250, gradeB: 185, deaths: 7, feedKg: 310, fcr: 1.77, isLate: false },
  { date: '19/04', gradeA: 2260, gradeB: 200, deaths: 6, feedKg: 308, fcr: 1.75, isLate: true },
  { date: '18/04', gradeA: 2200, gradeB: 190, deaths: 7, feedKg: 310, fcr: 1.79, isLate: false },
  { date: '17/04', gradeA: 2050, gradeB: 160, deaths: 9, feedKg: 308, fcr: 1.90, isLate: false },
  { date: '16/04', gradeA: 2150, gradeB: 170, deaths: 8, feedKg: 308, fcr: 1.82, isLate: false },
  { date: '15/04', gradeA: 2100, gradeB: 180, deaths: 8, feedKg: 305, fcr: 1.85, isLate: false },
]
