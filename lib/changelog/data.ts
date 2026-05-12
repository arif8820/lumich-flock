import type { VersionEntry } from './types'

export const CURRENT_VERSION = 'v0.3.0' as const

export const changelog: VersionEntry[] = [
  {
    version: 'v0.3.0',
    date: '2026-05-12',
    title: 'CSV Import Update',
    changes: [
      { type: 'improvement', text: 'Import produksi harian kini mencakup detail telur, pakan, dan vaksin per SKU' },
      { type: 'improvement', text: 'Template CSV produksi harian dinamis — kolom mengikuti stock items aktif farm' },
      { type: 'improvement', text: 'Tabel referensi Flock ID di halaman import dengan tombol salin satu klik' },
      { type: 'improvement', text: 'Panduan format tanggal YYYY-MM-DD di template dan UI import' },
      { type: 'fix',         text: 'Hapus entitas import Flock dan Stok Awal yang sudah tidak dipakai' },
    ],
  },
  {
    version: 'v0.2.0',
    date: '2026-05-11',
    title: 'Kas Module & RBAC',
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
    changes: [
      { type: 'feature', text: 'Dashboard produksi & flock management' },
      { type: 'feature', text: 'Inventaris & penjualan telur' },
      { type: 'feature', text: 'Multi-farm schema isolation' },
    ],
  },
]
