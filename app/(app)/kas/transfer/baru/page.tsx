import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { listAccounts } from '@/lib/db/queries/cash-account.queries'
import { TransferForm } from '@/components/forms/kas/transfer-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewTransferPage({
  searchParams,
}: {
  searchParams: Promise<{ fromAccountId?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!session.isAdmin) redirect('/kas')

  const { fromAccountId } = await searchParams

  const accounts = await listAccounts(session.farmSchema)

  if (accounts.length < 2) redirect('/kas')

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/kas" className="press-feedback p-1.5 rounded-lg" style={{ color: '#5a6b5b' }}>
          <ArrowLeft size={18} strokeWidth={2} />
        </Link>
        <h1 className="text-[17px] font-semibold" style={{ color: '#2d3a2e' }}>Transfer Antar Akun</h1>
      </div>

      <div className="rounded-xl border p-5" style={{ borderColor: '#e0e8df', background: 'white' }}>
        <TransferForm accounts={accounts} defaultFromId={fromAccountId} />
      </div>
    </div>
  )
}
