---
name: ERP Ayam Petelur — PRD Gap Analysis & Amendments
description: Pre-Sprint-1 gap analysis of PRD v1.6. 15 gaps found and resolved. Feeds into PRD v1.7.
type: project
date: 2026-04-20
prd_version_before: v1.6
prd_version_after: v1.7
status: approved
---

# ERP Ayam Petelur — PRD Gap Analysis & Amendments

**Tanggal:** 2026-04-20
**PRD sebelum:** v1.6 → **PRD sesudah:** v1.7

## Context

PRD v1.6 dianalisis sebelum Sprint 1 dimulai. Ditemukan 15 gap: missing tables, ambiguous flows, keputusan arsitektur yang belum diambil. Semua gap diselesaikan dalam sesi brainstorming. Dokumen ini merekam temuan + keputusan → dimasukkan ke PRD v1.7.

---

## Gaps & Keputusan

### 🔴 Critical

#### Gap 1 — Tabel `correction_records` tidak ada di schema DB
PRD 6.5.2 mendefinisikan mekanisme correction record tapi tidak ada tabel untuk menyimpannya.

**Keputusan:** Tambah tabel baru. Rule: koreksi pada `daily_records.eggs_grade_a/b` auto-create compensating `inventory_movements adjustment` row.

#### Gap 2 — `inventory_movements.source_id` polimorfik tanpa discriminator
`source_id` menunjuk ke 4 tabel berbeda tanpa cara untuk membedakannya saat query.

**Keputusan:** Tambah kolom `source_type` enum: `'daily_records' | 'sales_order_items' | 'stock_adjustments' | 'regrade_requests' | 'sales_returns' | 'import'`

#### Gap 3 — Tidak ada Sales Order concept; pembatalan invoice setelah inventory OUT tidak ada spec-nya
`egg_sales` tidak punya status flow; pembatalan setelah inventory keluar tidak terdefinisi.

**Keputusan:**
- Rename `egg_sales` → `sales_orders`, `egg_sale_items` → `sales_order_items`
- `sales_orders` bersifat general (bisa jual telur, flock, dll.)
- Status flow: `draft → confirmed → fulfilled` atau `confirmed → cancelled`
- `fulfilled` = satu DB transaction: inventory_movements OUT + invoice auto-created
- Cash SO fulfilled → invoice type=`cash_receipt`, status=`paid` langsung
- Credit SO fulfilled → invoice type=`sales_invoice`, status=`sent`
- Post-fulfilled reversal: hanya lewat Sales Return
- Sales Return approved → inventory_movements IN + invoice type=`credit_note` auto-created (tanpa approval terpisah) + `customer_credits` auto-created

**Invoice types:** `sales_invoice | cash_receipt | credit_note`
Credit note reuses tabel `invoices` (bukan tabel terpisah). `total_amount` negatif untuk credit note.

#### Gap 4 — `notifications.is_read` per-row, bukan per-user
Satu user membaca = semua user dianggap sudah baca.

**Keputusan:** Tambah tabel `notification_reads` (junction). Hapus `is_read` + `read_at` dari `notifications`.

---

### 🟠 High

#### Gap 5 — Konflik scope PPN (farm-level vs per-transaksi)
**Keputusan:** Per-transaksi saja. Default 0%. Tidak ada farm-level toggle.

#### Gap 6 — `user_coop_assignments` pakai string match, bukan FK
String matching `coop_name` bisa silently break jika nama kandang diubah.

**Keputusan:** Tambah tabel master `coops`. `flocks.coop_name` → `coop_id FK → coops`. `user_coop_assignments.coop_name` → `coop_id FK → coops`. Hanya Admin yang bisa kelola coops.

#### Gap 7 — Tidak ada UI spec untuk apply customer credit ke invoice
**Keputusan:** Di halaman detail invoice, jika `customer.available_credit > 0`, tampilkan section "Gunakan Kredit". Modal list open `customer_credits` (FIFO display). Admin input amount per entry (partial allowed). Creates `payments` row (`method: credit`) + update `customer_credits.used_amount`. `customer_credits` perlu field tambahan: `source_type enum('overpayment','credit_note')` dan `source_invoice_id FK → invoices nullable`.

#### Gap 8 — Alert deduplication tidak terdefinisi
**Keputusan:** Tambah tabel `alert_cooldowns`. Sebelum buat notification: cek `last_sent_at < 24h` untuk `alert_type + entity_id` yang sama → skip. Exception: `overdue_invoice` tidak ada cooldown (eskalasi harian).

#### Gap 9 — Mekanisme trigger alert tidak terdefinisi
**Keputusan:** Supabase `pg_cron` scheduled daily (06.00 waktu lokal farm). Cek semua kondisi alert, buat notifications + update alert_cooldowns.

---

### 🟡 Medium

#### Gap 10 — Multi-coop Operator dashboard behavior tidak jelas
**Keputusan:** Dashboard Operator menampilkan KPI agregat dari semua kandang yang ditugaskan + indikator jumlah kandang. Ada dropdown filter untuk drill down per kandang.

#### Gap 11 — `egg_weight_kg` mandatory harian
**Keputusan:** Selalu mandatory untuk MVP. Tidak ada perubahan.

#### Gap 12 — Import CSV tidak cover opening stock balance
**Keputusan:** Tambah entitas import: `opening_stock_balance`. Format: satu baris per `egg_category`, cutover date + quantity. Masuk sebagai `inventory_movements IN` (`source_type: import`, `is_imported: true`). Admin only. Satu import per cutover date.

#### Gap 13 — `updated_at` tidak ada di sebagian besar tabel
**Keputusan:** Tambah `updated_at TIMESTAMPTZ DEFAULT now()` ke semua tabel: `users`, `flocks`, `daily_records`, `customers`, `sales_orders`, `invoices`, `payments`, `regrade_requests`, `stock_adjustments`, `correction_records`, `alert_cooldowns`, `sales_returns`, `coops`.

#### Gap 14 — Status flock retired tidak clear implikasinya ke stok
**Keputusan:** Tidak ada special stock action. Telur tetap di pool (pooled by category, bukan by flock). Saat retirement: set `flocks.retired_at`. Tampilkan "stok tersisa saat retirement" di flock detail (baca dari `inventory_snapshots` di tanggal tersebut).

---

### 🔵 Low

#### Gap 15 — Metode form persistence saat session expired tidak dispesifikasi
**Keputusan:** `sessionStorage`. Serialize form state di setiap perubahan field. Restore on page mount dengan toast "Draft dipulihkan dari sesi sebelumnya." Clear on successful submit.

---

## DB Schema Delta

### Tabel Baru

```sql
correction_records
├── id uuid PK
├── entity_type  enum('daily_records','inventory_movements','sales_orders')
├── entity_id    uuid
├── field_name   text
├── old_value    text
├── new_value    text
├── reason       text NOT NULL
├── corrected_by FK → users
├── corrected_at timestamptz
└── created_at   timestamptz

coops
├── id          uuid PK
├── name        text NOT NULL
├── description text
├── is_active   bool DEFAULT true
├── created_by  FK → users
├── created_at  timestamptz
└── updated_at  timestamptz

notification_reads
├── id              uuid PK
├── notification_id FK → notifications
├── user_id         FK → users
├── read_at         timestamptz
└── UNIQUE(notification_id, user_id)

alert_cooldowns
├── id           uuid PK
├── alert_type   text   -- matches notifications.type
├── entity_type  text   -- 'flock' | 'invoice' | 'customer'
├── entity_id    uuid
├── last_sent_at timestamptz
└── UNIQUE(alert_type, entity_id)

sales_returns
├── id            uuid PK
├── return_number text UNIQUE   -- RTN-YYYYMM-XXXX
├── order_id      FK → sales_orders
├── customer_id   FK → customers
├── return_date   date
├── reason_type   enum('wrong_grade','damaged','quantity_error','other')
├── notes         text
├── status        enum('pending','approved','rejected')
├── submitted_by  FK → users
├── reviewed_by   FK → users nullable
├── reviewed_at   timestamptz nullable
├── created_at    timestamptz
└── updated_at    timestamptz

sales_return_items
├── id          uuid PK
├── return_id   FK → sales_returns
├── item_type   enum('egg_grade_a','egg_grade_b','flock','other')
├── item_ref_id uuid nullable   -- FK → flocks jika item_type=flock
├── quantity    integer
└── unit        enum('butir','ekor','unit')
```

### Tabel Dimodifikasi

```sql
-- sales_orders (rename dari egg_sales)
+ order_number  text UNIQUE        -- SO-YYYYMM-XXXX
+ status        enum('draft','confirmed','fulfilled','cancelled')
+ updated_by    FK → users
+ updated_at    timestamptz

-- sales_order_items (rename dari egg_sale_items)
~ sale_id       → order_id
+ item_type     enum('egg_grade_a','egg_grade_b','flock','other')
+ item_ref_id   uuid nullable      -- FK → flocks jika item_type=flock
+ description   text nullable
+ unit          enum('butir','ekor','unit')
- egg_category                     -- digantikan item_type

-- inventory_movements
+ source_type   enum('daily_records','sales_order_items','stock_adjustments',
                     'regrade_requests','sales_returns','import')
+ updated_at    timestamptz

-- invoices
~ sale_id       → order_id
+ type          enum('sales_invoice','cash_receipt','credit_note')
+ reference_invoice_id  FK → invoices nullable   -- credit_note → original invoice
+ return_id     FK → sales_returns nullable
+ updated_at    timestamptz
-- invoice_number prefix: INV- | RCP- | CN- (per type)

-- customer_credits
+ source_type         enum('overpayment','credit_note')
+ source_invoice_id   FK → invoices nullable   -- diisi jika source_type=credit_note
~ source_payment_id   → nullable               -- diisi jika source_type=overpayment

-- notifications
- is_read   bool                               -- pindah ke notification_reads
- read_at   timestamptz                        -- pindah ke notification_reads
+ updated_at timestamptz

-- flocks
~ coop_name → coop_id  FK → coops
+ retired_at  timestamptz nullable
+ updated_at  timestamptz

-- user_coop_assignments
~ coop_name → coop_id  FK → coops

-- Semua tabel: tambah updated_at jika belum ada
```

---

## Role Permission Matrix — Tambahan

| Aksi | Operator | Supervisor | Admin |
|------|----------|-----------|-------|
| Kelola coops (tambah/edit) | ❌ | ❌ | ✅ |
| Buat SO (draft) | ❌ | ✅ | ✅ |
| Confirm SO | ❌ | ✅ | ✅ |
| Fulfill SO | ❌ | ✅ | ✅ |
| Cancel SO (confirmed only) | ❌ | ✅ | ✅ |
| Delete SO (draft only) | ❌ | ✅ | ✅ |
| Submit sales return | ❌ | ✅ | ✅ |
| Approve/reject sales return | ❌ | ❌ | ✅ |
| Apply customer credit ke invoice | ❌ | ❌ | ✅ |

---

## Verification Checklist

- [ ] Semua tabel baru terbuat di Supabase dengan constraints yang benar
- [ ] SO status transitions di-enforce di API layer (bukan hanya frontend)
- [ ] SO `fulfilled` transition: satu DB transaction wrap `inventory_movements` + invoice creation
- [ ] Sales Return `approved`: satu DB transaction wrap `inventory_movements IN` + `credit_note` invoice + `customer_credits`
- [ ] `notification_reads` query: badge count = unread notifications untuk logged-in user
- [ ] `alert_cooldowns`: jalankan alert check, verifikasi duplikat tidak terbuat dalam window 24h
- [ ] Coops FK: verifikasi ubah nama coop di tabel `coops` tidak break assignments
- [ ] Multi-coop Operator dashboard: KPI sum correctly across assigned kandangs + filter berfungsi
- [ ] Credit note invoice: `total_amount` negatif, `reference_invoice_id` terisi, `return_id` terisi
- [ ] Opening stock import: tercipta sebagai `inventory_movements IN` dengan `source_type=import`
