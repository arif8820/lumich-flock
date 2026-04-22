import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { getFlockOptionsForInput } from '@/lib/services/daily-record.service'
import { DailyInputForm } from '@/components/forms/daily-input-form'

export default async function ProduksiInputPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const flocks = await getFlockOptionsForInput(session.id, session.role)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-[var(--lf-text-dark)] mb-6">Input Produksi Harian</h1>
      <DailyInputForm flocks={flocks} userRole={session.role} />
    </div>
  )
}
