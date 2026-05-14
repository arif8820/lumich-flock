import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getSalesReport } from '@/lib/db/queries/sales-order.queries'
import type { SalesReportRow } from '@/lib/db/queries/sales-order.queries'
import { LaporanFilter } from '@/components/forms/laporan-filter'
import { KpiCard } from '@/components/ui/kpi-card'

function toISODate(d: Date) { return d.toISOString().split('T')[0]! }
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
function parseSafe(s: string, d: Date) {
  if (!ISO_DATE.test(s)) return toISODate(d)
  const p = new Date(s); return isNaN(p.getTime()) ? toISODate(d) : s
}
function formatRupiah(n: number) { return `Rp ${n.toLocaleString('id-ID')}` }

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  confirmed: 'Konfirmasi',
  fulfilled: 'Selesai',
  cancelled: 'Batal',
}

export default async function LaporanPenjualanPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await getSession()
  if (!session || !hasPermission(session, PERMISSIONS.LAPORAN.PENJUALAN.VIEW)) redirect('/laporan')

  const params = await searchParams
  const today = new Date()
  const defaultFrom = new Date(today)
  defaultFrom.setDate(today.getDate() - 30)
  const safeFrom = parseSafe(typeof params.from === 'string' ? params.from : '', defaultFrom)
  const safeTo = parseSafe(typeof params.to === 'string' ? params.to : '', today)

  let rows: SalesReportRow[] = []
  try { rows = await getSalesReport(session.farmSchema, safeFrom, safeTo) } catch { /* empty */ }

  const totalSO = rows.length
  const totalRevenue = rows.reduce((s, r) => s + r.totalAmount, 0)
  const avgPerSO = totalSO > 0 ? totalRevenue / totalSO : 0

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>Laporan Penjualan</h1>
          <p className="text-[13px] mt-1" style={{ color: '#8fa08f' }}>Ringkasan sales order per periode</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap no-print">
          <Suspense fallback={null}>
            <LaporanFilter defaultFrom={safeFrom} defaultTo={safeTo} />
          </Suspense>
          {hasPermission(session, PERMISSIONS.LAPORAN.EXPORT) && (
            <a
              href={`/api/laporan/penjualan-csv?from=${safeFrom}&to=${safeTo}`}
              className="inline-flex items-center px-4 py-2 rounded-[10px] text-sm font-medium"
              style={{ backgroundColor: 'var(--lf-teal)', color: '#ffffff' }}
            >
              Export CSV
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Total SO" value={totalSO.toString()} />
        <KpiCard label="Total Revenue" value={formatRupiah(totalRevenue)} />
        <KpiCard label="Avg per SO" value={formatRupiah(Math.round(avgPerSO))} />
      </div>

      <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--lf-border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: 'var(--lf-bg-soft)' }}>
              {['Tanggal', 'No. SO', 'Pelanggan', 'Items', 'Total', 'Status'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--lf-text-soft)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--lf-text-soft)' }}>
                  Tidak ada data penjualan
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t" style={{ borderColor: 'var(--lf-border)' }}>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--lf-text-mid)' }}>{row.orderDate}</td>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--lf-text-dark)' }}>{row.orderNumber}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--lf-text-mid)' }}>{row.customerName}</td>
                  <td className="px-4 py-3 text-sm text-right" style={{ color: 'var(--lf-text-dark)' }}>{row.itemCount}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: 'var(--lf-text-dark)' }}>{formatRupiah(row.totalAmount)}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--lf-text-mid)' }}>{STATUS_LABEL[row.status] ?? row.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
