import type { VersionEntry } from './types'

export const CURRENT_VERSION = 'v0.9.1' as const

export const changelog: VersionEntry[] = [
  {
    version: 'v0.9.1',
    date: '2026-05-15',
    title: 'Input Telur — Kode Ikatan & Simpan Per-Ikatan',
    changes: [
      { type: 'feature', text: 'Setiap ikatan tray yang disimpan mendapat kode unik (format DDMMYY-NNN) — ditulis ke label fisik ikatan' },
      { type: 'feature', text: 'Input per-ikatan: operator simpan satu ikatan, dapat kode langsung, lanjut ke ikatan berikutnya' },
      { type: 'feature', text: 'Daftar ikatan tersimpan hari ini tampil di bawah form — dengan kode, butir, dan kg per ikatan' },
      { type: 'feature', text: 'Hapus ikatan individual (kode tidak di-reuse)' },
      { type: 'improvement', text: 'Multiple sesi panen dalam satu hari didukung — sequence kode berlanjut otomatis' },
    ],
  },
  {
    version: 'v0.9.0',
    date: '2026-05-15',
    title: 'Input Telur — Metode Tray (Ikatan)',
    changes: [
      { type: 'feature', text: 'Admin dapat mengaktifkan "Metode Tray" per SKU Telur di Stok Katalog — toggle Tray ON/OFF muncul khusus untuk kategori Telur' },
      { type: 'feature', text: 'Form Input Produksi: SKU dengan metode tray menampilkan baris per ikatan (nampan, telur atas, kg). Butir dihitung otomatis: (nampan−1)×30 + atas' },
      { type: 'feature', text: 'Tambah / hapus ikatan dinamis — audit trail disimpan per ikatan di tabel daily_egg_bundles' },
      { type: 'feature', text: 'SKU tanpa metode tray (telur pecah, retak, dll.) tetap menggunakan input butir+kg sederhana' },
      { type: 'improvement', text: 'Total butir & kg diakumulasi dari semua SKU (tray + simple) dan ditampilkan di bagian bawah tab Telur' },
    ],
  },
  {
    version: 'v0.8.2',
    date: '2026-05-15',
    title: 'Produksi — Kolom Vaksin di Tabel Harian',
    changes: [
      { type: 'feature', text: 'Tabel Produksi Harian: kolom Vaksin ditambahkan (desktop & mobile) — menampilkan total pemakaian vaksin per record, sejajar dengan kolom Pakan' },
    ],
  },
  {
    version: 'v0.8.1',
    date: '2026-05-15',
    title: 'Role Management — Sembunyikan Role Bawaan',
    changes: [
      { type: 'improvement', text: 'Role bawaan (Operator, Supervisor) disembunyikan dari halaman Manajemen Role — hanya Admin (sistem) dan role custom yang ditampilkan' },
    ],
  },
  {
    version: 'v0.8.0',
    date: '2026-05-14',
    title: 'Brand Identity & TypeScript Build Fixes',
    changes: [
      { type: 'feature',     text: 'Logo resmi LumichFlock (SVG) tampil di sidebar, halaman login, dan halaman changelog' },
      { type: 'feature',     text: 'Favicon baru: icon.svg squircle biru + favicon.ico multi-resolusi di browser tab' },
      { type: 'feature',     text: 'Theme color #7aadd4 untuk browser mobile (address bar biru)' },
      { type: 'fix',         text: 'Build TypeScript: semua kolom date Drizzle dikoreksi dari Date ke string — eliminasi instanceof Date yang tidak valid' },
    ],
  },
  {
    version: 'v0.7.0',
    date: '2026-05-14',
    title: 'Laporan Hub & 8 Basic Reports',
    changes: [
      { type: 'feature',     text: 'Hub Laporan: navigasi sidebar diganti 1 flat item "Laporan" → halaman hub dengan grid card semua report' },
      { type: 'feature',     text: 'Laporan Produksi Harian: filter kandang baru + kolom HDP%' },
      { type: 'feature',     text: 'Laporan Performa Flock: HDP% rata-rata, mortalitas%, FCR per flock dengan color coding' },
      { type: 'feature',     text: 'Laporan Stok Balance: saldo terkini semua item + total masuk/keluar' },
      { type: 'feature',     text: 'Laporan Mutasi Stok: riwayat pergerakan stok dengan filter item & date range' },
      { type: 'feature',     text: 'Laporan Penjualan Summary: KPI total SO, revenue, avg per SO + tabel per order' },
      { type: 'feature',     text: 'Laporan Penjualan per Pelanggan: breakdown revenue per customer' },
      { type: 'feature',     text: 'Laporan Piutang Aging: dipindah ke /laporan/keuangan/piutang (URL baru)' },
      { type: 'feature',     text: 'Laporan Kas & Cash Flow: total masuk/keluar/net + tabel transaksi dengan badge Masuk/Keluar' },
      { type: 'feature',     text: 'Export CSV untuk semua 8 laporan' },
      { type: 'feature',     text: 'Permission per-report: laporan.produksi.view, laporan.flock.view, laporan.stok.view, laporan.stok.mutasi.view, laporan.penjualan.view, laporan.keuangan.view' },
      { type: 'improvement', text: 'Print-friendly CSS: filter & sidebar disembunyikan saat Ctrl+P' },
    ],
  },
  {
    version: 'v0.6.0',
    date: '2026-05-14',
    title: 'Produksi & Manajemen Kandang/Flock',
    changes: [
      { type: 'feature',     text: 'Halaman Produksi: kolom baru Flock (−), Telur (+), Pakan (−) menggantikan Kematian/Afkir — lengkap dengan warna merah/hijau' },
      { type: 'feature',     text: 'Halaman Produksi: record dari flock yang sudah nonaktif kini tetap muncul' },
      { type: 'feature',     text: 'Filter dropdown Produksi kini menampilkan semua kandang & flock (aktif + nonaktif) dengan label [Nonaktif]' },
      { type: 'feature',     text: 'Filter dropdown Produksi diurutkan: aktif dahulu → nonaktif, masing-masing sort by arrivalDate terbaru' },
      { type: 'feature',     text: 'Manajemen Kandang: kolom Kapasitas menampilkan kapasitas / populasi hidup saat ini' },
      { type: 'feature',     text: 'Manajemen Kandang: kolom Flock Aktif baru — nama flock dan umur detail (contoh: 5 minggu 3 hari)' },
      { type: 'feature',     text: 'Manajemen Flock: kolom Total DOC diganti DOC Awal / Hidup — angka hidup berwarna hijau' },
      { type: 'feature',     text: 'Manajemen Flock: semua flock ditampilkan (aktif + nonaktif) dengan kolom Status dan row nonaktif di-dim' },
      { type: 'improvement', text: 'Manajemen Flock: counter header menampilkan jumlah aktif dan total flock' },
      { type: 'improvement', text: 'Manajemen Flock: urutan tabel — aktif dahulu, lalu nonaktif, masing-masing sort by createdAt terbaru' },
    ],
  },
  {
    version: 'v0.5.0',
    date: '2026-05-14',
    title: 'Import CSV — Inventory & Flock Sync',
    changes: [
      { type: 'feature',     text: 'Import produksi harian kini otomatis mencatat gerakan stok: telur masuk (+), pakan & vaksin keluar (−)' },
      { type: 'feature',     text: 'Validasi stok kumulatif per-baris saat pratinjau — batch ditolak seluruhnya jika ada baris yang kekurangan stok' },
      { type: 'feature',     text: 'Pesan error stok informatif: tanggal, nama item, saldo tersedia, dan jumlah dibutuhkan' },
      { type: 'improvement', text: 'Audit trail lengkap: setiap gerakan stok dari import tertaut ke daily_record asal via source_id' },
      { type: 'improvement', text: 'Populasi flock diperbarui otomatis dari data deaths/culled — tidak ada update manual diperlukan' },
    ],
  },
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
