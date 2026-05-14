# UAT — Generic Inventory System (Catalog-Based Stock)

**Feature branch:** `worktree-generic-inventory`
**Date:** _____________
**Tester:** _____________
**Environment:** Staging / Local
**Role under test:** Admin (unless noted)
**Build/Commit:** _____________

---

## Scope

This test script covers the full catalog-based inventory overhaul:

- **Stock Catalog management** — categories + SKU items
- **Stok page** — tabbed view by category, live balances
- **Stock purchase (Beli)** — receive stock against catalog items
- **Stock adjustment** — positive/negative correction per SKU
- **Regrade** — transfer quantity between two SKU items
- **Daily production input** — 4-tab form (Info, Telur, Pakan, Vaksin)
- **Dashboard** — new KPI cards + deaths/depletion charts
- **Laporan Produksi** — updated columns, CSV export
- **CSV Import** — opening stock format with `stock_item_id`
- **Sales Order** — stock check per `itemRefId` (catalog SKU)
- **Sales Return** — restock per `itemRefId`

---

## Sign-off Criteria

- All scenarios: **Pass**
- Zero critical bugs open
- No TypeScript build errors
- All 125 unit tests passing (`npx vitest run`)

---

## Section A — Stock Catalog (Admin)

| # | Step | Expected Result | Actual | Pass/Fail |
|---|------|----------------|--------|-----------|
| A1 | Navigate to **Admin > Katalog Stok**. Verify page loads. | Page shows list of stock categories with their items. Each category shows name and unit. System categories (Telur, Pakan, Vaksin) visible. | | |
| A2 | On the **Katalog Stok** page, in the "Tambah Kategori Baru" section at the bottom, fill in Name = `Karung`, Unit = `sak`. Click **Buat**. | New category "Karung (sak)" appears in the list. Success flash message shown. | | |
| A3 | On the "Karung" category row, type `Karung 50kg` in the item name input. Click **+ Tambah**. | New item "Karung 50kg" appears under the Karung category with active status. | | |
| A4 | Find any active item in the catalog. Click **Nonaktifkan**. | Item shows with strikethrough text and "(nonaktif)" label. Button changes to "Aktifkan". | | |
| A5 | Click **Aktifkan** on the same item from A4. | Item returns to normal active display. Strikethrough removed. | | |
| A6 | Attempt to add a new item under a system category (e.g., Telur). | Item is added successfully. System categories allow adding items. | | |

---

## Section B — Stok Page (Tabbed View)

| # | Step | Expected Result | Actual | Pass/Fail |
|---|------|----------------|--------|-----------|
| B1 | Navigate to **Stok**. | Page loads with tabs — one tab per stock category. Default tab visible. | | |
| B2 | Click each category tab (Telur, Pakan, Vaksin, and any custom categories). | Tab switches, table updates to show only items in that category. Each row shows: item name, balance, unit. | | |
| B3 | Verify balance column for any item with known inventory movements. | Balance = sum of all `inventory_movements` IN minus OUT for that stockItemId. No stale snapshot data. | | |
| B4 | Log in as **Operator** role. Navigate to **Stok**. | Stok page is visible. Operator can view balances but cannot trigger adjustments or regrade (those routes redirect or show access denied). | | |

---

## Section C — Pembelian Stok (Beli)

| # | Step | Expected Result | Actual | Pass/Fail |
|---|------|----------------|--------|-----------|
| C1 | Navigate to **Stok > Beli**. | Page loads with a form: category dropdown, item dropdown, quantity, date. | | |
| C2 | Select category = Pakan. Select item (e.g., Pakan Grower). Enter quantity = 500, date = today. Click **Simpan**. | Success message shown. A new `inventory_movements` row with `movementType = 'in'`, `source = 'purchase'` is created. Stok page shows balance increased by 500. | | |
| C3 | Navigate to **Stok > Beli**. Select category. Observe item dropdown. | Item dropdown only shows **active** items in the selected category. Inactive items (from A4) are not listed. | | |
| C4 | Submit Beli form with quantity = 0 or empty. | Validation error shown. No inventory movement created. | | |

---

## Section D — Penyesuaian Stok (Adjustment)

| # | Step | Expected Result | Actual | Pass/Fail |
|---|------|----------------|--------|-----------|
| D1 | Navigate to **Stok > Sesuaikan**. | Page loads with form: category, item, quantity (positive or negative), reason, date. | | |
| D2 | Select an item with existing stock. Enter quantity = **-10** (negative adjustment). Enter reason = `Koreksi hitung`. Click **Simpan**. | Success message. New `inventory_movements` row with `movementType = 'out'`, `source = 'adjustment'`. Stock balance decreases by 10. | | |
| D3 | Enter a **positive** adjustment (e.g., +50). Click **Simpan**. | New `inventory_movements` row with `movementType = 'in'`, `source = 'adjustment'`. Stock balance increases by 50. | | |
| D4 | Enter negative adjustment that exceeds current balance (e.g., balance = 10, enter -50). Click **Simpan**. | Error shown: insufficient stock. No movement created. Balance unchanged. | | |
| D5 | Log in as **Operator**. Navigate to **Stok > Sesuaikan**. | Access denied or redirect. Operator cannot make adjustments. | | |

---

## Section E — Regrading

| # | Step | Expected Result | Actual | Pass/Fail |
|---|------|----------------|--------|-----------|
| E1 | Navigate to **Stok > Regrading**. | Page shows list of pending regrade requests (empty if none) and a button to create new. | | |
| E2 | Click **Buat Regrading**. Select source item (e.g., Telur Grade A), target item (e.g., Telur Grade B), quantity = 200, date = today. Submit. | Regrade request created with status = **PENDING**. Appears in list. Stock balances NOT yet changed. | | |
| E3 | Find the pending request from E2. Click **Approve**. Confirm. | Status changes to **APPROVED**. Two `inventory_movements` rows created: `out` from source item, `in` to target item, both with `source = 'regrade'`. Grade A balance -200, Grade B balance +200. | | |
| E4 | Create another regrade request (same steps as E2). Then click **Reject**. Confirm. | Status changes to **REJECTED**. No inventory movements created. Balances unchanged. | | |
| E5 | Attempt to create regrade with quantity exceeding source item balance. | Error shown. Request not created. | | |

---

## Section F — Daily Production Input (4-Tab Form)

| # | Step | Expected Result | Actual | Pass/Fail |
|---|------|----------------|--------|-----------|
| F1 | Navigate to **Produksi > Input Harian**. | Form loads with 4 tabs: **Info Flock**, **Telur**, **Pakan**, **Vaksin**. | | |
| F2 | On **Tab 1 (Info Flock)**: Select flock from dropdown (shows flock name + coop name + current population). Select date = today. Enter deaths = 2, culled = 0. | Flock options show correctly with current population. Date defaults to today. | | |
| F3 | Click **Tab 2 (Telur)**. | Tab shows a row for each active Telur catalog item. Each row has: item name, qty (butir) input, qty (kg) input. | | |
| F4 | On Tab 2, enter qty = 4500 butir, 45 kg for Telur Grade A. Enter qty = 200 butir, 2 kg for Telur Grade B. | Values entered without error. | | |
| F5 | Click **Tab 3 (Pakan)**. | Tab shows a row for each active Pakan catalog item with current balance visible. Input field for qty used (kg). | | |
| F6 | On Tab 3, enter qty used = 120 for Pakan Grower. | Value entered. No error (assuming sufficient stock). | | |
| F7 | Click **Tab 4 (Vaksin)**. | Tab shows active Vaksin items with balance. Input for qty used. | | |
| F8 | Click **Simpan** from any tab. | Record saved. Success message. Redirected or form reset. `daily_records` row created. `daily_egg_records`, `daily_feed_records`, `daily_vaccine_records` rows created for non-zero entries. `inventory_movements` rows appended: IN for eggs, OUT for feed and vaccines. | | |
| F9 | Submit same flock + date again (duplicate). | Form shows error: record for this flock+date already exists. No duplicate created. | | |
| F10 | On Tab 3, enter feed quantity exceeding available balance (e.g., balance = 10, enter 500). Click **Simpan**. | Error shown: insufficient feed stock. No record saved. | | |
| F11 | Log in as **Operator**. Try to input for a coop not assigned to this operator. | Flock dropdown only shows flocks in operator's assigned coops. Unassigned flocks not selectable. | | |
| F12 | Log in as **Operator**. Try to submit record for date = 3 days ago (H-3). | Error: input only allowed up to H-1 for operator role. Form rejected. | | |
| F13 | Submit a record for yesterday (H-1) at 00:05 UTC today. | Record saved with `is_late_input = true` flag. | | |

---

## Section G — Dashboard

| # | Step | Expected Result | Actual | Pass/Fail |
|---|------|----------------|--------|-----------|
| G1 | Navigate to **Dashboard**. | Page loads with 4 KPI cards: **Produksi Hari Ini** (total eggs today), **Stok Telur** (total egg balance), **Populasi Aktif** (live bird count), **Kematian Hari Ini** (deaths today). | | |
| G2 | After submitting a daily record (F8), refresh Dashboard. | Produksi Hari Ini increases by egg butir count from that record. Populasi Aktif decreases by deaths + culled. Kematian Hari Ini increases. | | |
| G3 | Verify the **Deaths Bar Chart** on Dashboard. | Chart renders. Each bar = deaths on that date. X-axis = date, Y-axis = count. Last 7–14 days visible. | | |
| G4 | Verify the **Cumulative Depletion Area Chart** on Dashboard. | Chart renders. Area shows running total of deaths + culled over time. | | |
| G5 | Dashboard loads in < 3 seconds on staging environment. | Page ready within 3 seconds. No timeout errors. | | |

---

## Section H — Laporan Produksi

| # | Step | Expected Result | Actual | Pass/Fail |
|---|------|----------------|--------|-----------|
| H1 | Navigate to **Laporan > Produksi**. Set date range. Click **Tampilkan**. | Table loads. Columns: Tanggal, Kandang, Flock, Populasi Aktif, Kematian, Afkir. **No** Grade A/B or Pakan columns. | | |
| H2 | Verify KPI summary at top of laporan page. | Shows Total Kematian and Total Afkir only (no HDP%, FCR, feed metrics). | | |
| H3 | Click **Export CSV** on the laporan page. | CSV downloads with columns: Tanggal, Kandang, Flock, Populasi, Kematian, Afkir. No grade/feed columns. Valid UTF-8 CSV. | | |
| H4 | Log in as **Operator**. Navigate to **Laporan > Produksi**. | Access denied or redirect. Operators cannot view production report. | | |
| H5 | Set date range with no records. | Empty table shown. KPI shows 0 for all fields. No error. | | |

---

## Section I — CSV Import (Opening Stock)

| # | Step | Expected Result | Actual | Pass/Fail |
|---|------|----------------|--------|-----------|
| I1 | Navigate to **Admin > Import**. Download the **Opening Stock CSV template**. | CSV downloaded. Header row = `stock_item_id,quantity,movement_date`. (NOT `grade` or `flock_id`). | | |
| I2 | Fill in the template with a valid `stock_item_id` (from the catalog), quantity = 1000, movement_date = `2026-01-01`. Upload and click **Import**. | Import succeeds. Success message with count = 1. `inventory_movements` row created with `source = 'import'`, `movementType = 'in'`. | | |
| I3 | Upload the same CSV again (same movement_date). | Error shown: import for this date already exists. Zero rows imported. | | |
| I4 | Upload CSV with a `stock_item_id` that does not exist in `stock_items` table. | Error report shows: `stock_item_id "xyz" tidak ditemukan`. Zero rows imported. | | |
| I5 | Upload CSV with quantity = 0. | Error: quantity harus > 0. Row rejected. | | |
| I6 | Download **Flock CSV template**. Verify columns. | Header = `coop_id,name,arrival_date,initial_count,breed,notes`. No dropped columns. | | |
| I7 | Download **Daily Records CSV template**. Verify columns. | Header = `flock_id,record_date,deaths,culled,eggs_cracked,eggs_abnormal`. No `eggs_grade_a`, `eggs_grade_b`, `feed_kg` columns. | | |

---

## Section J — Sales Order (Stock Check via Catalog)

| # | Step | Expected Result | Actual | Pass/Fail |
|---|------|----------------|--------|-----------|
| J1 | Navigate to **Penjualan > Buat SO**. Add a line item: product type = `egg_grade_a`, select a specific catalog item (itemRefId). Enter quantity exceeding current balance. Click **Konfirmasi**. | Error: insufficient stock for the selected catalog item. SO not confirmed. | | |
| J2 | Create a valid SO with quantity within available balance. Click **Konfirmasi**. | SO confirmed. Stock reserved (available balance decreases by SO quantity). | | |
| J3 | Fulfill the SO from J2. | SO status = Fulfilled. `inventory_movements` OUT row created with `stockItemId` matching the catalog item (NOT a `grade` column). Invoice auto-generated. | | |

---

## Section K — Sales Return (Restock via Catalog)

| # | Step | Expected Result | Actual | Pass/Fail |
|---|------|----------------|--------|-----------|
| K1 | Navigate to **Penjualan > Return**. Create a return against the fulfilled SO from J3. Select returned egg items. Submit. | Return created with status = pending. | | |
| K2 | Admin approves the return. | Return status = approved. `inventory_movements` IN row created with `stockItemId` matching the catalog egg item. Stock balance increases by returned quantity. Credit note generated. | | |

---

## Regression Checklist

Confirm existing features still work after the inventory overhaul:

| # | Feature | Check | Pass/Fail |
|---|---------|-------|-----------|
| R1 | Login / Logout | Auth flow works for all 3 roles | |
| R2 | Flock management | Create, view, and list flocks | |
| R3 | Coop management | Admin can view and manage coops | |
| R4 | User management | Admin can create/deactivate users, assign coops | |
| R5 | Sales Order list | `/penjualan` page loads with correct SO list | |
| R6 | Invoice list | `/penjualan/invoices` page loads | |
| R7 | Payment recording | Cash and bank transfer payments still work | |
| R8 | Sidebar navigation | All nav links route to correct pages; no 404 | |
| R9 | Mobile responsive | Key pages (dashboard, produksi, stok) usable on 375px viewport | |

---

## Known Limitations / Out of Scope

- HDP% and FCR metrics are **removed** in this sprint (no longer computed from dropped columns). Future sprint may reintroduce via `daily_egg_records` aggregate.
- Feed and vaccine inventory are now tracked per SKU; historical data pre-migration will not appear in new balance view.
- E2E Playwright tests (`e2e/sprint9-uat.spec.ts`) have a known collection error (`test.setTimeout` outside `describe`) — unrelated to this sprint's changes.

---

## Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Tester | | | |
| Tech Lead | | | |
| Product Owner | | | |
