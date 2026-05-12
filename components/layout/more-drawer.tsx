// client: slide-up drawer for "Lainnya" bottom nav item
'use client'

import Link from 'next/link'
import { LayoutDashboard, Landmark, ShoppingCart, Settings, LogOut } from 'lucide-react'
import type { ClientUser } from './app-shell'

interface Props {
  isOpen: boolean
  onClose: () => void
  user: ClientUser
}

export function MoreDrawer({ isOpen, onClose, user }: Props) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="md:hidden fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-up sheet */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-lf-md"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[var(--lf-border)]" />
        </div>

        {/* Menu grid */}
        <div className="grid grid-cols-2 gap-3 p-4">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 p-4 rounded-xl bg-[var(--lf-blue-pale)] min-h-[56px]"
          >
            <LayoutDashboard size={20} style={{ color: 'var(--lf-blue-active)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--lf-text-dark)' }}>Dashboard</span>
          </Link>

          <Link
            href="/kas"
            onClick={onClose}
            className="flex items-center gap-3 p-4 rounded-xl bg-[var(--lf-blue-pale)] min-h-[56px]"
          >
            <Landmark size={20} style={{ color: 'var(--lf-blue-active)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--lf-text-dark)' }}>Kas</span>
          </Link>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--lf-bg-warm)] min-h-[56px] opacity-40 cursor-not-allowed select-none">
            <ShoppingCart size={20} style={{ color: 'var(--lf-text-soft)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--lf-text-soft)' }}>Penjualan</span>
          </div>

          {user.isAdmin && (
            <Link
              href="/admin"
              onClick={onClose}
              className="flex items-center gap-3 p-4 rounded-xl bg-[var(--lf-bg-warm)] min-h-[56px]"
            >
              <Settings size={20} style={{ color: 'var(--lf-text-mid)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--lf-text-dark)' }}>Admin</span>
            </Link>
          )}
        </div>

        {/* User info + logout */}
        <div className="flex items-center gap-3 px-4 py-3 border-t border-[var(--lf-border)] mx-4 mb-2">
          <div className="w-9 h-9 rounded-full bg-[var(--lf-blue-pale)] flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold" style={{ color: 'var(--lf-blue-active)' }}>
              {user.email?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--lf-text-dark)' }}>
              {user.email}
            </p>
            <p className="text-xs" style={{ color: 'var(--lf-text-soft)' }}>
              {user.roleSlug} · {user.farmSchema}
            </p>
          </div>
          {/* Logout via GET route that calls supabase.auth.signOut() and redirects to /login */}
          <a
            href="/logout"
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg min-h-[36px]"
            style={{ color: 'var(--lf-danger-text)', background: 'var(--lf-danger-bg)' }}
          >
            <LogOut size={13} />
            Keluar
          </a>
        </div>
      </div>
    </>
  )
}
