import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!hasPermission(session, PERMISSIONS.USER.MANAGE)) redirect('/forbidden')
  return <>{children}</>
}
