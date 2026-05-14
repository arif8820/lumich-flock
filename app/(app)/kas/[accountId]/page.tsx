import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { findAccountById, getAccountBalance } from '@/lib/db/queries/cash-account.queries'
import { listTransactions, getDailyReport } from '@/lib/db/queries/cash-transaction.queries'
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle, ArrowLeftRight, Plus } from 'lucide-react'

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

function formatDate(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const ACCOUNT_TYPE_LABEL: Record<string, string> = { cash: 'Tunai', bank: 'Bank', ewallet: 'E-Wallet' }

const TX_TYPE_CONFIG = {
  in: { label: 'Pemasukan', icon: ArrowUpCircle, color: '#3da88a', bg: '#e8f7f3', sign: '+' },
  out: { label: 'Pengeluaran', icon: ArrowDownCircle, color: '#e07070', bg: '#fdf0f0', sign: '-' },
  transfer_in: { label: 'Transfer Masuk', icon: ArrowLeftRight, color: '#7aadd4', bg: '#e3f0f9', sign: '+' },
  transfer_out: { label: 'Transfer Keluar', icon: ArrowLeftRight, color: '#b0bab0', bg: '#f5f5f5', sign: '-' },
}

type FilterType = 'in' | 'out' | 'transfer_in' | 'transfer_out' | undefined

export default async function AccountLedgerPage({
  params,
  searchParams,
}: {
  params: Promise<{ accountId: string }>
  searchParams: Promise<{ tab?: string; type?: string; dateFrom?: string; dateTo?: string; page?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!hasPermission(session, PERMISSIONS.KAS.VIEW)) redirect('/dashboard')

  const { accountId } = await params
  const { tab = 'riwayat', type, dateFrom, dateTo, page: pageStr } = await searchParams

  const page = Math.max(1, parseInt(pageStr ?? '1', 10))
  const PAGE_SIZE = 30
  const offset = (page - 1) * PAGE_SIZE

  const [account, balance] = await Promise.all([
    findAccountById(session.farmSchema, accountId),
    getAccountBalance(session.farmSchema, accountId),
  ])

  if (!account) notFound()

  const validTypes = ['in', 'out', 'transfer_in', 'transfer_out']
  const filterType: FilterType = validTypes.includes(type ?? '') ? (type as FilterType) : undefined

  // Default daily report date range: current month
  const now = new Date()
  const defaultDateFrom = new Date(now.getFullYear(), now.getMonth(), 1)
  const defaultDateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const [transactions, dailyReport] = await Promise.all([
    tab === 'riwayat' ? listTransactions(session.farmSchema, {
      accountId,
      type: filterType,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      limit: PAGE_SIZE + 1,
      offset,
    }) : Promise.resolve([]),
    tab === 'daily' ? getDailyReport(
      session.farmSchema,
      accountId,
      dateFrom ? new Date(dateFrom) : defaultDateFrom,
      dateTo ? new Date(dateTo) : defaultDateTo,
    ) : Promise.resolve([]),
  ])

  const hasMore = transactions.length > PAGE_SIZE
  const rows = transactions.slice(0, PAGE_SIZE)

  // Compute running balance for ledger rows (rows ordered desc by date)
  // balance = current total balance. Row[0] is newest — its ending balance = balance.
  // Walk forward: after row[i], subtract credit or add debit to get balance before row[i].
  const rowsWithBalance: Array<typeof rows[number] & { runningBalance: number }> = []
  let runningBalance = balance
  for (const tx of rows) {
    const isCredit = tx.type === 'in' || tx.type === 'transfer_in'
    rowsWithBalance.push({ ...tx, runningBalance })
    if (isCredit) {
      runningBalance -= Number(tx.amount)
    } else {
      runningBalance += Number(tx.amount)
    }
  }

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams()
    const merged = { tab, type, dateFrom, dateTo, page: String(page), ...overrides }
    for (const [k, v] of Object.entries(merged)) {
      if (v) p.set(k, v)
    }
    return `/kas/${accountId}?${p.toString()}`
  }

  const reportDateFrom = dateFrom ?? defaultDateFrom.toISOString().split('T')[0]!
  const reportDateTo = dateTo ?? defaultDateTo.toISOString().split('T')[0]!

  return (
    <div className="p-3 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link href="/kas" className="press-feedback p-1.5 rounded-lg" style={{ color: '#5a6b5b' }}>
          <ArrowLeft size={18} strokeWidth={2} />
        </Link>
        <div className="flex-1">
          <h1 className="text-[17px] font-semibold" style={{ color: '#2d3a2e' }}>{account.name}</h1>
          <span className="text-[11px] px-1.5 py-0.5 rounded-full" style={{ background: '#e3f0f9', color: '#5090be' }}>
            {ACCOUNT_TYPE_LABEL[account.type] ?? account.type}
          </span>
        </div>
        {session.isAdmin && (
          <div className="flex gap-2">
            <Link
              href={`/kas/transaksi/baru?accountId=${accountId}&type=in`}
              className="press-feedback flex items-center gap-1 text-[12px] px-3 py-1.5 bg-gradient-to-r from-[#7aadd4] to-[#5090be] text-white rounded-lg"
            >
              <Plus size={13} /> Transaksi
            </Link>
          </div>
        )}
      </div>

      {/* Balance card */}
      <div className="rounded-xl p-4 mb-5 text-white" style={{ background: 'linear-gradient(135deg, #7aadd4, #3d7cb0)' }}>
        <p className="text-[11px] opacity-80 mb-0.5">Saldo Saat Ini</p>
        <p className="text-2xl font-bold">{formatRupiah(balance)}</p>
      </div>

      {/* Tab selector */}
      <div className="flex gap-1 mb-4">
        {[
          { key: 'riwayat', label: 'Riwayat Transaksi' },
          { key: 'daily', label: 'Daily Report' },
        ].map(({ key, label }) => {
          const active = tab === key
          return (
            <Link
              key={key}
              href={buildUrl({ tab: key, page: '1' })}
              className="text-[12px] px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                background: active ? '#e3f0f9' : 'transparent',
                color: active ? '#3d7cb0' : '#8fa08f',
                border: active ? '1px solid #bbd5ee' : '1px solid transparent',
              }}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {tab === 'riwayat' && (
        <>
          {/* Filters */}
          <div className="rounded-xl border p-3 mb-4 flex flex-wrap gap-2 items-center" style={{ borderColor: '#e0e8df', background: 'white' }}>
            <span className="text-[11px] font-medium" style={{ color: '#8fa08f' }}>Filter:</span>

            {(['', 'in', 'out', 'transfer_in', 'transfer_out'] as const).map((t) => {
              const active = (t === '' && !filterType) || t === filterType
              const label = t === '' ? 'Semua' : TX_TYPE_CONFIG[t as keyof typeof TX_TYPE_CONFIG]?.label ?? t
              return (
                <Link
                  key={t}
                  href={buildUrl({ type: t || undefined, page: '1' })}
                  className="text-[11px] px-2.5 py-1 rounded-full border transition-colors"
                  style={{
                    borderColor: active ? '#7aadd4' : '#e0e8df',
                    background: active ? '#e3f0f9' : 'transparent',
                    color: active ? '#3d7cb0' : '#8fa08f',
                  }}
                >
                  {label}
                </Link>
              )
            })}

            <form method="GET" action={`/kas/${accountId}`} className="flex items-center gap-1.5 ml-auto">
              <input type="hidden" name="tab" value="riwayat" />
              <input type="hidden" name="type" value={type ?? ''} />
              <input
                type="date"
                name="dateFrom"
                defaultValue={dateFrom ?? ''}
                className="text-[11px] px-2 py-1 rounded-lg border outline-none"
                style={{ borderColor: '#e0e8df', color: '#5a6b5b' }}
              />
              <span className="text-[11px]" style={{ color: '#b0bab0' }}>–</span>
              <input
                type="date"
                name="dateTo"
                defaultValue={dateTo ?? ''}
                className="text-[11px] px-2 py-1 rounded-lg border outline-none"
                style={{ borderColor: '#e0e8df', color: '#5a6b5b' }}
              />
              <button type="submit" className="text-[11px] px-2.5 py-1 rounded-lg" style={{ background: '#e3f0f9', color: '#3d7cb0' }}>
                Terapkan
              </button>
              {(dateFrom || dateTo) && (
                <Link href={buildUrl({ dateFrom: undefined, dateTo: undefined, page: '1' })} className="text-[11px] px-2 py-1 rounded-lg" style={{ color: '#e07070' }}>
                  Reset
                </Link>
              )}
            </form>
          </div>

          {/* Ledger */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#e0e8df', background: 'white' }}>
            {/* Desktop header — hidden on mobile */}
            <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2 border-b text-[11px] font-medium" style={{ borderColor: '#e0e8df', color: '#8fa08f' }}>
              <span>Transaksi</span>
              <span className="text-right">Masuk</span>
              <span className="text-right">Keluar</span>
              <span className="text-right">Saldo</span>
            </div>

            {rowsWithBalance.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[13px]" style={{ color: '#8fa08f' }}>Tidak ada transaksi.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#f0f4f0]">
                {rowsWithBalance.map((tx) => {
                  const cfg = TX_TYPE_CONFIG[tx.type] ?? TX_TYPE_CONFIG.out
                  const Icon = cfg.icon
                  const isCredit = tx.type === 'in' || tx.type === 'transfer_in'
                  return (
                    <div key={tx.id}>
                      {/* Mobile card — hidden on sm+ */}
                      <div className="sm:hidden px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: cfg.bg }}
                          >
                            <Icon size={14} strokeWidth={2} style={{ color: cfg.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium truncate" style={{ color: '#2d3a2e' }}>
                              {tx.description ?? tx.categoryName ?? cfg.label}
                            </p>
                            <p className="text-[11px]" style={{ color: '#8fa08f' }}>
                              {formatDate(tx.transactionDate)} · {cfg.label}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p
                              className="text-[14px] font-semibold"
                              style={{ color: isCredit ? '#3da88a' : '#e07070' }}
                            >
                              {cfg.sign}{formatRupiah(Number(tx.amount))}
                            </p>
                            <p className="text-[10px]" style={{ color: '#b0bab0' }}>
                              {formatRupiah(tx.runningBalance)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Desktop row — hidden on mobile */}
                      <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-x-4 gap-y-0.5 px-4 py-3 items-center">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: cfg.bg }}
                          >
                            <Icon size={13} strokeWidth={2} style={{ color: cfg.color }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium truncate" style={{ color: '#2d3a2e' }}>
                              {tx.description ?? tx.categoryName ?? cfg.label}
                            </p>
                            <p className="text-[11px]" style={{ color: '#8fa08f' }}>
                              {cfg.label}
                              {tx.referenceNumber ? ` · ${tx.referenceNumber}` : ''}
                              {' · '}{formatDate(tx.transactionDate)}
                            </p>
                          </div>
                        </div>
                        <p className="text-[12px] font-medium text-right" style={{ color: isCredit ? '#3da88a' : '#d0d8d0' }}>
                          {isCredit ? formatRupiah(Number(tx.amount)) : '—'}
                        </p>
                        <p className="text-[12px] font-medium text-right" style={{ color: !isCredit ? '#e07070' : '#d0d8d0' }}>
                          {!isCredit ? formatRupiah(Number(tx.amount)) : '—'}
                        </p>
                        <p className="text-[12px] font-semibold text-right" style={{ color: '#2d3a2e' }}>
                          {formatRupiah(tx.runningBalance)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {(page > 1 || hasMore) && (
            <div className="flex justify-between mt-4">
              {page > 1 ? (
                <Link href={buildUrl({ page: String(page - 1) })} className="text-[12px] px-3 py-1.5 rounded-lg border" style={{ borderColor: '#e0e8df', color: '#5a6b5b' }}>
                  ← Sebelumnya
                </Link>
              ) : <div />}
              {hasMore && (
                <Link href={buildUrl({ page: String(page + 1) })} className="text-[12px] px-3 py-1.5 rounded-lg border" style={{ borderColor: '#e0e8df', color: '#5a6b5b' }}>
                  Selanjutnya →
                </Link>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'daily' && (
        <>
          {/* Date range for daily report */}
          <form method="GET" action={`/kas/${accountId}`} className="rounded-xl border p-3 mb-4 flex items-center gap-2 flex-wrap" style={{ borderColor: '#e0e8df', background: 'white' }}>
            <input type="hidden" name="tab" value="daily" />
            <span className="text-[11px] font-medium" style={{ color: '#8fa08f' }}>Periode:</span>
            <input
              type="date"
              name="dateFrom"
              defaultValue={reportDateFrom}
              className="text-[11px] px-2 py-1 rounded-lg border outline-none"
              style={{ borderColor: '#e0e8df', color: '#5a6b5b' }}
            />
            <span className="text-[11px]" style={{ color: '#b0bab0' }}>–</span>
            <input
              type="date"
              name="dateTo"
              defaultValue={reportDateTo}
              className="text-[11px] px-2 py-1 rounded-lg border outline-none"
              style={{ borderColor: '#e0e8df', color: '#5a6b5b' }}
            />
            <button type="submit" className="text-[11px] px-2.5 py-1 rounded-lg" style={{ background: '#e3f0f9', color: '#3d7cb0' }}>
              Terapkan
            </button>
          </form>

          {/* Daily report table */}
          <div className="rounded-xl border overflow-x-auto" style={{ borderColor: '#e0e8df', background: 'white' }}>
            <div className="grid grid-cols-5 gap-2 px-4 py-2 border-b text-[11px] font-medium" style={{ minWidth: '480px', borderColor: '#e0e8df', color: '#8fa08f' }}>
              <span>Tanggal</span>
              <span className="text-right">Saldo Awal</span>
              <span className="text-right">Total Masuk</span>
              <span className="text-right">Total Keluar</span>
              <span className="text-right">Saldo Akhir</span>
            </div>

            {dailyReport.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[13px]" style={{ color: '#8fa08f' }}>Tidak ada data pada periode ini.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#f0f4f0]" style={{ minWidth: '480px' }}>
                {dailyReport.map((row) => (
                  <div key={row.transactionDate} className="grid grid-cols-5 gap-2 px-4 py-2.5 items-center">
                    <p className="text-[12px]" style={{ color: '#2d3a2e' }}>{formatDate(row.transactionDate)}</p>
                    <p className="text-[12px] text-right" style={{ color: '#5a6b5b' }}>{formatRupiah(row.beginningBalance)}</p>
                    <p className="text-[12px] text-right font-medium" style={{ color: '#3da88a' }}>
                      {row.totalIn > 0 ? `+${formatRupiah(row.totalIn)}` : '—'}
                    </p>
                    <p className="text-[12px] text-right font-medium" style={{ color: '#e07070' }}>
                      {row.totalOut > 0 ? `-${formatRupiah(row.totalOut)}` : '—'}
                    </p>
                    <p className="text-[12px] text-right font-semibold" style={{ color: '#2d3a2e' }}>{formatRupiah(row.endingBalance)}</p>
                  </div>
                ))}
                {/* Summary row */}
                {dailyReport.length > 1 && (
                  <div className="grid grid-cols-5 gap-2 px-4 py-2.5 items-center" style={{ background: '#f7f9f7' }}>
                    <p className="text-[11px] font-semibold" style={{ color: '#5a6b5b' }}>Total</p>
                    <p className="text-[12px] text-right" style={{ color: '#5a6b5b' }}>{formatRupiah(dailyReport[0]!.beginningBalance)}</p>
                    <p className="text-[12px] text-right font-semibold" style={{ color: '#3da88a' }}>
                      +{formatRupiah(dailyReport.reduce((s, r) => s + r.totalIn, 0))}
                    </p>
                    <p className="text-[12px] text-right font-semibold" style={{ color: '#e07070' }}>
                      -{formatRupiah(dailyReport.reduce((s, r) => s + r.totalOut, 0))}
                    </p>
                    <p className="text-[12px] text-right font-semibold" style={{ color: '#2d3a2e' }}>
                      {formatRupiah(dailyReport[dailyReport.length - 1]!.endingBalance)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
