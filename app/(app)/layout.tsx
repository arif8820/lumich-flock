import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth/get-session'
import { AppShell, type ClientUser } from '@/components/layout/app-shell'
import {
  getNotificationsForRole,
  getReadNotificationIds,
} from '@/lib/services/notification.service'
import { CURRENT_VERSION } from '@/lib/changelog/data'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession()
  if (!user) redirect('/login')

  const NOTIFICATION_ROLES = ['operator', 'supervisor', 'admin'] as const
  type NotificationRole = typeof NOTIFICATION_ROLES[number]
  const notificationRole: NotificationRole = (NOTIFICATION_ROLES as readonly string[]).includes(user.roleSlug)
    ? user.roleSlug as NotificationRole
    : 'operator'

  const cookieStore = await cookies()
  const seenVersion = cookieStore.get('lf_seen_version')?.value
  const hasNewVersion = seenVersion !== CURRENT_VERSION

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
      hasNewVersion={hasNewVersion}
    >
      {children}
    </AppShell>
  )
}
