import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { findDailyRecordById } from '@/lib/db/queries/daily-record.queries'
import { canEdit } from '@/lib/services/lock-period.service'
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

  // Check if record is within H+7 window (supervisor window) for admin correction UI
  const recDay = Date.UTC(recordDate.getUTCFullYear(), recordDate.getUTCMonth(), recordDate.getUTCDate())
  const nowDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const diffDays = Math.round((nowDay - recDay) / 86_400_000)
  const isPastH7 = diffDays > 7

  const editable = canEdit(recordDate, session.role, now)

  // Non-admin, locked record → redirect away
  if (!editable && !isAdmin) redirect('/produksi')

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-xl font-semibold text-[var(--lf-text-dark)] mb-1">
        {isAdmin && isPastH7 ? 'Koreksi Data Produksi' : 'Edit Data Produksi'}
      </h1>
      <p className="text-sm mb-6" style={{ color: '#8fa08f' }}>
        {recordDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
      </p>

      {isAdmin && isPastH7 && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: '#fff3cd', color: '#856404', border: '1px solid #ffc107' }}>
          Rekaman ini berada di luar periode koreksi. Sebagai admin admin, Anda dapat mengedit dengan menyertakan al alasan koreksi.
        </div>
      )}

      <DailyRecordEditForm
        record={record}
        requireReason={isAdmin && isPastH7}
      />
    </div>
  )
}
