import { getSession } from '@/lib/auth/get-session'
import { getProductionReportData } from '@/lib/services/daily-record.service'
import type { Role } from '@/lib/services/daily-record.service'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function parseSafeDate(str: string | null, fallback: Date): Date {
  if (!str || !ISO_DATE.test(str)) return fallback
  const d = new Date(str)
  if (isNaN(d.getTime())) return fallback
  return d
}

export async function GET(request: Request): Promise<Response> {
  const session = await getSession()

  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (session.role !== 'admin' && session.role !== 'supervisor') {
    return new Response('Forbidden', { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const fromParam = searchParams.get('from')
  const toParam = searchParams.get('to')

  const today = new Date()
  const defaultFrom = new Date(today)
  defaultFrom.setDate(defaultFrom.getDate() - 30)

  const from = parseSafeDate(fromParam, defaultFrom)
  const to = parseSafeDate(toParam, today)

  const result = await getProductionReportData(from, to, session.role as Role)

  const header = [
    'Tanggal',
    'Kandang',
    'Flock',
    'Populasi',
    'TelurA',
    'TelurB',
    'TotalTelur',
    'HDP%',
    'PakanKg',
    'FCR',
    'Kematian',
  ].join(',')

  function escapeField(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  const dataRows = result.rows.map((row) => {
    const recordDate = row.recordDate instanceof Date
      ? row.recordDate.toISOString().split('T')[0]
      : String(row.recordDate).split('T')[0]
    return [
      recordDate,
      escapeField(row.coopName),
      escapeField(row.flockName),
      row.activePopulation,
      row.eggsGradeA,
      row.eggsGradeB,
      row.totalEggs,
      row.hdp.toFixed(1),
      row.feedKg.toFixed(1),
      row.fcr.toFixed(2),
      row.deaths,
    ].join(',')
  })

  const csv = [header, ...dataRows].join('\r\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="laporan-produksi.csv"',
    },
  })
}
