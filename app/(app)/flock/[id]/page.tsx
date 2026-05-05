import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth/get-session'
import { findFlockById } from '@/lib/db/queries/flock.queries'
import { findDeliveriesByFlockId } from '@/lib/db/queries/flock-delivery.queries'
import { getCoopById } from '@/lib/services/coop.service'
import { FlockDetailClient } from '@/components/forms/flock-detail-client'

export default async function FlockDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params
  const flock = await findFlockById(id)
  if (!flock) redirect('/flock')

  const [deliveries, coop] = await Promise.all([
    findDeliveriesByFlockId(id),
    getCoopById(flock.coopId),
  ])

  const coopName = coop?.name ?? flock.coopId

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          href="/flock"
          className="text-sm text-[var(--lf-text-mid)] hover:text-[var(--lf-text-dark)]"
        >
          ← Kembali
        </Link>
        <span className="text-[var(--lf-text-soft)]">/</span>
        <h1
          className="text-[18px] font-bold"
          style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}
        >
          {flock.name}
        </h1>
      </div>

      <FlockDetailClient
        flock={flock}
        deliveries={deliveries}
        coopName={coopName}
        userRole={session.role}
      />
    </div>
  )
}
