# UAT Test Cases — Phase 2: Production Core

**Sprint cakupan:** Sprint 2 (input produksi harian), Sprint 3 (inventory ledger + stok), Sprint 4 (dashboard KPI + charts)
**Versi PRD:** 1.8
**Tanggal:** 2026-04-22

---

## Setup Prasyarat

Sebelum menjalankan UAT, pastikan:
- Minimal 1 kandang (`coops`) aktif sudah dibuat Admin
- Minimal 1 flock aktif terikat ke kandang tersebut (`flocks.status = active`)
- Ada 3 akun user: `operator`, `supervisor`, `admin`
- Operator sudah diassign ke kandang via `user_coop_assignments`
- Sistem di-deploy atau dev server berjalan di `localhost:3000`

---

## Modul 1: Input Produksi Harian

### TC-P01 — Input Sukses Hari Ini (Operator)

**Role:** Operator  
**Precondition:** Login sebagai Operator; ada flock aktif di kandang yang diassign; belum ada record hari ini untuk flock tersebut

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Buka `/produksi/input` | Form tampil; dropdown Flock hanya menampilkan flock dari kandang yang diassign ke Operator ini |
| 2 | Pilih flock, biarkan tanggal = hari ini | Field tanggal terisi otomatis dengan tanggal hari ini |
| 3 | Isi semua field: Kematian=2, Sortir=0, Grade A=900, Grade B=50, Retak=10, Abnormal=5, Pakan=120, Bobot=0.065 | Field menerima input |
| 4 | Perhatikan section "Kalkulasi Otomatis" | Nilai update real-time: Depletion=2, Populasi Aktif=(initial_count-2), HDP%=((900+50)/populasi)×100, Pakan/ekor=(120/populasi)×1000 g, FCR=120/(950/12) |
| 5 | Klik "Simpan Data Produksi" | Loading state muncul "Menyimpan..." |
| 6 | Submit berhasil | Redirect ke `/produksi`; data hari ini muncul di tabel; tidak ada badge "Terlambat" |
| 7 | Cek `inventory_movements` di DB | Ada 2 baris baru: `movementType=IN, grade=A, quantity=900` dan `movementType=IN, grade=B, quantity=50`, keduanya `referenceType=daily_record` |
| 8 | Cek `sessionStorage` setelah submit | Key `daily-input-form` tidak ada (cleared on success) |

---

### TC-P02 — Duplicate Submit Diblokir

**Role:** Operator  
**Precondition:** Record untuk flock + tanggal hari ini sudah ada (submit dari TC-P01)

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Buka `/produksi/input`, pilih flock yang sama, tanggal sama | Form tampil normal |
| 2 | Isi field dengan nilai berbeda, klik "Simpan Data Produksi" | Error muncul: "Data untuk tanggal ini sudah ada" |
| 3 | Tidak ada redirect | Tetap di halaman form; data di form tidak hilang |
| 4 | Cek DB | Tidak ada record duplikat di `daily_records` |

---

### TC-P03 — Backdate Operator: H-1 Diizinkan

**Role:** Operator  
**Precondition:** Belum ada record kemarin untuk flock ini

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Buka `/produksi/input` | Field tanggal memiliki `min` = kemarin (H-1) |
| 2 | Ubah tanggal ke kemarin (H-1), isi semua field, submit | Berhasil; record tersimpan |
| 3 | Cek tabel di `/produksi` | Record kemarin tampil dengan badge "Terlambat" berwarna merah/oranye |
| 4 | Cek DB `daily_records` | `is_late_input = true` |

---

### TC-P04 — Backdate Operator: H-2 Diblokir

**Role:** Operator

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Buka `/produksi/input` | Field tanggal `min` = H-1; pilih tanggal H-2 tidak bisa via UI |
| 2 | Coba manipulasi manual via browser DevTools untuk submit H-2 | Backend mengembalikan error "Input hanya diizinkan sampai H-1 untuk role ini" |
| 3 | Tidak ada record tersimpan di DB | Konfirmasi via Supabase dashboard |

---

### TC-P05 — Backdate Supervisor: H-3 Diizinkan, H-4 Diblokir

**Role:** Supervisor

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Buka `/produksi/input`, ubah tanggal ke H-3 | Field menerima input (min = H-3 untuk Supervisor) |
| 2 | Submit | Berhasil; badge "Terlambat" muncul |
| 3 | Coba submit dengan tanggal H-4 via DevTools | Error: "Input hanya diizinkan sampai H-3 untuk role ini" |

---

### TC-P06 — Backdate Admin: Tidak Dibatasi

**Role:** Admin

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Buka `/produksi/input`, isi tanggal 1 tahun lalu | Field menerima input |
| 2 | Submit | Berhasil tersimpan; badge "Terlambat" muncul |

---

### TC-P07 — Validasi Nilai Negatif Diblokir

**Role:** Operator

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Coba isi field Kematian dengan nilai -1 | Field tidak menerima (HTML `min="0"`); atau pesan validasi muncul |
| 2 | Coba submit dengan Grade A = -100 via DevTools | Backend menolak; error "Input tidak valid" |

---

### TC-P08 — Session Expired: Data Form Tersimpan di sessionStorage

**Role:** Operator  
**Precondition:** Mulai mengisi form produksi

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Isi sebagian form (Grade A=500, Grade B=50) tanpa submit | Data tersimpan di `sessionStorage['daily-input-form']` |
| 2 | Simulasikan session expired (hapus cookie Supabase, refresh) | Redirect ke `/login` |
| 3 | Login ulang, buka `/produksi/input` | Form dimuat ulang dengan data yang tadi diisi (Grade A=500, Grade B=50 sudah terisi) |

---

### TC-P09 — Populasi Aktif Hari Pertama Flock

**Role:** Admin  
**Precondition:** Flock baru dibuat (belum ada `daily_records`); `initial_count = 5000`

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Buka `/produksi/input`, pilih flock baru tersebut | Dropdown menampilkan flock |
| 2 | Isi Kematian=10, Sortir=5, Grade A=3000 | Kalkulasi Otomatis: Populasi Aktif = 5000-10-5 = 4985 |
| 3 | HDP tampil | HDP = (3000/4985)×100 ≈ 60.2% |

---

### TC-P10 — Operator Tidak Bisa Lihat Flock Kandang Lain

**Role:** Operator (diassign ke Kandang A saja)  
**Precondition:** Ada Kandang A dan Kandang B; ada flock di keduanya

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Buka `/produksi/input` | Dropdown Flock hanya menampilkan flock dari Kandang A |
| 2 | Flock dari Kandang B tidak muncul | Konfirmasi tidak ada opsi untuk Kandang B |

---

## Modul 2: Inventory Ledger & Manajemen Stok

### TC-S01 — Stock Balance Update Setelah Input Produksi

**Precondition:** TC-P01 sudah dijalankan (Grade A=900, Grade B=50 sudah masuk)

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Buka `/stok` | Stok Grade A dan Grade B tampil |
| 2 | Verifikasi angka | Stok Grade A menambah 900; Stok Grade B menambah 50 dari baseline |
| 3 | Cek tabel riwayat mutasi | Dua baris dengan tipe `IN` muncul dengan referensi ke record produksi hari ini |

---

### TC-S02 — Stock Adjustment: Pengurangan Stok (Supervisor)

**Role:** Supervisor  
**Precondition:** Ada stok Grade A ≥ 100 butir

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Buka `/stok/sesuaikan` | Form adjustment tampil |
| 2 | Pilih Grade A, isi Jumlah = -30, Alasan = "Pecah di gudang" | Form menerima |
| 3 | Submit | Berhasil; stok Grade A berkurang 30 |
| 4 | Cek `inventory_movements` | Baris baru: `movementType=OUT, grade=A, quantity=30, referenceType=stock_adjustment` |
| 5 | Cek `/stok` | Stok Grade A berkurang 30 dari nilai sebelumnya |

---

### TC-S03 — Stock Adjustment: Pengurangan Melebihi Stok Diblokir

**Role:** Supervisor  
**Precondition:** Stok Grade B = 50 butir

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Buka `/stok/sesuaikan`, pilih Grade B, Jumlah = -100 | Form menerima input |
| 2 | Submit | Error: "Stok tidak mencukupi untuk operasi ini" |
| 3 | Cek DB | Tidak ada record baru di `stock_adjustments` atau `inventory_movements` |

---

### TC-S04 — Stock Adjustment: Operator Diblokir

**Role:** Operator

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Navigasi ke `/stok/sesuaikan` | Redirect atau error 403 / halaman tidak tersedia |
| 2 | Coba akses action via API langsung | Response: "Akses ditolak" |

---

### TC-S05 — Stock Adjustment: Penambahan Stok (Positif)

**Role:** Admin  
**Precondition:** Stok Grade B berapapun

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Buka `/stok/sesuaikan`, Grade B, Jumlah = +200, Alasan = "Tambah stok" | Form menerima |
| 2 | Submit | Berhasil; stok Grade B bertambah 200 |
| 3 | Cek `inventory_movements` | Baris baru: `movementType=IN, grade=B, quantity=200` |

---

### TC-S06 — Submit Regrade Request (Supervisor)

**Role:** Supervisor  
**Precondition:** Stok Grade A ≥ 300 butir

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Buka `/stok/regrade`, isi: Grade Asal=A, Grade Tujuan=B (auto-fill), Jumlah=100, Alasan="Salah sortir" | Grade Tujuan otomatis terisi B (kebalikan A) |
| 2 | Submit | Request tersimpan dengan status `PENDING` |
| 3 | Cek `/stok` | Stok Grade A **belum berkurang** (pending belum approved) |
| 4 | Cek DB `regrade_requests` | Status = `PENDING`, `gradeFrom=A`, `gradeTo=B`, `quantity=100` |

---

### TC-S07 — Regrade Pending Memblokir Stok dari Penjualan

**Precondition:** Ada regrade request PENDING untuk Grade A sebanyak 100; stok Grade A = 150

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Cek stok tersedia untuk dijual di UI atau via query | Stok tersedia = 150 − 100 = 50 (bukan 150) |
| 2 | Coba submit sales order untuk Grade A qty > 50 (misal 80) | Error: "Stok tidak mencukupi" karena 100 sedang blocked |

---

### TC-S08 — Approve Regrade Request (Admin)

**Role:** Admin  
**Precondition:** Ada regrade request PENDING Grade A → Grade B qty=100; Stok A ≥ 100

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Buka `/stok/regrade`, lihat daftar pending | Request dari TC-S06 muncul |
| 2 | Klik approve pada request tersebut | Konfirmasi dialog muncul |
| 3 | Konfirmasi approve | Status berubah ke `APPROVED` |
| 4 | Cek `inventory_movements` | Dua baris baru dalam satu transaksi: `OUT grade=A qty=100` dan `IN grade=B qty=100`, keduanya `referenceType=regrade`, `referenceId` = regrade request ID yang sama |
| 5 | Cek stok | Stok Grade A berkurang 100; Stok Grade B bertambah 100 |

---

### TC-S09 — Reject Regrade Request (Admin)

**Role:** Admin  
**Precondition:** Ada regrade request PENDING Grade B → Grade A qty=50

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Buka `/stok/regrade/[id]` untuk request tersebut | Detail request tampil |
| 2 | Klik "Tolak" | Status berubah ke `REJECTED` |
| 3 | Cek `inventory_movements` | Tidak ada baris baru terkait request ini |
| 4 | Cek stok Grade B dan A | Tidak ada perubahan |

---

### TC-S10 — Regrade Grade Sama Diblokir

**Role:** Supervisor

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Buka `/stok/regrade`, pilih Grade Asal = A | Grade Tujuan otomatis = B (tidak bisa sama) |
| 2 | Coba manipulasi payload agar gradeFrom = gradeTo via DevTools | Backend menolak dengan error validasi |

---

### TC-S11 — Regrade Melebihi Stok Diblokir

**Role:** Supervisor  
**Precondition:** Stok Grade A = 80

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Submit regrade Grade A → B, qty = 200 | Error: "Stok tidak mencukupi" |
| 2 | Cek DB | Tidak ada regrade request tersimpan |

---

## Modul 3: Dashboard KPI

### TC-D01 — Dashboard Load & KPI Cards Tampil

**Role:** Semua role  
**Precondition:** Minimal ada 1 hari data produksi tersimpan

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Buka `/dashboard` | Halaman load < 3 detik |
| 2 | KPI Cards tampil | Semua 6 card ada: HDP%, FCR (7 hari), Total Produksi Hari Ini, Stok Siap Jual, Populasi Aktif, Pakan/Ekor |
| 3 | Semua card menampilkan angka atau label "Tidak ada data" | Tidak ada card kosong tanpa penjelasan |

---

### TC-D02 — KPI HDP%: Kalkulasi Benar

**Precondition:** Record hari ini: Grade A=900, Grade B=50, Populasi Aktif=5000

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Buka `/dashboard` | KPI Card "HDP% Hari Ini" |
| 2 | Verifikasi nilai | HDP = (900+50)/5000 × 100 = 19.0% (atau nilai yang sesuai dengan populasi aktif real) |

---

### TC-D03 — KPI FCR 7-Hari: Label Jika Data < 7 Hari

**Precondition:** Flock baru, baru ada 3 hari data

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Buka `/dashboard` | KPI Card FCR |
| 2 | Verifikasi label | Tampil label "(< 7 hari)" di samping nilai FCR |
| 3 | Nilai FCR = SUM(pakan 3 hari) / (SUM(Grade A+B 3 hari) / 12) | Perhitungan menggunakan data yang tersedia |

---

### TC-D04 — Grafik Tren HDP Tampil

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Buka `/dashboard` | Grafik line chart HDP tampil |
| 2 | Default filter = 7 hari | Data 7 hari terakhir ditampilkan |
| 3 | Klik filter "14 hari" | Grafik update ke 14 hari |
| 4 | Klik filter "30 hari" | Grafik update ke 30 hari |
| 5 | Klik filter "Custom" | Date picker muncul; setelah pilih range, grafik update |

---

### TC-D05 — Grafik Production Bar Chart: Grade A vs B

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Buka `/dashboard` | Bar chart total produksi per hari tampil |
| 2 | Setiap batang memiliki dua segmen | Grade A (warna berbeda) dan Grade B terlihat terpisah |
| 3 | Hover pada batang | Tooltip menampilkan nilai Grade A, Grade B, dan total |

---

### TC-D06 — Dashboard Filter per Kandang (Supervisor & Admin)

**Role:** Supervisor  
**Precondition:** Ada data dari 2 kandang berbeda

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Buka `/dashboard` | Secara default, data semua kandang diagregat |
| 2 | Pilih filter "Kandang A" | KPI dan grafik update hanya menampilkan data Kandang A |
| 3 | Pilih "Semua Kandang" | Kembali ke tampilan agregat |

---

### TC-D07 — Dashboard Operator: Hanya Kandang yang Diassign

**Role:** Operator (diassign ke Kandang A saja)

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Buka `/dashboard` | Hanya data dari Kandang A tampil |
| 2 | Dropdown filter kandang | Hanya Kandang A tersedia sebagai opsi |
| 3 | Tidak ada data Kandang B terlihat | Dikonfirmasi dari KPI dan grafik |

---

### TC-D08 — Tabel Data Harian di Dashboard

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Buka `/dashboard` | Tabel data harian tampil di bawah grafik |
| 2 | Verifikasi isi | Menampilkan 7 baris terakhir |
| 3 | Record dengan `is_late_input=true` | Badge "Terlambat" tampil di baris tersebut |

---

### TC-D09 — Empty State Saat Tidak Ada Data

**Precondition:** Flock baru dibuat, belum ada `daily_records`

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Buka `/dashboard` | Tidak ada error atau chart kosong tanpa keterangan |
| 2 | KPI Cards | Menampilkan "—" atau "Tidak ada data" (bukan 0 membingungkan atau NaN) |
| 3 | Grafik area | Empty state yang informatif (teks penjelasan, bukan chart blank) |

---

### TC-D10 — FCR Alert Threshold

**Precondition:** FCR 7-hari > 2.5 (threshold default)

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Buka `/dashboard` | KPI Card FCR menampilkan visual warning (warna merah atau ikon alert) |
| 2 | Nilai FCR jelas terbaca | Nilai numerik tetap tampil bersama indikator warning |

---

## Pengujian Lintas Modul

### TC-X01 — Alur Lengkap: Input → Stok → Dashboard

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Login sebagai Operator, submit input produksi: Grade A=1000, Grade B=100 | Berhasil; redirect ke `/produksi` |
| 2 | Buka `/stok` | Stok Grade A +1000, Grade B +100 dari baseline |
| 3 | Buka `/dashboard` | KPI "Stok Siap Jual" = Grade A + Grade B termasuk produksi baru |
| 4 | KPI "Total Produksi Hari Ini" | = 1000 + 100 + Pecah + Abnormal (semua jenis telur) |

---

### TC-X02 — Transaksi Atomik: Gagal Tengah Jalan Tidak Korupsi Data

**Precondition:** Dapat disimulasikan di dev environment dengan DB connection timeout

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Simulasikan kegagalan setelah insert `daily_records` tapi sebelum insert `inventory_movements` | Transaction rollback |
| 2 | Cek DB | Tidak ada baris di `daily_records` tanpa pasangan `inventory_movements`, dan sebaliknya |
| 3 | Stok balance | Tidak berubah; konsisten |

---

### TC-X03 — Approve Regrade: Dua Movement Satu Transaksi

| # | Langkah | Hasil yang Diharapkan |
|---|---------|----------------------|
| 1 | Approve regrade request Grade A → B qty=50 (dari TC-S08) | Berhasil |
| 2 | Cek `inventory_movements` | Tepat 2 baris dengan `referenceId` sama: OUT Grade A 50, IN Grade B 50 |
| 3 | Jika satu insert gagal (simulasi) | Kedua baris tidak tersimpan; status regrade tetap PENDING |

---

## Catatan Pengujian

- **Tools:** Browser DevTools untuk inspeksi request/response, Supabase Dashboard untuk verifikasi DB
- **Waktu:** Masing-masing test case diperkirakan 5–10 menit
- **Pelaporan bug:** Catat nomor TC, langkah bermasalah, hasil aktual vs ekspektasi, screenshot jika relevan
- **Rollback data:** Reset stok dan record produksi antara test case yang saling bergantung menggunakan Supabase SQL editor
