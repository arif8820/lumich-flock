import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getSalesPerCustomerReport } from '@/lib/db/queries/sales-order.queries'
import type { SalesPerCustomerRow } from '@/lib/db/queries/sales-order.queries'
import { listCustomers } from '@/lib/db/queries/customer.queries'
import { LaporanFilter } from '@/components/forms/laporan-filter'
import { KpiCard } from '@/components/ui/kpi-card'

function toISODate(d: Date) { return d.toISOString().split('T')[0]! }
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
function parseSafe(s: string, d: Date) {
  if (!ISO_DATE.test(s)) return toISODate(d)
  const p = new Date(s); return isNaN(p.getTime()) ? toISODate(d) : s
}
function formatRupiah(n: number) { return `Rp ${n.toLocaleString('id-ID')}` }

export default async function LaporanPenjualanCustomerPage({
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
  const customerId = typeof params.customer === 'string' ? params.customer : undefined

  let customers: Awaited<ReturnType<typeof listCustomers>> = []
  try { customers = await listCustomers(session.farmSchema) } catch { /* empty */ }
  const customerOptions = customers.map((c) => ({ id: c.id, label: c.name }))

  let rows: SalesPerCustomerRow[] = []
  try { rows = await getSalesPerCustomerReport(session.farmSchema, safeFrom, safeTo, customerId) } catch { /* empty */ }

  const totalCustomers = rows.length
  const totalRevenue = rows.reduce((s, r) => s + r.totalRevenue, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>Penjualan per Pelanggan</h1>
          <p className="text-[13px] mt-1" style={{ color: '#8fa08f' }}>Ringkasan penjualan dikelompokkan per pelanggan</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap no-print">
          <Suspense fallback={null}>
            <LaporanFilter
              defaultFrom={safeFrom}
              defaultTo={safeTo}
              entityType="customer"
              entities={customerOptions}
              entityParamName="customer"
            />
          </Suspense>
          {hasPermission(session, PERMISSIONS.LAPORAN.EXPORT) && (
            <a
              href={`/api/laporan/penjualan-customer-csv?from=${safeFrom}&to=${safeTo}${customerId ? '&customer=' + customerId : ''}`}
              download="laporan-penjualan-customer.csv"
              className="inline-flex items-center px-4 py-2 rounded-[10px] text-sm font-medium"
              style={{ backgroundColor: 'var(--lf-teal)', color: '#ffffff' }}
            >
              Export CSV
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <KpiCard label="Total Pelanggan" value={totalCustomers.toString()} />
        <KpiCard label="Total Revenue" value={formatRupiah(totalRevenue)} />
      </div>

      <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--lf-border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: 'var(--lf-bg-soft)' }}>
              {['Pelanggan', 'Total SO', 'Total Revenue', 'Avg per SO', 'Terakhir Order'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--lf-text-soft)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--lf-text-soft)' }}>
                  Tidak ada data penjualan per pelanggan
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.customerId} className="border-t" style={{ borderColor: 'var(--lf-border)' }}>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--lf-text-dark)' }}>{row.customerName}</td>
                  <td className="px-4 py-3 text-sm text-right" style={{ color: 'var(--lf-text-dark)' }}>{row.totalOrders}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: 'var(--lf-text-dark)' }}>{formatRupiah(row.totalRevenue)}</td>
                  <td className="px-4 py-3 text-sm text-right" style={{ color: 'var(--lf-text-mid)' }}>{formatRupiah(Math.round(row.avgOrderValue))}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--lf-text-mid)' }}>{row.lastOrderDate}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
