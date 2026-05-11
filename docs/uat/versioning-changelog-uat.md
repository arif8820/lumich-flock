# UAT: Versioning & Changelog

**Versi:** 1.0  
**Tanggal:** 2026-05-11  
**Modul:** Versioning & Changelog  
**Role yang dibutuhkan:** Semua role (halaman publik); login untuk tes badge sidebar

---

## Prasyarat

- Browser modern (Chrome/Edge) dengan DevTools untuk clear cookie
- Akun user valid untuk login ke app
- App berjalan di `http://localhost:3000` (dev) atau URL production

---

## TC-01 — Halaman changelog bisa diakses tanpa login

**Role:** Publik (no auth)  
**Path:** `/changelog`

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Buka browser, pastikan **belum login** (atau gunakan incognito) | Session kosong |
| 2 | Navigasi langsung ke `/changelog` | Halaman changelog tampil — **tidak** redirect ke `/login` |
| 3 | Verifikasi header halaman | Logo LumichFlock + ikon burung + pill biru `v0.2.0` tampil |
| 4 | Verifikasi subtitle | Teks "Catatan pembaruan aplikasi" tampil di bawah header |

**Pass criteria:** Halaman tampil penuh tanpa redirect login.

---

## TC-02 — Versi terbaru tampil dengan benar

**Role:** Publik  
**Path:** `/changelog`

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Buka `/changelog` | Halaman tampil |
| 2 | Lihat entry pertama (paling atas) | Entry `v0.2.0` tampil dengan border kiri **biru** |
| 3 | Verifikasi badge pada entry pertama | Badge hijau **"TERBARU"** tampil di samping nomor versi |
| 4 | Verifikasi tanggal | Tanggal tampil dalam format Indonesia: "11 Mei 2026" |
| 5 | Verifikasi judul | Judul "Kas Module & RBAC" tampil |
| 6 | Verifikasi tag perubahan | Tag **FITUR** (hijau) dan **FIX** (biru) tampil dengan teks masing-masing |

**Pass criteria:** Entry terbaru tampil lengkap dengan semua elemen visual yang benar.

---

## TC-03 — Versi lama tampil dengan benar

**Role:** Publik  
**Path:** `/changelog`

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Buka `/changelog` | Halaman tampil |
| 2 | Scroll ke entry kedua | Entry `v0.1.0` tampil dengan border kiri **abu-abu** |
| 3 | Verifikasi badge | **Tidak ada** badge "TERBARU" pada entry ini |
| 4 | Verifikasi tanggal | "21 April 2026" tampil |
| 5 | Verifikasi judul | Judul "Foundation" tampil |
| 6 | Verifikasi tag | Tag **FITUR** (hijau) tampil untuk semua perubahan |

**Pass criteria:** Entry lama tampil tanpa badge TERBARU, border abu-abu.

---

## TC-04 — Color-coded change type tags

**Role:** Publik  
**Path:** `/changelog`

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Buka `/changelog` | Halaman tampil |
| 2 | Cari perubahan bertipe **FITUR** | Background **hijau muda**, teks hijau tua |
| 3 | Cari perubahan bertipe **FIX** | Background **biru muda**, teks biru tua |
| 4 | (Jika ada) Cari tipe **PENINGKATAN** | Background **kuning muda**, teks amber |
| 5 | (Jika ada) Cari tipe **BREAKING** | Background **ungu muda**, teks ungu tua |

**Pass criteria:** Setiap tipe punya warna yang berbeda dan konsisten.

---

## TC-05 — Sidebar badge muncul untuk user yang belum melihat versi terbaru

**Role:** Semua role (butuh login)  
**Path:** `/dashboard` → sidebar

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Buka DevTools → Application → Cookies → `localhost` | |
| 2 | Hapus cookie `lf_seen_version` jika ada (atau gunakan incognito lalu login) | Cookie terhapus |
| 3 | Login ke app, navigasi ke `/dashboard` | Sidebar tampil |
| 4 | Lihat area **bawah sidebar** (antara nav menu dan user card) | Badge "Versi" dengan nomor `v0.2.0` tampil |
| 5 | Verifikasi state badge | Background **biru muda** (`#e3f0f9`), teks biru, **titik merah kecil** di kanan |

**Pass criteria:** Badge tampil dengan background biru dan titik merah.

---

## TC-06 — Badge dot hilang setelah kunjungi halaman changelog

**Role:** Semua role (butuh login)  
**Path:** Sidebar → `/changelog` → kembali ke `/dashboard`

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Pastikan titik merah muncul di badge (sesuai TC-05) | Titik merah tampil |
| 2 | Klik badge "Versi v0.2.0" di sidebar | Redirect ke `/changelog` |
| 3 | Verifikasi halaman changelog tampil | Halaman tampil normal |
| 4 | Kembali ke `/dashboard` (klik menu Dashboard atau tombol back) | Dashboard tampil |
| 5 | Lihat badge di sidebar | Background **abu-abu** (`#f7f5f1`), teks abu, **tidak ada titik merah** |
| 6 | Buka DevTools → Cookies → cek `lf_seen_version` | Nilai cookie = `v0.2.0` |

**Pass criteria:** Titik merah hilang setelah visit changelog, cookie tersimpan.

---

## TC-07 — Badge tetap hilang setelah refresh halaman

**Role:** Semua role (butuh login)  
**Path:** `/dashboard`

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Lanjutkan dari TC-06 (badge sudah abu-abu) | Badge abu-abu tanpa titik merah |
| 2 | Hard refresh halaman (`Ctrl+Shift+R`) | Halaman reload |
| 3 | Lihat badge di sidebar | Tetap **abu-abu, tidak ada titik merah** |

**Pass criteria:** State badge persisten setelah refresh (berdasarkan cookie).

---

## TC-08 — Badge muncul lagi di browser baru / incognito

**Role:** Semua role (butuh login)  
**Path:** `/dashboard`

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Buka window incognito baru | Session bersih, tidak ada cookie |
| 2 | Login ke app | Login berhasil |
| 3 | Navigasi ke `/dashboard` | Sidebar tampil |
| 4 | Lihat badge | Background **biru**, **titik merah** tampil (karena tidak ada cookie `lf_seen_version`) |

**Pass criteria:** Badge selalu tampil dengan dot untuk session/browser baru.

---

## TC-09 — Klik badge redirect ke changelog

**Role:** Semua role (butuh login)  
**Path:** Sidebar

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Login, navigasi ke halaman mana pun dalam app | Sidebar tampil |
| 2 | Klik badge "Versi" di bagian bawah sidebar | Redirect ke `/changelog` |
| 3 | Verifikasi URL | URL berubah menjadi `/changelog` |
| 4 | Verifikasi halaman | Konten changelog tampil dengan benar |

**Pass criteria:** Badge berfungsi sebagai link ke `/changelog` dari halaman mana pun.

---

## TC-10 — Changelog tampil benar di mobile (bottom nav)

**Role:** Semua role (butuh login)  
**Path:** `/changelog` via mobile viewport

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Di DevTools, aktifkan mobile viewport (misal iPhone SE: 375px) | Layout mobile tampil |
| 2 | Login lalu navigasi ke `/changelog` | Halaman changelog tampil |
| 3 | Verifikasi layout | Konten terpusat, padding proporsional, tidak ada overflow horizontal |
| 4 | Verifikasi semua entry tampil | Semua versi tampil dengan benar |

**Pass criteria:** Halaman changelog responsive di mobile.

---

## Ringkasan Test Cases

| TC | Skenario | Role | Prioritas |
|----|----------|------|-----------|
| TC-01 | Akses tanpa login | Publik | High |
| TC-02 | Entry versi terbaru | Publik | High |
| TC-03 | Entry versi lama | Publik | Medium |
| TC-04 | Color-coded tags | Publik | Medium |
| TC-05 | Badge muncul (cookie kosong) | Login | High |
| TC-06 | Badge hilang setelah kunjungi changelog | Login | High |
| TC-07 | Badge persisten setelah refresh | Login | High |
| TC-08 | Badge muncul di browser baru | Login | Medium |
| TC-09 | Klik badge redirect ke changelog | Login | High |
| TC-10 | Responsive mobile | Login | Low |
