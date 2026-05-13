# UAT: Profil Akun — Info Akun & Ganti Password

**Versi:** 1.0  
**Tanggal:** 2026-05-13  
**Modul:** Profil Akun (`/profil`) — Tab Info Akun, Tab Keamanan, Navigasi Sidebar  
**Role yang dibutuhkan:** Operator, Supervisor, Admin  
**Prasyarat migrasi:** `ALTER TABLE "users" ADD COLUMN "phone" text;` sudah di-apply ke semua farm schemas

---

## Prasyarat

- Minimal 1 akun user aktif per role (operator, supervisor, admin)
- Migration `0012_spooky_rhino.sql` sudah di-apply (`npm run db:migrate` + manual farm schemas)
- App berjalan (`npm run dev`)
- Browser: Chrome desktop atau mobile viewport

---

## TC-01 — Navigasi: Klik User Card di Sidebar

**Role:** Semua role  
**Path:** Halaman mana saja (app)

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Login sebagai operator | App shell tampil dengan sidebar |
| 2 | Lihat bagian bawah sidebar — user card (nama + role) | User card tampil dengan nama dan role |
| 3 | Hover user card | Cursor berubah pointer, background berubah subtle (hover state) |
| 4 | Klik user card (area nama/avatar — bukan tombol logout) | Navigasi ke `/profil` |
| 5 | Verifikasi halaman `/profil` terbuka | Judul "Profil Saya", dua tab tampil: "Info Akun" dan "Keamanan" |
| 6 | Klik tombol logout (ikon di kanan user card) | Logout berjalan, redirect ke `/login` — bukan navigasi ke profil |

**Pass criteria:** Klik user card → `/profil`. Logout button tetap berfungsi terpisah.

---

## TC-02 — Halaman Profil: Tampilan Awal

**Role:** Semua role  
**Path:** `/profil`

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Buka `/profil` | Halaman tampil dengan header "Profil Saya" dan subtitle |
| 2 | Cek tab aktif default | Tab "Info Akun" aktif |
| 3 | Cek field di tab "Info Akun" | Field "Nama Lengkap" ter-prefill dengan nama user saat ini |
| 4 | Cek field "Nomor Telepon" | Ter-prefill dengan nomor yang tersimpan, atau kosong jika belum ada |
| 5 | Cek tombol "Simpan Perubahan" | Tombol disabled (karena belum ada perubahan) |
| 6 | Klik tab "Keamanan" | Tab berganti ke form ganti password |
| 7 | Cek field di tab "Keamanan" | 3 field password: "Password Saat Ini", "Password Baru", "Konfirmasi Password Baru" — semua kosong dan masked |
| 8 | Klik tab "Info Akun" kembali | Kembali ke form info akun, data masih ada |

**Pass criteria:** Prefill benar, tab switching berjalan, tombol submit disabled saat tidak ada perubahan.

---

## TC-03 — Info Akun: Update Nama Lengkap

**Role:** Semua role  
**Path:** `/profil` → Tab "Info Akun"

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Buka `/profil` tab "Info Akun" | Field nama ter-prefill |
| 2 | Ubah nama lengkap (misal: tambah spasi atau karakter) | Tombol "Simpan Perubahan" menjadi enabled |
| 3 | Klik "Simpan Perubahan" | Loading state muncul (teks berubah "Menyimpan...") |
| 4 | Tunggu respons | Toast sukses: "Informasi akun berhasil diperbarui" |
| 5 | Cek nama di sidebar user card | Nama di sidebar terupdate dengan nama baru |
| 6 | Reload halaman `/profil` | Field nama ter-prefill dengan nama baru |

**Pass criteria:** Nama terupdate di DB dan tercermin di sidebar setelah refresh.

---

## TC-04 — Info Akun: Update Nomor Telepon

**Role:** Semua role  
**Path:** `/profil` → Tab "Info Akun"

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Buka `/profil` tab "Info Akun" | Field telepon kosong atau ter-prefill |
| 2 | Isi nomor telepon: `08123456789` | Tombol "Simpan Perubahan" menjadi enabled |
| 3 | Klik "Simpan Perubahan" | Toast sukses tampil |
| 4 | Reload halaman | Field telepon ter-prefill dengan `08123456789` |
| 5 | Hapus nomor telepon (kosongkan field) | Tombol enabled |
| 6 | Klik "Simpan Perubahan" | Toast sukses — nomor telepon tersimpan sebagai null |
| 7 | Reload halaman | Field telepon kosong |

**Pass criteria:** Telepon bisa diisi, diubah, dan dihapus (nullable).

---

## TC-05 — Info Akun: Validasi Error

**Role:** Semua role  
**Path:** `/profil` → Tab "Info Akun"

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Hapus semua isi field "Nama Lengkap" | Field kosong |
| 2 | Klik "Simpan Perubahan" | Error tampil: "Nama minimal 2 karakter" (atau browser required validation) |
| 3 | Isi nama dengan 1 karakter (misal: "A") | Submit |
| 4 | Tunggu respons | Error tampil dari server validation |
| 5 | Isi nama dengan nama valid (min 2 karakter) | Submit berhasil, toast sukses |

**Pass criteria:** Validasi mencegah submit nama terlalu pendek.

---

## TC-06 — Info Akun: isDirty — Tombol Disabled

**Role:** Semua role  
**Path:** `/profil` → Tab "Info Akun"

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Buka `/profil` | Tombol "Simpan Perubahan" disabled |
| 2 | Ubah nama, lalu kembalikan ke nilai asal | Tombol kembali disabled |
| 3 | Ubah telepon, lalu hapus kembali (jika awalnya kosong) | Tombol kembali disabled |
| 4 | Ubah salah satu field dan biarkan berbeda | Tombol enabled |

**Pass criteria:** Submit button disabled jika tidak ada perubahan dari nilai awal.

---

## TC-07 — Keamanan: Ganti Password Sukses

**Role:** Semua role  
**Path:** `/profil` → Tab "Keamanan"

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Buka tab "Keamanan" | 3 field password kosong dan masked |
| 2 | Isi "Password Saat Ini" dengan password yang benar | Field terisi (masked) |
| 3 | Isi "Password Baru" dengan password baru (min 8 karakter) | Field terisi |
| 4 | Isi "Konfirmasi Password Baru" dengan password yang sama | Field terisi |
| 5 | Klik "Ubah Password" | Loading state tampil |
| 6 | Tunggu respons | Toast sukses: "Password berhasil diubah" |
| 7 | Cek semua field password | Semua field dikosongkan otomatis |
| 8 | Cek semua eye-toggle | Semua kembali ke mode masked (tidak plain text) |
| 9 | Logout dan login ulang dengan password baru | Login berhasil |

**Pass criteria:** Password berhasil diubah, semua field clear setelah sukses, login dengan password baru berfungsi.

---

## TC-08 — Keamanan: Password Saat Ini Salah

**Role:** Semua role  
**Path:** `/profil` → Tab "Keamanan"

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Isi "Password Saat Ini" dengan password yang **salah** | Field terisi |
| 2 | Isi "Password Baru" dan "Konfirmasi" dengan nilai valid | Field terisi |
| 3 | Klik "Ubah Password" | Loading state tampil |
| 4 | Tunggu respons | Error tampil: "Password saat ini salah" |
| 5 | Field password tidak dikosongkan | User masih bisa koreksi tanpa re-enter semua |

**Pass criteria:** Error ditampilkan, fields tidak di-clear saat gagal.

---

## TC-09 — Keamanan: Konfirmasi Password Tidak Cocok (Client-side)

**Role:** Semua role  
**Path:** `/profil` → Tab "Keamanan"

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Isi semua field password, tapi "Konfirmasi Password Baru" berbeda dari "Password Baru" | Field terisi |
| 2 | Klik "Ubah Password" | Error muncul **sebelum** request ke server: "Konfirmasi password tidak cocok" |
| 3 | Verifikasi tidak ada network request | Buka DevTools → Network — tidak ada request ke `/profil` action |
| 4 | Perbaiki konfirmasi menjadi sama | Error hilang setelah submit ulang dengan nilai benar |

**Pass criteria:** Validasi client-side mencegah request ke server saat password tidak cocok.

---

## TC-10 — Keamanan: Eye Toggle (Show/Hide Password)

**Role:** Semua role  
**Path:** `/profil` → Tab "Keamanan"

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Isi field "Password Saat Ini" | Karakter masked (●●●) |
| 2 | Klik ikon eye di field tersebut | Password terlihat sebagai teks biasa |
| 3 | Klik ikon eye lagi | Password kembali masked |
| 4 | Lakukan hal sama untuk "Password Baru" dan "Konfirmasi" | Masing-masing toggle independen |
| 5 | Setelah ganti password sukses (TC-07), cek eye toggles | Semua kembali ke mode masked |

**Pass criteria:** Setiap field toggle independen, reset ke masked setelah sukses.

---

## TC-11 — Akses Langsung URL `/profil` Tanpa Login

**Role:** Guest (tidak login)  
**Path:** `/profil`

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Logout (atau buka private/incognito window) | Tidak ada session aktif |
| 2 | Akses langsung `http://localhost:3000/profil` | Redirect otomatis ke `/login` |

**Pass criteria:** Halaman profil tidak bisa diakses tanpa autentikasi.

---

## TC-12 — Multi-Role Access

**Role:** Operator, Supervisor, Admin  
**Path:** `/profil`

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Login sebagai **operator** | Buka `/profil` via user card sidebar |
| 2 | Verifikasi halaman tampil dan kedua tab berfungsi | Pass |
| 3 | Logout, login sebagai **supervisor** | Buka `/profil` |
| 4 | Verifikasi halaman tampil dan kedua tab berfungsi | Pass |
| 5 | Logout, login sebagai **admin** | Buka `/profil` |
| 6 | Verifikasi halaman tampil dan kedua tab berfungsi | Pass |

**Pass criteria:** Semua role bisa akses dan menggunakan fitur profil.

---

## Ringkasan Test Cases

| TC | Skenario | Role |
|----|----------|------|
| TC-01 | Navigasi via user card sidebar | Semua |
| TC-02 | Tampilan awal halaman profil | Semua |
| TC-03 | Update nama lengkap | Semua |
| TC-04 | Update nomor telepon (isi, ubah, hapus) | Semua |
| TC-05 | Validasi error nama terlalu pendek | Semua |
| TC-06 | isDirty — tombol disabled jika tidak ada perubahan | Semua |
| TC-07 | Ganti password sukses | Semua |
| TC-08 | Password saat ini salah | Semua |
| TC-09 | Konfirmasi password tidak cocok (client-side) | Semua |
| TC-10 | Eye toggle show/hide password | Semua |
| TC-11 | Akses langsung tanpa login | Guest |
| TC-12 | Multi-role access | Operator, Supervisor, Admin |
