import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getStockMovementReport } from '@/lib/db/queries/inventory.queries'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
function parseSafe(s: string | null, d: Date) {
  if (!s || !ISO_DATE.test(s)) return d.toISOString().split('T')[0]!
  const p = new Date(s); return isNaN(p.getTime()) ? d.toISOString().split('T')[0]! : s
}
function esc(v: string) {
  return v.includes(',') || v.includes('"') || v.includes('\n') ? `"${v.replace(/"/g, '""')}"` : v
}

const SOURCE_LABEL: Record<string, string> = {
  production: 'Produksi',
  sale: 'Penjualan',
  adjustment: 'Penyesuaian',
  regrade: 'Regrade',
  import: 'Import',
  purchase: 'Pembelian',
}

export async function GET(request: Request): Promise<Response> {
  const session = await getSession()
  if (!session) return new Response('Unauthorized', { status: 401 })
  if (!hasPermission(session, PERMISSIONS.LAPORAN.EXPORT)) return new Response('Forbidden', { status: 403 })

  const { searchParams } = new URL(request.url)
  const today = new Date()
  const defaultFrom = new Date(today); defaultFrom.setDate(today.getDate() - 30)
  const from = parseSafe(searchParams.get('from'), defaultFrom)
  const to = parseSafe(searchParams.get('to'), today)
  const stockItemId = searchParams.get('item') ?? undefined

  let rows: Awaited<ReturnType<typeof getStockMovementReport>> = []
  try { rows = await getStockMovementReport(session.farmSchema, from, to, stockItemId) }
  catch { return new Response('Gagal mengambil data', { status: 500 }) }

  const header = 'Tanggal,Item,Kategori,Tipe,Sumber,Qty'
  const data = rows.map((r) => [
    r.movementDate,
    esc(r.itemName),
    esc(r.categoryName),
    r.movementType === 'in' ? 'Masuk' : 'Keluar',
    esc(SOURCE_LABEL[r.source] ?? r.source),
    r.quantity,
  ].join(','))

  return new Response([header, ...data].join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="laporan-stok-mutasi.csv"',
    },
  })
}
