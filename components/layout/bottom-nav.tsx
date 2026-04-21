'use client' // client: needs usePathname for active state

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Egg, Package, Menu } from 'lucide-react'

const mainItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/produksi', icon: Egg, label: 'Produksi' },
  { href: '/stok', icon: Package, label: 'Stok' },
]

export function BottomNav({ onMoreClick }: { onMoreClick: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex">
      {mainItems.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors ${
            pathname.startsWith(href) ? 'text-sky-600' : 'text-slate-500'
          }`}
        >
          <Icon size={20} />
          <span className="text-[10px]">{label}</span>
        </Link>
      ))}
      <button
        onClick={onMoreClick}
        className="flex-1 flex flex-col items-center gap-0.5 py-2 text-slate-500"
      >
        <Menu size={20} />
        <span className="text-[10px]">Lainnya</span>
      </button>
    </nav>
  )
}
