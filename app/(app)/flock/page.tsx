import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getAllFlocks } from '@/lib/services/flock.service'
import { FlockListClient } from '@/components/forms/flock-list-client'

export default async function FlockPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  const flocks = await getAllFlocks(session.farmSchema)

  return (
    <div className="p-3 md:p-6 space-y-5">
      <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
        Manajemen Flock
      </h1>
      <FlockListClient
        flocks={flocks}
        canCreate={hasPermission(session, PERMISSIONS.FLOCK.CREATE)}
        canDelete={session.isAdmin}
      />
    </div>
  )
}
