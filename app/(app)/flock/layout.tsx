import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'

export default async function FlockLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!hasPermission(session, PERMISSIONS.FLOCK.VIEW)) redirect('/forbidden')
  return <>{children}</>
}
