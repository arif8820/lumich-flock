import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getProductionReportData } from '@/lib/services/daily-record.service'
import type { Role, ProductionReportResult } from '@/lib/services/daily-record.service'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function parseSafeISODate(str: string | null, fallback: Date): string {
  if (!str || !ISO_DATE.test(str)) return fallback.toISOString().split('T')[0]!
  const d = new Date(str)
  return isNaN(d.getTime()) ? fallback.toISOString().split('T')[0]! : str
}

function escapeField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export async function GET(request: Request): Promise<Response> {
  const session = await getSession()

  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (!hasPermission(session, PERMISSIONS.LAPORAN.EXPORT)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const fromParam = searchParams.get('from')
  const toParam = searchParams.get('to')
  const coopParam = searchParams.get('coop') ?? undefined

  const today = new Date()
  const defaultFrom = new Date(today)
  defaultFrom.setDate(defaultFrom.getDate() - 30)

  const from = parseSafeISODate(fromParam, defaultFrom)
  const to = parseSafeISODate(toParam, today)

  let result: ProductionReportResult
  try {
    result = await getProductionReportData(session.farmSchema, from, to, session.roleSlug as Role, coopParam)
  } catch {
    return new Response('Gagal mengambil data laporan', { status: 500 })
  }

  const header = [
    'Tanggal',
    'Kandang',
    'Flock',
    'Populasi',
    'Telur (butir)',
    'HDP%',
    'Kematian',
    'Afkir',
  ].join(',')

  const dataRows = result.rows.map((row) => [
    row.recordDate,
    escapeField(row.coopName),
    escapeField(row.flockName),
    row.activePopulation,
    row.totalEggsButir,
    row.hdp.toFixed(1),
    row.deaths,
    row.culled,
  ].join(','))

  const csv = [header, ...dataRows].join('\r\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="laporan-produksi.csv"',
    },
  })
}
