'use client' // client: needs usePathname for active nav state

import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { BottomNav } from './bottom-nav'
import type { SessionUser } from '@/lib/auth/get-session'
import type { Notification } from '@/lib/services/notification.service'
import type { PermissionKey } from '@/lib/auth/permissions'

/** Serializable version of SessionUser safe to pass across server→client boundary */
export type ClientUser = Omit<SessionUser, 'permissions'> & {
  permissionKeys: PermissionKey[]
}

export function AppShell({
  user,
  children,
  notifications,
  readNotificationIds,
  hasNewVersion,
}: {
  user: ClientUser
  children: React.ReactNode
  notifications: Notification[]
  readNotificationIds: string[]
  hasNewVersion: boolean
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex" style={{ background: '#f7f5f1' }}>
      <Sidebar
        user={user}
        currentPath={pathname}
        notifications={notifications}
        readNotificationIds={readNotificationIds}
        hasNewVersion={hasNewVersion}
      />
      <main className="flex-1 overflow-auto pb-20 md:pb-6">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
