import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getAllStockBalances } from '@/lib/db/queries/inventory.queries'

function esc(v: string) {
  return v.includes(',') || v.includes('"') || v.includes('\n') ? `"${v.replace(/"/g, '""')}"` : v
}

export async function GET(): Promise<Response> {
  const session = await getSession()
  if (!session) return new Response('Unauthorized', { status: 401 })
  if (!hasPermission(session, PERMISSIONS.LAPORAN.EXPORT)) return new Response('Forbidden', { status: 403 })

  let rows: Awaited<ReturnType<typeof getAllStockBalances>> = []
  try { rows = await getAllStockBalances(session.farmSchema) }
  catch { return new Response('Gagal mengambil data', { status: 500 }) }

  const header = 'Item,Kategori,Satuan,Total Masuk,Total Keluar,Balance'
  const data = rows.map((r) => [esc(r.itemName), esc(r.categoryName), esc(r.unit), r.totalIn, r.totalOut, r.balance].join(','))

  return new Response([header, ...data].join('\r\n'), {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="laporan-stok.csv"' },
  })
}
