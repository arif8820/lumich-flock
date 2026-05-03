'use client'
// client: needs useState for accordion open/close state

import { useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Egg, Package, DollarSign, Bird, Settings, LogOut, BarChart2, ChevronDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { SessionUser } from '@/lib/auth/get-session'
import type { Notification } from '@/lib/services/notification.service'
import { NotificationBell } from '@/components/ui/notification-bell'

type NavSubItem = {
  href: string
  label: string
  /** roles that can see this sub-item. undefined = all roles */
  roles?: Array<'admin' | 'supervisor' | 'operator'>
}

type NavItem =
  | { kind: 'flat'; href: string; icon: LucideIcon; label: string; roles?: Array<'admin' | 'supervisor' | 'operator'> }
  | { kind: 'accordion'; id: string; icon: LucideIcon; label: string; roles?: Array<'admin' | 'supervisor' | 'operator'>; children: NavSubItem[] }

const NAV_SECTIONS: { section?: string; items: NavItem[] }[] = [
  {
    section: 'Menu Utama',
    items: [
      {
        kind: 'flat',
        href: '/dashboard',
        icon: LayoutDashboard,
        label: 'Dashboard',
      },
      {
        kind: 'accordion',
        id: 'produksi',
        icon: Egg,
        label: 'Produksi',
        children: [
          { href: '/produksi', label: 'Input Harian' },
          { href: '/admin/kandang', label: 'Kandang', roles: ['admin'] },
          { href: '/flock', label: 'Flock' },
        ],
      },
      {
        kind: 'flat',
        href: '/stok',
        icon: Package,
        label: 'Stok',
      },
      {
        kind: 'accordion',
        id: 'penjualan',
        icon: DollarSign,
        label: 'Penjualan',
        roles: ['admin', 'supervisor'],
        children: [
          { href: '/penjualan', label: 'Sales Order' },
          { href: '/penjualan/invoices', label: 'Invoice', roles: ['admin', 'supervisor'] },
          { href: '/admin/pelanggan', label: 'Pelanggan', roles: ['admin', 'supervisor'] },
        ],
      },
    ],
  },
  {
    section: 'Laporan',
    items: [
      {
        kind: 'accordion',
        id: 'laporan',
        icon: BarChart2,
        label: 'Laporan',
        roles: ['admin', 'supervisor'],
        children: [
          { href: '/laporan', label: 'Piutang' },
          { href: '/laporan/produksi', label: 'Produksi' },
        ],
      },
    ],
  },
  {
    section: 'Pengaturan',
    items: [
      {
        kind: 'flat',
        href: '/admin',
        icon: Settings,
        label: 'Admin',
        roles: ['admin'],
      },
    ],
  },
]

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getRoleLabel(role: string) {
  const map: Record<string, string> = { admin: 'Administrator', supervisor: 'Supervisor', operator: 'Operator' }
  return map[role] ?? role
}

function canSee(roles: Array<'admin' | 'supervisor' | 'operator'> | undefined, userRole: string): boolean {
  if (!roles) return true
  return roles.includes(userRole as 'admin' | 'supervisor' | 'operator')
}

function getDefaultOpenId(
  sections: typeof NAV_SECTIONS,
  currentPath: string,
  userRole: string,
): string | null {
  for (const { items } of sections) {
    for (const item of items) {
      if (item.kind !== 'accordion') continue
      if (!canSee(item.roles, userRole)) continue
      const hasActiveChild = item.children.some(
        child => canSee(child.roles, userRole) && currentPath.startsWith(child.href),
      )
      if (hasActiveChild) return item.id
    }
  }
  return null
}

export function Sidebar({
  user,
  currentPath,
  notifications,
  readNotificationIds,
}: {
  user: SessionUser
  currentPath: string
  notifications: Notification[]
  readNotificationIds: string[]
}) {
  const [openId, setOpenId] = useState<string | null>(
    () => getDefaultOpenId(NAV_SECTIONS, currentPath, user.role),
  )

  function toggleAccordion(id: string) {
    setOpenId(prev => (prev === id ? null : id))
  }

  return (
    <aside className="hidden md:flex w-[220px] flex-shrink-0 flex-col bg-white h-screen sticky top-0" style={{ borderRight: '1px solid #e0e8df' }}>
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4">
        <div
          className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7aadd4, #5090be)' }}
        >
          <Bird size={20} color="white" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold leading-tight" style={{ color: '#2d3a2e' }}>LumichFlock</p>
          <p className="text-[11px]" style={{ color: '#8fa08f' }}>ERP Peternakan</p>
        </div>
        <NotificationBell
          initialNotifications={notifications}
          readIds={readNotificationIds}
        />
      </div>

      {/* Farm info box */}
      <div className="mx-[10px] mb-3 px-[14px] py-3 rounded-[10px]" style={{ background: '#e3f0f9' }}>
        <p className="text-[10px] uppercase font-medium mb-1" style={{ letterSpacing: '0.8px', color: '#8fa08f' }}>
          Kandang Aktif
        </p>
        <p className="text-[12px] font-semibold" style={{ color: '#2d3a2e' }}>LumichFarm</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#7ab8b0' }} />
          <span className="text-[11px]" style={{ color: '#5a6b5b' }}>Aktif</span>
        </div>
      </div>

      {/* Nav */}
      <div className="px-[10px] flex-1 overflow-y-auto">
        {NAV_SECTIONS.map(({ section, items }) => {
          const visibleItems = items.filter(item => canSee(item.roles, user.role))
          if (visibleItems.length === 0) return null
          return (
            <div key={section ?? 'default'}>
              {section && (
                <p className="text-[10px] uppercase font-medium px-[10px] mb-1.5 mt-4 first:mt-0" style={{ letterSpacing: '0.8px', color: '#b0bab0' }}>
                  {section}
                </p>
              )}
              {visibleItems.map(item => {
                if (item.kind === 'flat') {
                  const active = currentPath.startsWith(item.href)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2.5 px-[10px] py-[9px] rounded-[9px] mb-0.5 transition-colors text-[13px]"
                      style={{ background: active ? '#e3f0f9' : 'transparent', color: active ? '#3d7cb0' : '#5a6b5b', fontWeight: active ? 600 : 400 }}
                    >
                      <Icon size={16} strokeWidth={1.8} style={{ color: active ? '#7aadd4' : '#b0bab0', flexShrink: 0 }} />
                      {item.label}
                    </Link>
                  )
                }

                // accordion item
                const Icon = item.icon
                const isOpen = openId === item.id
                const visibleChildren = item.children.filter(c => canSee(c.roles, user.role))
                const hasActiveChild = visibleChildren.some(c => currentPath.startsWith(c.href))
                const headerActive = hasActiveChild
                return (
                  <div key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggleAccordion(item.id)}
                      className="w-full flex items-center gap-2.5 px-[10px] py-[9px] rounded-[9px] mb-0.5 transition-colors text-[13px]"
                      style={{ background: headerActive ? '#e3f0f9' : 'transparent', color: headerActive ? '#3d7cb0' : '#5a6b5b', fontWeight: headerActive ? 600 : 400 }}
                    >
                      <Icon size={16} strokeWidth={1.8} style={{ color: headerActive ? '#7aadd4' : '#b0bab0', flexShrink: 0 }} />
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        size={13}
                        strokeWidth={2}
                        style={{ color: '#b0bab0', flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                      />
                    </button>
                    {isOpen && visibleChildren.map(child => {
                      const childActive = currentPath.startsWith(child.href)
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="flex items-center gap-2.5 pl-[28px] pr-[10px] py-[7px] rounded-[9px] mb-0.5 transition-colors text-[12px]"
                          style={{ background: childActive ? '#e3f0f9' : 'transparent', color: childActive ? '#3d7cb0' : '#7a8b7a', fontWeight: childActive ? 600 : 400 }}
                        >
                          <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: childActive ? '#7aadd4' : '#b0bab0' }} />
                          {child.label}
                        </Link>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* User card */}
      <div className="mx-[10px] mb-4 px-[10px] py-2 rounded-[9px] flex items-center gap-2.5" style={{ background: '#f7f5f1' }}>
        <div
          className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-[11px] font-bold flex-shrink-0"
          style={{ background: '#bbd5ee', color: '#3d7cb0' }}
        >
          {getInitials(user.fullName)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold truncate" style={{ color: '#2d3a2e' }}>{user.fullName}</p>
          <p className="text-[10px]" style={{ color: '#8fa08f' }}>{getRoleLabel(user.role)}</p>
        </div>
        {/* Logout via GET route that calls supabase.auth.signOut() and redirects to /login */}
        <a href="/logout" style={{ color: '#8fa08f' }}>
          <LogOut size={14} strokeWidth={1.8} />
        </a>
      </div>
    </aside>
  )
}
