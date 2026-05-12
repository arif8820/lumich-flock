// client: needs usePathname for active state + drawer trigger
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Egg, Package, Heart, FileText, Menu } from 'lucide-react'

const NAV_TABS = [
  { href: '/produksi', icon: Egg, label: 'Produksi' },
  { href: '/stok', icon: Package, label: 'Stok' },
  { href: '/flock', icon: Heart, label: 'Flock' },
  { href: '/laporan', icon: FileText, label: 'Laporan' },
] as const

interface Props {
  onMoreClick: () => void
  isMoreOpen: boolean
}

export function BottomNav({ onMoreClick, isMoreOpen }: Props) {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white flex"
      style={{ borderTop: '1px solid #e0e8df', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {NAV_TABS.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 min-h-[56px] justify-center transition-colors"
            style={{ color: active ? '#7aadd4' : '#c0c8bf' }}
          >
            <Icon size={20} strokeWidth={1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        )
      })}

      {/* Lainnya — triggers drawer */}
      <button
        type="button"
        onClick={onMoreClick}
        className="flex-1 flex flex-col items-center gap-0.5 py-2 min-h-[56px] justify-center transition-colors"
        style={{ color: isMoreOpen ? '#7aadd4' : '#c0c8bf' }}
      >
        <Menu size={20} strokeWidth={1.8} />
        <span className="text-[10px] font-medium">Lainnya</span>
      </button>
    </nav>
  )
}
