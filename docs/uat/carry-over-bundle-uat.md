# UAT: Carry-Over Bundle (Ikatan Sebagian Antar Hari)

**Date:** 2026-05-18
**Feature:** v0.9.2 — Carry-Over Bundle
**Branch:** `worktree-carry-over-bundle`
**Migration:** `0015_bundle_carry_over.sql`

---

## Test Environment

| Item | Value |
|------|-------|
| Base URL | `http://localhost:3000` |
| Migration | `0015_bundle_carry_over.sql` applied ke semua farm schema |
| Pre-req | Minimal 1 flock aktif dengan kandang assigned |
| Pre-req | Minimal 1 SKU Telur dengan `useTrayMethod = true` di Stok Katalog |
| Test Users | `admin@lumich.test` (admin), `supervisor@lumich.test` (supervisor), `operator@lumich.test` (operator) |

---

## Setup: Aktifkan Target Ikatan pada SKU

> Lakukan sekali sebelum semua test case di bawah.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login sebagai `admin@lumich.test` | Berhasil masuk |
| 2 | Buka `/admin/stok-katalog` | Halaman daftar SKU tampil |
| 3 | Cari SKU kategori Telur yang sudah aktif Metode Tray (misal: "Telur Utuh") | SKU ditemukan |
| 4 | Isi kolom **Target Ikatan** dengan `15.00` kg | Input menerima nilai, tersimpan saat blur |
| 5 | Refresh halaman, cek nilai Target Ikatan | Nilai persist: `15.00` kg |
| 6 | Isi nilai `0` lalu blur | Nilai **tidak tersimpan** (invalid — harus > 0) |
| 7 | Kosongkan kolom Target Ikatan (hapus nilai) lalu blur | Tersimpan sebagai null (tidak ada target) |
| 8 | Isi kembali `15.00` sebelum lanjut | Target aktif kembali |

---

## TC-01: Simpan Ikatan Partial — Badge "Partial" Muncul di Zona B

**Pre-condition:** SKU Telur Utuh aktif Metode Tray, Target Ikatan = 15.00 kg.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login sebagai `operator@lumich.test` | Berhasil |
| 2 | Buka `/produksi/input`, pilih flock, pilih tanggal **hari ini (H)** | Tampil |
| 3 | Klik tab **Telur** | Tab aktif |
| 4 | Isi Zona A: Nampan = 15, Atas = 5, Kg = **9.00** (di bawah target 15.00) | Input terisi |
| 5 | Klik **+ Simpan Ikatan** | Loading... |
| 6 | Toast muncul | Toast sukses dengan kode ikatan |
| 7 | Zona B muncul dengan ikatan baru | Badge **"Partial"** berwarna kuning `(#fff3cd / #856404)` tampil di samping kode |
| 8 | Tombol **×** (hapus) di baris ikatan tersebut | Tombol aktif (tidak disabled) |

**Pass/Fail:** ⬜

---

## TC-02: Simpan Ikatan Penuh — Badge "Selesai" Muncul di Zona B

**Pre-condition:** SKU Telur Utuh aktif Metode Tray, Target Ikatan = 15.00 kg.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Isi Zona A: Nampan = 20, Atas = 0, Kg = **16.50** (melebihi target 15.00) | Input terisi |
| 2 | Klik **+ Simpan Ikatan** | Loading... |
| 3 | Zona B menampilkan ikatan baru | Badge **"Selesai"** berwarna hijau `(#d4edda / #155724)` |
| 4 | Tombol **×** pada ikatan ini | Tombol **disabled** (ikatan penuh tidak bisa dihapus) |

**Pass/Fail:** ⬜

---

## TC-03: Simpan Ikatan Tanpa Target — Selalu Badge "Selesai"

**Pre-condition:** Target Ikatan dikosongkan (null) untuk SKU Telur Utuh.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Di `/admin/stok-katalog`, kosongkan Target Ikatan untuk SKU Telur Utuh, blur | Tersimpan null |
| 2 | Buka `/produksi/input`, isi Zona A dengan nilai berapapun (misal: Kg = 5.00) | Input terisi |
| 3 | Klik **+ Simpan Ikatan** | Berhasil |
| 4 | Zona B | Badge **"Selesai"** (karena tanpa target, semua ikatan langsung dianggap closed) |
| 5 | Tombol **×** | **Disabled** |
| 6 | Kembalikan Target Ikatan ke `15.00` sebelum lanjut ke TC berikutnya | Tersimpan |

**Pass/Fail:** ⬜

---

## TC-04: Zona C Muncul Hari Berikutnya — Ikatan Partial Tampil

**Pre-condition:** TC-01 selesai — ada 1 ikatan partial tersimpan untuk flock pada tanggal H.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Tanpa logout, ganti tanggal di form ke **H+1** (besok) | Tanggal berubah |
| 2 | Klik tab **Telur** | Tab aktif |
| 3 | Lihat area bawah item "Telur Utuh" | Zona C muncul: kotak ungu dengan header **"Ikatan Belum Selesai dari Hari Sebelumnya"** |
| 4 | Periksa isi Zona C | Tampil 1 row: kode ikatan dari H, tanggal H dalam format DD/MM/YYYY, qty kg partial |
| 5 | Tombol **"Lengkapi"** tersedia di row tersebut | Tombol biru-ungu visible |

**Pass/Fail:** ⬜

---

## TC-05: Zona C Kosong Jika Buka Tanggal Lain (Bukan H+1 dari Partial)

**Pre-condition:** Ada ikatan partial di tanggal H.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Ganti tanggal ke **H+2** (2 hari setelah partial) | Tanggal berubah |
| 2 | Lihat area Telur Utuh | Zona C **tidak muncul** (tidak ada ikatan partial dari H+1) |
| 3 | Ganti tanggal ke **H−1** (sehari sebelum partial dibuat) | Tanggal berubah |
| 4 | Lihat area Telur Utuh | Zona C **tidak muncul** |
| 5 | Kembali ke **H+1** | Zona C muncul kembali |

**Pass/Fail:** ⬜

---

## TC-06: Lengkapi Ikatan — Happy Path

**Pre-condition:** TC-04 selesai — Zona C muncul di H+1 dengan 1 ikatan partial.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Di tanggal H+1, Tab Telur, klik **"Lengkapi"** pada ikatan partial di Zona C | Form input expand di bawah row |
| 2 | Periksa form yang muncul | Tampil 3 field: **Nampan**, **Atas**, **Kg** + tombol **"Simpan Kontribusi"** dan **"Batal"** |
| 3 | Isi Nampan = 10, Atas = 5, Kg = **6.50** | Input terisi. Preview butir: (10−1)×30 + 5 = **275** |
| 4 | Klik **"Simpan Kontribusi"** | Loading... |
| 5 | Toast sukses muncul | Pesan sukses tampil |
| 6 | Zona C | Row ikatan partial **hilang** dari Zona C |
| 7 | Zona B (ikatan hari ini) | Tidak ada tambahan row di Zona B (kontribusi tidak muncul sebagai ikatan baru) |

**Pass/Fail:** ⬜

---

## TC-07: Data Integrity — Inventory Movement Carry-Over

**Pre-condition:** TC-06 selesai. Akses ke Supabase SQL Editor.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Query `inventory_movements` WHERE `source_type = 'bundle_contributions'` | Satu row ditemukan untuk kontribusi H+1 |
| 2 | Cek kolom `movement_date` pada row tersebut | Sama dengan tanggal H+1 |
| 3 | Cek kolom `quantity` | Sama dengan `qtyButir` kontribusi (275 butir dari TC-06) |
| 4 | Query `bundle_contributions` WHERE `bundle_id = <id_ikatan_partial>` | Satu row ditemukan |
| 5 | Cek `qty_butir` dan `qty_kg` di `bundle_contributions` | 275 butir, 6.50 kg |
| 6 | Query `daily_egg_bundles` WHERE `id = <id_ikatan_partial>` | Row ditemukan |
| 7 | Cek kolom `is_open` | `false` (ikatan sudah ditutup) |
| 8 | Cek `qty_butir` dan `qty_kg` di `daily_egg_bundles` | Total dari H + H+1 (partial + kontribusi) |

**Pass/Fail:** ⬜

---

## TC-08: HDP Accuracy — Butir Masuk ke Hari yang Benar

**Pre-condition:** TC-06 selesai.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Buka `/laporan` atau lihat data `daily_egg_records` via SQL | — |
| 2 | Query `daily_egg_records` untuk tanggal H, flock yang sama | Ditemukan row untuk SKU Telur Utuh |
| 3 | Cek `qty_butir` di `daily_egg_records` untuk tanggal H | Sama dengan butir di ikatan partial H saja (misal: 425 butir dari TC-01) |
| 4 | Query `daily_egg_records` untuk tanggal H+1, flock yang sama | Ditemukan row untuk SKU Telur Utuh |
| 5 | Cek `qty_butir` di `daily_egg_records` untuk tanggal H+1 | Sama dengan butir kontribusi H+1 (275 butir dari TC-06) |
| 6 | Verifikasi: butir H dan H+1 tidak tercampur | HDP per hari akurat — setiap hari hanya mencatat produksi hari itu |

**Pass/Fail:** ⬜

---

## TC-09: Mutasi Stok — Label "Kontribusi Ikatan" di Laporan

**Pre-condition:** TC-06 selesai.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Buka `/laporan/stok/mutasi` | Halaman mutasi stok tampil |
| 2 | Set filter periode mencakup H dan H+1 | Filter terisi |
| 3 | Cari row untuk SKU Telur Utuh pada tanggal H | Ditemukan, kolom **Sumber** = "Produksi" |
| 4 | Cari row untuk SKU Telur Utuh pada tanggal H+1 | Ditemukan |
| 5 | Cek kolom **Sumber** pada row H+1 | Tampil **"Kontribusi Ikatan"** (bukan "Produksi") |

**Pass/Fail:** ⬜

---

## TC-10: Batal Lengkapi — Form Collapse, Tidak Ada Perubahan

**Pre-condition:** Ada ikatan partial di Zona C (reset ke kondisi sebelum TC-06 atau gunakan data baru).

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Klik **"Lengkapi"** pada ikatan partial di Zona C | Form expand |
| 2 | Isi sebagian data: Nampan = 5, Atas = 0, Kg = 3.00 | Input terisi |
| 3 | Klik **"Batal"** | Form collapse, kembali ke tampilan row ikatan |
| 4 | Cek Zona C | Ikatan partial masih ada (tidak terhapus) |
| 5 | Query `bundle_contributions` untuk bundle tersebut | **0 rows** — tidak ada data tersimpan |

**Pass/Fail:** ⬜

---

## TC-11: Validasi Input Kontribusi — Field Wajib

**Pre-condition:** Ada ikatan partial di Zona C, form expand.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Klik **"Lengkapi"** untuk expand form | Form muncul |
| 2 | Biarkan semua field default (Nampan=1, Atas=0, Kg=0) | — |
| 3 | Klik **"Simpan Kontribusi"** | Error muncul: Kg harus > 0 (atau validasi serupa) |
| 4 | Isi Kg = 6.50, biarkan Nampan = 0 | — |
| 5 | Klik **"Simpan Kontribusi"** | Error muncul: Nampan harus ≥ 1 |
| 6 | Isi Nampan = 10, Atas = 5, Kg = 6.50 | Input valid |
| 7 | Klik **"Simpan Kontribusi"** | Berhasil |

**Pass/Fail:** ⬜

---

## TC-12: Hapus Ikatan Partial — Diizinkan

**Pre-condition:** Ada ikatan partial (badge "Partial") di Zona B, belum ada kontribusi.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Di Zona B, lihat ikatan partial — badge kuning "Partial" | Visible |
| 2 | Tombol **×** pada ikatan partial tersebut | **Aktif** (tidak disabled) |
| 3 | Klik **×** → klik **OK** pada dialog konfirmasi | Ikatan terhapus dari Zona B |
| 4 | Query `daily_egg_bundles` untuk bundle tersebut | Row tidak ditemukan (atau soft-deleted) |
| 5 | Query `inventory_movements` untuk bundle tersebut | **0 rows** — movement ikut terhapus |

**Pass/Fail:** ⬜

---

## TC-13: Hapus Ikatan Closed — Disabled

**Pre-condition:** Ada ikatan closed (badge "Selesai") di Zona B — baik ikatan penuh maupun ikatan yang sudah dilengkapi kontribusinya.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Di Zona B, lihat ikatan dengan badge hijau "Selesai" | Visible |
| 2 | Cek tombol **×** pada ikatan tersebut | Tombol **disabled** (tidak bisa diklik) |
| 3 | Inspect element jika perlu — disabled attribute ada | Tombol `disabled` di HTML |

**Pass/Fail:** ⬜

---

## TC-14: Carry-Over Tidak Muncul Jika Buka Tanggal H (Hari Partial Dibuat)

**Pre-condition:** Ikatan partial dibuat pada tanggal H.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Pilih tanggal **H** (hari yang sama saat partial dibuat) | Tanggal terisi |
| 2 | Tab Telur — lihat item Telur Utuh | Zona C **tidak muncul** |
| 3 | Zona B | Ikatan partial muncul dengan badge "Partial" (bukan di Zona C) |

**Pass/Fail:** ⬜

---

## TC-15: Carry-Over dengan Multiple SKU Telur

**Pre-condition:** Ada 2 SKU dengan Metode Tray aktif dan Target Ikatan masing-masing (misal: "Telur Utuh" target 15kg, "Telur Grade A" target 10kg). Keduanya punya ikatan partial di tanggal H.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Buka form input tanggal H+1, Tab Telur | Tampil |
| 2 | Lihat area "Telur Utuh" | Zona C muncul dengan ikatan partial Telur Utuh |
| 3 | Lihat area "Telur Grade A" | Zona C muncul dengan ikatan partial Telur Grade A (terpisah per SKU) |
| 4 | Lengkapi kontribusi untuk Telur Utuh | Zona C Telur Utuh hilang, Telur Grade A masih ada |
| 5 | Lengkapi kontribusi untuk Telur Grade A | Semua Zona C hilang |

**Pass/Fail:** ⬜

---

## TC-16: Zona C Refresh Otomatis Saat Ganti Tanggal

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Di tanggal H+1, Zona C tampil dengan ikatan partial | Visible |
| 2 | Ganti tanggal ke H+2 | Zona C **hilang** (tidak ada partial dari H+1) |
| 3 | Ganti kembali ke H+1 | Zona C **muncul kembali** dengan ikatan partial |
| 4 | Ganti tanggal ke H (hari partial dibuat) | Zona C **tidak muncul** |

**Pass/Fail:** ⬜

---

## TC-17: Zona C Refresh Saat Ganti Flock

**Pre-condition:** Flock A punya ikatan partial di H. Flock B tidak punya.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Pilih Flock A, tanggal H+1 — Zona C tampil | Visible |
| 2 | Ganti ke Flock B | Zona C **hilang** (Flock B tidak punya partial) |
| 3 | Ganti kembali ke Flock A | Zona C **muncul kembali** |

**Pass/Fail:** ⬜

---

## TC-18: Lock Period — Operator Tidak Bisa Contribute ke H−2

**Pre-condition:** Ada ikatan partial di H−2 (2 hari lalu) untuk flock. Login sebagai `operator@lumich.test`.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Buka form input tanggal H−1 | Tanggal H−1 dipilih |
| 2 | Lihat Zona C — ikatan dari H−2 tampil atau tidak? | Zona C **tidak muncul** (filter hanya H−2 dari H−1 = tidak di-query) |
| 3 | Andaikan Zona C muncul — klik "Lengkapi", isi data, klik "Simpan Kontribusi" | Error: "Input hanya diizinkan sampai H-1 untuk role ini" |

**Pass/Fail:** ⬜

---

## Ringkasan

| TC | Deskripsi | Status |
|----|-----------|--------|
| Setup | Aktifkan Target Ikatan di Stok Katalog | ⬜ |
| TC-01 | Simpan ikatan partial — badge "Partial" | ⬜ |
| TC-02 | Simpan ikatan penuh — badge "Selesai", hapus disabled | ⬜ |
| TC-03 | Tanpa target — selalu "Selesai" | ⬜ |
| TC-04 | Zona C muncul H+1 dengan ikatan partial | ⬜ |
| TC-05 | Zona C kosong jika bukan H+1 dari partial | ⬜ |
| TC-06 | Lengkapi ikatan — happy path | ⬜ |
| TC-07 | Data integrity: inventory_movements + bundle_contributions | ⬜ |
| TC-08 | HDP accuracy: butir masuk ke hari yang benar | ⬜ |
| TC-09 | Laporan mutasi: label "Kontribusi Ikatan" | ⬜ |
| TC-10 | Batal lengkapi — tidak ada perubahan | ⬜ |
| TC-11 | Validasi input kontribusi | ⬜ |
| TC-12 | Hapus ikatan partial — diizinkan | ⬜ |
| TC-13 | Hapus ikatan closed — disabled | ⬜ |
| TC-14 | Zona C tidak muncul di hari partial dibuat | ⬜ |
| TC-15 | Carry-over dengan multiple SKU | ⬜ |
| TC-16 | Zona C refresh saat ganti tanggal | ⬜ |
| TC-17 | Zona C refresh saat ganti flock | ⬜ |
| TC-18 | Lock period: operator tidak bisa contribute ke H−2 | ⬜ |
