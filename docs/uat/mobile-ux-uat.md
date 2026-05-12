# UAT: Mobile UX — Operator-First

**Versi:** 1.0  
**Tanggal:** 2026-05-12  
**Modul:** Bottom Nav, Form Produksi, List Cards (Produksi/Stok/Flock/Kas), Global Mobile Fixes  
**Role yang dibutuhkan:** Operator, Supervisor, Admin  
**Device target:** iPhone/Android di 390px (Chrome DevTools: iPhone 14 Pro emulation juga diterima)

---

## Prasyarat

- Minimal 1 flock aktif dengan coop assigned
- Minimal 2 item stok (satu telur, satu non-telur)
- Minimal 1 akun kas dengan beberapa transaksi
- Browser: Chrome DevTools → Device: iPhone 14 Pro (393 × 852), atau HP fisik
- Login sebagai **operator** untuk TC-01 s.d. TC-07
- Login sebagai **admin** untuk TC-08 (role access control)

---

## TC-01 — Bottom Nav: Navigasi 5 Tab

**Role:** Operator  
**Path:** Halaman mana saja (app)

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Buka app di mobile viewport | Bottom nav tampil di bawah: 5 tab — Produksi, Stok, Flock, Laporan, Lainnya |
| 2 | Tap tab **Produksi** | Navigasi ke `/produksi`, icon Produksi active (highlighted) |
| 3 | Tap tab **Stok** | Navigasi ke `/stok`, icon Stok active |
| 4 | Tap tab **Flock** | Navigasi ke `/flock`, icon Flock active |
| 5 | Tap tab **Laporan** | Navigasi ke `/laporan`, icon Laporan active |
| 6 | Pastikan tab **Beranda/Dashboard** tidak ada di bottom nav | Tidak tampil sebagai tab utama |
| 7 | Pastikan **Kandang** tidak ada sebagai tab tersendiri | Tidak tampil |

**Pass criteria:** 5 tab tampil, navigasi berfungsi, active state benar per route.

---

## TC-02 — Bottom Nav: Drawer "Lainnya"

**Role:** Operator  
**Path:** Halaman mana saja

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Tap tab **Lainnya** (ikon menu/hamburger) | Drawer slide-up muncul dari bawah |
| 2 | Cek isi drawer: ada **Dashboard** (link), **Kas** (link), **Penjualan** (grayed out), **Admin** (tidak tampil untuk operator) | Sesuai |
| 3 | Cek bagian bawah drawer: nama user, nama farm, role badge, tombol **Keluar** | Tampil |
| 4 | Tap **Dashboard** | Drawer tutup, navigasi ke `/dashboard` |
| 5 | Buka drawer lagi, tap **Kas** | Drawer tutup, navigasi ke `/kas` |
| 6 | Buka drawer, tap backdrop (area gelap di luar drawer) | Drawer tutup |
| 7 | Cek tombol **Keluar** — ukuran tap target | Tinggi tombol ≥ 44px |
| 8 | Tap **Keluar** | Logout, redirect ke halaman login |

**Pass criteria:** Drawer terbuka/tutup, semua link berfungsi, user info tampil, logout berjalan.

---

## TC-03 — Drawer: Admin Menu Visibility

**Role:** Admin  
**Path:** Drawer "Lainnya"

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Login sebagai **admin**, buka drawer | Menu **Admin** tampil (tidak grayed out) |
| 2 | Tap **Admin** | Navigasi ke `/admin` |
| 3 | Logout, login sebagai **operator**, buka drawer | Menu **Admin** tidak tampil sebagai link aktif (grayed out atau hidden) |

**Pass criteria:** Admin menu hanya bisa diakses oleh role admin.

---

## TC-04 — Form Produksi: Mobile Input

**Role:** Operator  
**Path:** `/produksi` → tombol **+ Input Harian**

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Tap tombol **+ Input Harian** | Tinggi tombol ≥ 44px, navigasi ke form input |
| 2 | Cek selector **Flock** | Full width, nama flock tampil lengkap (tidak terpotong) |
| 3 | Tap field selector Flock | Tidak ada iOS auto-zoom (viewport tidak bergerak/membesar) |
| 4 | Cek bagian header form | Ada tampilan **Populasi Aktif** (jumlah ekor) untuk flock yang dipilih |
| 5 | Cek tab strip (Ayam / Telur / Pakan / Vaksin) | Tampil sebagai grid 4 kolom, semua tab visible tanpa scroll horizontal |
| 6 | Tap masing-masing tab | Tab berganti, konten berubah |
| 7 | Di tab **Ayam**, tap field **Kematian** | Numerik keyboard muncul, tidak ada iOS auto-zoom |
| 8 | Tap tombol **−** pada stepper Kematian | Nilai berkurang 1 (tidak bisa di bawah 0) |
| 9 | Tap tombol **+** pada stepper Kematian | Nilai bertambah 1 |
| 10 | Ukur hit area tombol +/− | Minimal 48×48px (tidak perlu presisi, tapi mudah ditap) |
| 11 | Di tab **Telur**, cek field qty butir dan qty kg | Pakai stepper (+/−), inputmode numeric |
| 12 | Di tab **Pakan**, cek field qty pakan | Pakai stepper, step = 0.1 untuk kg |
| 13 | Scroll ke bawah form | Tombol **Simpan** selalu tampil (sticky/fixed di bagian bawah viewport) |
| 14 | Isi form valid dan tap **Simpan** | Data tersimpan, redirect ke list produksi |

**Pass criteria:** Semua input mudah ditap di 390px, tidak ada iOS zoom, stepper +/− responsif, tombol simpan selalu reachable.

---

## TC-05 — List Produksi: Mobile Card View

**Role:** Operator  
**Path:** `/produksi`

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Buka `/produksi` di mobile | Tidak ada horizontal scroll — konten muat di layar |
| 2 | Cek layout | Tampil sebagai kartu per record (bukan tabel) |
| 3 | Cek isi setiap card | Tanggal (bold) · nama kandang · nama flock · stat Mati / Afkir / Total Butir |
| 4 | Cek stat Total Butir | Warna hijau (berbeda dari Mati/Afkir) |
| 5 | Cek record yang masih editable | Ada tombol **Edit** atau **Koreksi** di kanan card |
| 6 | Cek record yang sudah terkunci | Chip/badge **Terkunci** tampil (bukan kosong) |
| 7 | Tap tombol Edit pada record editable | Navigasi ke halaman edit |
| 8 | Ukur tap target tombol Edit | Tinggi ≥ 44px |
| 9 | Putar ke landscape atau perbesar ke desktop (1280px) | Tampilan beralih ke tabel (bukan card) |

**Pass criteria:** Card view di mobile, tabel di desktop. Tidak ada overflow horizontal. Tombol Edit ≥ 44px.

---

## TC-06 — List Stok: Mobile Card View

**Role:** Operator  
**Path:** `/stok`

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Buka `/stok` di mobile | Card list tampil, tidak ada horizontal scroll |
| 2 | Cek tab kategori (Telur / Pakan / Lainnya) | Tab visible semua, bisa ditap |
| 3 | Cek isi card setiap item | Nama item (bold) · balance (angka besar) · unit di bawahnya |
| 4 | Cek card item **Telur** | Total butir tampil |
| 5 | Di tab Telur, cek baris **Total Telur** | Background berbeda (bukan putih/transparan), mencolok sebagai summary |
| 6 | Tap tombol aksi (Beli/Regrade/Sesuaikan) jika tersedia | Navigasi ke form yang benar |
| 7 | Desktop (1280px): cek tabel | Tabel tampil, card tersembunyi |

**Pass criteria:** Card view mobile, tidak ada overflow. Total Telur summary punya background yang visible.

---

## TC-07 — List Flock: Mobile Card View

**Role:** Operator  
**Path:** `/flock`

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Buka `/flock` di mobile | Card list tampil |
| 2 | Cek isi setiap card | Nama batch · nama kandang · umur (minggu) · populasi · badge fase |
| 3 | Cek HDP% tampil jika tersedia | Tampil di card |
| 4 | Tap tombol **Detail** | Navigasi ke halaman detail flock |
| 5 | Ukur tap target tombol Detail | Tinggi ≥ 44px |
| 6 | Jika ada flock aktif: tap area card (bukan tombol) | Navigasi ke detail (card clickable) |
| 7 | Desktop (1280px) | Tabel tampil, card tersembunyi |

**Pass criteria:** Card view mobile. Tap target Detail ≥ 44px. Desktop tabel tidak berubah.

---

## TC-08 — Kas Ledger: Mobile Card View

**Role:** Admin atau Supervisor  
**Path:** `/kas` → klik card kantong

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Buka halaman riwayat kantong di mobile | Card list tampil per transaksi |
| 2 | Cek isi card | Tanggal · deskripsi · nominal (warna hijau jika kredit/masuk, merah jika debit/keluar) |
| 3 | Cek running balance | Tampil kecil/muted di bawah nominal |
| 4 | Filter tanggal atau tipe | Card list terupdate sesuai filter |
| 5 | Tab **Daily Report** — buka di mobile | Tabel 5 kolom tidak overflow horizontal — ada horizontal scroll jika tidak muat |
| 6 | Desktop: baris transaksi tampil sebagai grid (bukan card) | Desktop layout tidak berubah |

**Pass criteria:** Card view mobile per transaksi. Debit merah, kredit hijau. Daily report tidak memecah layout di 390px.

---

## TC-09 — Global: iOS Auto-Zoom Fix

**Role:** Operator  
**Device:** iPhone fisik atau DevTools dengan iPhone emulation, Safari atau Chrome

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Buka form input produksi | - |
| 2 | Tap field tanggal | Viewport **tidak** zoom in — halaman tetap ukuran sama |
| 3 | Tap field notes/catatan (textarea) | Tidak zoom |
| 4 | Tap selector flock (select) | Tidak zoom |
| 5 | Buka form transaksi kas (jika ada) | Tap field jumlah → tidak zoom |

**Pass criteria:** Zero iOS auto-zoom di semua field input. Semua input font-size ≥ 16px.

---

## TC-10 — Global: Tap Target & Padding

**Role:** Operator

| # | Skenario | Langkah | Expected |
|---|----------|---------|----------|
| 10a | Padding halaman mobile | Buka `/produksi` di 390px | Konten punya margin 12px kiri-kanan (bukan 24px) |
| 10b | Padding halaman desktop | Buka di 1280px | Padding 24px (normal) |
| 10c | Bottom padding | Scroll ke paling bawah halaman produksi | Konten tidak tertutup bottom nav |
| 10d | Header button ukuran | Cek tombol `+ Input Harian` di header | Tinggi ≥ 44px, mudah ditap |
| 10e | Bottom nav height | Cek bottom nav | Tinggi ≥ 56px per item |

**Pass criteria:** Padding mobile 12px, desktop 24px. Konten tidak tertutup nav. Semua header button ≥ 44px.

---

## TC-11 — Desktop Regression: Layout Tidak Berubah

**Role:** Admin  
**Device:** Desktop 1280px

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Buka `/produksi` | Tabel tampil (bukan card), sidebar tampil |
| 2 | Buka `/stok` | Tabel/list desktop tampil |
| 3 | Buka `/flock` | Tabel flock tampil |
| 4 | Buka `/kas/[id]` | Grid riwayat desktop tampil, bukan card |
| 5 | Cek bottom nav | **Tidak tampil** di desktop (hidden) |
| 6 | Cek form input produksi di desktop | Form normal (stepper tetap berfungsi di desktop) |
| 7 | Cek sidebar | Sidebar tampil normal |

**Pass criteria:** Semua halaman desktop **identik** dengan sebelum implementasi mobile UX. Tidak ada regresi layout.

---

## Hasil UAT

| TC | Nama Test | Status | Catatan |
|----|-----------|--------|---------|
| TC-01 | Bottom Nav: Navigasi 5 Tab | | |
| TC-02 | Bottom Nav: Drawer "Lainnya" | | |
| TC-03 | Drawer: Admin Menu Visibility | | |
| TC-04 | Form Produksi: Mobile Input | | |
| TC-05 | List Produksi: Mobile Card View | | |
| TC-06 | List Stok: Mobile Card View | | |
| TC-07 | List Flock: Mobile Card View | | |
| TC-08 | Kas Ledger: Mobile Card View | | |
| TC-09 | Global: iOS Auto-Zoom Fix | | |
| TC-10 | Global: Tap Target & Padding | | |
| TC-11 | Desktop Regression | | |

**Sign-off:**  
Tester: _______________  
Tanggal: _______________  
