import Link from 'next/link'
import { LayoutDashboard, Egg, Package, DollarSign, Bird, Settings } from 'lucide-react'
import type { SessionUser } from '@/lib/auth/get-session'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/produksi', icon: Egg, label: 'Produksi' },
  { href: '/stok', icon: Package, label: 'Stok' },
  { href: '/penjualan', icon: DollarSign, label: 'Penjualan' },
  { href: '/flock', icon: Bird, label: 'Flock' },
]

export function Sidebar({ user, currentPath }: { user: SessionUser; currentPath: string }) {
  return (
    <aside className="hidden md:flex w-14 flex-col items-center border-r border-slate-200 bg-white py-4 gap-1">
      <div className="mb-4 text-xl">🐔</div>
      {navItems.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className={`flex flex-col items-center gap-0.5 w-11 h-11 rounded-lg justify-center transition-colors ${
            currentPath.startsWith(href)
              ? 'bg-sky-50 text-sky-600'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
          title={label}
        >
          <Icon size={18} />
          <span className="text-[9px] leading-none">{label}</span>
        </Link>
      ))}
      {user.role === 'admin' && (
        <Link
          href="/admin"
          className={`mt-auto flex flex-col items-center gap-0.5 w-11 h-11 rounded-lg justify-center transition-colors ${
            currentPath.startsWith('/admin')
              ? 'bg-sky-50 text-sky-600'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
          title="Admin"
        >
          <Settings size={18} />
          <span className="text-[9px] leading-none">Admin</span>
        </Link>
      )}
    </aside>
  )
}
