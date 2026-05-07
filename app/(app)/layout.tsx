import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { AppShell } from '@/components/layout/app-shell'
import {
  getNotificationsForRole,
  getReadNotificationIds,
} from '@/lib/services/notification.service'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession()
  if (!user) redirect('/login')

  const [notifications, readNotificationIds] = await Promise.all([
    getNotificationsForRole(user.farmSchema, user.role, 50),
    getReadNotificationIds(user.farmSchema, user.id),
  ])

  return (
    <AppShell
      user={user}
      notifications={notifications}
      readNotificationIds={readNotificationIds}
    >
      {children}
    </AppShell>
  )
}
