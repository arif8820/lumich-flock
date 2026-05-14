import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getStockMovementReport, getAllStockBalances } from '@/lib/db/queries/inventory.queries'
import { LaporanFilter } from '@/components/forms/laporan-filter'

function toISODate(d: Date) { return d.toISOString().split('T')[0]! }
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
function parseSafe(s: string, d: Date) {
  if (!ISO_DATE.test(s)) return toISODate(d)
  const p = new Date(s); return isNaN(p.getTime()) ? toISODate(d) : s
}

// movementType is 'in' | 'out'; source carries semantic meaning (production, sale, adjustment, regrade, import, purchase)
const SOURCE_LABEL: Record<string, string> = {
  production: 'Produksi',
  sale: 'Penjualan',
  adjustment: 'Penyesuaian',
  regrade: 'Regrade',
  import: 'Import',
  purchase: 'Pembelian',
}

export default async function LaporanStokMutasiPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await getSession()
  if (!session || !hasPermission(session, PERMISSIONS.LAPORAN.STOK.MUTASI.VIEW)) redirect('/laporan')

  const params = await searchParams
  const today = new Date()
  const defaultFrom = new Date(today); defaultFrom.setDate(today.getDate() - 30)

  const safeFrom = parseSafe(typeof params.from === 'string' ? params.from : '', defaultFrom)
  const safeTo = parseSafe(typeof params.to === 'string' ? params.to : '', today)
  const stockItemId = typeof params.item === 'string' ? params.item : undefined

  const [rows, balances] = await Promise.all([
    getStockMovementReport(session.farmSchema, safeFrom, safeTo, stockItemId).catch(() => []),
    getAllStockBalances(session.farmSchema).catch(() => []),
  ])

  const itemOptions = balances.map((b) => ({ id: b.stockItemId, label: b.itemName }))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>Mutasi Stok</h1>
          <p className="text-[13px] mt-1" style={{ color: '#8fa08f' }}>Riwayat pergerakan stok per periode</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap no-print">
          <Suspense fallback={null}>
            <LaporanFilter
              defaultFrom={safeFrom}
              defaultTo={safeTo}
              entityType="stockItem"
              entities={itemOptions}
              entityParamName="item"
            />
          </Suspense>
          {hasPermission(session, PERMISSIONS.LAPORAN.EXPORT) && (
            <a
              href={`/api/laporan/stok-mutasi-csv?from=${safeFrom}&to=${safeTo}${stockItemId ? `&item=${stockItemId}` : ''}`}
              download="laporan-stok-mutasi.csv"
              className="inline-flex items-center px-4 py-2 rounded-[10px] text-sm font-medium"
              style={{ backgroundColor: 'var(--lf-teal)', color: '#ffffff' }}
            >Export CSV</a>
          )}
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--lf-border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: 'var(--lf-bg-soft)' }}>
              {['Tanggal', 'Item', 'Kategori', 'Tipe', 'Sumber', 'Qty'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--lf-text-soft)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--lf-text-soft)' }}>Tidak ada mutasi untuk periode ini</td></tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t" style={{ borderColor: 'var(--lf-border)' }}>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--lf-text-mid)' }}>{row.movementDate}</td>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--lf-text-dark)' }}>{row.itemName}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--lf-text-mid)' }}>{row.categoryName}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: row.movementType === 'in' ? '#e8f5e9' : '#fce4e4',
                        color: row.movementType === 'in' ? '#27ae60' : '#e74c3c',
                      }}
                    >
                      {row.movementType === 'in' ? 'Masuk' : 'Keluar'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--lf-text-mid)' }}>{SOURCE_LABEL[row.source] ?? row.source}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: 'var(--lf-text-dark)' }}>{row.quantity.toLocaleString('id-ID')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
