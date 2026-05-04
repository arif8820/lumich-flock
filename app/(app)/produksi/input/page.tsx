import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { getFlockOptionsForInput } from '@/lib/services/daily-record.service'
import { getActiveEggItems, getActiveFeedItems, getActiveVaccineItems } from '@/lib/services/stock-catalog.service'
import { getAllStockBalances } from '@/lib/db/queries/inventory.queries'
import { DailyInputForm } from '@/components/forms/daily-input-form'

export default async function ProduksiInputPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [flocks, eggItems, feedItems, vaccineItems, balances] = await Promise.all([
    getFlockOptionsForInput(session.id, session.role),
    getActiveEggItems(),
    getActiveFeedItems(),
    getActiveVaccineItems(),
    getAllStockBalances(),
  ])

  const balanceMap = new Map(balances.map((b) => [b.stockItemId, b.balance]))

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-[var(--lf-text-dark)] mb-6">Input Produksi Harian</h1>
      <DailyInputForm
        flocks={flocks}
        userRole={session.role}
        eggItems={eggItems}
        feedItems={feedItems.map((i) => ({ ...i, balance: balanceMap.get(i.id) ?? 0 }))}
        vaccineItems={vaccineItems.map((i) => ({ ...i, balance: balanceMap.get(i.id) ?? 0 }))}
      />
    </div>
  )
}
