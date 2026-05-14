import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getFlockPerformanceData } from '@/lib/services/daily-record.service'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
function parseSafe(s: string | null, d: Date) {
  if (!s || !ISO_DATE.test(s)) return d.toISOString().split('T')[0]!
  const p = new Date(s)
  return isNaN(p.getTime()) ? d.toISOString().split('T')[0]! : s
}
function esc(v: string) {
  return v.includes(',') || v.includes('"') || v.includes('\n')
    ? `"${v.replace(/"/g, '""')}"`
    : v
}

export async function GET(request: Request): Promise<Response> {
  const session = await getSession()
  if (!session) return new Response('Unauthorized', { status: 401 })
  if (!hasPermission(session, PERMISSIONS.LAPORAN.EXPORT))
    return new Response('Forbidden', { status: 403 })

  const { searchParams } = new URL(request.url)
  const today = new Date()
  const defaultFrom = new Date(today)
  defaultFrom.setDate(today.getDate() - 30)
  const from = parseSafe(searchParams.get('from'), defaultFrom)
  const to = parseSafe(searchParams.get('to'), today)
  const flockId = searchParams.get('flock') ?? undefined

  let rows: Awaited<ReturnType<typeof getFlockPerformanceData>> = []
  try {
    rows = await getFlockPerformanceData(session.farmSchema, from, to, flockId)
  } catch {
    return new Response('Gagal mengambil data', { status: 500 })
  }

  const header =
    'Flock,Kandang,Umur (mgg),Pop. Awal,HDP%,Total Telur,Kematian,Mortalitas%,FCR'
  const data = rows.map((r) =>
    [
      esc(r.flockName),
      esc(r.coopName),
      r.ageWeeks,
      r.initialCount,
      r.avgHdp.toFixed(1),
      r.totalEggsButir,
      r.totalDeaths,
      r.mortalityPct.toFixed(1),
      r.fcr.toFixed(2),
    ].join(',')
  )

  return new Response([header, ...data].join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="laporan-flock.csv"',
    },
  })
}
