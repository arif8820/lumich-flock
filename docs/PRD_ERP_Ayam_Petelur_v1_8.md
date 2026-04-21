# Product Requirements Document (PRD)
## Modular ERP System — Ayam Petelur (Layer Farm)
**Versi:** 1.8
**Tanggal:** April 2026
**Status:** Draft

---

## Changelog

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | April 2026 | Initial draft |
| 1.1 | April 2026 | Update stack rekomendasi + alasan; tambah Customer Credit Management & Invoice di Modul Penjualan; klarifikasi Multi-farm vs Multi-kandang |
| 1.2 | April 2026 | Selaraskan kategori telur produksi→penjualan (Opsi A: sortir di kandang); tambah Stock Adjustment; FCR jadi KPI wajib + Berat Telur jadi field wajib; tambah tabel `inventory_movements`; aturan backdate input diperlonggar per role |
| 1.3 | April 2026 | Pisah `egg_sales` → `egg_sales` + `egg_sale_items` (multi-item per transaksi); tambah tabel `users` & `inventory_snapshots` ke skema DB; definisi batas umur fase produksi flock; tambah seksi mekanisme notifikasi; klarifikasi FCR 7-hari vs FCR kumulatif; tambah pertimbangan PPN di invoice; spec minimal import CSV |
| 1.4 | April 2026 | Tambah fitur Regrading (pindah grade antar kategori telur) di Stock Adjustment: dua adjustment terpisah dengan approval Admin, stok pending selama menunggu; tambah tabel `regrade_requests` di skema DB; update `inventory_movements` source type |
| 1.5 | April 2026 | Tambah seksi Data Consistency & Lock Period (6.5); tambah Role Permission Matrix (6.6); tambah business rules partial payment & overpayment di Credit Management (6.2.4); tetapkan unit standardization butir sebagai source of truth (6.2.1); perkuat spec Import CSV dengan preview & rollback (6.4); perluas NFR dengan performance strategy & disaster recovery (Seksi 9) |
| 1.6 | April 2026 | Tambah Authentication & Session Management (6.7); tambah field `notes` & `created_by` di tabel `customers`; tambah kolom `created_by`/`updated_by` di tabel `flocks` dan `egg_sales`; perjelas acceptance criteria Dashboard (6.1.2) dengan filter per kandang; tambah edge cases Penjualan (6.2.5); tambah acceptance criteria Invoice terkait WhatsApp & email; perjelas aturan backdate vs lock period di tabel 6.5.1; tambah definisi "Populasi Aktif Awal" untuk hari pertama flock; tambah sprint untuk Security & UAT di Timeline (Seksi 10); tambah metrik "Zero data breach" di Kriteria Sukses (Seksi 11); tambah risiko "Concurrent write conflict" di tabel Risiko (Seksi 12) |
| 1.8 | April 2026 | Sprint 1 design decisions: (1) Auth — hapus invite email flow, admin create+manage semua user via Supabase Service Role API langsung; (2) `flock_phases` dijadikan tabel DB yang configurable (bukan hardcode), dengan seed data default Starter/Grower/Layer/Late-layer; (3) Nav shell: bottom tab 4 item mobile + sidebar icon 48px desktop, tema Light; (4) UI language: Bahasa Indonesia; (5) Migrations: drizzle-kit generate + migrate (bukan db:push) untuk production audit trail; (6) Layer architecture strict: thin actions → services → queries (future-proof untuk native mobile); (7) Tambah tabel `flock_phases` ke schema Phase 1 |
| 1.7 | April 2026 | Pre-Sprint-1 gap analysis: tambah tabel `correction_records`, `coops`, `notification_reads`, `alert_cooldowns`, `sales_returns`, `sales_return_items`; rename `egg_sales`→`sales_orders` + `egg_sale_items`→`sales_order_items` (generalisasi `item_type`); tambah status flow SO (`draft/confirmed/fulfilled/cancelled`); tambah Sales Return + Credit Note via `invoices.type`; tambah field `type` di `invoices` (`sales_invoice/cash_receipt/credit_note`); tambah `source_type` di `inventory_movements`; update `customer_credits` (`source_type` + `source_invoice_id`); hapus `notifications.is_read` + `read_at`; `flocks.coop_name`→`coop_id FK`; `user_coop_assignments.coop_name`→`coop_id FK`; tambah `updated_at` semua tabel; PPN per-transaksi only; tambah opening stock balance import; `sessionStorage` untuk form draft; `alert_cooldowns` dedup mechanism; multi-coop Operator dashboard aggregated + filter; tambah `retired_at` di `flocks` |

---

## 1. Latar Belakang

Operasional farm ayam petelur saat ini banyak mengandalkan pencatatan manual di spreadsheet (Excel), yang rawan kesalahan, sulit diakses real-time, dan tidak terintegrasi antar bagian operasional. Dibutuhkan sistem ERP modular yang dimulai dari kebutuhan paling mendasar: pencatatan produksi harian, manajemen stok telur, dan tracking kondisi flock.

---

## 2. Tujuan Produk

- Mendigitalisasi pencatatan harian operasional kandang
- Menyediakan dashboard real-time untuk monitoring KPI produksi
- Membangun fondasi sistem modular yang dapat dikembangkan bertahap
- Mengurangi ketergantungan terhadap spreadsheet manual

---

## 3. Klarifikasi: Multi-Farm vs Multi-Kandang

> **Ini dua hal yang berbeda dan penting untuk dibedakan sejak awal.**

### Multi-Kandang (dalam scope MVP)
Satu lokasi farm yang memiliki beberapa kandang fisik. Misalnya: Farm Cianjur punya Kandang A, Kandang B, dan Kandang C. Setiap flock/batch terikat ke satu kandang.

> **Update v1.7:** Kandang dikelola via tabel master `coops` (bukan string `coop_name` langsung di `flocks`). Ini memastikan referential integrity — rename kandang tidak merusak assignment operator. Tabel `flocks` dan `user_coop_assignments` kini menggunakan `coop_id FK → coops`. Hanya Admin yang bisa tambah/edit kandang.

### Multi-Farm (roadmap v2.0)
Beberapa lokasi farm yang terpisah secara geografis, dikelola dalam satu sistem. Implikasi teknis jauh lebih kompleks: tenant isolation per lokasi, kemungkinan beda owner/operator, laporan konsolidasi lintas farm, dan manajemen akses per lokasi. Ini **bukan** sekadar menambah kandang baru.

---

## 4. Ruang Lingkup MVP

### ✅ Termasuk dalam MVP

| No | Modul | Prioritas |
|----|-------|-----------|
| 1 | Production Core (input & monitoring harian) | P0 |
| 2 | Inventory & Sales Telur (termasuk Stock Adjustment, Credit & Invoice) | P1 |
| 3 | Flock Management | P1 |

### ❌ Di Luar Scope MVP

- Modul HR / Payroll
- Modul Procurement / Pembelian
- Akuntansi & Laporan Keuangan lengkap
- Multi-farm / Multi-lokasi
- Role-based access control lanjutan
- Proses Grading terpisah di sistem (ditunda ke v1.1 — lihat 6.1.3)

---

## 5. Pengguna (User Persona)

### 5.1 Operator Kandang
- Input data harian (deplesi, produksi, pakan)
- Akses via mobile/tablet
- Kebutuhan: form input cepat & simpel

### 5.2 Supervisor / Manajer Farm
- Memantau KPI harian dan mingguan
- Approve late input (backdate H-3)
- Butuh dashboard agregat dan alert anomali

### 5.3 Admin / Owner
- Melihat rekap penjualan, stok, piutang, dan performa flock
- Generate dan approve invoice
- Bisa backdate input tanpa batas waktu
- Akses penuh ke semua modul

---

## 6. Spesifikasi Fitur

---

### 6.1 Modul 1: Production Core

#### 6.1.1 Input Harian Produksi

> **Keputusan desain (v1.2):** Kategori telur diselaraskan antara produksi dan penjualan. Operator melakukan sortir/grading di kandang sebelum input — tidak ada proses grading terpisah di sistem untuk MVP. Ini menyederhanakan alur tanpa kehilangan akurasi, dengan asumsi sortir dilakukan sebelum telur masuk gudang.

**Fields:**

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| Tanggal | Date | ✓ | Auto-fill hari ini |
| Kandang / Batch | Dropdown | ✓ | Pilih flock aktif |
| Jumlah Mati | Integer | ✓ | Ayam mati hari ini (boleh 0) |
| Jumlah Afkir | Integer | ✓ | Ayam diafkir hari ini (boleh 0) |
| Telur Grade A | Integer | ✓ | Butir telur kualitas terbaik |
| Telur Grade B | Integer | ✓ | Butir telur kualitas kedua |
| Telur Pecah/Retak | Integer | ✓ | Butir telur cacat (tidak masuk stok jual) |
| Telur Putih/Abnormal | Integer | ✓ | Butir telur abnormal (tidak masuk stok jual) |
| Berat Total Telur (kg) | Decimal | ✓ | **Wajib** — digunakan untuk kalkulasi FCR |
| Pakan Diberikan (kg) | Decimal | ✓ | Total pakan hari ini |

> **Catatan:** Telur Pecah dan Putih/Abnormal **tidak masuk stok siap jual** (`inventory_movements`). Hanya Grade A dan Grade B yang dibukukan sebagai stok masuk.

**Kalkulasi otomatis:**

| Kalkulasi | Formula |
|-----------|---------|
| Total Deplesi | Mati + Afkir |
| Populasi Aktif | Populasi kemarin − Total Deplesi |
| Total Produksi (butir) | Grade A + Grade B + Pecah + Putih |
| Stok Masuk ke Gudang | Grade A + Grade B |
| HDP % | (Total Produksi / Populasi Aktif) × 100 |
| Pakan per Ekor (gr) | (Pakan × 1000) / Populasi Aktif |
| **FCR** | **Total Pakan (kg) / Berat Total Telur (kg)** |

> **Catatan (v1.6): Populasi Aktif Hari Pertama.** Untuk hari pertama input setelah chick-in, "Populasi kemarin" diambil dari field `initial_count` di tabel `flocks`. Sistem secara otomatis menggunakan nilai ini jika belum ada `daily_records` sebelumnya untuk flock tersebut.

**Aturan Backdate Input:**

| Role | Batas Backdate | Keterangan |
|------|---------------|------------|
| Operator | H-1 | Dengan flag `is_late_input = true` |
| Supervisor | H-3 | Dengan flag `is_late_input = true` |
| Admin | Tidak dibatasi | Untuk koreksi data historis |

Setiap record menyimpan dua timestamp: `record_date` (tanggal data) dan `submitted_at` (waktu input aktual) untuk audit trail.

**Acceptance Criteria:**
- Input selesai dalam < 2 menit
- Validasi semua field wajib sebelum submit
- Operator tidak bisa submit untuk tanggal lebih dari H-1
- Late input tampil dengan badge berbeda di tabel data harian
- Submit otomatis membuat baris di `inventory_movements` (type: `in`, source: `production`)
- Pada input hari pertama flock, sistem otomatis mengisi "Populasi kemarin" dari `flocks.initial_count`

**Edge Cases & Error Handling (v1.5):**

| Kasus | Perilaku Sistem |
|-------|----------------|
| **Double submit** (submit 2x untuk flock + tanggal yang sama) | Sistem mendeteksi duplikat sebelum insert; tampilkan error "Data untuk [Flock X] tanggal [Y] sudah ada" — tidak membuat record baru |
| **Network putus saat submit** | Form menampilkan pesan error koneksi; data di form tidak hilang (tersimpan di local state); user bisa retry tanpa isi ulang |
| **Session expired saat mengisi form** | Data form disimpan sementara di browser; setelah re-login, form dimuat ulang dengan data yang tadi diisi |
| **Nilai negatif pada field Integer** | Validasi frontend + backend; field tidak menerima angka negatif |
| **Total deplesi > populasi aktif** | Validasi: tampilkan warning "Deplesi melebihi populasi aktif" dan blokir submit |

---

#### 6.1.2 Dashboard Produksi

| Widget | Deskripsi |
|--------|-----------|
| KPI Card: HDP % Hari Ini | Persentase produksi harian |
| KPI Card: FCR (7 hari terakhir) | Efisiensi pakan kumulatif 7 hari — lihat 6.1.4 untuk definisi |
| KPI Card: Total Produksi Hari Ini | Jumlah butir (Grade A + B + Cacat) |
| KPI Card: Stok Siap Jual | Grade A + Grade B tersedia di gudang |
| KPI Card: Populasi Aktif | Jumlah ayam saat ini |
| KPI Card: Pakan per Ekor | Gram/ekor hari ini |
| Grafik Tren HDP (7/14/30 hari) | Line chart |
| Grafik Tren FCR (7/14/30 hari) | Line chart — semakin rendah semakin baik |
| Grafik Total Produksi per Hari | Bar chart, Grade A vs Grade B |
| Grafik Deplesi Kumulatif | Area chart |
| Tabel Data Harian | 7 baris terakhir, termasuk flag late input |

**Acceptance Criteria:**
- Load < 3 detik
- Filter rentang waktu: 7 hari, 14 hari, 30 hari, custom
- Operator hanya melihat data kandang yang ditugaskan padanya (`user_coop_assignments`)
- Supervisor dan Admin bisa filter per kandang atau lihat semua kandang sekaligus
- Jika tidak ada data untuk rentang yang dipilih, tampilkan empty state yang informatif (bukan chart kosong tanpa keterangan)

---

#### 6.1.3 Catatan: Proses Grading (Post-MVP)

Untuk MVP, grading dilakukan manual oleh operator sebelum input. Jika ke depan farm membutuhkan jeda waktu antara panen dan grading (misalnya grading dilakukan esok hari), fitur **Grading Workflow** bisa ditambahkan di v1.1:

- Telur masuk dulu sebagai "Stok Belum Disortir"
- Proses grading mengkonversi ke Grade A / Grade B / Cacat
- Baru setelah grading telur masuk ke stok siap jual

---

#### 6.1.4 Klarifikasi FCR: 7-Hari vs Kumulatif

> **Dua metrik FCR digunakan di sistem ini dengan tujuan berbeda. Penting untuk tidak mencampuradukkan keduanya.**

| Metrik | Formula | Ditampilkan di | Kegunaan |
|--------|---------|---------------|----------|
| **FCR 7-Hari** | SUM(pakan 7 hari terakhir) / SUM(berat telur 7 hari terakhir) | Dashboard Produksi | Deteksi tren efisiensi pakan jangka pendek; sensitif terhadap perubahan pakan mendadak |
| **FCR Kumulatif** | SUM(pakan sejak chick-in) / SUM(berat telur sejak chick-in) | Halaman detail Flock | Evaluasi performa batch secara keseluruhan; relevan untuk keputusan afkir |

- Keduanya menggunakan satuan yang sama: **kg pakan / kg telur**
- FCR lebih rendah = lebih efisien
- Threshold alert default: FCR > 2.5 (configurable per farm)
- Jika data kurang dari 7 hari (flock baru), FCR 7-hari dihitung dari data yang tersedia dan diberi label "(< 7 hari)"

---

### 6.2 Modul 2: Inventory & Sales Telur

#### 6.2.1 Manajemen Stok Telur

**Logika stok (berbasis `inventory_movements`):**

```
Stok Real-time = SUM(quantity) dari tabel inventory_movements
                 di-filter per egg_category dan status = active
```

Stok tidak lagi dihitung on-the-fly dari join tabel produksi + penjualan. Setiap mutasi stok menghasilkan satu baris di `inventory_movements` (lihat Seksi 8 — Skema Database).

**Sumber mutasi stok:**

| Tipe | Source | Arah | Keterangan |
|------|--------|------|------------|
| `in` | `production` | + | Input harian produksi (Grade A + B) |
| `out` | `sale` | − | Penjualan telur |
| `adjustment` | `manual` | + / − | Penyesuaian stok manual |
| `adjustment` | `regrade` | − / + | Pindah grade (regrading) — hanya aktif setelah diapprove Admin |

**Unit Standardization (v1.5):**

> **Source of truth untuk stok adalah BUTIR.** Kilogram hanya digunakan sebagai estimasi tampilan — bukan untuk kalkulasi bisnis (penjualan, adjustment, regrading selalu dalam satuan butir).

| Konteks | Satuan | Keterangan |
|---------|--------|------------|
| Stok & transaksi | **Butir** | Source of truth; tidak boleh ada transaksi dalam kg |
| FCR | **Kg** | Kalkulasi efisiensi pakan — menggunakan `egg_weight_kg` dari input harian |
| Estimasi berat stok | **Kg** | `SUM(butir) × rata-rata berat/butir`; hanya untuk tampilan, bukan transaksi |

Rata-rata berat per butir dihitung otomatis dari data input harian: `SUM(egg_weight_kg) / SUM(Grade A + Grade B)` rolling 7 hari terakhir. Jika data < 7 hari, gunakan semua data yang tersedia.

**Tampilan stok:**

| Field | Keterangan |
|-------|------------|
| Stok Grade A (Butir) | |
| Stok Grade B (Butir) | |
| Total Stok Siap Jual | Grade A + Grade B |
| Estimasi Berat Stok (kg) | Estimasi saja — `total butir × avg berat/butir (7 hari)` |
| Riwayat Mutasi Stok | Log semua pergerakan masuk/keluar/adjustment |

---

#### 6.2.2 Stock Adjustment (Penyesuaian Stok)

Stock Adjustment mencakup dua jenis operasi yang berbeda: **Penyesuaian Biasa** dan **Regrading (Pindah Grade)**.

---

##### 6.2.2a Penyesuaian Stok Biasa

**Deskripsi:** Koreksi stok fisik gudang dengan sistem tanpa membuat transaksi penjualan fiktif. Contoh: telur pecah di gudang, busuk, konsumsi internal.

**Fields:**

| Field | Tipe | Keterangan |
|-------|------|------------|
| Tanggal | Date | |
| Kategori Telur | Dropdown | Grade A / Grade B |
| Jumlah | Integer | Positif (tambah) atau negatif (kurangi) |
| Alasan | Dropdown | Pecah di gudang / Busuk / Konsumsi internal / Sampling / Lainnya |
| Catatan | Text | Wajib jika alasan = Lainnya |
| Foto Bukti | Image upload | Opsional |

**Acceptance Criteria:**
- Hanya Supervisor dan Admin yang bisa membuat adjustment
- Langsung efektif saat disubmit — tidak perlu approval
- Setiap adjustment tercatat di `inventory_movements` (type: `adjustment`, source: `manual`)
- Ada log audit: siapa yang melakukan adjustment, kapan, berapa, alasan apa
- Tidak bisa adjustment lebih besar dari stok tersedia (stok tidak boleh minus)

---

##### 6.2.2b Regrading (Pindah Grade)

**Deskripsi:** Fitur untuk memindahkan telur dari satu grade ke grade lain (Grade A → Grade B atau sebaliknya). Kasus penggunaan umum: telur Grade A yang ditemukan cacat minor saat pengecekan ulang di gudang, atau Grade B yang ternyata memenuhi standar Grade A.

**Alur Regrading:**

```
Supervisor/Admin submit regrade request
        ↓
Status: PENDING
(Stok belum berubah, telur "diblokir" dari transaksi lain)
        ↓
Admin review & approve / reject
        ↓
   [Approved]                    [Rejected]
       ↓                              ↓
Dua inventory_movements          Request ditutup,
dibuat secara berurutan:         tidak ada perubahan stok
  1. OUT dari grade asal
  2. IN  ke grade tujuan
```

**Fields Form Regrading:**

| Field | Tipe | Keterangan |
|-------|------|------------|
| Tanggal | Date | Tanggal kejadian regrading |
| Grade Asal | Dropdown | Grade A / Grade B |
| Grade Tujuan | Auto-fill | Kebalikan dari Grade Asal (tidak bisa sama) |
| Jumlah (Butir) | Integer | Positif; tidak boleh melebihi stok grade asal |
| Alasan | Dropdown | Cacat minor terdeteksi / Salah sortir / Pengecekan ulang / Lainnya |
| Catatan | Text | Wajib jika alasan = Lainnya |
| Foto Bukti | Image upload | Opsional |

**Status Regrade Request:**

| Status | Keterangan |
|--------|------------|
| `pending` | Disubmit, menunggu review Admin |
| `approved` | Disetujui Admin; dua movement dibuat, stok berubah |
| `rejected` | Ditolak Admin; stok tidak berubah, request ditutup |

**Aturan Approval:**

| Submitter | Approver |
|-----------|----------|
| Supervisor | Admin saja |
| Admin | Langsung approved (self-approve) |

> **Catatan:** Admin bisa self-approve karena diasumsikan memiliki otoritas penuh. Jika ke depan dibutuhkan four-eyes principle untuk Admin, ini bisa dikonfigurasi di v2.0.

**Perilaku Stok Selama Pending:**

- Stok Grade asal **belum berkurang** — tidak ada perubahan di `inventory_movements`
- Sistem **memblokir** jumlah telur yang sedang pending dari transaksi penjualan baru
  - Formula stok tersedia untuk jual: `Stok real-time − SUM(quantity pending regrade dari grade ini)`
- Jika stok grade asal turun di bawah jumlah pending (akibat penjualan lain yang diapprove lebih dulu), sistem memberikan **warning** kepada Admin saat review — bukan auto-reject

**Acceptance Criteria:**
- Hanya Supervisor dan Admin yang bisa submit regrade request
- Grade asal dan grade tujuan tidak boleh sama
- Jumlah tidak boleh melebihi stok tersedia (real-time minus pending lain dari grade yang sama)
- Selama pending, jumlah tersebut tidak bisa dijual
- Saat approved: dua baris `inventory_movements` dibuat (source: `regrade`), dengan referensi ke `regrade_requests.id` yang sama
- Saat rejected: tidak ada baris `inventory_movements` yang dibuat
- Semua perubahan status tercatat di log audit (siapa yang approve/reject, kapan, catatan opsional)
- Admin menerima notifikasi in-app saat ada regrade request baru yang perlu di-review

---

#### 6.2.3 Customer Management

| Field | Tipe | Keterangan |
|-------|------|------------|
| Nama Pelanggan | Text | |
| Tipe Pelanggan | Enum | Retail / Agen / Distributor |
| Nomor Telepon | Text | |
| Alamat | Text | |
| Credit Limit (Rp) | Decimal | Batas piutang maksimal, 0 = cash only |
| Payment Terms (hari) | Integer | Jatuh tempo pembayaran, contoh: 7 / 14 / 30 |
| Status | Enum | Aktif / Non-aktif / Diblokir |
| Catatan | Text | Opsional |
| Dibuat oleh | FK → users | Audit trail — siapa yang menambahkan pelanggan ini |

> **Catatan (v1.6):** Field `created_by` ditambahkan untuk audit trail. Ini penting karena hanya Admin yang bisa menambah pelanggan — perlu tercatat siapa Admin yang menambahkan.

---

#### 6.2.4 Customer Credit Management

**Konsep:**
```
Sisa Credit Limit = Credit Limit − Total Piutang Belum Lunas
```

| Fitur | Deskripsi |
|-------|-----------|
| Saldo Piutang Real-time | Total tagihan belum dibayar per pelanggan |
| Riwayat Transaksi Kredit | Daftar invoice kredit + status pembayaran |
| Pencatatan Pembayaran | Input pelunasan penuh atau sebagian |
| Aging Report | Rekap piutang: 0–7 hr / 8–14 hr / 15–30 hr / > 30 hr |
| Alert Overdue | Notifikasi invoice melewati jatuh tempo |
| Blokir Otomatis | Pelanggan diblokir jika ada invoice > 30 hari belum dibayar (configurable) |

**Status Invoice:**

| Status | Keterangan |
|--------|------------|
| Draft | Dibuat, belum dikirim |
| Sent | Sudah dikirim ke pelanggan |
| Partial | Dibayar sebagian |
| Paid | Lunas |
| Overdue | Melewati jatuh tempo, belum lunas |
| Cancelled | Dibatalkan |

**Aturan Partial Payment & Alokasi Pembayaran (v1.5):**

Ketika pelanggan membayar dan memiliki lebih dari satu invoice outstanding, sistem menggunakan aturan alokasi berikut:

| Kondisi | Aturan Default | Bisa Diubah? |
|---------|---------------|--------------|
| Pelanggan bayar sebagian | Alokasikan ke invoice **terlama (oldest-first)** | Admin bisa pilih invoice manual |
| Pembayaran pas dengan satu invoice | Langsung lunaskan invoice tersebut | — |
| Overpayment (bayar lebih dari total tagihan) | Selisih disimpan sebagai **kredit pelanggan** | Admin bisa pilih: refund atau simpan |

**Kredit Pelanggan (Overpayment):**
```
Saldo Kredit = SUM(overpayment) − SUM(kredit yang sudah digunakan)
```
- Kredit pelanggan bisa digunakan untuk melunasi invoice berikutnya
- Ditampilkan di halaman detail pelanggan sebagai "Kredit Tersedia"
- Tidak ada expired — kredit berlaku selama pelanggan aktif

**Aturan Pembulatan (Rounding):**
- Semua kalkulasi moneter menggunakan **2 desimal (sen)**
- Tampilan dibulatkan ke Rp terdekat (floor untuk tagihan, ceil untuk kredit kembali)
- Selisih pembulatan < Rp 1 diabaikan dan tidak membuat status invoice tetap "Partial"

**Apply Customer Credit ke Invoice (v1.7):**

Jika `customer.available_credit > 0`, halaman detail invoice menampilkan section "Gunakan Kredit".

Alur:
1. Admin klik "Gunakan Kredit" → modal muncul
2. Modal menampilkan list semua `customer_credits` yang masih open (FIFO display, terlama di atas)
3. Admin input amount per entry (partial allowed; validasi: amount ≤ available balance entry tersebut)
4. Confirm → sistem buat `payments` row per entry yang diapply (`method: credit`) + update `customer_credits.used_amount`
5. `invoice.paid_amount` diperbarui → status invoice = `paid` atau `partial`

Edge cases:
- Beberapa credit entry → FIFO display, Admin bebas pilih amount per entry
- Credit entry > sisa tagihan invoice → Admin input partial; surplus tetap di balance
- Credit dan cash bisa dikombinasikan dalam satu invoice (credit cover sebagian, cash sisanya)

**Acceptance Criteria:**
- Sistem memblokir transaksi baru jika credit limit terlampaui
- Alert muncul H+1 setelah jatuh tempo (configurable)
- Admin bisa override blokir dengan alasan yang tercatat di log audit
- Export aging report ke CSV / Excel
- Alokasi pembayaran oldest-first berjalan otomatis; Admin bisa override pilih invoice
- Overpayment otomatis masuk saldo kredit pelanggan; Admin mendapat notifikasi
- Saldo kredit pelanggan tampil real-time di halaman detail pelanggan
- Tombol "Gunakan Kredit" hanya muncul jika `available_credit > 0`
- Setiap penggunaan kredit tercatat di `payments` dengan `method: credit` dan referensi ke `customer_credits.id`

---

#### 6.2.5 Sales Order

> **Perubahan v1.7:** `egg_sales` + `egg_sale_items` diganti dengan `sales_orders` + `sales_order_items`. Sales Order bersifat general — bisa digunakan untuk penjualan telur, flock, maupun item lain. Ditambahkan status flow eksplisit dan mekanisme Sales Return.

**Status Flow:**

```
draft ──→ confirmed ──→ fulfilled (terminal)
  │            │              └─ auto: inventory OUT + invoice
  └─ [delete]  └─ cancelled (terminal)
```

| Status | Keterangan |
|--------|------------|
| `draft` | Bisa diedit dan dihapus |
| `confirmed` | Tidak bisa dihapus; bisa dibatalkan (→ `cancelled`) |
| `fulfilled` | Inventory OUT + invoice auto-terbentuk dalam satu DB transaction; tidak bisa dibatalkan |
| `cancelled` | Terminal; tidak ada perubahan inventory |

**Header Sales Order:**

| Field | Tipe | Keterangan |
|-------|------|------------|
| Nomor SO | Auto-gen | `SO-YYYYMM-XXXX` |
| Tanggal | Date | |
| Pelanggan | Dropdown | Pilih dari master customer |
| Metode Pembayaran | Enum | Cash / Kredit |
| Catatan | Text | Opsional |

**Item SO (bisa lebih dari 1 baris):**

| Field | Tipe | Keterangan |
|-------|------|------------|
| Tipe Item | Dropdown | `egg_grade_a` / `egg_grade_b` / `flock` / `other` |
| Referensi | FK | Pilih flock jika tipe = `flock`; kosong untuk lainnya |
| Deskripsi | Text | Wajib jika tipe = `other`; opsional override untuk tipe lain |
| Jumlah | Integer | |
| Satuan | Enum | `butir` / `ekor` / `unit` |
| Harga per Satuan (Rp) | Decimal | |
| Diskon (%) | Decimal | Opsional |
| Subtotal | Auto-kalkulasi | Jumlah × Harga × (1 − Diskon%) |

**Total:**

| Field | Keterangan |
|-------|------------|
| Subtotal sebelum PPN | SUM semua item subtotal |
| PPN (%) | Default 0%; bisa diaktifkan per transaksi jika farm PKP |
| Total Tagihan | Subtotal + PPN |

**Logika saat Fulfilled:**
- `inventory_movements OUT` dibuat per item (`source_type: sales_order_items`)
- Jika `item_type = flock`: `flocks.status` → `sold`, `flocks.retired_at` di-set; tidak ada inventory movement telur
- Jika metode = **Cash**: invoice type = `cash_receipt`, status = `paid` langsung
- Jika metode = **Kredit**: invoice type = `sales_invoice`, status = `sent`; masuk piutang pelanggan
- Validasi stok: jumlah jual per kategori ≤ stok tersedia (real-time minus pending regrade)
- Validasi credit: sisa credit limit ≥ total tagihan (untuk kredit)
- Semua di atas dalam **satu DB transaction**

**Edge Cases & Error Handling:**

| Kasus | Perilaku Sistem |
|-------|----------------|
| **Pelanggan berstatus Diblokir dipilih** | Warning + blokir submit; Admin bisa override dengan alasan |
| **Stok tidak cukup saat fulfill** (race condition) | Backend row-level lock saat insert; jika stok tidak cukup → transaksi dibatalkan, pesan error "Stok tidak mencukupi saat transaksi diproses" |
| **Semua item dihapus** | Submit di-disable jika tidak ada item |
| **Harga per satuan = 0** | Konfirmasi "Harga Rp 0, apakah ini benar?" sebelum submit |

---

#### 6.2.5a Sales Return

Sales Return diajukan setelah SO berstatus `fulfilled`. Pembatalan langsung tidak tersedia post-fulfilled.

**Alur:**

```
Supervisor/Admin submit sales return (referensi SO yang fulfilled)
        ↓
Status: PENDING
        ↓
Admin approve / reject
        ↓
   [Approved]                         [Rejected]
       ↓                                   ↓
inventory_movements IN per item      Tidak ada perubahan
credit_note invoice auto-terbentuk   Return ditutup
customer_credits auto-terbentuk
```

**Form Sales Return:**

| Field | Tipe | Keterangan |
|-------|------|------------|
| Sales Order | Dropdown | Pilih SO yang fulfilled |
| Tanggal Return | Date | |
| Tipe Alasan | Dropdown | `wrong_grade` / `damaged` / `quantity_error` / `other` |
| Item Return | Multi-row | item_type + quantity (tidak boleh melebihi quantity di SO) |
| Catatan | Text | Wajib jika alasan = `other` |

**Credit Note:**
- Credit note = invoice bertipe `credit_note`, `total_amount` bernilai negatif
- Nomor auto-gen: `CN-YYYYMM-XXXX`
- Referensi ke invoice asli via `reference_invoice_id`
- Tidak perlu approval terpisah — auto-terbentuk saat return approved
- Credit note otomatis menambah saldo `customer_credits` pelanggan

**Acceptance Criteria:**
- Hanya Supervisor dan Admin yang bisa submit sales return
- Return item quantity tidak boleh melebihi quantity di SO asli
- Saat approved: satu DB transaction — `inventory_movements IN` + credit_note invoice + customer_credits
- Saat rejected: tidak ada perubahan apapun
- Semua perubahan status tercatat di log audit

---

#### 6.2.6 Generate Invoice

> **Update v1.7:** Invoice kini memiliki field `type`. Invoice terbentuk otomatis saat SO status → `fulfilled` (bukan saat submit transaksi). Cash SO → invoice type `cash_receipt` langsung `paid`. Credit SO → invoice type `sales_invoice`. Sales Return approved → invoice type `credit_note` (nilai negatif, referensi ke invoice asli).

**Tipe Invoice:**

| Tipe | Prefix Nomor | Status Awal | Keterangan |
|------|-------------|-------------|------------|
| `sales_invoice` | `INV-` | `sent` | SO kredit yang fulfilled |
| `cash_receipt` | `RCP-` | `paid` | SO cash yang fulfilled |
| `credit_note` | `CN-` | `sent` | Auto-terbentuk saat sales return approved |

**Komponen Invoice:**

| Komponen | Keterangan |
|----------|------------|
| Nomor Invoice | Auto-generate sesuai prefix tipe: `INV-YYYYMM-XXXX` / `RCP-YYYYMM-XXXX` / `CN-YYYYMM-XXXX` |
| Tipe | `sales_invoice` / `cash_receipt` / `credit_note` |
| Tanggal Invoice | Tanggal transaksi |
| Jatuh Tempo | Tanggal Invoice + Payment Terms pelanggan |
| Data Farm (Header) | Nama farm, alamat, nomor telepon |
| Data Pelanggan | Nama, alamat |
| Detail Produk | Kategori telur, jumlah, harga satuan, diskon, subtotal per item |
| Subtotal | SUM semua item |
| PPN | Jika diaktifkan |
| Total Tagihan | |
| Status Pembayaran | Paid / Unpaid / Partial |
| Catatan / Syarat Pembayaran | Opsional |

> **Catatan PPN (v1.3):** Untuk MVP, PPN default = 0% (tidak dikenakan). Farm yang sudah berstatus PKP (Pengusaha Kena Pajak) bisa mengaktifkan PPN 11% di pengaturan. Ini memengaruhi total tagihan dan tampilan invoice (baris PPN ditampilkan secara eksplisit). Pelaporan pajak formal berada di luar scope MVP.

**Fitur Invoice:**

| Fitur | Deskripsi |
|-------|-----------|
| Generate PDF | Render ke PDF, bisa diunduh |
| Kirim via WhatsApp | Share link PDF ke nomor WA pelanggan |
| Kirim via Email | Opsional |
| Cetak | Print-friendly layout |
| Duplikat Invoice | Copy invoice lama sebagai template |

**Acceptance Criteria:**
- PDF tergenerate dalam < 5 detik
- Invoice bisa dibuka di mobile tanpa distorsi
- Setiap perubahan status pembayaran otomatis tercatat di riwayat
- Tombol "Kirim via WhatsApp" membuka WA Web/App dengan pesan siap kirim yang menyertakan nomor invoice, total tagihan, dan link PDF; nomor WA otomatis diisi dari data pelanggan
- Jika fitur email diaktifkan, email harus menyertakan PDF invoice sebagai attachment (bukan hanya link)

---

### 6.3 Modul 3: Flock Management

#### 6.3.1 Data Batch / Flock

| Field | Tipe | Keterangan |
|-------|------|------------|
| Nama Batch | Text | Contoh: "Batch A - Feb 2026" |
| Tanggal Chick-in | Date | |
| Strain / Ras | Text | Lohmann Brown, ISA Brown, dll |
| Jumlah Awal (DOC) | Integer | |
| Kandang | Text | Nomor atau nama kandang |
| Status | Enum | Aktif / Selesai / Dijual |
| Target Umur Afkir | Integer (minggu) | |
| Catatan | Text | |

**Kalkulasi otomatis:**

| Kalkulasi | Formula |
|-----------|---------|
| Umur Flock (Hari) | Tanggal Hari Ini − Tanggal Chick-in |
| Umur Flock (Minggu) | Hari / 7 |
| Fase Produksi | Lihat tabel di bawah |
| % Survival Rate | (Populasi Aktif / Jumlah Awal) × 100 |
| FCR Kumulatif | Total Pakan s.d. hari ini / Total Berat Telur s.d. hari ini |

**Definisi Fase Produksi (v1.3):**

> Fase ditentukan otomatis berdasarkan umur flock dalam minggu. Threshold ini mengikuti standar industri ayam petelur komersial (strain Lohmann Brown / ISA Brown) dan bisa dikonfigurasi per strain jika diperlukan.

| Fase | Rentang Umur | Keterangan |
|------|-------------|------------|
| Rearing | 0 – 17 minggu | Fase pertumbuhan, belum bertelur |
| Pre-lay | 18 – 20 minggu | Mulai muncul telur pertama |
| Early Lay | 21 – 30 minggu | Produksi meningkat menuju puncak |
| Peak Lay | 31 – 50 minggu | HDP ≥ 85%, performa optimal |
| Late Lay | > 50 minggu | Produksi mulai menurun, persiapan afkir |

- Fase ditampilkan sebagai badge berwarna di kartu flock dan tabel
- Alert dikirim saat flock memasuki fase baru (lihat 6.3.2)

---

#### 6.3.2 Alert & Notifikasi Fase

| Kondisi | Alert | Cooldown |
|---------|-------|----------|
| Umur mencapai 18 minggu | "Flock [X] memasuki fase pre-lay" | 1x per fase |
| HDP turun > 5% dari hari sebelumnya | "Penurunan produksi signifikan di [Kandang X]" | 24 jam |
| Deplesi harian > 0.5% populasi | "Deplesi di atas batas normal di [Kandang X]" | 24 jam |
| FCR > threshold (configurable, default: 2.5) | "FCR [Kandang X] di atas standar" | 24 jam |
| Stok telur > threshold max | "Stok menumpuk, dorong penjualan" | 24 jam |
| Invoice overdue | "Piutang [Pelanggan X] melewati jatuh tempo" | Tidak ada (eskalasi harian) |

> **Deduplication (v1.7):** Alert ditrack via tabel `alert_cooldowns` (`alert_type`, `entity_id`, `last_sent_at`). Sebelum membuat notification, sistem cek apakah alert yang sama untuk entity yang sama sudah dikirim dalam window cooldown-nya. Jika sudah → skip. `overdue_invoice` tidak punya cooldown (eskalasi setiap hari sampai dibayar).

> **Trigger mechanism (v1.7):** Alert dicek oleh Supabase `pg_cron` yang berjalan setiap hari pukul 06.00 waktu lokal farm. Fungsi terjadwal ini memeriksa semua kondisi alert, membuat `notifications`, dan memperbarui `alert_cooldowns`.

---

#### 6.3.3 Mekanisme Pengiriman Notifikasi (v1.3)

> **Clarifikasi:** Seksi ini mendefinisikan *bagaimana* alert dikirimkan, bukan hanya kondisi pemicunya.

**Channel notifikasi yang didukung di MVP:**

| Channel | Deskripsi | Target Role |
|---------|-----------|-------------|
| **In-app notification** | Bell icon di navbar; ditampilkan saat user login | Semua role |
| **WhatsApp (via link)** | Tombol "Kirim ke WA" di halaman alert — membuka WA Web/App dengan pesan siap kirim | Admin / Supervisor |
| **Email** | Email ringkasan harian (opsional, opt-in) | Admin / Owner |

**Aturan notifikasi:**

- Alert in-app ditampilkan secara real-time menggunakan Supabase Realtime
- Alert dianggap "dibaca" setelah user klik; tersimpan di log
- Notifikasi email (jika diaktifkan) dikirim sekali sehari, pukul 07.00 waktu lokal farm
- Push notification mobile (PWA) masuk roadmap v1.1 — tidak termasuk MVP
- Setiap notifikasi yang terkirim tercatat: tipe alert, waktu, penerima, dan status baca

---

### 6.4 Onboarding: Import Data Historis (MVP Light)

> **Konteks:** Import CSV masuk roadmap v1.1, namun spec minimal berikut dimasukkan ke MVP agar proses onboarding farm pertama tidak terhambat.

**Scope import yang didukung di MVP:**

| Entitas | Format | Keterangan |
|---------|--------|------------|
| Data flock (master) | CSV | Nama batch, tanggal chick-in, strain, jumlah awal, kandang |
| Data produksi historis | CSV | Per baris = satu hari satu flock; field sesuai `daily_records` |
| Data pelanggan | CSV | Field sesuai tabel `customers` |
| Opening stock balance | CSV | **v1.7:** Satu baris per `egg_category` (grade_a / grade_b); field: `date, egg_category, quantity_eggs`. Masuk sebagai `inventory_movements IN` (`source_type: import`, `is_imported: true`). Satu import per cutover date. Admin only. |

**Alur Import (v1.5):**

```
Upload CSV
    ↓
Validasi & Preview (sebelum data masuk DB)
    ↓
User konfirmasi → Import / Batalkan
    ↓
   [Import]                    [Batalkan]
      ↓                             ↓
Data masuk DB               Tidak ada yang tersimpan
Laporan hasil import
```

**Aturan import:**
- Template CSV tersedia untuk diunduh di halaman import
- Sistem memvalidasi format sebelum import (tipe data, field wajib)
- **Preview wajib ditampilkan sebelum data masuk DB:** tabel ringkasan — berapa baris valid, berapa error, contoh 5 baris pertama
- Error ditampilkan per baris dengan keterangan kolom & alasan; user bisa download laporan error
- User harus klik **"Konfirmasi Import"** setelah melihat preview — tidak ada auto-import
- Data yang valid diimport meskipun ada baris error (partial import); user dikonfirmasi dulu
- **Rollback:** jika terjadi error sistem saat proses import berlangsung (bukan error validasi), seluruh batch dibatalkan — tidak ada data yang tersimpan sebagian
- Semua record hasil import diberi flag `is_imported = true` dan `imported_by` untuk audit
- Import backdate tidak terbatas — hanya tersedia untuk Admin

---

### 6.5 Data Consistency & Lock Period (v1.5)

> **Masalah yang diselesaikan:** Tanpa lock period, operator atau Admin bisa mengedit data produksi lama kapan saja — yang bisa merusak laporan historis, stok yang sudah diselesaikan, dan invoice yang sudah dikirim.

#### 6.5.1 Aturan Lock Period

| Role | Bisa Edit Data | Batas Waktu Edit | Keterangan |
|------|---------------|-----------------|------------|
| Operator | Input baru + edit record milik sendiri | H+1 dari tanggal record | Form tidak bisa dibuka setelah batas |
| Supervisor | Edit record manapun | H+7 dari tanggal record | Form terkunci setelah 7 hari dari tanggal data |
| Admin | Edit record manapun | Tidak dibatasi | Setiap edit dicatat sebagai correction record |

> **Perbedaan Backdate vs Lock Period:**
> - **Backdate** = seberapa jauh ke belakang seseorang boleh *membuat* input baru
> - **Lock Period** = seberapa jauh ke belakang seseorang boleh *mengedit* record yang sudah ada
>
> Contoh: Supervisor boleh backdate sampai H-3 (membuat input baru untuk 3 hari lalu), tapi boleh *mengedit* record yang sudah ada sampai H+7 dari tanggal data tersebut.

#### 6.5.2 Prinsip Edit: Correction, Bukan Overwrite

Untuk data yang sudah melewati lock period Supervisor (> H+7) dan hanya bisa diakses Admin, sistem **tidak boleh langsung overwrite** nilai lama. Mekanisme yang digunakan:

- Edit oleh Admin pada data terkunci membuat **correction record** — disimpan di tabel `correction_records` (v1.7) yang menyimpan `entity_type`, `entity_id`, `field_name`, `old_value`, `new_value`, `reason`, `corrected_by`, `corrected_at`
- Nilai lama tetap tersimpan di database (tidak di-overwrite)
- Tampilan di UI menampilkan nilai terkini (setelah koreksi) dengan indikator bahwa record ini pernah dikoreksi
- Riwayat koreksi bisa dilihat Admin dengan klik pada indikator tersebut
- Koreksi pada `daily_records.eggs_grade_a` atau `eggs_grade_b` otomatis membuat compensating `inventory_movements adjustment` entry

**Acceptance Criteria:**
- Record yang sudah di luar batas lock period role yang bersangkutan tidak bisa diedit langsung
- Admin yang mengedit data terkunci wajib mengisi alasan koreksi
- Nilai lama dan nilai baru tersimpan di log, tidak pernah dihapus
- Koreksi pada `daily_records` yang memengaruhi stok (perubahan Grade A / Grade B) otomatis membuat adjustment entry di `inventory_movements`

---

### 6.6 Role Permission Matrix (v1.5)

> **Konteks:** Seksi 5 mendefinisikan persona per role. Seksi ini mendefinisikan secara granular apa yang boleh dan tidak boleh dilakukan masing-masing role per fitur.

**Legenda:** ✅ Boleh | ❌ Tidak boleh | 👁 View only

| Fitur / Aksi | Operator | Supervisor | Admin |
|-------------|----------|-----------|-------|
| **Production** | | | |
| Input harian (hari ini & H-1) | ✅ | ✅ | ✅ |
| Input backdate H-2 s/d H-3 | ❌ | ✅ | ✅ |
| Input backdate > H-3 | ❌ | ❌ | ✅ |
| Edit record dalam lock period | ✅ (milik sendiri, H+1) | ✅ (H+7) | ✅ |
| Edit record di luar lock period | ❌ | ❌ | ✅ (dengan alasan) |
| **Inventory & Stok** | | | |
| Lihat stok real-time | ✅ | ✅ | ✅ |
| Stock adjustment biasa | ❌ | ✅ | ✅ |
| Submit regrade request | ❌ | ✅ | ✅ |
| Approve / reject regrade request | ❌ | ❌ | ✅ |
| **Kandang (Coops)** | | | |
| Lihat daftar kandang | ✅ | ✅ | ✅ |
| Tambah / edit kandang | ❌ | ❌ | ✅ |
| **Sales Order** | | | |
| Buat SO (draft) | ❌ | ✅ | ✅ |
| Confirm SO | ❌ | ✅ | ✅ |
| Fulfill SO | ❌ | ✅ | ✅ |
| Cancel SO (confirmed only) | ❌ | ✅ | ✅ |
| Delete SO (draft only) | ❌ | ✅ | ✅ |
| Submit sales return | ❌ | ✅ | ✅ |
| Approve / reject sales return | ❌ | ❌ | ✅ |
| **Invoice** | | | |
| Generate invoice | ❌ | ✅ | ✅ |
| Kirim invoice ke pelanggan | ❌ | ✅ | ✅ |
| Batalkan invoice | ❌ | ❌ | ✅ |
| **Customer & Kredit** | | | |
| Lihat data pelanggan | ❌ | 👁 | ✅ |
| Tambah / edit pelanggan | ❌ | ❌ | ✅ |
| Input pembayaran | ❌ | ✅ | ✅ |
| Apply customer credit ke invoice | ❌ | ❌ | ✅ |
| Override credit limit | ❌ | ❌ | ✅ (dengan alasan) |
| Lihat aging report | ❌ | 👁 | ✅ |
| Export aging report | ❌ | ❌ | ✅ |
| **Flock Management** | | | |
| Lihat data flock | ✅ | ✅ | ✅ |
| Tambah / edit flock | ❌ | ✅ | ✅ |
| Tutup / retire flock | ❌ | ❌ | ✅ |
| **Dashboard** | | | |
| Dashboard produksi (kandang sendiri) | ✅ | ✅ | ✅ |
| Dashboard produksi (semua kandang) | ❌ | ✅ | ✅ |
| **Import & Konfigurasi** | | | |
| Import CSV | ❌ | ❌ | ✅ |
| Konfigurasi alert threshold | ❌ | ❌ | ✅ |
| Konfigurasi PPN & payment terms default | ❌ | ❌ | ✅ |

> **Catatan implementasi:** Matrix ini adalah source of truth untuk frontend (show/hide elemen UI) dan backend (middleware authorization check). Setiap endpoint API harus memvalidasi role sebelum eksekusi — frontend hide saja tidak cukup.

---

### 6.7 Authentication & Session Management (v1.6)

> **Konteks:** Supabase Auth digunakan untuk MVP. Seksi ini mendefinisikan perilaku sesi dan keamanan akun yang harus dipenuhi sebelum go-live.

#### 6.7.1 Login & Akses

- Login menggunakan **email + password** (Supabase Auth)
- Tidak ada self-registration — akun dibuat oleh Admin melalui halaman manajemen user
- Setelah akun dibuat oleh Admin, user menerima **email undangan** dengan link untuk set password pertama kali

#### 6.7.2 Aturan Sesi

| Parameter | Nilai |
|-----------|-------|
| Session timeout (inaktif) | 8 jam — setelah 8 jam tidak aktif, user diminta login ulang |
| Session maksimum | 24 jam — meskipun aktif terus, token di-refresh otomatis setiap 24 jam |
| Jumlah sesi bersamaan | Tidak dibatasi di MVP (bisa login dari HP + laptop) |

#### 6.7.3 Password Policy

| Aturan | Ketentuan |
|--------|-----------|
| Panjang minimum | 8 karakter |
| Kompleksitas | Minimal 1 huruf besar + 1 angka |
| Lupa password | Via email reset link (Supabase bawaan) |
| Ganti password | User bisa ganti sendiri dari halaman profil |

#### 6.7.4 Manajemen User oleh Admin

| Aksi | Keterangan |
|------|------------|
| Buat user baru | Admin input email, nama, role → sistem kirim email undangan |
| Nonaktifkan user | `is_active = false`; user tidak bisa login; data historis tetap tersimpan |
| Ubah role user | Admin bisa ubah role kapan saja; efektif di sesi berikutnya |
| Reset password | Admin bisa trigger email reset password untuk user manapun |

> **Catatan:** Hapus user permanen tidak tersedia di MVP — user hanya bisa dinonaktifkan. Ini menjaga integritas audit trail (record yang dibuat user tersebut tetap bisa dilacak).

**Acceptance Criteria:**
- User yang dinonaktifkan tidak bisa login meskipun session masih aktif (validasi `is_active` di setiap request)
- Email undangan terkirim dalam < 1 menit setelah Admin membuat akun baru
- Link reset password expired setelah 24 jam

---

## 7. Arsitektur Teknis & Stack Rekomendasi

### 7.1 Stack yang Direkomendasikan

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| **Frontend Framework** | **Next.js 16** | Masih dominan untuk React full-stack apps di 2026. Versi 16 sudah mature dengan React Server Components dan Server Actions — cocok untuk ERP yang butuh SSR untuk performa (laporan, invoice). Ekosistem terluas, SDM paling mudah dicari. |
| **UI / Styling** | **Tailwind CSS v4** | Versi 4 rilis dengan engine baru (Oxide) yang jauh lebih cepat. Utility-first cocok untuk UI ERP yang konsisten tanpa custom CSS berantakan. |
| **Component Library** | **shadcn/ui** | Bukan library tradisional — komponen di-copy ke project, fully customizable. Ideal untuk ERP yang butuh kontrol penuh atas tabel, form, dan dialog. Gratis, no lock-in. |
| **Backend / Database** | **Supabase** | PostgreSQL sebagai core menjamin ACID compliance — krusial untuk transaksi stok dan piutang. Include Auth, Realtime, Storage, dan Edge Functions. Raise $120M Oct 2025, ekosistem makin mature. |
| **ORM** | **Drizzle ORM** | Menggantikan Prisma sebagai pilihan utama di 2026. Type-safe, performa lebih baik (tanpa query engine tersendiri), sintaks dekat dengan SQL. Cocok dengan Supabase/PostgreSQL. |
| **Auth** | **Supabase Auth** | Bundled dengan Supabase, support OAuth dan magic link. Cukup untuk MVP. Bisa migrasi ke Clerk jika butuh SSO enterprise. |
| **PDF Generation** | **React PDF (react-pdf)** | Generate PDF berbasis React component. Invoice didesain dengan JSX biasa, mudah di-maintain tim frontend. |
| **Charts** | **Recharts** | Mature, berbasis React, fleksibel untuk dashboard KPI. |
| **Export Excel** | **SheetJS (xlsx)** | Standar industri untuk export Excel, berjalan client-side. |
| **Hosting Frontend** | **Vercel** | Native untuk Next.js, deployment via git push. Free tier cukup untuk MVP. |
| **Hosting Backend** | **Supabase Cloud** | Managed PostgreSQL, tidak perlu ops tim. |

### 7.2 Mengapa Tidak Pakai Alternatif Lain?

| Alternatif | Kenapa Tidak Dipilih |
|------------|---------------------|
| **Remix / React Router v7** | Ekosistem dan SDM jauh lebih kecil dari Next.js. Untuk ERP bisnis, kemudahan rekrut developer lebih penting. |
| **SvelteKit** | Perlu relearn paradigma baru. Tim familiar React tidak produktif di awal. |
| **Convex** | Tidak pakai SQL — berisiko untuk ERP yang heavy relational (invoice, piutang, stok, inventory ledger). |
| **PocketBase** | SQLite tidak cocok untuk production ERP dengan concurrent writes dan kebutuhan audit trail. |
| **Prisma** | Lebih lambat dari Drizzle, ada overhead query engine. Tren komunitas sudah bergeser ke Drizzle di 2025–2026. |
| **Firebase** | NoSQL tidak ideal untuk data relasional ERP. Pricing tidak terduga saat skala besar. |

### 7.3 Diagram Arsitektur

```
┌──────────────────────────────────────────────┐
│                  Frontend                    │
│   Next.js 16 + Tailwind v4 + shadcn/ui       │
│   (Vercel — Web & Mobile-responsive)         │
└───────────────────┬──────────────────────────┘
                    │ Server Actions / REST
         ┌──────────▼──────────────┐
         │   Drizzle ORM           │
         │   (Type-safe queries)   │
         └──────────┬──────────────┘
                    │
┌───────────────────▼──────────────────────────┐
│              Supabase                        │
│  PostgreSQL · Auth · Realtime · Storage      │
│  Edge Functions (PDF generation)             │
└──────────────────────────────────────────────┘
```

---

## 8. Skema Database

> **Update v1.7:** Penambahan tabel baru, rename tabel, dan perubahan field. Lihat changelog v1.7 untuk ringkasan.

```
users                        ← Eksplisit (sinkron dengan Supabase Auth)
├── id (uuid, PK)            ← sinkron dengan Supabase Auth uid
├── email
├── full_name
├── role (operator/supervisor/admin)
├── is_active (bool)
├── created_at
└── updated_at               ← BARU (v1.7)

coops                        ← BARU (v1.7): Master data kandang
├── id (uuid, PK)
├── name
├── description
├── is_active (bool, default true)
├── created_by (FK → users)
├── created_at
└── updated_at

flocks
├── id (uuid, PK)
├── name
├── chick_in_date
├── strain
├── initial_count
├── coop_id (FK → coops)     ← v1.7: ganti coop_name string → FK ke coops
├── status (active/retired/sold)
├── target_cull_week
├── retired_at               ← BARU (v1.7): diisi saat status → retired/sold
├── created_by (FK → users)
├── updated_by (FK → users)
└── updated_at               ← BARU (v1.7)

daily_records
├── id (uuid, PK)
├── flock_id (FK → flocks)
├── record_date              ← tanggal data (bisa backdate)
├── submitted_at             ← timestamp aktual input (untuk audit)
├── is_late_input (bool)
├── is_imported (bool)       ← true jika dari import CSV
├── submitted_by (FK → users)
├── deaths
├── culled
├── eggs_grade_a
├── eggs_grade_b
├── eggs_cracked
├── eggs_abnormal
├── egg_weight_kg            ← WAJIB
├── feed_given_kg
└── updated_at               ← BARU (v1.7)

inventory_movements          ← Kartu Stok / Ledger
├── id (uuid, PK)
├── movement_date
├── type (in/out/adjustment)
├── source (production/sale/adjustment/regrade/import)
├── source_type              ← BARU (v1.7): enum discriminator
│                               'daily_records' | 'sales_order_items' |
│                               'stock_adjustments' | 'regrade_requests' |
│                               'sales_returns' | 'import'
├── source_id                ← FK ke tabel sesuai source_type
├── egg_category (grade_a/grade_b)
├── quantity                 ← positif = masuk, negatif = keluar/adjustment minus
├── notes
├── created_by (FK → users)
└── updated_at               ← BARU (v1.7)

inventory_snapshots          ← Cache stok harian
├── id (uuid, PK)
├── snapshot_date            ← tanggal snapshot (satu baris per kategori per hari)
├── egg_category (grade_a/grade_b)
├── quantity                 ← total stok pada akhir hari tersebut
└── created_at               ← timestamp pembuatan snapshot (default: tengah malam)

stock_adjustments            ← Penyesuaian stok biasa (bukan regrading)
├── id (uuid, PK)
├── adjustment_date
├── egg_category
├── quantity                 ← bisa positif atau negatif
├── reason (broken_in_warehouse/rotten/internal_consumption/sampling/other)
├── notes
├── photo_url                ← opsional
├── created_by (FK → users)
└── updated_at               ← BARU (v1.7)

regrade_requests             ← Permintaan pindah grade
├── id (uuid, PK)
├── request_date
├── from_category (grade_a/grade_b)
├── to_category (grade_a/grade_b)
├── quantity
├── reason (minor_defect/missorted/recheck/other)
├── notes
├── photo_url                ← opsional
├── status (pending/approved/rejected)
├── submitted_by (FK → users)
├── reviewed_by (FK → users) ← nullable
├── reviewed_at              ← nullable
├── review_notes             ← opsional
└── updated_at               ← BARU (v1.7)

correction_records           ← BARU (v1.7): Audit trail koreksi data terkunci
├── id (uuid, PK)
├── entity_type              ← enum: 'daily_records' | 'inventory_movements' | 'sales_orders'
├── entity_id (uuid)         ← FK ke tabel sesuai entity_type
├── field_name               ← nama field yang dikoreksi
├── old_value (text)
├── new_value (text)
├── reason (text, NOT NULL)  ← wajib diisi Admin
├── corrected_by (FK → users)
├── corrected_at (timestamptz)
└── created_at

customers
├── id (uuid, PK)
├── name
├── type (retail/agent/distributor)
├── phone
├── address
├── credit_limit
├── payment_terms_days
├── status (active/inactive/blocked)
├── notes
├── created_by (FK → users)
└── updated_at               ← BARU (v1.7)

sales_orders                 ← v1.7: rename dari egg_sales; generalisasi untuk semua tipe penjualan
├── id (uuid, PK)
├── order_number             ← BARU (v1.7): auto-gen SO-YYYYMM-XXXX
├── order_date
├── customer_id (FK → customers)
├── payment_method (cash/credit)
├── status                   ← BARU (v1.7): enum draft/confirmed/fulfilled/cancelled
├── tax_pct                  ← persentase PPN per transaksi (default 0)
├── subtotal                 ← SUM dari sales_order_items.subtotal
├── tax_amount               ← subtotal × tax_pct / 100
├── total_amount             ← subtotal + tax_amount
├── notes
├── created_by (FK → users)
├── updated_by (FK → users)
└── updated_at               ← BARU (v1.7)

sales_order_items            ← v1.7: rename dari egg_sale_items; generalisasi item_type
├── id (uuid, PK)
├── order_id (FK → sales_orders)
├── item_type                ← BARU (v1.7): enum egg_grade_a/egg_grade_b/flock/other
├── item_ref_id (uuid)       ← BARU (v1.7): nullable; FK → flocks jika item_type=flock
├── description (text)       ← BARU (v1.7): nullable; wajib jika item_type=other
├── quantity
├── unit                     ← BARU (v1.7): enum butir/ekor/unit
├── price_per_unit
├── discount_pct
└── subtotal                 ← quantity × price × (1 − discount_pct/100)

sales_returns                ← BARU (v1.7): Sales Return post-fulfilled SO
├── id (uuid, PK)
├── return_number            ← auto-gen RTN-YYYYMM-XXXX
├── order_id (FK → sales_orders)
├── customer_id (FK → customers)
├── return_date
├── reason_type              ← enum: wrong_grade/damaged/quantity_error/other
├── notes
├── status (pending/approved/rejected)
├── submitted_by (FK → users)
├── reviewed_by (FK → users) ← nullable
├── reviewed_at              ← nullable
├── created_at
└── updated_at

sales_return_items           ← BARU (v1.7): Detail item per sales return
├── id (uuid, PK)
├── return_id (FK → sales_returns)
├── item_type                ← enum: egg_grade_a/egg_grade_b/flock/other
├── item_ref_id (uuid)       ← nullable
├── quantity
└── unit                     ← enum: butir/ekor/unit

invoices
├── id (uuid, PK)
├── invoice_number (unique, auto-gen)  ← prefix per type: INV-/RCP-/CN-
├── type                     ← BARU (v1.7): enum sales_invoice/cash_receipt/credit_note
├── order_id (FK → sales_orders)      ← v1.7: ganti sale_id → order_id
├── reference_invoice_id     ← BARU (v1.7): nullable FK → invoices (credit_note → original)
├── return_id                ← BARU (v1.7): nullable FK → sales_returns
├── customer_id (FK → customers)
├── issue_date
├── due_date
├── total_amount             ← negatif untuk credit_note
├── paid_amount
├── status (draft/sent/partial/paid/overdue/cancelled)
├── notes
└── updated_at               ← BARU (v1.7)

payments
├── id (uuid, PK)
├── invoice_id (FK → invoices)
├── payment_date
├── amount
├── method (cash/transfer/cheque/credit)  ← tambah 'credit' untuk customer credit apply
├── reference_number
├── created_by (FK → users)
└── updated_at               ← BARU (v1.7)

customer_credits             ← Saldo kredit pelanggan (overpayment atau credit note)
├── id (uuid, PK)
├── customer_id (FK → customers)
├── amount                   ← jumlah kredit (selalu positif)
├── source_type              ← BARU (v1.7): enum overpayment/credit_note
├── source_payment_id        ← nullable FK → payments (diisi jika source_type=overpayment)
├── source_invoice_id        ← BARU (v1.7): nullable FK → invoices (diisi jika source_type=credit_note)
├── used_amount
├── notes
└── created_at

notifications                ← Log notifikasi in-app
├── id (uuid, PK)
├── type (production_alert/overdue_invoice/stock_warning/phase_change/other)
├── title
├── body
├── target_role (operator/supervisor/admin/all)
├── related_entity_type
├── related_entity_id
└── created_at               ← hapus is_read + read_at (v1.7) → pindah ke notification_reads

notification_reads           ← BARU (v1.7): Per-user read tracking
├── id (uuid, PK)
├── notification_id (FK → notifications)
├── user_id (FK → users)
├── read_at (timestamptz)
└── UNIQUE(notification_id, user_id)

alert_cooldowns              ← BARU (v1.7): Deduplication alert
├── id (uuid, PK)
├── alert_type               ← matches notifications.type
├── entity_type              ← 'flock' | 'invoice' | 'customer'
├── entity_id (uuid)
├── last_sent_at (timestamptz)
└── UNIQUE(alert_type, entity_id)

user_coop_assignments        ← Mapping Operator ke Kandang
├── id (uuid, PK)
├── user_id (FK → users)
├── coop_id (FK → coops)     ← v1.7: ganti coop_name string → FK ke coops
└── assigned_at
```

**Catatan desain `regrade_requests`:**
- Saat status berubah ke `approved`: sistem membuat **dua baris** `inventory_movements` secara berurutan dalam satu database transaction — pertama `OUT` dari `from_category`, lalu `IN` ke `to_category`, keduanya dengan `source: regrade`, `source_type: regrade_requests`, dan `source_id` menunjuk ke `regrade_requests.id` yang sama
- Stok yang sedang `pending` diblokir dari penjualan: query stok tersedia = `SUM(inventory_movements) − SUM(regrade_requests.quantity WHERE status = 'pending' AND from_category = ?)`

**Catatan desain `inventory_movements`:**
- Stok real-time = `SELECT SUM(quantity) FROM inventory_movements WHERE egg_category = ? GROUP BY egg_category`
- `inventory_snapshots` menyimpan total stok akhir hari per kategori — dibuat otomatis tiap tengah malam via Supabase scheduled function
- Query stok real-time menggunakan snapshot terakhir + movements sejak snapshot tersebut, untuk menghindari full scan tabel setiap saat
- Tabel ini adalah sumber kebenaran tunggal untuk semua pergerakan stok
- `source_type` wajib diisi — digunakan untuk join ke tabel asal tanpa ambiguitas

**Catatan desain `sales_orders` + `sales_order_items`:**
- Satu `sales_orders` bisa memiliki banyak `sales_order_items` (multi-item per transaksi)
- `inventory_movements` mereferensikan `sales_order_items.id` sebagai `source_id` (`source_type: sales_order_items`) agar mutasi stok per kategori bisa dilacak secara granular
- Item `item_type=flock` tidak menghasilkan `inventory_movements` — sebaliknya, mengubah `flocks.status` dan `flocks.retired_at`
- Status transition `fulfilled` harus dieksekusi dalam satu DB transaction

**Catatan desain `invoices`:**
- `type=credit_note`: `total_amount` bernilai negatif; `reference_invoice_id` wajib diisi; `return_id` wajib diisi
- `type=cash_receipt`: `status=paid`, `paid_amount=total_amount` saat dibuat; `due_date` = `issue_date`
- Invoice auto-created saat SO `fulfilled` — tidak dibuat manual

**Catatan desain `customer_credits`:**
- Saldo kredit tersedia = `SUM(amount) − SUM(used_amount)` per `customer_id`
- Setiap penggunaan kredit untuk melunasi invoice dicatat sebagai `payments` dengan `method: credit`, dan `used_amount` pada `customer_credits` diperbarui
- `source_type` membedakan asal kredit: `overpayment` (dari kelebihan bayar) atau `credit_note` (dari sales return)

**Catatan desain `notification_reads`:**
- Satu baris per (notification × user) — memungkinkan per-user read tracking
- Badge count unread: `SELECT COUNT(*) FROM notifications n LEFT JOIN notification_reads nr ON n.id = nr.notification_id AND nr.user_id = ? WHERE nr.id IS NULL AND (n.target_role = user_role OR n.target_role = 'all')`

**Catatan desain `alert_cooldowns`:**
- Sebelum buat notification: `SELECT last_sent_at FROM alert_cooldowns WHERE alert_type = ? AND entity_id = ?`
- Jika `last_sent_at > NOW() - INTERVAL cooldown` → skip
- Setelah buat notification: upsert `alert_cooldowns.last_sent_at = NOW()`
- `overdue_invoice`: tidak dicek cooldown, selalu buat notification

**Catatan desain `correction_records`:**
- Koreksi pada `daily_records.eggs_grade_a` atau `eggs_grade_b` wajib diikuti pembuatan `inventory_movements adjustment` compensating entry dalam satu transaction
- Nilai `old_value` dan `new_value` disimpan sebagai text — aplikasi handle parsing sesuai `entity_type`

**Catatan desain `user_coop_assignments`:**
- Digunakan untuk membatasi akses dashboard Operator hanya ke kandang yang ditugaskan
- Supervisor dan Admin tidak perlu entry di tabel ini — mereka otomatis bisa akses semua kandang
- Satu user bisa ditugaskan ke lebih dari satu kandang
- Dashboard Operator (multi-assignment): KPI diagregat dari semua kandang yang ditugaskan; ada dropdown filter per kandang

---

## 9. Non-Functional Requirements

### 9.1 General

| Requirement | Target |
|-------------|--------|
| Availability | 99.5% uptime |
| Response time | < 3 detik untuk semua halaman |
| Mobile support | Responsif di layar 375px ke atas |
| Browser support | Chrome, Safari, Firefox (2 versi terakhir) |
| PDF generation | < 5 detik |
| Audit trail | Semua mutasi stok, adjustment, dan override kredit tercatat dengan user + timestamp |
| Form draft persistence | Form input disimpan di `sessionStorage` saat session expired; dipulihkan otomatis setelah re-login dengan toast konfirmasi; cleared on successful submit |

### 9.2 Performance Strategy (v1.5)

> **Konteks:** Dashboard dan inventory ledger berpotensi berat seiring bertambahnya data. Berikut constraint yang harus dipenuhi beserta strategi yang direkomendasikan ke tim teknis.

| Target | Constraint | Strategi yang Direkomendasikan |
|--------|------------|-------------------------------|
| Dashboard load < 3 detik | Berlaku meski data > 1 tahun | Gunakan `inventory_snapshots` harian sebagai base; query hanya delta sejak snapshot terakhir |
| Aging report < 5 detik | Berlaku untuk pelanggan dengan > 100 invoice | Materialized view atau pre-aggregated table, refresh tiap malam |
| Halaman riwayat stok < 3 detik | Berlaku untuk log > 10.000 baris | Pagination server-side wajib; tidak boleh load all di client |
| API endpoint stok real-time < 1 detik | Diakses tiap buka halaman inventory | Index wajib pada `inventory_movements(egg_category, movement_date)` |

Keputusan indexing dan caching detail (query plan, materialized view DDL) diserahkan ke TDD.

### 9.3 Disaster Recovery & Backup Strategy (v1.5)

> **ERP menyimpan data bisnis kritikal.** Kehilangan data > 24 jam bisa berdampak langsung ke operasional dan keuangan farm.

| Requirement | Target |
|-------------|--------|
| **RPO** (Recovery Point Objective) | Maksimal **24 jam** — tidak boleh kehilangan data lebih dari 1 hari |
| **RTO** (Recovery Time Objective) | Maksimal **4 jam** — sistem harus bisa dipulihkan dalam 4 jam setelah insiden |
| Backup otomatis | Harian — disediakan oleh Supabase (Point-in-Time Recovery aktif) |
| Retensi backup | Minimal **30 hari** |
| Backup testing | Wajib dilakukan **sekali sebelum go-live** (restore drill) |
| Notifikasi kegagalan backup | Admin menerima alert jika backup gagal |

**Catatan implementasi:**
- Supabase Pro plan menyediakan PITR (Point-in-Time Recovery) hingga 7 hari — cukup untuk MVP
- Untuk retensi 30 hari, aktifkan pg_dump terjadwal ke Supabase Storage atau S3-compatible storage
- Restore drill sebelum go-live adalah acceptance criteria Sprint 9

---

## 10. Milestones & Timeline MVP

| Sprint | Durasi | Deliverable |
|--------|--------|-------------|
| Sprint 1 | 2 minggu | Setup project, auth & user management (6.7), master data flock & customer |
| Sprint 2 | 2 minggu | Form input harian produksi + logika backdate per role |
| Sprint 3 | 2 minggu | `inventory_movements` ledger + manajemen stok real-time |
| Sprint 4 | 2 minggu | Dashboard KPI (HDP, FCR, grafik tren) + filter per kandang |
| Sprint 5 | 2 minggu | Sales Order (sales_order_items, status flow, Sales Return) + stock adjustment |
| Sprint 6 | 2 minggu | Credit management, aging report, invoice PDF + PPN |
| Sprint 7 | 1 minggu | Alert & notifikasi in-app + email digest |
| Sprint 8 | 1 minggu | Import CSV + lock period + correction record |
| Sprint 9 | 1 minggu | Security hardening, restore drill, UAT & bug fix |
| **Total** | **~15 minggu** | **MVP siap production** |

> **Catatan (v1.6):** Sprint 9 ditambahkan untuk mencakup security hardening (rate limiting, row-level security review), restore drill (acceptance criteria NFR 9.3), dan User Acceptance Testing (UAT) yang melibatkan operator dan supervisor aktual dari farm.

---

## 11. Kriteria Sukses MVP

| Metrik | Target |
|--------|--------|
| Operator bisa input harian tanpa training > 30 menit | ✓ |
| Data produksi bisa diakses real-time oleh supervisor | ✓ |
| Stok sistem selalu sinkron dengan fisik gudang (via adjustment) | ✓ |
| FCR tercatat dan tampil di dashboard setiap hari | ✓ |
| Invoice bisa digenerate dan dikirim dalam < 1 menit | ✓ |
| Piutang pelanggan terpantau real-time | ✓ |
| Dashboard load dalam 3 detik | ✓ |
| Setiap mutasi stok bisa diaudit (siapa, kapan, berapa, alasan) | ✓ |
| Tidak ada kehilangan data selama 30 hari pertama | ✓ |
| Zero data breach atau unauthorized access selama periode MVP | ✓ |

---

## 12. Asumsi & Risiko

### Asumsi
- Satu akun untuk satu farm (single-tenant di MVP)
- Multi-kandang dalam satu farm didukung via field `coop_name`
- Operator melakukan sortir/grading di kandang sebelum input (tidak ada jeda grading terpisah)
- Koneksi internet tersedia di area kandang (minimal 3G)
- Farm tidak wajib PKP di MVP — PPN diaktifkan opsional

### Risiko

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Operator tidak disiplin input harian | Tinggi | Reminder notifikasi harian + form sesederhana mungkin + toleransi backdate |
| Operator salah kategorikan Grade A/B saat sortir | Medium | Panduan visual di form + fitur adjustment untuk koreksi |
| Data historis tidak bisa dimigrasi dari Excel | Medium | Sediakan fitur import CSV untuk onboarding awal (spec di 6.4) |
| Pelanggan menolak sistem invoice digital | Medium | Sediakan opsi print PDF + kirim WhatsApp |
| Credit limit diabaikan oleh tim sales | Medium | Blokir otomatis di sistem, override hanya Admin + log audit |
| Stok fisik vs sistem selalu selisih jika adjustment tidak disiplin | Medium | Training + SOP adjustment wajib dilakukan tiap minggu |
| **Concurrent write conflict** pada transaksi stok | Medium | Row-level locking di PostgreSQL untuk insert `inventory_movements`; validasi stok di backend bukan frontend; transaksi dibatalkan dengan pesan error yang jelas jika terjadi konflik |

---

## 13. Roadmap Modul Selanjutnya (Post-MVP)

| Fase | Modul | Keterangan |
|------|-------|------------|
| v1.1 | Import data historis dari Excel (full) | Onboarding lebih mudah; versi light sudah di MVP (6.4) |
| v1.1 | Grading Workflow terpisah | Jika farm butuh jeda waktu antara panen dan sortir |
| v1.1 | Push notification PWA | Notifikasi mobile untuk operator |
| v1.2 | Modul Procurement | Pembelian pakan, DOC, obat — lengkap dengan PO |
| v1.3 | Laporan keuangan sederhana | Revenue, COGS, margin per batch |
| v2.0 | Multi-farm / Multi-lokasi | Tenant isolation, laporan konsolidasi |
| v2.1 | HR & absensi karyawan kandang | |
| v2.2 | Integrasi timbangan digital | Input berat telur otomatis |
| v2.3 | PWA offline-first | Untuk kandang dengan koneksi tidak stabil |

---

*Dokumen ini merupakan living document. Revisi dilakukan sesuai feedback dari user testing dan perubahan prioritas bisnis.*
