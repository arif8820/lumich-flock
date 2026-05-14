import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getAllStockBalances } from '@/lib/db/queries/inventory.queries'
import { KpiCard } from '@/components/ui/kpi-card'

export default async function LaporanStokPage() {
  const session = await getSession()
  if (!session || !hasPermission(session, PERMISSIONS.LAPORAN.STOK.VIEW)) redirect('/laporan')

  let rows: Awaited<ReturnType<typeof getAllStockBalances>> = []
  try { rows = await getAllStockBalances(session.farmSchema) } catch { /* empty state */ }

  const totalItems = rows.length
  const lowStock = rows.filter((r) => r.balance <= 0).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>Stok Balance</h1>
          <p className="text-[13px] mt-1" style={{ color: '#8fa08f' }}>Saldo stok terkini semua item</p>
        </div>
        {hasPermission(session, PERMISSIONS.LAPORAN.EXPORT) && (
          <a href="/api/laporan/stok-csv" download="laporan-stok.csv" className="inline-flex items-center px-4 py-2 rounded-[10px] text-sm font-medium no-print" style={{ backgroundColor: 'var(--lf-teal)', color: '#ffffff' }}>
            Export CSV
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <KpiCard label="Total Item" value={totalItems.toString()} />
        <KpiCard label="Stok Habis / Minus" value={lowStock.toString()} />
      </div>

      <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--lf-border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: 'var(--lf-bg-soft)' }}>
              {['Item', 'Kategori', 'Satuan', 'Total Masuk', 'Total Keluar', 'Balance'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--lf-text-soft)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--lf-text-soft)' }}>Tidak ada data stok</td></tr>
            ) : (
              rows.map((row) => (
                <tr key={row.stockItemId} className="border-t" style={{ borderColor: 'var(--lf-border)' }}>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--lf-text-dark)' }}>{row.itemName}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--lf-text-mid)' }}>{row.categoryName}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--lf-text-mid)' }}>{row.unit}</td>
                  <td className="px-4 py-3 text-sm text-right" style={{ color: 'var(--lf-text-dark)' }}>{row.totalIn.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 text-sm text-right" style={{ color: 'var(--lf-text-mid)' }}>{row.totalOut.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: row.balance <= 0 ? '#e74c3c' : 'var(--lf-text-dark)' }}>{row.balance.toLocaleString('id-ID')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
