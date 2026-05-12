import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'
import { getAllStockBalances } from '@/lib/db/queries/inventory.queries'
import { getCategories } from '@/lib/services/stock-catalog.service'
import Link from 'next/link'
import type { StockBalance } from '@/lib/db/queries/inventory.queries'

const SYSTEM_TABS = [
  { key: 'telur', label: '🥚 Telur', categoryName: 'Telur' },
  { key: 'pakan', label: '🌾 Pakan', categoryName: 'Pakan' },
  { key: 'vaksin', label: '💉 Vaksin', categoryName: 'Vaksin' },
  { key: 'packaging', label: '📦 Packaging', categoryName: 'Packaging' },
]

export default async function StokPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { tab = 'telur' } = await searchParams

  const [balances, categories] = await Promise.all([
    getAllStockBalances(session.farmSchema),
    getCategories(session.farmSchema),
  ])

  const systemCategoryNames = new Set(SYSTEM_TABS.map((t) => t.categoryName))
  const otherCategories = categories.filter((c) => !systemCategoryNames.has(c.name))

  const tabs = [
    ...SYSTEM_TABS,
    ...(otherCategories.length > 0 ? [{ key: 'lainnya', label: '➕ Lain-lain', categoryName: null }] : []),
  ]

  const activeTab = tabs.find((t) => t.key === tab) ?? tabs[0]!

  let filteredBalances: StockBalance[]
  if (activeTab.key === 'lainnya') {
    const otherNames = new Set(otherCategories.map((c) => c.name))
    filteredBalances = balances.filter((b) => otherNames.has(b.categoryName))
  } else {
    filteredBalances = balances.filter((b) => b.categoryName === activeTab.categoryName)
  }

  const isTelur = activeTab.key === 'telur'
  const totalButir = isTelur ? filteredBalances.reduce((s, b) => s + b.balance, 0) : null

  return (
    <div className="p-3 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-[var(--lf-text-dark)]">Stok</h1>
        {hasPermission(session, PERMISSIONS.STOK.ADJUST) && (
          <div className="hidden md:flex gap-2">
            <Link href="/stok/sesuaikan" className="press-feedback text-sm px-3 py-2 bg-gradient-to-r from-[#7aadd4] to-[#5090be] text-white rounded-lg shadow-lf-btn">
              Penyesuaian
            </Link>
            <Link href="/stok/regrade" className="press-feedback text-sm px-3 py-2 border border-[var(--lf-border)] rounded-lg text-[var(--lf-text-mid)]">
              Regrade
            </Link>
            <Link href="/stok/beli" className="press-feedback text-sm px-3 py-2 border border-[var(--lf-border)] rounded-lg text-[var(--lf-text-mid)]">
              Pembelian
            </Link>
          </div>
        )}
      </div>

      {/* Tab strip */}
      <div className="flex gap-0 border-b border-[var(--lf-border)] mb-5 overflow-x-auto">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/stok?tab=${t.key}`}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              t.key === activeTab.key
                ? 'border-[var(--lf-blue-active)] text-[var(--lf-blue-active)]'
                : 'border-transparent text-[var(--lf-text-soft)] hover:text-[var(--lf-text-mid)]'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Balance list */}
      {filteredBalances.length === 0 ? (
        <p className="text-[var(--lf-text-soft)] text-center py-16 text-sm">Tidak ada data stok.</p>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="md:hidden space-y-2">
            {filteredBalances.map((item) => (
              <div key={item.stockItemId} className="bg-white rounded-xl p-4 shadow-lf-sm border border-[var(--lf-border)]">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-3">
                    {activeTab.key === 'lainnya' && (
                      <p className="text-[10px] text-[var(--lf-text-soft)] uppercase tracking-wide mb-0.5">{item.categoryName}</p>
                    )}
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--lf-text-dark)' }}>{item.itemName}</p>
                    <span
                      className="inline-block text-[10px] px-2 py-0.5 rounded-full mt-1"
                      style={{ background: 'var(--lf-blue-pale)', color: 'var(--lf-blue-active)' }}
                    >
                      {item.categoryName}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold" style={{ color: 'var(--lf-text-dark)' }}>
                      {item.balance.toLocaleString('id-ID')}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--lf-text-soft)' }}>{item.unit}</p>
                  </div>
                </div>
                {hasPermission(session, PERMISSIONS.STOK.ADJUST) && (
                  <div className="flex gap-2 mt-3">
                    <Link
                      href="/stok/beli"
                      className="flex-1 text-center text-xs py-2.5 rounded-lg border border-[var(--lf-border)] min-h-[40px] flex items-center justify-center"
                      style={{ color: 'var(--lf-text-mid)' }}
                    >
                      Beli
                    </Link>
                    <Link
                      href="/stok/regrade"
                      className="flex-1 text-center text-xs py-2.5 rounded-lg border border-[var(--lf-border)] min-h-[40px] flex items-center justify-center"
                      style={{ color: 'var(--lf-text-mid)' }}
                    >
                      Regrade
                    </Link>
                    <Link
                      href="/stok/sesuaikan"
                      className="flex-1 text-center text-xs py-2.5 rounded-lg bg-gradient-to-r from-[#7aadd4] to-[#5090be] text-white min-h-[40px] flex items-center justify-center"
                    >
                      Sesuaikan
                    </Link>
                  </div>
                )}
              </div>
            ))}

            {isTelur && totalButir !== null && (
              <div className="bg-[var(--lf-bg-warm)] rounded-xl p-4 border border-[var(--lf-border)] flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--lf-text-dark)]">Total Telur</p>
                <div className="text-right">
                  <p className="font-bold text-[var(--lf-blue-active)]">{totalButir.toLocaleString('id')}</p>
                  <p className="text-[10px] text-[var(--lf-text-soft)]">butir</p>
                </div>
              </div>
            )}
          </div>

          {/* Desktop list */}
          <div className="hidden md:block">
            <div className="grid gap-3">
              {filteredBalances.map((b) => (
                <div
                  key={b.stockItemId}
                  className="bg-white rounded-xl p-4 shadow-lf-sm border border-[var(--lf-border)] flex items-center justify-between"
                >
                  <div>
                    {activeTab.key === 'lainnya' && (
                      <p className="text-[10px] text-[var(--lf-text-soft)] uppercase tracking-wide mb-0.5">{b.categoryName}</p>
                    )}
                    <p className="font-medium text-[var(--lf-text-dark)]">{b.itemName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[var(--lf-blue-active)]">
                      {b.balance.toLocaleString('id')}
                    </p>
                    <p className="text-[10px] text-[var(--lf-text-soft)]">{b.unit}</p>
                  </div>
                </div>
              ))}

              {isTelur && totalButir !== null && (
                <div className="bg-[var(--lf-bg-warm)] rounded-xl p-4 border border-[var(--lf-border)] flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--lf-text-dark)]">Total Telur</p>
                  <div className="text-right">
                    <p className="font-bold text-[var(--lf-blue-active)]">{totalButir.toLocaleString('id')}</p>
                    <p className="text-[10px] text-[var(--lf-text-soft)]">butir</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {isTelur && (
        <p className="text-xs text-[var(--lf-text-soft)] mt-4">Detail per flock tersedia di Laporan.</p>
      )}
    </div>
  )
}
