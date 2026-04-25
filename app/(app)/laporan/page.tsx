import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAgingData } from '@/lib/services/invoice.service'
import { KpiCard } from '@/components/ui/kpi-card'

function formatRupiah(n: number): string {
  return `Rp ${n.toLocaleString('id-ID')}`
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString('id-ID')
}

function getDaysOverdueStyle(bucket: string): React.CSSProperties {
  switch (bucket) {
    case '0-7':
      return { color: 'var(--lf-text-dark)' }
    case '8-14':
      return { color: '#e67e22' }
    case '15-30':
      return { color: '#e74c3c' }
    case '>30':
      return { color: '#c0392b', fontWeight: 'bold' }
    default:
      return { color: 'var(--lf-text-dark)' }
  }
}

export default async function LaporanPage() {
  const session = await getSession()
  if (!session || session.role === 'operator') redirect('/dashboard')

  let agingData: Awaited<ReturnType<typeof getAgingData>> = []
  try {
    agingData = await getAgingData()
  } catch {
    // DB error — render empty state
  }

  const bucket07 = agingData.filter((r) => r.bucket === '0-7').reduce((s, r) => s + r.outstanding, 0)
  const bucket814 = agingData.filter((r) => r.bucket === '8-14').reduce((s, r) => s + r.outstanding, 0)
  const bucket1530 = agingData.filter((r) => r.bucket === '15-30').reduce((s, r) => s + r.outstanding, 0)
  const bucket30 = agingData.filter((r) => r.bucket === '>30').reduce((s, r) => s + r.outstanding, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-[18px] font-bold"
            style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}
          >
            Laporan Piutang
          </h1>
          <p className="text-[13px] mt-1" style={{ color: '#8fa08f' }}>
            Aging piutang pelanggan berdasarkan hari keterlambatan
          </p>
        </div>
        {(session.role === 'admin' || session.role === 'supervisor') && (
          <a
            href="/api/laporan/aging-csv"
            className="inline-flex items-center px-4 py-2 rounded-[10px] text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--lf-teal)',
              color: '#ffffff',
            }}
          >
            Export CSV
          </a>
        )}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard
          label="0–7 Hari"
          value={formatRupiah(bucket07)}
        />
        <KpiCard
          label="8–14 Hari"
          value={formatRupiah(bucket814)}
        />
        <KpiCard
          label="15–30 Hari"
          value={formatRupiah(bucket1530)}
        />
        <KpiCard
          label=">30 Hari"
          value={formatRupiah(bucket30)}
        />
      </div>

      {/* Aging Table */}
      <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--lf-border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: 'var(--lf-bg-soft)' }}>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--lf-text-soft)' }}>Pelanggan</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--lf-text-soft)' }}>No. Invoice</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--lf-text-soft)' }}>Tgl Terbit</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--lf-text-soft)' }}>Jatuh Tempo</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--lf-text-soft)' }}>Total</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--lf-text-soft)' }}>Terbayar</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--lf-text-soft)' }}>Sisa</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--lf-text-soft)' }}>Hari Lewat</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--lf-text-soft)' }}>Kategori</th>
            </tr>
          </thead>
          <tbody>
            {agingData.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-sm"
                  style={{ color: 'var(--lf-text-soft)' }}
                >
                  Tidak ada data piutang jatuh tempo
                </td>
              </tr>
            ) : (
              agingData.map((row) => (
                <tr
                  key={row.invoiceId}
                  className="border-t"
                  style={{ borderColor: 'var(--lf-border)' }}
                >
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--lf-text-dark)' }}>
                    {row.customerName}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--lf-text-dark)' }}>
                    {row.invoiceNumber}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--lf-text-mid)' }}>
                    {formatDate(row.issueDate)}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--lf-text-mid)' }}>
                    {formatDate(row.dueDate)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right" style={{ color: 'var(--lf-text-dark)' }}>
                    {formatRupiah(row.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right" style={{ color: 'var(--lf-text-mid)' }}>
                    {formatRupiah(row.paidAmount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: 'var(--lf-text-dark)' }}>
                    {formatRupiah(row.outstanding)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right" style={getDaysOverdueStyle(row.bucket)}>
                    {row.daysOverdue}
                  </td>
                  <td className="px-4 py-3 text-sm" style={getDaysOverdueStyle(row.bucket)}>
                    {row.bucket} hari
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
