import { type NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getSalesPerCustomerReport } from '@/lib/db/queries/sales-order.queries'

function esc(v: string) {
  return v.includes(',') || v.includes('"') || v.includes('\n') ? `"${v.replace(/"/g, '""')}"` : v
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
function parseSafe(s: string | null, d: Date) {
  if (!s || !ISO_DATE.test(s)) return d.toISOString().split('T')[0]!
  const p = new Date(s); return isNaN(p.getTime()) ? d.toISOString().split('T')[0]! : s
}

function formatRupiah(n: number) { return `Rp ${n.toLocaleString('id-ID')}` }

export async function GET(request: NextRequest): Promise<Response> {
  const session = await getSession()
  if (!session) return new Response('Unauthorized', { status: 401 })
  if (!hasPermission(session, PERMISSIONS.LAPORAN.EXPORT)) return new Response('Forbidden', { status: 403 })

  const { searchParams } = request.nextUrl
  const today = new Date()
  const defaultFrom = new Date(today)
  defaultFrom.setDate(today.getDate() - 30)
  const from = parseSafe(searchParams.get('from'), defaultFrom)
  const to = parseSafe(searchParams.get('to'), today)
  const customerId = searchParams.get('customer') ?? undefined

  let rows: Awaited<ReturnType<typeof getSalesPerCustomerReport>> = []
  try { rows = await getSalesPerCustomerReport(session.farmSchema, from, to, customerId) }
  catch { return new Response('Gagal mengambil data', { status: 500 }) }

  const header = 'Pelanggan,Total SO,Total Revenue,Avg per SO,Terakhir Order'
  const data = rows.map((r) => [
    esc(r.customerName),
    r.totalOrders,
    esc(formatRupiah(r.totalRevenue)),
    esc(formatRupiah(Math.round(r.avgOrderValue))),
    esc(r.lastOrderDate),
  ].join(','))

  return new Response([header, ...data].join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="laporan-penjualan-customer-${from}-${to}.csv"`,
    },
  })
}
