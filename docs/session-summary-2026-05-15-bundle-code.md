# Session Summary: Bundle Code & Per-Ikatan Save

**Date:** 2026-05-15 (dilanjutkan 2026-05-17)
**Branch:** `worktree-tray-bundle-egg-input`
**Version shipped:** v0.9.0 → v0.9.1

---

## Background & Problem

Operator panen telur dalam beberapa sesi per hari. Setiap "ikatan" (~15 kg, disusun dari nampan tray) perlu **label fisik** yang ditulis tangan — agar saat ikatan tiba di gudang atau dijual, bisa dicocokkan ke data sistem.

**Flow lama (sebelum sesi ini):**
- Operator input semua ikatan sekaligus di form, baru submit
- Tidak ada kode per ikatan — tidak bisa ditelusuri ke label fisik
- Semua bundle disimpan sekaligus saat submit form utama

**Masalah lapangan:**
- Operator butuh kode **saat itu juga** (bukan setelah semua selesai)
- Satu flock bisa punya 3–5 sesi panen dalam sehari
- Label fisik harus ditulis sebelum lanjut ke ikatan berikutnya

**Solusi yang didesain:**
- Simpan **per ikatan** — satu klik → dapat kode → lanjut
- Kode format `DDMMYY-NNN` (misal `150526-003`) — unique per flock per hari
- Ikatan yang sudah dihapus tidak reuse kode (kode sudah tertulis di label)

---

## Arsitektur yang Diubah

### Sebelum

```
saveDailyRecordAction
  └─ saveDailyRecord (service)
       └─ upsertDailyRecordTx (query)
            ├─ insert daily_records
            ├─ insert daily_egg_records
            ├─ insert daily_egg_bundles  ← semua sekaligus
            └─ insert inventory_movements
```

### Sesudah

```
saveBundleAction (baru)              saveDailyRecordAction (disederhanakan)
  └─ saveSingleBundle (baru)           └─ saveDailyRecord
       └─ db.transaction                    └─ upsertDailyRecordTx
            ├─ upsert daily_records              ├─ insert daily_records
            ├─ getNextBundleSequence             ├─ insert daily_egg_records (non-bundle)
            ├─ upsert daily_egg_records          ├─ insert daily_feed_records
            ├─ insert daily_egg_bundles          ├─ insert daily_vaccine_records
            └─ insert inventory_movements        └─ insert inventory_movements
                 (sourceId = bundle.id)

deleteBundleAction (baru)
  └─ deleteBundle (baru)
       └─ db.transaction
            ├─ subtract dari daily_egg_records
            ├─ delete daily_egg_bundles
            └─ delete inventory_movements
                 (WHERE sourceId = bundleId)
```

---

## Perubahan Per File

### Schema & Migration

**`lib/db/schema/daily-egg-bundles.ts`**
- Tambah field `bundleCode: varchar('bundle_code', { length: 12 })` (nullable)

**`lib/db/schema-factory.ts`**
- Tambah `bundleCode: varchar('bundle_code', { length: 12 })` ke definisi `dailyEggBundles`

**`lib/db/migrations/0014_bundle_code.sql`** ← *baru*
```sql
ALTER TABLE "daily_egg_bundles" ADD COLUMN "bundle_code" varchar(12);
```

**`lib/db/farm-template.sql`**
- Tambah kolom `"bundle_code" varchar(12)` di CREATE TABLE `daily_egg_bundles`

---

### Query Layer

**`lib/db/queries/daily-record.queries.ts`**

Fungsi baru:
- `getNextBundleSequence(farmSchema, flockId, recordDate): Promise<number>` — COUNT bundles untuk flock+tanggal, return count+1
- `insertSingleBundle(farmSchema, data): Promise<DailyEggBundle>` — insert satu row bundle
- `deleteBundleById(farmSchema, bundleId): Promise<void>`
- `getBundlesByFlockDate(farmSchema, flockId, recordDate): Promise<BundleWithStockItem[]>` — join ke daily_egg_records untuk dapat stockItemId
- `getBundleWithContext(farmSchema, bundleId)` — join ke egg_records + daily_records, return context untuk delete validation

Type baru:
- `BundleWithStockItem = DailyEggBundle & { stockItemId: string }`

Dihapus:
- Seluruh blok `if (input.bundleData && input.bundleData.length > 0)` dari `upsertDailyRecordTx`

---

### Service Layer

**`lib/services/daily-record.service.ts`**

Fungsi baru:
- `formatBundleCode(recordDate, seq): string` — `"2026-05-15"` + `3` → `"150526-003"`
- `saveSingleBundle(farmSchema, input, userId, role)` — full transaction: upsert header, generate kode, upsert egg_records (additive), insert bundle, insert inventory_movement dengan `sourceId = bundle.id`
- `deleteBundle(farmSchema, bundleId, _userId, role)` — subtract dari egg_records, delete bundle, delete movement WHERE `sourceId = bundleId`
- `getExistingBundlesForInput(farmSchema, flockId, recordDate)` — return `Record<stockItemId, BundleWithStockItem[]>`

Type baru:
- `SavedBundle = { bundleCode, bundleIndex, qtyButir, qtyKg }`

Disederhanakan:
- `saveDailyRecord`: `eggEntries` kini hanya `Array<{ stockItemId, qtyButir, qtyKg }>` — tidak ada bundle-method branching

**Bug kritis yang ditemukan & diperbaiki:**
> Movement delete di `deleteBundle` awalnya match by `stockItemId + flockId + quantity + movementDate` tanpa `sourceId` — jika 2 ikatan punya `qtyButir` sama dalam satu hari, movement yang salah bisa terhapus (silent ledger corruption).
> Fix: `saveSingleBundle` → `sourceId: bundle!.id`; `deleteBundle` → tambah `eq(inventoryMovements.sourceId, bundleId)` ke WHERE clause.

---

### Actions Layer

**`lib/actions/daily-record.actions.ts`**

Ditambah:
- `saveBundleAction(data)` — Zod validate `{ flockId, recordDate, stockItemId, trayCount, topTrayCount, qtyKg }`, coop access check, delegate ke `saveSingleBundle`
- `deleteBundleAction(bundleId)` — auth, delegate ke `deleteBundle`
- `getExistingBundlesForInputAction(flockId, recordDate)` — auth + coop check, delegate ke `getExistingBundlesForInput`

Disederhanakan:
- `saveDailyRecordAction`: hapus `bundleEntrySchema` + `eggEntrySchema` bundle refine; `eggEntrySchema` kini plain `{ stockItemId, qtyButir, qtyKg }`; hapus `as any` cast

---

### UI

**`components/forms/daily-input-form.tsx`**

State dihapus:
- `eggBundles: Record<string, BundleEntry[]>` (client-side draft list)

State baru:
- `draftBundle: Record<string, DraftBundle>` — satu draft per stockItemId
- `savedBundles: Record<string, BundleWithStockItem[]>` — server-persisted bundles
- `bundlePending: Record<string, boolean>` — loading per item
- `bundleToast: string | null` — success message

Handlers baru:
- `handleSaveBundle(stockItemId)` — snapshot flockId/recordDate, call `saveBundleAction`, reset draft, show toast, refresh savedBundles
- `handleDeleteBundle(bundleId, bundleCode, bundleIndex?)` — confirm dialog, call `deleteBundleAction`, refresh savedBundles

Effect:
- `useEffect` fetch `getExistingBundlesForInputAction` saat flockId/recordDate berubah — dengan cancellation flag untuk cegah race condition

Render Tab Telur (bundle items):
- **Zona A** — 3 input (Nampan, Atas, Kg) + preview butir + tombol "Simpan Ikatan"
- **Zona B** — list ikatan tersimpan dengan `bundleCode`, qtyButir, qtyKg, tombol hapus; total row di bawah

Toast:
- Tampil di atas tab strip (bukan dalam tab) — terlihat dari semua tab selama 4 detik

Submit:
- `eggEntries` hanya dari `simpleEggEntries` (non-bundle) — bundle items sudah server-persisted

`allEggTotals`:
- Bundle contribution dibaca dari `savedBundles` (bukan client state)

Bug yang diperbaiki oleh code quality reviewer:
- Race condition pada `useEffect` → cancellation flag `let cancelled = false`
- Stale closure di handlers → snapshot `currentFlockId`/`currentRecordDate` di awal handler
- Dead code `SESSION_KEY` (const + `removeItem` tanpa setItem/getItem) → dihapus
- `setError(result.error)` tanpa null-coalesce → `setError(result.error ?? null)`

---

### Changelog & Docs

**`lib/changelog/data.ts`**
- `CURRENT_VERSION` → `v0.9.1`
- Entry baru v0.9.1: bundle code per-ikatan save

**`docs/uat/bundle-code-per-ikatan-uat.md`** ← *baru*
- 15 test case UAT: TC-01 s/d TC-15
- Cover: tampilan, simpan, delete, sequence, multi-sesi, data integrity, role/lock period, format kode

---

## Format Kode Bundle

```
DDMMYY-NNN

Contoh: ikatan ke-3 flock A pada 15 Mei 2026 → 150526-003
```

- Sequence dihitung dari COUNT existing bundles untuk flock+tanggal saat INSERT (dalam transaksi)
- Gap diizinkan setelah delete — kode yang sudah tertulis di label fisik tidak di-reuse
- Tidak ada unique constraint di DB — scope natural (flock + tanggal + sequence) sudah cukup

---

## Commit Log (20 commits)

| Commit | Deskripsi |
|--------|-----------|
| `f895600` | feat(stok-katalog): add toggle bundle method query, service, and action |
| `68b4995` | feat(admin): add bundle method toggle per Telur item in stok katalog |
| `8b1dfaa` | feat(queries): add egg bundle insert/delete/fetch queries |
| `a43a720` | feat(actions): extend egg entry Zod schema for bundle method |
| `9271698` | feat(service): save and replace egg bundle rows in daily record transaction |
| `ddda9a7` | feat(produksi): bundle UI, load-bundles service, type-safe action cast |
| `0c38228` | chore(changelog): add v0.9.0 entry for tray bundle egg input feature |
| `6893fba` | fix(queries): remove stray eslint-disable comment |
| `fbf900d` | feat(schema): add bundle_code varchar(12) to daily_egg_bundles |
| `6842f54` | feat(queries): add per-bundle save/delete/fetch queries; remove bundle logic from upsertDailyRecordTx |
| `4930bb9` | feat(service): add saveSingleBundle, deleteBundle, getExistingBundlesForInput; simplify saveDailyRecord |
| `e3eabfd` | **fix(service): link inventory movement to bundle.id for safe per-bundle delete** |
| `a8cb49f` | fix(service): add userId param to deleteBundle signature per spec |
| `7b794b7` | feat(actions): add saveBundleAction, deleteBundleAction, getExistingBundlesForInputAction |
| `b99cad3` | feat(ui): Zona A + Zona B bundle input with per-ikatan save and code display |
| `69a11f8` | fix(ui): move bundle toast above tab strip; fix delete confirm fallback |
| `1e13a66` | fix(ui): resolve race condition, stale closures, dead SESSION_KEY |
| `f0434e0` | chore(changelog): add v0.9.1 entry |
| `678ffd5` | fix(bundle): resolve 4 UAT bugs found during testing |
| `acc2d76` | fix(lint): remove unused imports and variable |

---

## Files Changed (15 files, +1128 / -74 lines)

```
app/(app)/admin/stok-katalog/page.tsx
components/forms/daily-input-form.tsx
docs/uat/bundle-code-per-ikatan-uat.md
lib/actions/daily-record.actions.ts
lib/actions/stock-catalog.actions.ts
lib/changelog/data.ts
lib/db/farm-template.sql
lib/db/migrations/0013_tray_bundle_egg_input.sql
lib/db/migrations/0014_bundle_code.sql
lib/db/queries/daily-record.queries.ts
lib/db/queries/stock-catalog.queries.ts
lib/db/schema-factory.ts
lib/db/schema/daily-egg-bundles.ts
lib/services/daily-record.service.ts
lib/services/stock-catalog.service.ts
```

---

## Deployment Checklist

- [ ] Apply migration `0014_bundle_code.sql` ke semua farm schema di Supabase SQL Editor:
  ```sql
  ALTER TABLE "daily_egg_bundles" ADD COLUMN "bundle_code" varchar(12);
  ```
- [ ] Merge branch `worktree-tray-bundle-egg-input` ke `main`
- [ ] Vercel deploy otomatis dari `main`
- [ ] UAT manual menggunakan `docs/uat/bundle-code-per-ikatan-uat.md`
