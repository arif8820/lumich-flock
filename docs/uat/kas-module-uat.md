# UAT: Modul Kas

**Versi:** 1.0  
**Tanggal:** 2026-05-08  
**Modul:** Kas (Cash Management)  
**Role yang dibutuhkan:** Admin, Supervisor

---

## Prasyarat

- Sudah login sebagai **Admin** untuk TC-01 s.d. TC-10
- Minimal 2 akun kantong kas sudah dibuat (untuk tes transfer)
- Browser modern (Chrome/Edge)

---

## TC-01 — Buat Kantong Kas Baru

**Role:** Admin  
**Path:** Admin → Pengaturan Kas → `/admin/kas`

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Buka menu **Admin** dari sidebar | Halaman admin grid tampil |
| 2 | Klik card **Pengaturan Kas** | Halaman `/admin/kas` tampil dengan dua kolom: Akun Kas dan Kategori |
| 3 | Isi form Akun Kas: Nama = `Kas Tunai`, Tipe = `Cash`, Saldo Awal = `500000` | Form terisi |
| 4 | Klik **Simpan** | Akun baru muncul di daftar, saldo awal Rp 500.000 |
| 5 | Buat akun kedua: Nama = `BCA Operasional`, Tipe = `Bank`, Saldo Awal = `2000000` | Dua akun tampil di daftar |

**Pass criteria:** Kedua akun muncul di daftar dengan saldo awal yang benar.

---

## TC-02 — Buat Kategori Transaksi

**Role:** Admin  
**Path:** `/admin/kas`

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Di kolom Kategori, isi Nama = `Pakan`, Tipe = `Keluar` | Form terisi |
| 2 | Klik **Simpan** | Kategori muncul di daftar |
| 3 | Buat kategori: Nama = `Penjualan Telur`, Tipe = `Masuk` | Muncul di daftar |
| 4 | Buat kategori: Nama = `Biaya Umum`, Tipe = `Masuk/Keluar` | Muncul di daftar |

**Pass criteria:** 3 kategori tampil di daftar dengan tipe masing-masing benar.

---

## TC-03 — Input Kas Masuk

**Role:** Admin  
**Path:** `/kas` → klik **+ Transaksi**

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Dari halaman `/kas`, klik tombol **+ Transaksi** | Halaman form transaksi baru tampil |
| 2 | Pilih Tipe = `Kas Masuk`, Akun = `BCA Operasional` | Field terpilih |
| 3 | Isi Tanggal = hari ini, Jumlah = `1500000` | Field terisi |
| 4 | Pilih Kategori = `Penjualan Telur`, isi Deskripsi = `Hasil penjualan telur Senin` | Field terisi |
| 5 | Klik **Simpan** | Redirect ke `/kas`, transaksi muncul di tabel terbaru |
| 6 | Klik card **BCA Operasional** | Saldo tampil Rp 3.500.000 (2.000.000 + 1.500.000) |

**Pass criteria:** Saldo BCA Operasional naik sesuai jumlah yang diinput.

---

## TC-04 — Input Kas Keluar

**Role:** Admin  
**Path:** `/kas` → klik **+ Transaksi**

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Klik **+ Transaksi** | Form tampil |
| 2 | Pilih Tipe = `Kas Keluar`, Akun = `Kas Tunai` | Field terpilih |
| 3 | Isi Tanggal = hari ini, Jumlah = `200000` | Field terisi |
| 4 | Pilih Kategori = `Pakan`, isi No. Referensi = `INV/001`, Deskripsi = `Beli pakan ayam` | Field terisi |
| 5 | Klik **Simpan** | Redirect ke `/kas`, transaksi tampil di tabel |
| 6 | Klik card **Kas Tunai** | Saldo tampil Rp 300.000 (500.000 - 200.000) |

**Pass criteria:** Saldo Kas Tunai turun sesuai jumlah yang diinput.

---

## TC-05 — Transfer Antar Kantong

**Role:** Admin  
**Path:** `/kas` → klik **+ Transfer**

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Klik **+ Transfer** | Halaman form transfer tampil |
| 2 | Pilih Dari = `BCA Operasional`, Ke = `Kas Tunai` | Field terpilih |
| 3 | Isi Tanggal = hari ini, Jumlah = `500000` | Field terisi |
| 4 | Klik **Simpan** | Redirect ke `/kas` |
| 5 | Cek card **BCA Operasional** | Saldo berkurang Rp 500.000 |
| 6 | Cek card **Kas Tunai** | Saldo bertambah Rp 500.000 |
| 7 | Buka riwayat BCA Operasional | Ada baris `transfer_out` Rp 500.000 |
| 8 | Buka riwayat Kas Tunai | Ada baris `transfer_in` Rp 500.000 |

**Pass criteria:** Transfer atomic — kedua saldo berubah, masing-masing ada 1 baris transaksi pasangan.

---

## TC-06 — Validasi Form: Input Tidak Valid

**Role:** Admin

| # | Skenario | Langkah | Expected |
|---|----------|---------|----------|
| 6a | Jumlah = 0 | Isi jumlah `0`, klik Simpan | Error: "Jumlah harus lebih dari 0" |
| 6b | Jumlah negatif | Isi jumlah `-100`, klik Simpan | Error validasi tampil |
| 6c | Tanggal lewat H+1 | Isi tanggal = 3 hari dari sekarang, klik Simpan | Error: "Tanggal tidak boleh lebih dari H+1" |
| 6d | Transfer ke akun sama | Pilih Dari dan Ke = akun yang sama, klik Simpan | Error: "Akun asal dan tujuan tidak boleh sama" |

**Pass criteria:** Semua skenario menampilkan pesan error yang sesuai, data tidak tersimpan.

---

## TC-07 — Riwayat Transaksi per Kantong

**Role:** Admin atau Supervisor  
**Path:** `/kas` → klik salah satu card kantong

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Klik card **BCA Operasional** | Halaman riwayat tampil dengan tab "Riwayat Transaksi" aktif |
| 2 | Pastikan tabel berisi kolom: Tanggal, Keterangan, Masuk, Keluar, Saldo | Kolom sesuai |
| 3 | Cek kolom Saldo dari bawah ke atas | Saldo berjalan konsisten (saldo terkini di atas, saldo lama di bawah) |
| 4 | Filter Tipe = `Kas Masuk` | Hanya baris tipe `in` yang tampil |
| 5 | Set Date From - Date To = rentang bulan ini | Hanya transaksi dalam rentang tampil |
| 6 | Hapus filter | Semua transaksi tampil kembali |

**Pass criteria:** Filter berfungsi, saldo berjalan akurat (saldo akhir baris paling atas = saldo akun saat ini).

---

## TC-08 — Daily Report

**Role:** Admin atau Supervisor  
**Path:** `/kas/[accountId]` → tab **Daily Report**

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Buka riwayat salah satu kantong | Halaman tampil |
| 2 | Klik tab **Daily Report** | Tab berganti, tabel daily report tampil |
| 3 | Default tanggal = bulan berjalan | Date range terisi bulan ini |
| 4 | Cek baris pertama | Kolom: Tanggal, Saldo Awal, Total Masuk, Total Keluar, Saldo Akhir |
| 5 | Verifikasi formula per baris | Saldo Awal + Total Masuk - Total Keluar = Saldo Akhir ✓ |
| 6 | Cek Saldo Awal baris ke-2 = Saldo Akhir baris ke-1 | Running balance konsisten |
| 7 | Ubah date range ke bulan lalu | Data bulan lalu tampil |

**Pass criteria:** Formula saldo per baris benar, running balance konsisten antar hari.

---

## TC-09 — Kelola Kantong: Edit & Nonaktifkan

**Role:** Admin  
**Path:** `/admin/kas`

| # | Langkah | Expected |
|---|---------|----------|
| 9a | Klik edit pada akun **yang belum ada transaksi** | Form edit tampil, field Saldo Awal bisa diubah |
| 9b | Ubah Saldo Awal, klik Simpan | Saldo awal berubah, saldo akun terhitung ulang |
| 9c | Klik edit pada akun **yang sudah ada transaksi** | Field Saldo Awal disabled / muncul pesan warning |
| 9d | Coba ubah Saldo Awal akun bertransaksi (jika bisa submit) | Error: "Saldo awal tidak dapat diubah karena sudah ada transaksi" |
| 9e | Toggle nonaktifkan akun | Akun tidak tampil di dashboard `/kas` dan tidak bisa dipilih di form transaksi |

**Pass criteria:** Guard saldo awal berfungsi. Akun nonaktif tidak muncul di form/dashboard.

---

## TC-10 — Role Access Control

| # | Skenario | Langkah | Expected |
|---|----------|---------|----------|
| 10a | Supervisor: lihat dashboard | Login supervisor, buka `/kas` | Halaman tampil, **tombol + Transaksi dan + Transfer tidak ada** |
| 10b | Supervisor: buka riwayat | Klik card kantong | Riwayat dan Daily Report tampil (read-only) |
| 10c | Supervisor: akses form transaksi langsung | Buka URL `/kas/transaksi/baru` | Redirect atau error 403 |
| 10d | Supervisor: akses admin kas | Buka URL `/admin/kas` | Redirect atau error 403 |
| 10e | Operator: akses `/kas` | Login operator, buka `/kas` | Redirect ke `/dashboard` |
| 10f | Operator: akses `/admin/kas` | Buka URL langsung | Redirect atau error 403 |

**Pass criteria:** Supervisor hanya bisa view. Operator tidak bisa akses sama sekali. Tidak ada cara bypass via URL langsung.

---

## TC-11 — Dashboard Kas (Ringkasan)

**Role:** Admin atau Supervisor  
**Path:** `/kas`

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Buka `/kas` | Halaman tampil dengan card per kantong |
| 2 | Cek setiap card | Nama kantong, tipe badge (Cash/Bank/E-Wallet), saldo tampil |
| 3 | Cek saldo di card = saldo dari riwayat akun | Konsisten |
| 4 | Cek tabel 20 transaksi terbaru | Transaksi dari semua kantong, urut terbaru di atas |

**Pass criteria:** Saldo di dashboard konsisten dengan saldo di halaman riwayat per kantong.

---

## TC-12 — Kelola Kategori: Edit & Nonaktifkan

**Role:** Admin  
**Path:** `/admin/kas`

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Klik edit pada kategori `Pakan` | Form edit tampil |
| 2 | Ubah nama menjadi `Pakan Ayam`, klik Simpan | Nama berubah di daftar |
| 3 | Toggle nonaktifkan kategori `Biaya Umum` | Kategori tidak muncul di dropdown form transaksi baru |

**Pass criteria:** Edit nama berhasil. Kategori nonaktif tidak tampil di pilihan form transaksi.

---

## Hasil UAT

| TC | Nama Test | Status | Catatan |
|----|-----------|--------|---------|
| TC-01 | Buat Kantong Kas Baru | | |
| TC-02 | Buat Kategori Transaksi | | |
| TC-03 | Input Kas Masuk | | |
| TC-04 | Input Kas Keluar | | |
| TC-05 | Transfer Antar Kantong | | |
| TC-06 | Validasi Form Input Tidak Valid | | |
| TC-07 | Riwayat Transaksi per Kantong | | |
| TC-08 | Daily Report | | |
| TC-09 | Kelola Kantong: Edit & Nonaktifkan | | |
| TC-10 | Role Access Control | | |
| TC-11 | Dashboard Kas (Ringkasan) | | |
| TC-12 | Kelola Kategori: Edit & Nonaktifkan | | |

**Sign-off:**  
Tester: _______________  
Tanggal: _______________  
