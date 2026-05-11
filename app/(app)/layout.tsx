import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { AppShell, type ClientUser } from '@/components/layout/app-shell'
import {
  getNotificationsForRole,
  getReadNotificationIds,
} from '@/lib/services/notification.service'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession()
  if (!user) redirect('/login')

  const NOTIFICATION_ROLES = ['operator', 'supervisor', 'admin'] as const
  type NotificationRole = typeof NOTIFICATION_ROLES[number]
  const notificationRole: NotificationRole = (NOTIFICATION_ROLES as readonly string[]).includes(user.roleSlug)
    ? user.roleSlug as NotificationRole
    : 'operator'

  const [notifications, readNotificationIds] = await Promise.all([
    getNotificationsForRole(user.farmSchema, notificationRole, 50),
    getReadNotificationIds(user.farmSchema, user.id),
  ])

  const clientUser: ClientUser = {
    ...user,
    permissionKeys: [...user.permissions],
  }

  return (
    <AppShell
      user={clientUser}
      notifications={notifications}
      readNotificationIds={readNotificationIds}
    >
      {children}
    </AppShell>
  )
}
