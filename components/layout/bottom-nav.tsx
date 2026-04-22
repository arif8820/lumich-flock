// client: needs usePathname for active state
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Bird, Egg, Package, FileText } from 'lucide-react'

const tabs = [
  { href: '/dashboard', icon: Home, label: 'Beranda' },
  { href: '/flock', icon: Bird, label: 'Kandang' },
  { href: '/produksi', icon: Egg, label: 'Produksi' },
  { href: '/stok', icon: Package, label: 'Stok' },
  { href: '/laporan', icon: FileText, label: 'Laporan' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white flex"
      style={{ borderTop: '1px solid #e0e8df', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors"
            style={{ color: active ? '#7aadd4' : '#c0c8bf' }}
          >
            <Icon size={20} strokeWidth={1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
