# UAT: Laporan Hub & Basic Reports

**Date:** 2026-05-14
**Feature:** Laporan Hub Navigation + 8 Basic Reports
**Branch:** `worktree-laporan-hub`

---

## Test Environment

| Item | Value |
|------|-------|
| Base URL | `http://localhost:3000` |
| Test Users | `admin@lumich.test` (admin), `supervisor@lumich.test` (supervisor), `operator@lumich.test` (operator) |
| Prerequisites | At least 1 flock with daily records, 1+ sales orders, 1+ stock movements, 1+ cash transactions |

---

## NAV-01: Sidebar Navigation — Laporan Flat Item

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `supervisor@lumich.test` | Dashboard loads |
| 2 | Inspect sidebar | "Laporan" appears as **flat item** (no accordion arrow), not expandable |
| 3 | Click "Laporan" in sidebar | Navigates to `/laporan` (hub page) |
| 4 | Verify active state | "Laporan" item highlighted in sidebar |

**Pass/Fail:** ⬜

---

## NAV-02: Laporan Hub Page — Card Grid

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/laporan` as admin | Hub page loads with card grid |
| 2 | Count visible report cards | 8 cards visible: Produksi Harian, Performa Flock, Stok Balance, Mutasi Stok, Penjualan, Penjualan per Pelanggan, Piutang Aging, Kas & Cash Flow |
| 3 | Verify each card has icon, title, description, arrow | All 3 elements present on each card |
| 4 | Hover on any card | Border changes to blue (`--lf-blue`), hover effect visible |
| 5 | Click "Produksi Harian" card | Navigates to `/laporan/produksi` |
| 6 | Back to `/laporan`, click "Piutang Aging" | Navigates to `/laporan/keuangan/piutang` |

**Pass/Fail:** ⬜

---

## NAV-03: Hub Page — Permission Filtering (Operator)

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `operator@lumich.test` | Dashboard loads |
| 2 | Navigate to `/laporan` | Hub page loads |
| 3 | Verify: Piutang Aging card **not visible** | Card hidden (operator lacks `laporan.keuangan.view`) |
| 4 | Verify: Kas & Cash Flow card **not visible** | Card hidden |
| 5 | Verify: Produksi Harian card **visible** | Card shown (if operator has `laporan.produksi.view`) |
| 6 | Directly navigate to `/laporan/keuangan/piutang` | Redirected to `/laporan` (permission denied) |

**Pass/Fail:** ⬜

---

## LAP-01: Produksi Harian — Date Range Filter

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/laporan/produksi` as supervisor | Page loads with table |
| 2 | Verify default date range | Last 30 days (today - 30 days to today) |
| 3 | Change "Dari" date to 1 week ago | URL updates with `?from=YYYY-MM-DD` |
| 4 | Verify table reloads | Data filtered to selected range |
| 5 | Change "Sampai" date to yesterday | URL updates, data reloads |
| 6 | Verify HDP% column present | Column "HDP%" visible in table header |
| 7 | Verify HDP% values are percentages | Values like "87.5%" in HDP% column |

**Pass/Fail:** ⬜

---

## LAP-02: Produksi Harian — Kandang Filter

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/laporan/produksi` | Page loads |
| 2 | Verify "Kandang" dropdown present in filter bar | Dropdown shows "Semua" + list of kandang |
| 3 | Select specific kandang | URL updates with `?coop=<id>`, data filtered |
| 4 | Verify only rows for selected kandang shown | Table contains only matching kandang |
| 5 | Select "Semua" | All kandang data restored |

**Pass/Fail:** ⬜

---

## LAP-03: Produksi Harian — CSV Export

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/laporan/produksi?from=YYYY-MM-DD&to=YYYY-MM-DD` | Page loads with filtered data |
| 2 | Click "Export CSV" | File downloads: `laporan-produksi.csv` |
| 3 | Open CSV | Headers: Tanggal, Kandang, Flock, Populasi, Kematian, Afkir, Telur (butir), HDP% |
| 4 | Verify data matches table | Same rows and values |
| 5 | Apply coop filter, export again | CSV contains only filtered kandang rows |

**Pass/Fail:** ⬜

---

## LAP-04: Performa Flock — Basic View

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/laporan/flock` as supervisor | Page loads |
| 2 | Verify KPI cards present | 3 cards: Avg HDP%, Total Telur, Total Kematian |
| 3 | Verify table columns | Flock, Kandang, Umur (mgg), Pop. Awal, HDP%, Total Telur, Kematian, Mortalitas%, FCR |
| 4 | Verify HDP% color coding | Green if ≥70%, orange if ≥50%, red if <50% |
| 5 | Select flock from dropdown | Data filtered to selected flock |
| 6 | Click "Export CSV" | Downloads `laporan-flock.csv` with correct columns |

**Pass/Fail:** ⬜

---

## LAP-05: Stok Balance — View

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/laporan/stok` as supervisor | Page loads |
| 2 | Verify KPI cards | Total Item count, Stok Habis / Minus count |
| 3 | Verify table columns | Item, Kategori, Satuan, Total Masuk, Total Keluar, Balance |
| 4 | Verify items with balance ≤ 0 shown in red | Negative/zero balance rows have red text |
| 5 | No date filter present | Page has no date filter (current snapshot) |
| 6 | Click "Export CSV" | Downloads `laporan-stok.csv` |

**Pass/Fail:** ⬜

---

## LAP-06: Mutasi Stok — Movement History

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/laporan/stok/mutasi` as supervisor | Page loads |
| 2 | Verify date range filter + item filter present | Both filters visible |
| 3 | Verify table columns | Tanggal, Item, Kategori, Tipe, Qty, Sumber |
| 4 | Verify type badges | "Masuk" badge green, "Keluar" badge red |
| 5 | Select specific stock item | Data filtered to that item only |
| 6 | Navigate directly as operator | Redirected to `/laporan` (operator lacks `laporan.stok.mutasi.view`) |
| 7 | Export CSV | Downloads `laporan-stok-mutasi.csv` |

**Pass/Fail:** ⬜

---

## LAP-07: Penjualan Summary

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/laporan/penjualan` as supervisor | Page loads |
| 2 | Verify KPI cards | Total SO, Total Revenue, Avg per SO |
| 3 | Verify table columns | Tanggal, No. SO, Pelanggan, Items, Total, Status |
| 4 | Verify status labels Indonesian | Draft/Konfirmasi/Selesai/Batal (not draft/confirmed/fulfilled/cancelled) |
| 5 | Change date range | Data reloads for new range |
| 6 | Verify total revenue in KPI matches sum of table | Values consistent |
| 7 | Export CSV | Downloads `laporan-penjualan.csv` |

**Pass/Fail:** ⬜

---

## LAP-08: Penjualan per Pelanggan

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/laporan/penjualan/customer` as supervisor | Page loads |
| 2 | Verify KPI cards | Total Pelanggan, Total Revenue |
| 3 | Verify table columns | Pelanggan, Total SO, Total Revenue, Avg per SO, Terakhir Order |
| 4 | Pelanggan filter dropdown present | Shows "Semua" + customer list |
| 5 | Select specific pelanggan | Data filtered, shows only that customer's row |
| 6 | Export CSV | Downloads `laporan-penjualan-customer.csv` |

**Pass/Fail:** ⬜

---

## LAP-09: Piutang Aging (Moved URL)

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/laporan/keuangan/piutang` as supervisor | Aging report loads (not 404) |
| 2 | Verify 4 KPI buckets | 0–7 Hari, 8–14 Hari, 15–30 Hari, >30 Hari |
| 3 | Verify aging table columns | Pelanggan, No. Invoice, Tgl Terbit, Jatuh Tempo, Total, Terbayar, Sisa, Hari Lewat, Kategori |
| 4 | Navigate as operator | Redirected to `/laporan` (lacks `laporan.keuangan.view`) |
| 5 | Export CSV | Downloads `laporan-aging.csv` (existing route) |

**Pass/Fail:** ⬜

---

## LAP-10: Kas & Cash Flow

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/laporan/keuangan/kas` as admin | Page loads |
| 2 | Verify KPI cards | Total Masuk, Total Keluar, Net Cash Flow |
| 3 | Verify table columns | Tanggal, Keterangan, Akun, Kategori, Tipe, Jumlah |
| 4 | Verify type badges | Masuk/Transfer Masuk = green, Keluar/Transfer Keluar = red |
| 5 | Verify amount sign | Keluar rows prefixed with "-" |
| 6 | Change date range | Data reloads |
| 7 | Navigate as supervisor | Access depends on `laporan.keuangan.view` permission assigned to supervisor role |
| 8 | Export CSV | Downloads `laporan-kas.csv` |

**Pass/Fail:** ⬜

---

## PRINT-01: Print-Friendly Layout

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to any report page (e.g. `/laporan/produksi`) | Page loads normally |
| 2 | Press Ctrl+P (or browser print preview) | Print preview opens |
| 3 | Verify sidebar hidden in preview | Left sidebar not visible |
| 4 | Verify filter bar hidden in preview | Filter inputs/buttons not visible |
| 5 | Verify Export CSV button hidden in preview | Button not visible |
| 6 | Verify table fills width | Table uses full available width |
| 7 | Cancel print | Return to normal view — all elements visible again |

**Pass/Fail:** ⬜

---

## PERM-01: Permission Guard — Keuangan Routes

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as operator | Dashboard loads |
| 2 | Navigate to `/laporan/keuangan/piutang` | Redirected to `/laporan` |
| 3 | Navigate to `/laporan/keuangan/kas` | Redirected to `/laporan` |
| 4 | Navigate to `/laporan/stok/mutasi` | Redirected to `/laporan` (if operator lacks `laporan.stok.mutasi.view`) |
| 5 | Login as admin, assign `laporan.keuangan.view` to supervisor role | Role updated successfully |
| 6 | Login as supervisor, navigate to `/laporan/keuangan/piutang` | Aging report loads (no redirect) |

**Pass/Fail:** ⬜

---

## PERM-02: Export CSV Permission

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as user WITHOUT `laporan.export` permission | Dashboard loads |
| 2 | Navigate to `/laporan/produksi` | Page loads, but "Export CSV" button NOT visible |
| 3 | Directly GET `/api/laporan/produksi-csv` | Returns 403 Forbidden |
| 4 | Login as user WITH `laporan.export` permission | |
| 5 | Navigate to `/laporan/produksi` | "Export CSV" button visible |
| 6 | Click Export CSV | File downloads successfully |

**Pass/Fail:** ⬜

---

## Regression Checklist

| Item | Status |
|------|--------|
| Dashboard loads without error | ⬜ |
| `/produksi/input` still works (create daily record) | ⬜ |
| `/stok` inventory page still works | ⬜ |
| `/penjualan` sales order list still works | ⬜ |
| `/kas` cash module still works | ⬜ |
| Sidebar all other nav items (Dashboard, Produksi, Stok, Penjualan, Kas, Admin) still visible and functional | ⬜ |
| Login / logout flow unaffected | ⬜ |

---

## Test Result Summary

| ID | Test Case | Result | Notes |
|----|-----------|--------|-------|
| NAV-01 | Sidebar flat item | ⬜ | |
| NAV-02 | Hub page card grid | ⬜ | |
| NAV-03 | Permission filtering operator | ⬜ | |
| LAP-01 | Produksi date filter + HDP% | ⬜ | |
| LAP-02 | Produksi kandang filter | ⬜ | |
| LAP-03 | Produksi CSV export | ⬜ | |
| LAP-04 | Performa Flock | ⬜ | |
| LAP-05 | Stok Balance | ⬜ | |
| LAP-06 | Mutasi Stok | ⬜ | |
| LAP-07 | Penjualan Summary | ⬜ | |
| LAP-08 | Penjualan per Pelanggan | ⬜ | |
| LAP-09 | Piutang Aging (new URL) | ⬜ | |
| LAP-10 | Kas & Cash Flow | ⬜ | |
| PRINT-01 | Print-friendly CSS | ⬜ | |
| PERM-01 | Keuangan permission guard | ⬜ | |
| PERM-02 | Export CSV permission | ⬜ | |
| REG | Regression checklist | ⬜ | |

**Total:** 17 test cases | **Pass:** — | **Fail:** — | **Tester:** ___________ | **Date:** ___________
