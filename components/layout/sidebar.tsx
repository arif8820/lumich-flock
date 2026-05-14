'use client'
// client: needs useState for accordion open/close state

import { useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Egg, Package, DollarSign, Bird, Settings, LogOut, BarChart2, ChevronDown, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ClientUser } from './app-shell'
import type { PermissionKey } from '@/lib/auth/permissions'
import type { Notification } from '@/lib/services/notification.service'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { NotificationBell } from '@/components/ui/notification-bell'
import { VersionBadge } from '@/components/layout/version-badge'

type NavSubItem = {
  href: string
  label: string
  /** permission required to see this sub-item. undefined = always visible */
  requiredPermission?: PermissionKey
}

type NavItem =
  | { kind: 'flat'; href: string; icon: LucideIcon; label: string; requiredPermission?: PermissionKey }
  | { kind: 'accordion'; id: string; icon: LucideIcon; label: string; requiredPermission?: PermissionKey; children: NavSubItem[] }

const NAV_SECTIONS: { section?: string; items: NavItem[] }[] = [
  {
    section: 'Menu Utama',
    items: [
      {
        kind: 'flat',
        href: '/dashboard',
        icon: LayoutDashboard,
        label: 'Dashboard',
        // no permission required — always visible
      },
      {
        kind: 'accordion',
        id: 'produksi',
        icon: Egg,
        label: 'Produksi',
        requiredPermission: PERMISSIONS.PRODUKSI.VIEW,
        children: [
          { href: '/produksi', label: 'Input Harian', requiredPermission: PERMISSIONS.PRODUKSI.VIEW },
          { href: '/admin/kandang', label: 'Kandang', requiredPermission: PERMISSIONS.COOP.MANAGE },
          { href: '/flock', label: 'Flock', requiredPermission: PERMISSIONS.FLOCK.VIEW },
        ],
      },
      {
        kind: 'flat',
        href: '/stok',
        icon: Package,
        label: 'Stok',
        requiredPermission: PERMISSIONS.STOK.VIEW,
      },
      {
        kind: 'accordion',
        id: 'penjualan',
        icon: DollarSign,
        label: 'Penjualan',
        requiredPermission: PERMISSIONS.SALES.VIEW,
        children: [
          { href: '/penjualan', label: 'Sales Order', requiredPermission: PERMISSIONS.SALES.VIEW },
          { href: '/penjualan/invoices', label: 'Invoice', requiredPermission: PERMISSIONS.SALES.VIEW },
          { href: '/admin/pelanggan', label: 'Pelanggan', requiredPermission: PERMISSIONS.SALES.VIEW },
        ],
      },
    ],
  },
  {
    section: 'Keuangan',
    items: [
      {
        kind: 'flat',
        href: '/kas',
        icon: Wallet,
        label: 'Kas',
        requiredPermission: PERMISSIONS.KAS.VIEW,
      },
    ],
  },
  {
    section: 'Laporan',
    items: [
      {
        kind: 'flat',
        href: '/laporan',
        icon: BarChart2,
        label: 'Laporan',
        requiredPermission: PERMISSIONS.LAPORAN.VIEW,
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
        requiredPermission: PERMISSIONS.USER.MANAGE,
      },
    ],
  },
]

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function canSee(requiredPermission: PermissionKey | undefined, permissionKeys: string[]): boolean {
  if (!requiredPermission) return true
  return permissionKeys.includes(requiredPermission)
}

// Prevents /admin matching /admin/kandang — requires trailing slash or exact match
function isActive(currentPath: string, href: string): boolean {
  return currentPath === href || currentPath.startsWith(href + '/')
}

function getDefaultOpenId(
  sections: typeof NAV_SECTIONS,
  currentPath: string,
  permissionKeys: string[],
): string | null {
  for (const { items } of sections) {
    for (const item of items) {
      if (item.kind !== 'accordion') continue
      if (!canSee(item.requiredPermission, permissionKeys)) continue
      const hasActiveChild = item.children.some(
        child => canSee(child.requiredPermission, permissionKeys) && isActive(currentPath, child.href),
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
  hasNewVersion,
}: {
  user: ClientUser
  currentPath: string
  notifications: Notification[]
  readNotificationIds: string[]
  hasNewVersion: boolean
}) {
  const { permissionKeys } = user

  const [openId, setOpenId] = useState<string | null>(
    () => getDefaultOpenId(NAV_SECTIONS, currentPath, permissionKeys),
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
        <p className="text-[12px] font-semibold" style={{ color: '#2d3a2e' }}>{user.farmName}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#7ab8b0' }} />
          <span className="text-[11px]" style={{ color: '#5a6b5b' }}>Aktif</span>
        </div>
      </div>

      {/* Nav */}
      <div className="px-[10px] flex-1 overflow-y-auto">
        {NAV_SECTIONS.map(({ section, items }) => {
          const visibleItems = items.filter(item => canSee(item.requiredPermission, permissionKeys))
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
                  const active = isActive(currentPath, item.href)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="press-feedback flex items-center gap-2.5 px-[10px] py-[9px] rounded-[9px] mb-0.5 transition-colors text-[13px]"
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
                const visibleChildren = item.children.filter(c => canSee(c.requiredPermission, permissionKeys))
                const parentActive = visibleChildren.some(c => isActive(currentPath, c.href))
                return (
                  <div key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggleAccordion(item.id)}
                      className="press-feedback w-full flex items-center gap-2.5 px-[10px] py-[9px] rounded-[9px] mb-0.5 transition-colors text-[13px]"
                      style={{ background: parentActive ? '#e3f0f9' : 'transparent', color: parentActive ? '#3d7cb0' : '#5a6b5b', fontWeight: parentActive ? 600 : 400 }}
                    >
                      <Icon size={16} strokeWidth={1.8} style={{ color: parentActive ? '#7aadd4' : '#b0bab0', flexShrink: 0 }} />
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        size={13}
                        strokeWidth={2}
                        style={{ color: '#b0bab0', flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms ease' }}
                      />
                    </button>
                    {isOpen && (
                      <div className="mb-1">
                        {visibleChildren.map(child => {
                          const childActive = isActive(currentPath, child.href)
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="press-feedback flex items-center gap-2.5 pl-[28px] pr-[10px] py-[7px] rounded-[9px] mb-0.5 transition-colors text-[12px]"
                              style={{ background: childActive ? '#e3f0f9' : 'transparent', color: childActive ? '#3d7cb0' : '#7a8b7a', fontWeight: childActive ? 600 : 400 }}
                            >
                              <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: childActive ? '#7aadd4' : '#b0bab0' }} />
                              {child.label}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      <VersionBadge hasNewVersion={hasNewVersion} />

      {/* User card */}
      <div className="mx-[10px] mb-4 rounded-[9px] flex items-center gap-2.5" style={{ background: '#f7f5f1' }}>
        <Link
          href="/profil"
          className="flex items-center gap-2.5 flex-1 min-w-0 px-[10px] py-2 rounded-[9px] hover:bg-[#ece9e4] transition-colors"
        >
          <div
            className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-[11px] font-bold flex-shrink-0"
            style={{ background: '#bbd5ee', color: '#3d7cb0' }}
          >
            {getInitials(user.fullName)}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold truncate" style={{ color: '#2d3a2e' }}>{user.fullName}</p>
            <p className="text-[10px]" style={{ color: '#8fa08f' }}>{user.roleName}</p>
          </div>
        </Link>
        {/* Logout via GET route that calls supabase.auth.signOut() and redirects to /login */}
        <a href="/logout" className="pr-[10px]" style={{ color: '#8fa08f' }}>
          <LogOut size={14} strokeWidth={1.8} />
        </a>
      </div>
    </aside>
  )
}
