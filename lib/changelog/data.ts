import type { VersionEntry } from './types'

export const CURRENT_VERSION = 'v0.2.0' as const

export const changelog: VersionEntry[] = [
  {
    version: 'v0.2.0',
    date: '2026-05-11',
    title: 'Kas Module & RBAC',
    highlights: [
      'Modul kas & transaksi keuangan',
      'Dynamic RBAC permission matrix',
    ],
    changes: [
      { type: 'feature', text: 'Modul kas dengan multi-akun & kategori' },
      { type: 'feature', text: 'Dynamic RBAC permission matrix di admin' },
      { type: 'fix',     text: 'Sidebar permissions tidak muncul setelah role change' },
    ],
  },
  {
    version: 'v0.1.0',
    date: '2026-04-21',
    title: 'Foundation',
    highlights: [
      'Launch awal aplikasi',
      'Multi-farm schema isolation',
    ],
    changes: [
      { type: 'feature', text: 'Dashboard produksi & flock management' },
      { type: 'feature', text: 'Inventaris & penjualan telur' },
      { type: 'feature', text: 'Multi-farm schema isolation' },
    ],
  },
]
