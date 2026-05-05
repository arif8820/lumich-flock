import Link from 'next/link'
import { Users, Home, ShoppingBag, Settings, MessageSquare, Bell, Upload, Package } from 'lucide-react'

const MENU = [
  {
    href: '/admin/stok-katalog',
    icon: Package,
    label: 'Katalog Stok',
    desc: 'Kelola kategori dan item stok (telur, pakan, vaksin, dll)',
  },
  {
    href: '/admin/users',
    icon: Users,
    label: 'Manajemen User',
    desc: 'Tambah, ubah role, dan kelola akses pengguna',
  },
  {
    href: '/admin/kandang',
    icon: Home,
    label: 'Manajemen Kandang',
    desc: 'Daftarkan dan atur kandang aktif',
  },
  {
    href: '/admin/pelanggan',
    icon: ShoppingBag,
    label: 'Manajemen Pelanggan',
    desc: 'Data pelanggan, tipe, dan batas kredit',
  },
  {
    href: '/admin/flock-phases',
    icon: Settings,
    label: 'Fase Flock',
    desc: 'Konfigurasi fase pertumbuhan ayam',
  },
  {
    href: '/admin/settings/wa-template',
    icon: MessageSquare,
    label: 'Template WhatsApp',
    desc: 'Konfigurasi pesan WhatsApp untuk invoice',
  },
  {
    href: '/admin/settings/alerts',
    icon: Bell,
    label: 'Konfigurasi Alert',
    desc: 'Atur ambang batas FCR, depletion, HDP, dan invoice overdue',
  },
  {
    href: '/admin/import',
    icon: Upload,
    label: 'Import CSV',
    desc: 'Import massal flock, produksi, pelanggan, stok awal',
  },
]

export default function AdminPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
          Panel Admin
        </h1>
        <p className="text-sm mt-1" style={{ color: '#8fa08f' }}>
          Pilih modul yang ingin dikelola
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MENU.map(({ href, icon: Icon, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="press-feedback flex items-start gap-4 p-5 bg-white rounded-2xl shadow-lf-sm border border-[var(--lf-border)] hover:shadow-lf-md transition-shadow"
          >
            <div
              className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--lf-blue-pale)' }}
            >
              <Icon size={20} style={{ color: 'var(--lf-blue-dark)' }} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#2d3a2e' }}>{label}</p>
              <p className="text-xs mt-0.5" style={{ color: '#8fa08f' }}>{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
