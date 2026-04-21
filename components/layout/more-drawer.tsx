'use client' // client: needs drawer open/close state

import Link from 'next/link'
import { DollarSign, Bird, Settings, X } from 'lucide-react'
import type { SessionUser } from '@/lib/auth/get-session'

export function MoreDrawer({
  open,
  onClose,
  user,
}: {
  open: boolean
  onClose: () => void
  user: SessionUser
}) {
  if (!open) return null

  return (
    <>
      <div
        className="md:hidden fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-xl z-50 p-4 pb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold text-slate-700">Menu</span>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="space-y-1">
          <DrawerLink href="/penjualan" icon={DollarSign} label="Penjualan" onClose={onClose} />
          <DrawerLink href="/flock" icon={Bird} label="Flock" onClose={onClose} />
          {user.role === 'admin' && (
            <DrawerLink href="/admin" icon={Settings} label="Admin" onClose={onClose} />
          )}
        </div>
      </div>
    </>
  )
}

function DrawerLink({
  href,
  icon: Icon,
  label,
  onClose,
}: {
  href: string
  icon: React.ComponentType<{ size?: number }>
  label: string
  onClose: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  )
}
