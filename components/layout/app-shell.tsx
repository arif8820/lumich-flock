'use client' // client: needs drawer state

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { BottomNav } from './bottom-nav'
import { MoreDrawer } from './more-drawer'
import type { SessionUser } from '@/lib/auth/get-session'

export function AppShell({
  user,
  children,
}: {
  user: SessionUser
  children: React.ReactNode
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar user={user} currentPath={pathname} />
      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        {children}
      </main>
      <BottomNav onMoreClick={() => setDrawerOpen(true)} />
      <MoreDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
      />
    </div>
  )
}
