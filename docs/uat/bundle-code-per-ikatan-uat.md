# UAT: Bundle Code & Simpan Per-Ikatan

**Date:** 2026-05-15
**Feature:** v0.9.1 — Kode Ikatan Unik & Input Per-Ikatan untuk Telur Tray
**Branch:** `worktree-tray-bundle-egg-input`

---

## Test Environment

| Item | Value |
|------|-------|
| Base URL | `http://localhost:3000` |
| Migration | `0014_bundle_code.sql` applied to Supabase |
| Pre-req | Minimal 1 flock aktif dengan kandang assigned |
| Pre-req | Minimal 1 SKU Telur dengan `useTrayMethod = true` di Stok Katalog |
| Test Users | `admin@lumich.test` (admin), `supervisor@lumich.test` (supervisor), `operator@lumich.test` (operator) |

---

## Setup: Aktifkan Metode Tray

> Lakukan sekali sebelum semua test case di bawah.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login sebagai `admin@lumich.test` | Berhasil masuk |
| 2 | Buka `/admin/stok-katalog` | Halaman daftar SKU tampil |
| 3 | Cari SKU kategori Telur (misal: "Telur Utuh") | SKU ditemukan |
| 4 | Toggle "Metode Tray" → ON | Toggle berubah ke ON, tersimpan |
| 5 | Refresh halaman, cek toggle masih ON | Status persist |

---

## TC-01: Tampilan Tab Telur — Bundle Item Menampilkan Zona A & Zona B

**Pre-condition:** SKU Telur Utuh sudah aktif Metode Tray.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login sebagai `operator@lumich.test` | Berhasil |
| 2 | Buka `/produksi/input` | Halaman input tampil |
| 3 | Pilih flock aktif | Flock terpilih, populasi tampil di header |
| 4 | Pilih tanggal hari ini | Tanggal terisi |
| 5 | Klik tab **Telur** | Tab aktif berpindah ke Telur |
| 6 | Lihat item "Telur Utuh" | Menampilkan label **Tray** (badge biru) |
| 7 | Periksa area input | Tampil 3 field: **Nampan**, **Atas**, **Kg** (Zona A) |
| 8 | Periksa tombol | Tombol **+ Simpan Ikatan** tersedia |
| 9 | Periksa area di bawah Zona A | Zona B "Tersimpan hari ini" belum ada (kosong) |

**Pass/Fail:** ⬜

---

## TC-02: Simpan Ikatan Pertama — Kode 001 Diterima

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Di Tab Telur, isi **Nampan** = 15, **Atas** = 5, **Kg** = 9.20 | Input terisi |
| 2 | Preview butir terhitung: (15−1)×30 + 5 = **425** | Label "425 butir" tampil di bawah input |
| 3 | Klik **+ Simpan Ikatan** | Tombol loading "Menyimpan..." |
| 4 | Tunggu respons | Toast muncul di atas tab strip: **"Ikatan tersimpan: 150526-001"** (atau sesuai tanggal) |
| 5 | Toast menghilang setelah ~4 detik | Toast hilang otomatis |
| 6 | Zona A reset ke nilai default (Nampan=1, Atas=0, Kg=0) | Field kosong/default |
| 7 | Zona B muncul: "Tersimpan hari ini" | Row pertama: kode **150526-001**, 425 butir, 9.20 kg |

**Pass/Fail:** ⬜

---

## TC-03: Simpan Ikatan Kedua — Kode 002 (Sequence Berlanjut)

**Pre-condition:** TC-02 sudah selesai, ikatan 001 sudah tersimpan.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Isi Zona A: **Nampan** = 14, **Atas** = 0, **Kg** = 8.50 | Input terisi |
| 2 | Preview butir: (14−1)×30 + 0 = **390** | Label "390 butir" |
| 3 | Klik **+ Simpan Ikatan** | Loading... |
| 4 | Toast muncul | **"Ikatan tersimpan: 150526-002"** |
| 5 | Zona B sekarang punya 2 row | Row 1: 150526-001 · 425 butir; Row 2: 150526-002 · 390 butir |
| 6 | Total row di bawah Zona B | **815 butir · 17.70 kg** |

**Pass/Fail:** ⬜

---

## TC-04: Toast Tampil di Atas Tab Strip (Bukan Dalam Tab)

**Pre-condition:** Berada di Tab Telur.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Simpan satu ikatan | Toast muncul |
| 2 | Perhatikan posisi toast | Toast tampil **di atas tab strip**, bukan di dalam konten tab |
| 3 | Klik tab **Pakan** segera setelah simpan (dalam 4 detik) | Toast masih terlihat meski pindah tab |
| 4 | Kembali ke tab Telur | Zona B tetap menampilkan ikatan yang baru disimpan |

**Pass/Fail:** ⬜

---

## TC-05: Hapus Ikatan — Konfirmasi Dialog & Zona B Update

**Pre-condition:** Minimal 2 ikatan tersimpan.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Di Zona B, klik tombol **×** pada ikatan 150526-001 | Dialog konfirmasi muncul: "Hapus ikatan 150526-001? Kode ini sudah tidak bisa dipakai lagi." |
| 2 | Klik **Cancel** | Dialog tutup, ikatan tetap ada di Zona B |
| 3 | Klik **×** lagi pada ikatan yang sama | Dialog muncul kembali |
| 4 | Klik **OK** | Ikatan hilang dari Zona B |
| 5 | Zona B hanya tampilkan ikatan 150526-002 | Sequence tidak berubah (150526-001 tidak muncul lagi) |
| 6 | Total row update | Hanya hitungan ikatan 002 saja |

**Pass/Fail:** ⬜

---

## TC-06: Simpan Setelah Hapus — Sequence Tidak Reuse Kode Lama

**Pre-condition:** TC-05 selesai — ikatan 001 sudah dihapus, ikatan 002 masih ada.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Isi Zona A dengan data baru: Nampan=10, Atas=3, Kg=6.00 | Input terisi |
| 2 | Klik **+ Simpan Ikatan** | Loading... |
| 3 | Toast kode muncul | Kode adalah **150526-003** (bukan 001) |
| 4 | Zona B menampilkan 2 ikatan: 002 dan 003 | Sequence gap 001 dibiarkan kosong (intentional) |

**Pass/Fail:** ⬜

---

## TC-07: Multiple Sesi Panen — Sequence Berlanjut Antar Sesi

**Pre-condition:** Minimal 2 ikatan sudah tersimpan untuk flock+tanggal yang sama dari sesi sebelumnya.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Tutup browser / logout | Session habis |
| 2 | Login kembali sebagai operator | Berhasil |
| 3 | Buka `/produksi/input`, pilih flock dan tanggal yang sama | Tampil |
| 4 | Buka Tab Telur | Zona B langsung menampilkan ikatan dari sesi sebelumnya |
| 5 | Simpan ikatan baru | Kode melanjutkan dari sequence terakhir (misal: jika sudah ada 003, kode baru = **150526-004**) |

**Pass/Fail:** ⬜

---

## TC-08: Submit Form Utama — Ikatan Tidak Terkirim Ganda

**Pre-condition:** Minimal 1 ikatan tersimpan di Zona B. Tab Pakan dan Vaksin diisi.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Isi tab **Ayam**: deaths=0, culled=0 | Terisi |
| 2 | Isi tab **Pakan**: pilih item, isi jumlah | Terisi |
| 3 | Klik tombol **Simpan** (form utama) | Loading... |
| 4 | Redirect ke `/produksi` | Berhasil redirect |
| 5 | Buka record harian yang baru saja dibuat di `/produksi` | Detail record tampil |
| 6 | Cek data telur | Qty butir = total dari semua ikatan yang tersimpan (bukan double-count) |
| 7 | Cek data pakan | Tersimpan sesuai input |
| 8 | Cek `inventory_movements` (via Drizzle Studio atau Supabase SQL Editor) | Satu movement `in` per ikatan — bukan double insert |

**Pass/Fail:** ⬜

---

## TC-09: Non-Bundle Egg Items — Tidak Terpengaruh

**Pre-condition:** Ada SKU Telur tanpa Metode Tray aktif (misal: "Telur Pecah").

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Buka `/produksi/input`, Tab Telur | Tampil |
| 2 | Lihat item "Telur Pecah" | Tampil input biasa: **Butir** + **Kg** (bukan Zona A/B) |
| 3 | Isi Butir = 50, Kg = 3.00 | Input terisi |
| 4 | Submit form utama | Berhasil |
| 5 | Cek record — Telur Pecah tersimpan 50 butir | Data benar, tidak ada bundle row untuk item ini |

**Pass/Fail:** ⬜

---

## TC-10: Role Operator — Tidak Bisa Simpan Backdate > H+1

**Pre-condition:** Login sebagai `operator@lumich.test`.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Buka `/produksi/input` | Tampil |
| 2 | Set tanggal ke 3 hari lalu (H−3) | Field tanggal terisi |
| 3 | Isi Zona A, klik **+ Simpan Ikatan** | Error muncul (toast merah atau error message): "Tanggal tidak bisa diubah" atau sejenisnya |
| 4 | Ikatan tidak tersimpan di Zona B | Zona B tetap kosong |

**Pass/Fail:** ⬜

---

## TC-11: Role Supervisor — Bisa Backdate s/d H−7

**Pre-condition:** Login sebagai `supervisor@lumich.test`.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Buka `/produksi/input` | Tampil |
| 2 | Set tanggal ke H−5 (5 hari lalu) | Diizinkan (dalam batas H−7 supervisor) |
| 3 | Simpan ikatan | Berhasil, kode muncul |
| 4 | Set tanggal ke H−10 | Field tanggal mungkin dibatasi oleh `min` attribute |
| 5 | Paksa kirim via saveBundleAction (jika bisa bypass UI) | Error: periode terkunci |

**Pass/Fail:** ⬜

---

## TC-12: Format Kode Ikatan — Validasi Format DDMMYY-NNN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Simpan ikatan pada tanggal **2026-05-15** | Kode format: `150526-NNN` |
| 2 | Simpan ikatan pada tanggal **2026-01-09** (jika bisa pilih) | Kode format: `090126-NNN` (zero-padded hari dan bulan) |
| 3 | Sequence ke-10 pada hari yang sama | Kode: `150526-010` (3 digit, zero-padded) |
| 4 | Sequence ke-100 | Kode: `150526-100` |

**Pass/Fail:** ⬜

---

## TC-13: Hapus Ikatan — Inventory Movement Terhapus (Data Integrity)

**Pre-condition:** Minimal 1 ikatan tersimpan. Akses ke Supabase SQL Editor atau Drizzle Studio.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Catat `bundle_id` dari ikatan yang akan dihapus (via Supabase Table Editor) | ID tercatat |
| 2 | Query `inventory_movements` WHERE `source_id = <bundle_id>` | Satu row ditemukan dengan `quantity = qtyButir ikatan` |
| 3 | Hapus ikatan via UI (klik × → OK) | Ikatan hilang dari Zona B |
| 4 | Query `inventory_movements` WHERE `source_id = <bundle_id>` lagi | **0 rows** — movement ikut terhapus |
| 5 | Query `daily_egg_records` untuk record yang sama | `qty_butir` berkurang sebesar butir ikatan yang dihapus |

**Pass/Fail:** ⬜

---

## TC-14: Zona B Refresh Otomatis Setelah Ganti Flock/Tanggal

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Pilih Flock A, tanggal hari ini — Zona B tampilkan ikatan Flock A | Ikatan Flock A muncul |
| 2 | Ganti ke Flock B | Zona B **langsung update** — tampilkan ikatan Flock B (atau kosong jika belum ada) |
| 3 | Ganti tanggal ke kemarin | Zona B update lagi — ikatan kemarin dari Flock B muncul |

**Pass/Fail:** ⬜

---

## TC-15: Tombol Simpan Disabled Jika Flock/Tanggal Belum Dipilih

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Load `/produksi/input` — flock dan tanggal sudah auto-terisi default | Tombol aktif |
| 2 | Hapus nilai tanggal (clear field) | Tombol **+ Simpan Ikatan** menjadi disabled |
| 3 | Isi tanggal kembali | Tombol aktif kembali |

**Pass/Fail:** ⬜

---

## Ringkasan

| TC | Deskripsi | Status |
|----|-----------|--------|
| TC-01 | Tampilan Zona A & Zona B | ⬜ |
| TC-02 | Simpan ikatan pertama — kode 001 | ⬜ |
| TC-03 | Simpan ikatan kedua — kode 002 | ⬜ |
| TC-04 | Toast di atas tab strip | ⬜ |
| TC-05 | Hapus ikatan + konfirmasi | ⬜ |
| TC-06 | Sequence tidak reuse kode lama | ⬜ |
| TC-07 | Multiple sesi — sequence berlanjut | ⬜ |
| TC-08 | Submit form utama — tidak double-count | ⬜ |
| TC-09 | Non-bundle items tidak terpengaruh | ⬜ |
| TC-10 | Operator: backdate > H+1 ditolak | ⬜ |
| TC-11 | Supervisor: backdate s/d H−7 diizinkan | ⬜ |
| TC-12 | Format kode DDMMYY-NNN valid | ⬜ |
| TC-13 | Hapus ikatan: inventory movement ikut hapus | ⬜ |
| TC-14 | Zona B refresh saat ganti flock/tanggal | ⬜ |
| TC-15 | Tombol disabled jika flock/tanggal kosong | ⬜ |
