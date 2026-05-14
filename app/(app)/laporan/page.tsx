import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import {
  Egg, Bird, Package, ShoppingCart, Users, Landmark, ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

type ReportCard = {
  href: string
  icon: React.ElementType
  title: string
  description: string
  permissionKey: string
}

const REPORTS: ReportCard[] = [
  {
    href: '/laporan/produksi',
    icon: Egg,
    title: 'Produksi Harian',
    description: 'Rekap telur, kematian, afkir, dan HDP% per kandang',
    permissionKey: PERMISSIONS.LAPORAN.PRODUKSI.VIEW,
  },
  {
    href: '/laporan/flock',
    icon: Bird,
    title: 'Performa Flock',
    description: 'HDP%, mortalitas, dan FCR per flock',
    permissionKey: PERMISSIONS.LAPORAN.FLOCK.VIEW,
  },
  {
    href: '/laporan/stok',
    icon: Package,
    title: 'Stok Balance',
    description: 'Saldo stok terkini semua item',
    permissionKey: PERMISSIONS.LAPORAN.STOK.VIEW,
  },
  {
    href: '/laporan/stok/mutasi',
    icon: Package,
    title: 'Mutasi Stok',
    description: 'Riwayat pergerakan stok masuk dan keluar',
    permissionKey: PERMISSIONS.LAPORAN.STOK.MUTASI.VIEW,
  },
  {
    href: '/laporan/penjualan',
    icon: ShoppingCart,
    title: 'Penjualan',
    description: 'Ringkasan sales order per periode',
    permissionKey: PERMISSIONS.LAPORAN.PENJUALAN.VIEW,
  },
  {
    href: '/laporan/penjualan/customer',
    icon: Users,
    title: 'Penjualan per Pelanggan',
    description: 'Breakdown penjualan per pelanggan',
    permissionKey: PERMISSIONS.LAPORAN.PENJUALAN.VIEW,
  },
  {
    href: '/laporan/keuangan/piutang',
    icon: Landmark,
    title: 'Piutang Aging',
    description: 'Status piutang berdasarkan hari keterlambatan',
    permissionKey: PERMISSIONS.LAPORAN.KEUANGAN.VIEW,
  },
  {
    href: '/laporan/keuangan/kas',
    icon: Landmark,
    title: 'Kas & Cash Flow',
    description: 'Arus kas masuk dan keluar per periode',
    permissionKey: PERMISSIONS.LAPORAN.KEUANGAN.VIEW,
  },
]

export default async function LaporanHubPage() {
  const session = await getSession()
  if (!session || !hasPermission(session, PERMISSIONS.LAPORAN.VIEW)) redirect('/dashboard')

  const visibleReports = REPORTS.filter((r) =>
    hasPermission(session, r.permissionKey as Parameters<typeof hasPermission>[1])
  )

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
          Laporan
        </h1>
        <p className="text-[13px] mt-1" style={{ color: '#8fa08f' }}>
          Pilih laporan yang ingin dilihat
        </p>
      </div>

      {visibleReports.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--lf-text-soft)' }}>
          Tidak ada laporan yang dapat diakses.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleReports.map((report) => {
            const Icon = report.icon
            return (
              <Link
                key={report.href}
                href={report.href}
                className="group flex items-start gap-4 p-5 rounded-[14px] border transition-colors hover:border-[var(--lf-blue)]"
                style={{ borderColor: 'var(--lf-border)', background: '#fff' }}
              >
                <div
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
                  style={{ background: '#e3f0f9' }}
                >
                  <Icon size={18} style={{ color: '#5090be' }} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold" style={{ color: '#2d3a2e' }}>{report.title}</p>
                  <p className="text-[12px] mt-0.5 leading-relaxed" style={{ color: '#8fa08f' }}>{report.description}</p>
                </div>
                <ArrowRight size={16} strokeWidth={1.8} style={{ color: '#b0bab0', flexShrink: 0, marginTop: 2 }} />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
