# UAT: CSV Import — Produksi Harian & Pelanggan

**Versi:** 1.0  
**Tanggal:** 2026-05-12  
**Modul:** Admin → Import CSV  
**Role yang dibutuhkan:** Admin

---

## Prasyarat

- Login sebagai user dengan role **admin**
- Farm memiliki minimal:
  - 1 flock aktif (catat `flock_id`-nya dari halaman Flock)
  - Stock items aktif: ≥1 SKU Telur (misal Grade A), ≥1 item Pakan (misal Konsentrat), ≥1 item Vaksin (opsional)
- App berjalan di `http://localhost:3000`

---

## TC-01 — Halaman import hanya tampilkan 2 entitas

**Path:** `/admin/import`

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Login sebagai admin, navigasi ke `/admin/import` | Halaman tampil |
| 2 | Lihat grid pilihan jenis data | Tepat **2 tombol**: "Produksi Harian" dan "Pelanggan" |
| 3 | Verifikasi tidak ada tombol Flock atau Stok Awal | Kedua tombol tersebut **tidak ada** |

**Pass criteria:** Hanya 2 entitas tampil.

---

## TC-02 — Download template Produksi Harian bersifat dinamis

**Path:** `/admin/import`

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Pilih **Produksi Harian** | Tombol aktif (highlight biru) |
| 2 | Klik **Download Template** | File `template_daily_records.csv` terunduh |
| 3 | Buka file di Excel/text editor | Baris pertama (header) tampil |
| 4 | Verifikasi kolom dasar | Header mengandung: `flock_id, record_date, deaths, culled, notes` |
| 5 | Verifikasi kolom telur | Untuk setiap SKU Telur aktif: kolom `egg_<nama_sku>_butir` dan `egg_<nama_sku>_kg` ada |
| 6 | Verifikasi kolom pakan | Untuk setiap item Pakan aktif: kolom `feed_<nama_item>_kg` ada |
| 7 | Verifikasi kolom vaksin | Untuk setiap item Vaksin aktif: kolom `vaccine_<nama_item>_dosis` ada |
| 8 | Verifikasi spasi di nama SKU | Spasi diganti underscore — misal "Grade A" → `egg_Grade_A_butir` |

**Pass criteria:** Header CSV mencerminkan stock items aktif farm secara akurat.

---

## TC-03 — Import Produksi Harian valid (lengkap dengan egg/feed)

**Persiapan:** Isi template dari TC-02 dengan data berikut (ganti `<flock_id>` dengan ID aktual):

```
<flock_id>,2026-01-15,3,0,,500,25.5,200,10.0,150
```

*(Asumsi: 1 SKU Telur, 1 item Pakan, 1 item Vaksin — sesuaikan jumlah kolom dengan template)*

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Di `/admin/import`, pilih **Produksi Harian** | - |
| 2 | Upload file CSV yang sudah diisi | File terbaca, tampil "X baris data" |
| 3 | Klik **Pratinjau Data** | Halaman pratinjau muncul |
| 4 | Verifikasi ringkasan | **1 baris valid**, 0 error |
| 5 | Verifikasi tabel pratinjau | Semua kolom tampil termasuk kolom egg/feed/vaccine |
| 6 | Klik **Konfirmasi Import** | Muncul pesan "Import Berhasil — 1 baris berhasil diimpor" |
| 7 | Cek DB tabel `daily_records` | Row baru dengan `flock_id` + `record_date = 2026-01-15` ada, `is_imported = true` |
| 8 | Cek DB tabel `daily_egg_records` | Row berisi `daily_record_id` dari baris di atas, `qty_butir = 500`, `qty_kg = 25.50` |
| 9 | Cek DB tabel `daily_feed_records` | Row berisi `qty_used` sesuai nilai yang diinput |
| 10 | Cek DB tabel `daily_vaccine_records` | Row berisi `qty_used` sesuai nilai yang diinput (jika vaksin > 0) |

**Pass criteria:** Semua 4 tabel terisi dengan benar dalam satu transaksi.

---

## TC-04 — Kolom egg/feed/vaccine bernilai 0 tidak membuat child records

**Persiapan:** CSV dengan nilai egg = 0, feed = 0, vaccine = 0 (gunakan tanggal berbeda dari TC-03):

```
<flock_id>,2026-01-16,1,0,,0,0,0,0,0
```

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Upload CSV, pratinjau, konfirmasi | "1 baris berhasil diimpor" |
| 2 | Cek DB `daily_records` | Row baru ada untuk `2026-01-16` |
| 3 | Cek DB `daily_egg_records` | **Tidak ada** row baru untuk record ini |
| 4 | Cek DB `daily_feed_records` | **Tidak ada** row baru untuk record ini |
| 5 | Cek DB `daily_vaccine_records` | **Tidak ada** row baru untuk record ini |

**Pass criteria:** Parent record tersimpan, child records tidak dibuat untuk nilai 0.

---

## TC-05 — Error: flock_id tidak valid

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Buat CSV dengan `flock_id` yang tidak ada di DB: `invalid-uuid,2026-01-20,0,0,` | - |
| 2 | Upload dan klik Pratinjau | Halaman pratinjau muncul |
| 3 | Verifikasi ringkasan | **0 baris valid**, 1 error |
| 4 | Verifikasi pesan error | Pesan mengandung teks seperti "flock_id" dan "tidak ditemukan" |

**Pass criteria:** Baris ditolak dengan pesan error yang jelas.

---

## TC-06 — Error: format tanggal salah

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Buat CSV dengan tanggal format DD/MM/YYYY: `<flock_id>,15/01/2026,0,0,` | - |
| 2 | Upload dan klik Pratinjau | - |
| 3 | Verifikasi error | Pesan mengandung teks "format tanggal tidak valid" |

**Pass criteria:** Baris ditolak, format YYYY-MM-DD diwajibkan.

---

## TC-07 — Error: duplikat (flock_id + record_date sudah ada)

**Prasyarat:** TC-03 sudah dijalankan — record `2026-01-15` sudah ada di DB.

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Upload CSV dengan baris yang sama: `<flock_id>,2026-01-15,3,0,` | - |
| 2 | Pratinjau → Konfirmasi | Import diproses |
| 3 | Verifikasi hasil | **Error** muncul dengan pesan "sudah ada" — import gagal (rollback) |

**Pass criteria:** Duplicate ditolak saat commit, pesan error dalam Bahasa Indonesia.

---

## TC-08 — CSV dengan baris campuran (sebagian valid, sebagian error)

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Buat CSV 3 baris: baris 1 valid, baris 2 flock_id invalid, baris 3 valid (tanggal berbeda) | - |
| 2 | Upload dan Pratinjau | Ringkasan: **2 baris valid**, 1 error |
| 3 | Verifikasi tabel error | Baris 3 (baris ke-2 data) tampil dengan pesan error |
| 4 | Klik Konfirmasi Import | "2 baris berhasil diimpor" |
| 5 | Cek DB | Hanya 2 record valid yang tersimpan |

**Pass criteria:** Baris valid diimpor, baris error dilewati tanpa memblokir yang lain.

---

## TC-09 — Import Pelanggan tidak berubah

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Pilih **Pelanggan** di halaman import | - |
| 2 | Download template | File `template_customers.csv` terunduh dengan header: `name,type,phone,address,credit_limit,payment_terms` |
| 3 | Isi dengan data valid: `Toko Maju,retail,081234567890,Jl. Mawar 1,5000000,30` | - |
| 4 | Upload, pratinjau, konfirmasi | "1 baris berhasil diimpor" |
| 5 | Verifikasi di halaman Pelanggan | Customer baru muncul dengan status `active` |

**Pass criteria:** Customer import berfungsi normal, tidak ada regresi.

---

## TC-10 — Import Pelanggan tidak terpengaruh saat ganti ke Produksi Harian

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Pilih Pelanggan, upload file, lihat pratinjau | Pratinjau muncul |
| 2 | Klik tombol **Produksi Harian** (ganti entitas) | Form kembali ke step awal |
| 3 | Verifikasi tidak ada data pratinjau lama tersisa | Halaman bersih, tidak ada tabel pratinjau |

**Pass criteria:** Ganti entitas mereset state form dengan benar.
