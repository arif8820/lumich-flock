import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { listAccounts } from '@/lib/db/queries/cash-account.queries'
import { listActiveCategories } from '@/lib/db/queries/cash-category.queries'
import { TransactionForm } from '@/components/forms/kas/transaction-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewTransactionPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string; type?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'admin') redirect('/kas')

  const { accountId, type } = await searchParams

  const [accounts, categories] = await Promise.all([
    listAccounts(session.farmSchema),
    listActiveCategories(session.farmSchema),
  ])

  if (accounts.length === 0) redirect('/admin/kas')

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/kas" className="press-feedback p-1.5 rounded-lg" style={{ color: '#5a6b5b' }}>
          <ArrowLeft size={18} strokeWidth={2} />
        </Link>
        <h1 className="text-[17px] font-semibold" style={{ color: '#2d3a2e' }}>Transaksi Baru</h1>
      </div>

      <div className="rounded-xl border p-5" style={{ borderColor: '#e0e8df', background: 'white' }}>
        <TransactionForm
          accounts={accounts}
          categories={categories}
          defaultAccountId={accountId}
          defaultType={(type === 'out' ? 'out' : 'in') as 'in' | 'out'}
        />
      </div>
    </div>
  )
}
