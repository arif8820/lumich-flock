import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth/get-session'
import { getUserById } from '@/lib/services/user.service'
import { getAllCoops } from '@/lib/services/coop.service'
import { findAssignmentsByUser } from '@/lib/db/queries/user-coop-assignment.queries'
import { CoopAssignmentPanel } from '@/components/forms/coop-assignment-panel'

export default async function UserKandangPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/dashboard')

  const [user, assignments, allCoops] = await Promise.all([
    getUserById(id),
    findAssignmentsByUser(id),
    getAllCoops(),
  ])

  if (!user || user.role !== 'operator') redirect('/admin/users')

  const activeCoops = allCoops
    .filter((c) => c.status === 'active')
    .map((c) => ({ id: c.id, name: c.name }))

  const enrichedAssignments = assignments.map((a) => ({
    id: a.id,
    coopId: a.coopId,
    coopName: a.coopName,
  }))

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/users"
          className="text-sm text-[var(--lf-text-mid)] hover:text-[var(--lf-text-dark)]"
        >
          ← Kembali
        </Link>
        <span className="text-[var(--lf-text-soft)]">/</span>
        <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
          Kelola Kandang — {user.fullName}
        </h1>
      </div>

      <div className="bg-white rounded-2xl shadow-lf-sm p-6">
        <CoopAssignmentPanel
          userId={id}
          assignments={enrichedAssignments}
          availableCoops={activeCoops}
        />
      </div>
    </div>
  )
}
