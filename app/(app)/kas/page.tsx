import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { listAccounts, getAccountBalance } from '@/lib/db/queries/cash-account.queries'
import { listTransactions } from '@/lib/db/queries/cash-transaction.queries'
import { Wallet, ArrowUpCircle, ArrowDownCircle, ArrowLeftRight, Plus } from 'lucide-react'

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

function formatDate(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const ACCOUNT_TYPE_LABEL: Record<string, string> = { cash: 'Tunai', bank: 'Bank', ewallet: 'E-Wallet' }

const TX_TYPE_CONFIG = {
  in: { label: 'Pemasukan', icon: ArrowUpCircle, color: '#3da88a' },
  out: { label: 'Pengeluaran', icon: ArrowDownCircle, color: '#e07070' },
  transfer_in: { label: 'Transfer Masuk', icon: ArrowLeftRight, color: '#7aadd4' },
  transfer_out: { label: 'Transfer Keluar', icon: ArrowLeftRight, color: '#b0bab0' },
}

export default async function KasPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role === 'operator') redirect('/dashboard')

  const accounts = await listAccounts(session.farmSchema)

  const balances = await Promise.all(
    accounts.map(async (acc) => ({
      ...acc,
      balance: await getAccountBalance(session.farmSchema, acc.id),
    }))
  )

  const totalBalance = balances.reduce((sum, a) => sum + a.balance, 0)

  const recentTxs = await listTransactions(session.farmSchema, { limit: 20 })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: '#2d3a2e' }}>Kas & Bank</h1>
          <p className="text-[13px] mt-0.5" style={{ color: '#8fa08f' }}>Kelola akun kas, pemasukan, dan pengeluaran</p>
        </div>
        {session.role === 'admin' && (
          <div className="flex gap-2">
            <Link
              href="/kas/transaksi/baru"
              className="press-feedback flex items-center gap-1.5 text-sm px-3 py-2 bg-gradient-to-r from-[#7aadd4] to-[#5090be] text-white rounded-lg shadow-lf-btn"
            >
              <Plus size={14} strokeWidth={2} />
              Transaksi
            </Link>
            <Link
              href="/kas/transfer/baru"
              className="press-feedback flex items-center gap-1.5 text-sm px-3 py-2 border border-[var(--lf-border)] rounded-lg"
              style={{ color: '#5a6b5b' }}
            >
              <ArrowLeftRight size={14} strokeWidth={2} />
              Transfer
            </Link>
          </div>
        )}
      </div>

      {/* Total balance card */}
      <div className="rounded-xl p-5 mb-5 text-white" style={{ background: 'linear-gradient(135deg, #7aadd4, #3d7cb0)' }}>
        <p className="text-[12px] font-medium opacity-80 mb-1">Total Saldo</p>
        <p className="text-3xl font-bold">{formatRupiah(totalBalance)}</p>
        <p className="text-[12px] opacity-70 mt-1">{accounts.length} akun aktif</p>
      </div>

      {/* Account cards */}
      {balances.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center mb-5" style={{ borderColor: '#e0e8df' }}>
          <Wallet size={32} className="mx-auto mb-2" style={{ color: '#b0bab0' }} />
          <p className="text-[13px]" style={{ color: '#8fa08f' }}>Belum ada akun kas.</p>
          {session.role === 'admin' && (
            <Link href="/admin/kas" className="text-[13px] font-medium mt-1 inline-block" style={{ color: '#7aadd4' }}>
              Tambah akun →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {balances.map((acc) => (
            <Link
              key={acc.id}
              href={`/kas/${acc.id}`}
              className="press-feedback rounded-xl p-4 border transition-shadow hover:shadow-lf-sm"
              style={{ background: 'white', borderColor: '#e0e8df' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: '#2d3a2e' }}>{acc.name}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: '#e3f0f9', color: '#5090be' }}>
                    {ACCOUNT_TYPE_LABEL[acc.type] ?? acc.type}
                  </span>
                </div>
                <Wallet size={16} strokeWidth={1.8} style={{ color: '#b0bab0' }} />
              </div>
              <p className="text-[18px] font-bold" style={{ color: '#2d3a2e' }}>{formatRupiah(acc.balance)}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Recent transactions */}
      <div className="rounded-xl border" style={{ borderColor: '#e0e8df', background: 'white' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#e0e8df' }}>
          <p className="text-[13px] font-semibold" style={{ color: '#2d3a2e' }}>Transaksi Terbaru</p>
        </div>

        {recentTxs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[13px]" style={{ color: '#8fa08f' }}>Belum ada transaksi.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#f0f4f0' }}>
            {recentTxs.map((tx) => {
              const cfg = TX_TYPE_CONFIG[tx.type] ?? TX_TYPE_CONFIG.out
              const Icon = cfg.icon
              const isCredit = tx.type === 'in' || tx.type === 'transfer_in'
              return (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: isCredit ? '#e8f7f3' : '#fdf0f0' }}
                  >
                    <Icon size={15} strokeWidth={2} style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate" style={{ color: '#2d3a2e' }}>
                      {tx.description ?? tx.categoryName ?? cfg.label}
                    </p>
                    <p className="text-[11px]" style={{ color: '#8fa08f' }}>
                      {tx.accountName} · {formatDate(tx.transactionDate)}
                    </p>
                  </div>
                  <p className="text-[13px] font-semibold flex-shrink-0" style={{ color: isCredit ? '#3da88a' : '#e07070' }}>
                    {isCredit ? '+' : '-'}{formatRupiah(Number(tx.amount))}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
