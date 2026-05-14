import { type NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getSalesReport } from '@/lib/db/queries/sales-order.queries'

function esc(v: string) {
  return v.includes(',') || v.includes('"') || v.includes('\n') ? `"${v.replace(/"/g, '""')}"` : v
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
function parseSafe(s: string | null, d: Date) {
  if (!s || !ISO_DATE.test(s)) return d.toISOString().split('T')[0]!
  const p = new Date(s); return isNaN(p.getTime()) ? d.toISOString().split('T')[0]! : s
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft', confirmed: 'Konfirmasi', fulfilled: 'Selesai', cancelled: 'Batal',
}

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

  let rows: Awaited<ReturnType<typeof getSalesReport>> = []
  try { rows = await getSalesReport(session.farmSchema, from, to) }
  catch { return new Response('Gagal mengambil data', { status: 500 }) }

  const header = 'Tanggal,No. SO,Pelanggan,Items,Total,Status'
  const data = rows.map((r) => [
    esc(r.orderDate),
    esc(r.orderNumber),
    esc(r.customerName),
    r.itemCount,
    r.totalAmount,
    esc(STATUS_LABEL[r.status] ?? r.status),
  ].join(','))

  return new Response([header, ...data].join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="laporan-penjualan-${from}-${to}.csv"`,
    },
  })
}
