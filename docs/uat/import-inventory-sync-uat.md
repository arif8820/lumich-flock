# UAT: Import CSV Produksi Harian — Inventory & Flock Sync

**Versi:** 1.0  
**Tanggal:** 2026-05-14  
**Modul:** Admin → Import CSV → Produksi Harian  
**Role yang dibutuhkan:** Admin  
**Branch:** `worktree-import-inventory-sync`

---

## Prasyarat

- Login sebagai user dengan role **admin**
- Farm memiliki:
  - 1 flock aktif (catat `flock_id` dari halaman Flock)
  - ≥1 SKU Telur aktif (misal "Grade A")
  - ≥1 item Pakan aktif (misal "Pakan Starter") dengan **stok awal > 0** di `inventory_movements`
  - ≥1 item Vaksin aktif (opsional, tapi dibutuhkan untuk TC-06 dan TC-07)
- Catat saldo stok awal pakan dan vaksin dari halaman Stok sebelum memulai
- App berjalan di `http://localhost:3000`

---

## TC-IS-01 — Import valid: inventory_movements ter-insert untuk egg/feed/vaccine

**Tujuan:** Setelah import, stok telur naik dan stok pakan/vaksin turun sesuai data CSV.

**Persiapan:**
- Catat saldo stok: `balance_pakan_awal` dan `balance_telur_awal` dari halaman Stok
- Siapkan CSV 1 baris (ganti `<flock_id>`, sesuaikan kolom dengan template aktual):

```
flock_id,record_date,deaths,culled,notes,egg_grade_a_butir,egg_grade_a_kg,feed_pakan_starter_kg
<flock_id>,2026-02-01,2,0,,500,6.25,100
```

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Navigasi ke `/admin/import`, pilih **Produksi Harian** | - |
| 2 | Upload CSV, klik **Pratinjau Data** | 1 baris valid, 0 error |
| 3 | Klik **Konfirmasi Import** | "Import Berhasil — 1 baris berhasil diimpor" |
| 4 | Cek DB tabel `daily_records` | Row baru: `flock_id` + `record_date = 2026-02-01`, `is_imported = true` |
| 5 | Cek DB tabel `inventory_movements` filter `source = 'import'` | 2 rows baru: 1 untuk egg, 1 untuk feed |
| 6 | Verifikasi row egg movement | `movement_type = 'in'`, `source_type = 'daily_egg_records'`, `quantity = 500`, `source_id` = id dari `daily_records` baris TC ini |
| 7 | Verifikasi row feed movement | `movement_type = 'out'`, `source_type = 'daily_feed_records'`, `quantity = 100`, `source_id` = id yang sama |
| 8 | Cek halaman Stok → saldo telur | Naik sebesar **500** dari `balance_telur_awal` |
| 9 | Cek halaman Stok → saldo pakan | Turun sebesar **100** dari `balance_pakan_awal` |
| 10 | Verifikasi `is_imported = true` di movements | Kedua movement punya kolom `is_imported = true` dan `imported_by` = id user admin yang login |

**Pass criteria:** Saldo telur naik, saldo pakan turun, movements ter-insert dengan benar dalam 1 transaksi.

---

## TC-IS-02 — Flock population otomatis berubah setelah import deaths/culled

**Tujuan:** `deaths` dan `culled` di CSV langsung mempengaruhi populasi flock (dihitung on-the-fly).

**Persiapan:**
- Catat populasi flock aktif dari halaman Flock sebelum import: `pop_awal`
- Siapkan CSV 1 baris dengan deaths = 5, culled = 2:

```
<flock_id>,2026-02-02,5,2,,0,0,0
```

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Upload CSV, pratinjau, konfirmasi | "1 baris berhasil diimpor" |
| 2 | Navigasi ke halaman Flock → detail flock tersebut | - |
| 3 | Verifikasi populasi aktif | `pop_awal - 5 - 2 = pop_awal - 7` |
| 4 | Cek DB `daily_records` | Row: `deaths = 5`, `culled = 2` untuk `2026-02-02` |

**Pass criteria:** Populasi berkurang 7 tanpa perlu update kolom di tabel `flocks` (dihitung dari sum `daily_records`).

---

## TC-IS-03 — Nilai 0 tidak membuat inventory_movements

**Tujuan:** Import dengan egg/feed = 0 tidak menghasilkan movement kotor di ledger.

**Persiapan:** CSV 1 baris semua qty = 0:

```
<flock_id>,2026-02-03,1,0,,0,0,0
```

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Upload CSV, pratinjau, konfirmasi | "1 baris berhasil diimpor" |
| 2 | Cek DB `daily_records` | Row baru untuk `2026-02-03` ada |
| 3 | Cek DB `inventory_movements` filter `source = 'import'` dan `movement_date = 2026-02-03` | **Tidak ada** rows baru |
| 4 | Cek saldo stok pakan dan telur | Tidak berubah dari sebelum import |

**Pass criteria:** Ledger bersih — zero-qty tidak masuk inventory_movements.

---

## TC-IS-04 — Validasi stok: pakan tidak mencukupi → seluruh batch ditolak

**Tujuan:** Kalau satu row bikin saldo pakan negatif, seluruh batch gagal (tidak ada partial import).

**Persiapan:**
- Catat saldo pakan saat ini: `saldo_pakan` (misal 50 kg)
- Siapkan CSV 2 baris: row 1 ambil 30 kg (OK), row 2 ambil 40 kg (melebihi sisa 20 kg):

```
<flock_id>,2026-02-10,0,0,,0,0,30
<flock_id>,2026-02-11,0,0,,0,0,40
```

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Upload CSV, klik **Pratinjau Data** | Halaman pratinjau muncul |
| 2 | Verifikasi ringkasan | **0 baris valid** — tombol Konfirmasi disabled |
| 3 | Verifikasi tabel error | Error pada baris row ke-2 |
| 4 | Verifikasi pesan error row 2 | Pesan mengandung: tanggal `2026-02-11`, nama item pakan, "tersedia", "dibutuhkan" |
| 5 | Verifikasi baris 1 tidak tersimpan | Cek DB `daily_records` — **tidak ada** row baru untuk `2026-02-10` |
| 6 | Cek saldo pakan | Tidak berubah |

**Pass criteria:** Batch ditolak seluruhnya, tidak ada partial import, pesan error informatif.

---

## TC-IS-05 — Pesan error stok mengandung informasi lengkap

**Tujuan:** Error message membantu user identify masalah — harus ada tanggal, nama item, saldo tersedia, qty dibutuhkan.

**Persiapan:** CSV 1 baris dengan qty pakan melebihi saldo:

```
<flock_id>,2026-03-15,0,0,,0,0,9999
```

*(Asumsi saldo pakan < 9999)*

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Upload CSV, klik **Pratinjau Data** | 0 baris valid, 1 error |
| 2 | Baca pesan error di tabel | Pesan mengandung `2026-03-15` (tanggal) |
| 3 | Verifikasi nama item | Pesan mengandung nama SKU pakan (bukan teks generik "stok pakan") |
| 4 | Verifikasi angka tersedia | Pesan mengandung angka saldo aktual pakan |
| 5 | Verifikasi angka dibutuhkan | Pesan mengandung `9999` |

**Pass criteria:** Format pesan: `"Baris N (YYYY-MM-DD): stok <NamaItem> tidak mencukupi (tersedia: X, dibutuhkan: Y)"`.

---

## TC-IS-06 — Validasi stok kumulatif (multi-row satu item)

**Tujuan:** Validasi balance bersifat running — row ke-N melihat sisa setelah row 1..N-1.

**Persiapan:**
- Saldo pakan aktual: `S` (misal 100 kg)
- CSV 3 baris, masing-masing ambil 40 kg (total 120 > 100):

```
<flock_id>,2026-04-01,0,0,,0,0,40
<flock_id>,2026-04-02,0,0,,0,0,40
<flock_id>,2026-04-03,0,0,,0,0,40
```

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Upload CSV, pratinjau | 0 baris valid |
| 2 | Verifikasi error | Error muncul pada **baris ke-3** (`2026-04-03`) bukan baris ke-1 |
| 3 | Pesan error baris ke-3 | `tersedia: 20, dibutuhkan: 40` (sisa 100-40-40=20) |
| 4 | Baris 1 dan 2 tidak tersimpan | Cek DB — tidak ada record baru untuk tanggal tersebut |

**Pass criteria:** Running balance bekerja benar, error report menunjuk ke baris yang tepat.

---

## TC-IS-07 — Vaksin: movement 'out' ter-insert dengan benar

**Tujuan:** Vaksin diperlakukan sama dengan pakan (movement 'out'), bukan seperti telur.

**Persiapan:**
- Farm punya item vaksin aktif dengan saldo > 0
- Catat saldo vaksin: `saldo_vaksin_awal`
- Download template — pastikan kolom `vaccine_<nama>_dosis` ada
- CSV 1 baris dengan vaksin > 0:

```
<flock_id>,2026-02-05,0,0,,0,0,0,10
```

*(Kolom terakhir = vaccine qty)*

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Upload, pratinjau, konfirmasi | "1 baris berhasil diimpor" |
| 2 | Cek DB `inventory_movements` filter `source = 'import'`, `source_type = 'daily_vaccine_records'` | 1 row baru |
| 3 | Verifikasi movement vaksin | `movement_type = 'out'`, `quantity = 10` |
| 4 | Cek saldo vaksin di halaman Stok | Turun sebesar 10 dari `saldo_vaksin_awal` |

**Pass criteria:** Vaksin dikurangi dari stok, bukan ditambah.

---

## TC-IS-08 — source_id movement linked ke daily_record yang benar

**Tujuan:** `source_id` di `inventory_movements` harus = `id` dari `daily_records` yang diimport.

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Jalankan TC-IS-01 | - |
| 2 | Ambil `id` dari `daily_records` row yang baru diimport | `dr_id` |
| 3 | Query `inventory_movements` WHERE `source_id = dr_id` | Rows ditemukan |
| 4 | Verifikasi semua movements untuk record ini punya `source_id = dr_id` | Benar |
| 5 | Verifikasi `source = 'import'` | Bukan `'production'` |

**Pass criteria:** Audit trail terhubung — movements bisa ditelusuri ke `daily_records` asalnya.

---

## TC-IS-09 — Duplikat import tidak membuat double movements

**Tujuan:** Unique constraint `daily_records_flock_date_idx` mencegah duplikat, movements tidak double.

**Prasyarat:** TC-IS-01 sudah dijalankan — record `2026-02-01` sudah ada.

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Upload CSV yang sama dengan TC-IS-01 (flock + tanggal sama) | - |
| 2 | Pratinjau → Konfirmasi | Error muncul: "Data untuk flock pada tanggal tersebut sudah ada" |
| 3 | Cek DB `inventory_movements` | Jumlah movements tidak bertambah (masih sama dengan setelah TC-IS-01) |
| 4 | Cek saldo stok | Tidak berubah dari setelah TC-IS-01 |

**Pass criteria:** Full rollback — tidak ada double movement, stok tidak double-counted.

---

## TC-IS-10 — Regresi: import Pelanggan tidak terpengaruh

**Tujuan:** Perubahan pada import Produksi Harian tidak merusak import Pelanggan.

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Pilih **Pelanggan** di `/admin/import` | - |
| 2 | Upload CSV pelanggan valid: `Toko Baru,retail,081234,Jl. Melati,3000000,14` | - |
| 3 | Pratinjau, konfirmasi | "1 baris berhasil diimpor" |
| 4 | Verifikasi halaman Pelanggan | Customer baru muncul, `is_imported = true` |
| 5 | Cek `inventory_movements` | **Tidak ada** row baru (import pelanggan tidak menyentuh inventory) |

**Pass criteria:** Import pelanggan berfungsi normal, tidak ada side effect ke inventory.

---

## Checklist Ringkasan

| TC | Deskripsi | Pass/Fail |
|----|-----------|-----------|
| TC-IS-01 | Inventory movements ter-insert (egg in, feed out) | ✅ PASS |
| TC-IS-02 | Flock population berubah setelah import deaths/culled | ✅ PASS |
| TC-IS-03 | Nilai 0 tidak menghasilkan movement | ✅ PASS |
| TC-IS-04 | Stok tidak cukup → seluruh batch ditolak | ✅ PASS |
| TC-IS-05 | Pesan error stok informatif (tanggal, nama, tersedia, dibutuhkan) | ✅ PASS |
| TC-IS-06 | Validasi stok kumulatif antar-row | ✅ PASS |
| TC-IS-07 | Vaksin movement type 'out' | ✅ PASS |
| TC-IS-08 | source_id movement linked ke daily_record | ✅ PASS (verified via source code) |
| TC-IS-09 | Duplikat ditolak, tidak double movement | ✅ PASS |
| TC-IS-10 | Regresi: import Pelanggan tidak terpengaruh | ✅ PASS |
