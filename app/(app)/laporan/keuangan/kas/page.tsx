import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getCashFlowReport } from '@/lib/db/queries/kas.queries'
import type { CashFlowReport } from '@/lib/db/queries/kas.queries'
import { LaporanFilter } from '@/components/forms/laporan-filter'
import { KpiCard } from '@/components/ui/kpi-card'

function toISODate(d: Date) {
  return d.toISOString().split('T')[0]!
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function parseSafe(s: string, d: Date) {
  if (!ISO_DATE.test(s)) return toISODate(d)
  const p = new Date(s)
  return isNaN(p.getTime()) ? toISODate(d) : s
}

function formatRupiah(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`
}

const TYPE_LABEL: Record<string, string> = {
  in: 'Masuk',
  out: 'Keluar',
  transfer_in: 'Transfer Masuk',
  transfer_out: 'Transfer Keluar',
}

export default async function LaporanKasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await getSession()
  if (!session || !hasPermission(session, PERMISSIONS.LAPORAN.KEUANGAN.VIEW)) redirect('/laporan')

  const params = await searchParams
  const today = new Date()
  const defaultFrom = new Date(today)
  defaultFrom.setDate(today.getDate() - 30)

  const safeFrom = parseSafe(typeof params.from === 'string' ? params.from : '', defaultFrom)
  const safeTo = parseSafe(typeof params.to === 'string' ? params.to : '', today)

  let report: CashFlowReport = { rows: [], totalIn: 0, totalOut: 0, netFlow: 0 }
  try {
    report = await getCashFlowReport(session.farmSchema, safeFrom, safeTo)
  } catch {
    // DB error — render empty state
  }

  const { rows, totalIn, totalOut, netFlow } = report

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-[18px] font-bold"
            style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}
          >
            Kas &amp; Cash Flow
          </h1>
          <p className="text-[13px] mt-1" style={{ color: '#8fa08f' }}>
            Arus kas masuk dan keluar per periode
          </p>
        </div>
        <div className="flex items-center gap-4 flex-wrap no-print">
          <Suspense fallback={null}>
            <LaporanFilter defaultFrom={safeFrom} defaultTo={safeTo} />
          </Suspense>
          {hasPermission(session, PERMISSIONS.LAPORAN.EXPORT) && (
            <a
              href={`/api/laporan/kas-csv?from=${safeFrom}&to=${safeTo}`}
              download="laporan-kas.csv"
              className="inline-flex items-center px-4 py-2 rounded-[10px] text-sm font-medium"
              style={{ backgroundColor: 'var(--lf-teal)', color: '#ffffff' }}
            >
              Export CSV
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Total Masuk" value={formatRupiah(totalIn)} />
        <KpiCard label="Total Keluar" value={formatRupiah(totalOut)} />
        <KpiCard label="Net Cash Flow" value={formatRupiah(netFlow)} />
      </div>

      <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--lf-border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: 'var(--lf-bg-soft)' }}>
              {['Tanggal', 'Keterangan', 'Akun', 'Kategori', 'Tipe', 'Jumlah'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--lf-text-soft)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm"
                  style={{ color: 'var(--lf-text-soft)' }}
                >
                  Tidak ada transaksi kas untuk periode ini
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const isInflow = row.type === 'in' || row.type === 'transfer_in'
                return (
                  <tr key={row.id} className="border-t" style={{ borderColor: 'var(--lf-border)' }}>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--lf-text-mid)' }}>
                      {row.transactionDate}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--lf-text-dark)' }}>
                      {row.description}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--lf-text-mid)' }}>
                      {row.accountName}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--lf-text-mid)' }}>
                      {row.categoryName ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          background: isInflow ? '#e8f5e9' : '#fce4e4',
                          color: isInflow ? '#27ae60' : '#e74c3c',
                        }}
                      >
                        {TYPE_LABEL[row.type] ?? row.type}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-sm text-right font-medium"
                      style={{ color: isInflow ? '#27ae60' : '#e74c3c' }}
                    >
                      {isInflow ? '' : '-'}{formatRupiah(row.amount)}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
