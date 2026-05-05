import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { findDailyRecordById, findDailySubRecordsByRecordId } from '@/lib/db/queries/daily-record.queries'
import { canEdit } from '@/lib/services/lock-period.service'
import { getActiveEggItems, getActiveFeedItems, getActiveVaccineItems } from '@/lib/services/stock-catalog.service'
import { getAllStockBalances } from '@/lib/db/queries/inventory.queries'
import { DailyRecordEditForm } from './edit-form'

type Props = { params: Promise<{ id: string }> }

export default async function ProduksiEditPage({ params }: Props) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params
  const record = await findDailyRecordById(id)
  if (!record) redirect('/produksi')

  const now = new Date()
  const recordDate = new Date(record.recordDate)
  const isAdmin = session.role === 'admin'

  const recDay = Date.UTC(recordDate.getUTCFullYear(), recordDate.getUTCMonth(), recordDate.getUTCDate())
  const nowDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const diffDays = Math.round((nowDay - recDay) / 86_400_000)
  const isPastH7 = diffDays > 7

  const editable = canEdit(recordDate, session.role, now)
  if (!editable && !isAdmin) redirect('/produksi')

  const [subRecords, eggItems, feedItems, vaccineItems, balances] = await Promise.all([
    findDailySubRecordsByRecordId(id),
    getActiveEggItems(),
    getActiveFeedItems(),
    getActiveVaccineItems(),
    getAllStockBalances(),
  ])

  const balanceMap = new Map(balances.map((b) => [b.stockItemId, b.balance]))

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-[var(--lf-text-dark)] mb-1">
        {isAdmin && isPastH7 ? 'Koreksi Data Produksi' : 'Edit Data Produksi'}
      </h1>
      <p className="text-sm mb-4" style={{ color: '#8fa08f' }}>
        {recordDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
      </p>

      {isAdmin && isPastH7 && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: '#fff3cd', color: '#856404', border: '1px solid #ffc107' }}>
          Rekaman ini berada di luar periode koreksi. Sebagai admin, Anda dapat mengedit dengan menyertakan alasan koreksi.
        </div>
      )}

      <DailyRecordEditForm
        record={record}
        subRecords={subRecords}
        eggItems={eggItems}
        feedItems={feedItems.map((i) => ({ ...i, balance: balanceMap.get(i.id) ?? 0 }))}
        vaccineItems={vaccineItems.map((i) => ({ ...i, balance: balanceMap.get(i.id) ?? 0 }))}
        requireReason={isAdmin && isPastH7}
      />
    </div>
  )
}
