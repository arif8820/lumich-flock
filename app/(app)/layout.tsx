import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { AppShell } from '@/components/layout/app-shell'
import {
  getNotificationsForRole,
  getUnreadCount,
} from '@/lib/services/notification.service'
import { db } from '@/lib/db'
import { notificationReads } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession()
  if (!user) redirect('/login')

  const [notifications, unreadCount, readRows] = await Promise.all([
    getNotificationsForRole(user.role, 50),
    getUnreadCount(user.id, user.role),
    db
      .select({ notificationId: notificationReads.notificationId })
      .from(notificationReads)
      .where(eq(notificationReads.userId, user.id)),
  ])

  const readNotificationIds = readRows.map((r) => r.notificationId)

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
