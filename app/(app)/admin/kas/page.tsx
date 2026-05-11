import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { listAccounts, countTransactionsByAccount } from '@/lib/db/queries/cash-account.queries'
import { listCategories } from '@/lib/db/queries/cash-category.queries'
import { AccountForm } from './account-form'
import { CategoryForm } from './category-form'
import { AccountList } from './account-list'
import { CategoryList } from './category-list'

export default async function AdminKasPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!session.isAdmin) redirect('/kas')

  const [accounts, categories] = await Promise.all([
    listAccounts(session.farmSchema),
    listCategories(session.farmSchema),
  ])

  const txCounts = await Promise.all(
    accounts.map(acc => countTransactionsByAccount(session.farmSchema, acc.id))
  )
  const accountsWithTxCount = accounts.map((acc, i) => ({ ...acc, hasTx: (txCounts[i] ?? 0) > 0 }))

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: '#2d3a2e' }}>Pengaturan Kas</h1>
        <p className="text-[13px] mt-0.5" style={{ color: '#8fa08f' }}>Kelola akun kas dan kategori transaksi</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accounts */}
        <div>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#e0e8df', background: 'white' }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: '#e0e8df' }}>
              <p className="text-[13px] font-semibold" style={{ color: '#2d3a2e' }}>Akun Kas</p>
            </div>
            <AccountList accounts={accountsWithTxCount} />
            <div className="px-4 pb-4 pt-2 border-t" style={{ borderColor: '#f0f4f0' }}>
              <p className="text-[11px] font-medium mb-3" style={{ color: '#8fa08f' }}>TAMBAH AKUN</p>
              <AccountForm />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#e0e8df', background: 'white' }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: '#e0e8df' }}>
              <p className="text-[13px] font-semibold" style={{ color: '#2d3a2e' }}>Kategori Transaksi</p>
            </div>
            <CategoryList categories={categories} />
            <div className="px-4 pb-4 pt-2 border-t" style={{ borderColor: '#f0f4f0' }}>
              <p className="text-[11px] font-medium mb-3" style={{ color: '#8fa08f' }}>TAMBAH KATEGORI</p>
              <CategoryForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
