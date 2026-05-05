import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth/get-session'
import { getAllCoops } from '@/lib/services/coop.service'
import { findAllActiveFlocks } from '@/lib/db/queries/flock.queries'
import { CreateFlockForm } from '@/components/forms/create-flock-form'

export default async function NewFlockPage() {
  const session = await getSession()
  if (!session || session.role === 'operator') redirect('/flock')

  const allCoops = await getAllCoops()
  const activeFlocks = await findAllActiveFlocks()
  const occupiedCoopIds = new Set(activeFlocks.map((f) => f.coopId))
  const availableCoops = allCoops
    .filter((c) => c.status === 'active' && !occupiedCoopIds.has(c.id))
    .map((c) => ({ id: c.id, name: c.name }))

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/flock"
          className="text-sm text-[var(--lf-text-mid)] hover:text-[var(--lf-text-dark)]"
        >
          ← Kembali
        </Link>
        <span className="text-[var(--lf-text-soft)]">/</span>
        <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
          Tambah Flock Baru
        </h1>
      </div>

      <div className="bg-white rounded-2xl shadow-lf-sm p-6">
        <CreateFlockForm activeCoops={availableCoops} />
      </div>
    </div>
  )
}
