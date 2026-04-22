'use client' // client: needs usePathname for active nav state

import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { BottomNav } from './bottom-nav'
import type { SessionUser } from '@/lib/auth/get-session'

export function AppShell({
  user,
  children,
}: {
  user: SessionUser
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar user={user} currentPath={pathname} />
      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
