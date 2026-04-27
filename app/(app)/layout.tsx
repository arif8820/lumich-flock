import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { AppShell } from '@/components/layout/app-shell'
import {
  getNotificationsForRole,
  getUnreadCount,
  getReadNotificationIds,
} from '@/lib/services/notification.service'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession()
  if (!user) redirect('/login')

  const [notifications, unreadCount, readNotificationIds] = await Promise.all([
    getNotificationsForRole(user.role, 50),
    getUnreadCount(user.id, user.role),
    getReadNotificationIds(user.id),
  ])

  return (
    <AppShell
      user={user}
      unreadCount={unreadCount}
      notifications={notifications}
      readNotificationIds={readNotificationIds}
    >
      {children}
    </AppShell>
  )
}
