import Link from 'next/link'
import { LayoutDashboard, Egg, Package, DollarSign, Bird, Settings, LogOut, BarChart2 } from 'lucide-react'
import type { SessionUser } from '@/lib/auth/get-session'

const mainNav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/produksi', icon: Egg, label: 'Produksi' },
  { href: '/stok', icon: Package, label: 'Stok' },
  { href: '/penjualan', icon: DollarSign, label: 'Penjualan' },
  { href: '/flock', icon: Bird, label: 'Flock' },
]

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getRoleLabel(role: string) {
  const map: Record<string, string> = { admin: 'Administrator', supervisor: 'Supervisor', operator: 'Operator' }
  return map[role] ?? role
}

export function Sidebar({ user, currentPath }: { user: SessionUser; currentPath: string }) {
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
        <div>
          <p className="text-[13px] font-bold leading-tight" style={{ color: '#2d3a2e' }}>LumichFlock</p>
          <p className="text-[11px]" style={{ color: '#8fa08f' }}>ERP Peternakan</p>
        </div>
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
        <p className="text-[10px] uppercase font-medium px-[10px] mb-1.5" style={{ letterSpacing: '0.8px', color: '#b0bab0' }}>
          Menu Utama
        </p>
        {mainNav.map(({ href, icon: Icon, label }) => {
          const active = currentPath.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-[10px] py-[9px] rounded-[9px] mb-0.5 transition-colors text-[13px]"
              style={{ background: active ? '#e3f0f9' : 'transparent', color: active ? '#3d7cb0' : '#5a6b5b', fontWeight: active ? 600 : 400 }}
            >
              <Icon size={16} strokeWidth={1.8} style={{ color: active ? '#7aadd4' : '#b0bab0', flexShrink: 0 }} />
              {label}
            </Link>
          )
        })}

        {/* Invoice sub-link under Penjualan — admin + supervisor only */}
        {user.role !== 'operator' && (() => {
          const active = currentPath.startsWith('/penjualan/invoices')
          return (
            <Link
              href="/penjualan/invoices"
              className="flex items-center gap-2.5 pl-[28px] pr-[10px] py-[7px] rounded-[9px] mb-0.5 transition-colors text-[12px]"
              style={{ background: active ? '#e3f0f9' : 'transparent', color: active ? '#3d7cb0' : '#7a8b7a', fontWeight: active ? 600 : 400 }}
            >
              <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: active ? '#7aadd4' : '#b0bab0' }} />
              Invoice
            </Link>
          )
        })()}

        {/* Laporan Piutang — admin + supervisor only */}
        {user.role !== 'operator' && (() => {
          const active = currentPath.startsWith('/laporan')
          return (
            <Link
              href="/laporan"
              className="flex items-center gap-2.5 px-[10px] py-[9px] rounded-[9px] mb-0.5 transition-colors text-[13px]"
              style={{ background: active ? '#e3f0f9' : 'transparent', color: active ? '#3d7cb0' : '#5a6b5b', fontWeight: active ? 600 : 400 }}
            >
              <BarChart2 size={16} strokeWidth={1.8} style={{ color: active ? '#7aadd4' : '#b0bab0', flexShrink: 0 }} />
              Laporan Piutang
            </Link>
          )
        })()}

        {user.role === 'admin' && (
          <>
            <p className="text-[10px] uppercase font-medium px-[10px] mt-4 mb-1.5" style={{ letterSpacing: '0.8px', color: '#b0bab0' }}>
              Pengaturan
            </p>
            {(() => {
              const active = currentPath.startsWith('/admin')
              return (
                <Link
                  href="/admin"
                  className="flex items-center gap-2.5 px-[10px] py-[9px] rounded-[9px] mb-0.5 transition-colors text-[13px]"
                  style={{ background: active ? '#e3f0f9' : 'transparent', color: active ? '#3d7cb0' : '#5a6b5b', fontWeight: active ? 600 : 400 }}
                >
                  <Settings size={16} strokeWidth={1.8} style={{ color: active ? '#7aadd4' : '#b0bab0', flexShrink: 0 }} />
                  Admin
                </Link>
              )
            })()}
          </>
        )}
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
