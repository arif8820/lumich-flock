'use client' // client: needs usePathname for active nav state

import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { BottomNav } from './bottom-nav'
import type { SessionUser } from '@/lib/auth/get-session'
import type { Notification } from '@/lib/services/notification.service'

export function AppShell({
  user,
  children,
  notifications,
  readNotificationIds,
}: {
  user: SessionUser
  children: React.ReactNode
  notifications: Notification[]
  readNotificationIds: string[]
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex" style={{ background: '#f7f5f1' }}>
      <Sidebar
        user={user}
        currentPath={pathname}
        notifications={notifications}
        readNotificationIds={readNotificationIds}
      />
      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
