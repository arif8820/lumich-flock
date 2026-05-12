import type { VersionEntry } from './types'

export const CURRENT_VERSION = 'v0.4.0' as const

export const changelog: VersionEntry[] = [
  {
    version: 'v0.4.0',
    date: '2026-05-12',
    title: 'Mobile UX — Operator First',
    changes: [
      { type: 'feature',     text: 'Bottom nav baru: Produksi · Stok · Flock · Laporan · Lainnya' },
      { type: 'feature',     text: 'Drawer "Lainnya" dengan akses Dashboard, Kas, dan info user' },
      { type: 'feature',     text: 'Stepper +/− untuk input angka di form produksi harian' },
      { type: 'improvement', text: 'Form produksi: selector flock full-width, tab grid 4 kolom, tombol simpan sticky' },
      { type: 'improvement', text: 'List Produksi, Stok, Flock, dan Kas tampil sebagai card di mobile — tanpa scroll horizontal' },
      { type: 'improvement', text: 'Populasi aktif flock tampil di header form produksi untuk cross-check sebelum input' },
      { type: 'fix',         text: 'Input font-size 16px — mencegah iOS auto-zoom saat tap field' },
      { type: 'fix',         text: 'Semua tombol min 44px — lebih mudah ditap di lapangan' },
      { type: 'fix',         text: 'Padding halaman mobile 12px (sebelumnya 24px) — konten lebih lega' },
    ],
  },
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
