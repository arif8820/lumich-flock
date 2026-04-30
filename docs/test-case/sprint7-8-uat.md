# Sprint 7–8 UAT Test Cases

**Date:** 2026-04-28
**Sprint:** 7–8 — Alerts & Notifications, CSV Import, Lock Period, Correction Records

---

## Test Environment

| Item | Value |
|------|-------|
| Base URL | `http://localhost:3000` |
| Pre-req | `ALERT_WEBHOOK_SECRET` set in `.env.local` |
| Pre-req | At least 1 active flock with ≥2 daily records |
| Pre-req | At least 1 invoice with status `sent` or `partial` past due date |
| Pre-req | Migration `0005_sprint7_8_phase4_operations.sql` applied to Supabase |
| Test Users | `admin@lumich.test` (admin), `supervisor@lumich.test` (supervisor), `operator@lumich.test` (operator) |

---

## Functional Test Cases

### ALT-01: Alert Webhook — Authentication Required

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | POST to `/api/alerts/run` with no `x-alert-secret` header | Response: 401 Unauthorized |
| 2 | POST to `/api/alerts/run` with wrong secret header | Response: 401 Unauthorized |
| 3 | POST to `/api/alerts/run` with correct `x-alert-secret` header matching `.env.local` | Response: 200, alerts evaluated |

**Pass/Fail:** ⬜

---

### ALT-02: Phase Change Alert Fires Once Per Phase

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Ensure active flock exists, note current phase (check `/flock`) | Phase noted |
| 3 | POST to `/api/alerts/run` with correct secret | 200 OK |
| 4 | Navigate to bell icon → open notification dropdown | Notification "Fase baru: \<phaseName\>" visible if flock just entered new phase |
| 5 | POST to `/api/alerts/run` again | 200 OK |
| 6 | Check bell — no duplicate phase change notification for same flock + same phase | No duplicate |

**Pass/Fail:** ⬜

---

### ALT-03: HDP Drop Alert — Fires and Deduplicates

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Pre-condition: Seed two daily records for same flock where today's HDP is > 5% lower than yesterday's | Data seeded |
| 2 | POST to `/api/alerts/run` | 200 OK |
| 3 | Login as `supervisor@lumich.test`, check bell notification | Notification "HDP Turun Signifikan" visible with drop % in body |
| 4 | POST to `/api/alerts/run` again (same day) | 200 OK |
| 5 | Check bell — no duplicate HDP alert within 24h cooldown | No duplicate |

**Pass/Fail:** ⬜

---

### ALT-04: FCR Alert — Threshold Configurable

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to `/admin/settings/alerts` | Alert config page loads |
| 3 | Verify FCR Threshold, Depletion %, HDP Drop %, Stock Max, Overdue Delay fields visible | All 5 fields present |
| 4 | Set FCR threshold to `999` (very high — no alert should fire), click Simpan | Success message |
| 5 | POST to `/api/alerts/run` | 200 OK |
| 6 | Check bell — no FCR alert | No FCR notification |
| 7 | Reset FCR threshold to `2.5`, click Simpan | Success message |

**Pass/Fail:** ⬜

---

### ALT-05: Overdue Invoice Alert — Fires Daily (No Cooldown)

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Pre-condition: at least 1 invoice with `status = sent` and `due_date` in the past | Invoice exists |
| 2 | POST to `/api/alerts/run` | 200 OK |
| 3 | Login as `admin@lumich.test`, check bell | Notification "Invoice Jatuh Tempo" with invoice number and overdue days |
| 4 | POST to `/api/alerts/run` again | 200 OK |
| 5 | Check bell — a second overdue notification appears (no cooldown = fires daily) | Second notification present |

**Pass/Fail:** ⬜

---

### ALT-06: Stock Overstock Alert — 24h Cooldown

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to `/admin/settings/alerts`, set "Batas Stok Maksimal (butir)" to `1` (lower than current stock), click Simpan | Saved |
| 3 | POST to `/api/alerts/run` | 200 OK |
| 4 | Check bell — notification "Stok Terlalu Tinggi" visible | Notification present |
| 5 | POST to `/api/alerts/run` again (same day) | 200 OK |
| 6 | Check bell — no duplicate stock alert within 24h | No duplicate |
| 7 | Reset stock threshold to `10000`, click Simpan | Saved |

**Pass/Fail:** ⬜

---

### NOTIF-01: Bell Icon — Unread Count Badge

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Trigger at least 1 alert via POST `/api/alerts/run` | Alert fired |
| 3 | Check bell icon in sidebar/navbar | Red badge with unread count visible |
| 4 | Click notification in dropdown | Notification marked as read |
| 5 | Badge count decreases by 1 | Count updated |
| 6 | Mark all as read | Badge disappears |

**Pass/Fail:** ⬜

---

### NOTIF-02: Notification Role Targeting

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Ensure HDP drop alert was fired (targetRole: `supervisor`) | Alert in DB |
| 2 | Login as `operator@lumich.test` | Success |
| 3 | Check bell icon | HDP drop notification NOT visible to operator |
| 4 | Login as `supervisor@lumich.test` | Success |
| 5 | Check bell icon | HDP drop notification IS visible to supervisor |
| 6 | Overdue invoice alert (targetRole: `admin`) — login as supervisor | Success |
| 7 | Check bell | Overdue invoice alert NOT visible to supervisor |

**Pass/Fail:** ⬜

---

### NOTIF-03: Admin Alert Settings — Access Control

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `supervisor@lumich.test` | Success |
| 2 | Navigate to `/admin/settings/alerts` directly | Redirected to `/dashboard` |
| 3 | Login as `operator@lumich.test` | Success |
| 4 | Navigate to `/admin/settings/alerts` directly | Redirected to `/dashboard` |
| 5 | Login as `admin@lumich.test` | Success |
| 6 | Navigate to `/admin/settings/alerts` | Page loads, all threshold fields visible |

**Pass/Fail:** ⬜

---

### IMP-01: CSV Import — Download Template

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to `/admin/import` | Import landing page loads |
| 3 | Select entity "Flock (Master)" | Entity selected |
| 4 | Click "Download Template" | CSV file downloads: `template_flocks.csv` |
| 5 | Open CSV — verify header row present: `coop_id,name,arrival_date,initial_count,breed` | Headers correct |
| 6 | Repeat for "Produksi Harian", "Pelanggan", "Stok Awal" | Each entity downloads correct template |

**Pass/Fail:** ⬜

---

### IMP-02: CSV Import — Preview Before Import

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to `/admin/import` | Page loads |
| 3 | Select "Pelanggan" | Entity selected |
| 4 | Prepare valid CSV: 3 valid rows + 1 row with empty `name` field | CSV ready |
| 5 | Upload CSV, click "Pratinjau Data" | Preview step shown |
| 6 | Verify: "3 baris valid", "1 baris error" counts shown | Counts correct |
| 7 | Verify error row shows Baris number + reason (e.g., "name: wajib diisi") | Error detail visible |
| 8 | Verify sample table shows ≤5 valid rows | Sample table present |
| 9 | Verify NO data written to DB at this point (check customer list) | Customer count unchanged |

**Pass/Fail:** ⬜

---

### IMP-03: CSV Import — Konfirmasi Import

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Following IMP-02 preview step (3 valid rows) | Preview shown |
| 2 | Click "Konfirmasi Import (3 baris valid)" | Loading state |
| 3 | Success screen: "Import Berhasil — 3 baris berhasil diimpor" | Success message |
| 4 | Navigate to `/admin/pelanggan` | 3 new customers visible |
| 5 | Verify imported customers have `is_imported = true` (check Drizzle Studio or DB) | Flag set |

**Pass/Fail:** ⬜

---

### IMP-04: CSV Import — FK Validation (Flock Import)

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to `/admin/import`, select "Flock (Master)" | Selected |
| 3 | Prepare CSV: 1 row with valid existing `coop_id`, 1 row with non-existent `coop_id` | CSV ready |
| 4 | Upload CSV, click "Pratinjau Data" | Preview shown |
| 5 | Verify: "1 baris valid", "1 baris error" | Counts correct |
| 6 | Error row shows message about invalid `coop_id` | FK error message |

**Pass/Fail:** ⬜

---

### IMP-05: CSV Import — Duplicate Check (Daily Records)

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Pre-condition: daily record already exists for flock X on date 2026-01-10 | Record in DB |
| 2 | Login as `admin@lumich.test` | Success |
| 3 | Navigate to `/admin/import`, select "Produksi Harian" | Selected |
| 4 | Upload CSV with a row for same flock X on same date 2026-01-10 | CSV uploaded |
| 5 | Click "Pratinjau Data" | Preview shown |
| 6 | That row appears in error section: duplicate record detected | Error visible |

**Pass/Fail:** ⬜

---

### IMP-06: CSV Import — Full Rollback on System Error

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Prepare a large valid CSV import for "Pelanggan" (10 valid rows) | CSV ready |
| 3 | Simulate DB error mid-import (e.g., disconnect DB briefly or use a row that violates DB constraint not caught in preview) | Error triggered |
| 4 | Verify: error message shown "Gagal mengimpor data — semua perubahan dibatalkan" | Error displayed |
| 5 | Check customer list — NONE of the 10 rows were persisted | Count unchanged (rollback worked) |

**Pass/Fail:** ⬜

---

### IMP-07: CSV Import — Admin Only

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `supervisor@lumich.test` | Success |
| 2 | Navigate to `/admin/import` directly | Redirected to `/dashboard` |
| 3 | Login as `operator@lumich.test` | Success |
| 4 | Navigate to `/admin/import` directly | Redirected to `/dashboard` |

**Pass/Fail:** ⬜

---

### LOCK-01: Operator Lock Period — Cannot Edit Past H+1

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `operator@lumich.test` | Success |
| 2 | Navigate to `/produksi` | Produksi page loads |
| 3 | Attempt to edit a daily record from 3 days ago | Edit button disabled OR form shows "Periode lock" tooltip |
| 4 | Attempt to edit a daily record from yesterday (H+1) | Edit allowed |
| 5 | Attempt to edit a daily record from today | Edit allowed |

**Pass/Fail:** ⬜

---

### LOCK-02: Supervisor Lock Period — Cannot Edit Past H+7

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `supervisor@lumich.test` | Success |
| 2 | Navigate to `/produksi` | Produksi page loads |
| 3 | Attempt to edit a daily record from 8 days ago | Edit blocked |
| 4 | Attempt to edit a daily record from 7 days ago (H+7) | Edit allowed |
| 5 | Attempt to edit a daily record from 3 days ago | Edit allowed |

**Pass/Fail:** ⬜

---

### LOCK-03: Admin — Unlimited Edit With Correction Record

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to a daily record from 30 days ago | Record visible |
| 3 | Click Edit | Reason modal appears: "Alasan Koreksi (wajib diisi)" |
| 4 | Submit without filling reason | Validation error: reason wajib |
| 5 | Fill in reason, submit changes | Edit saved |
| 6 | Verify correction_records row created (check Drizzle Studio): entity_type = `daily_records`, old_value, new_value, reason, corrected_by | Row present |

**Pass/Fail:** ⬜

---

### LOCK-04: Correction — eggs_grade_a Creates Compensating Inventory Movement

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Find a locked daily record with `eggs_grade_a` value (e.g., 500) | Record found |
| 3 | Edit `eggs_grade_a` to new value (e.g., 450), fill reason | Form submitted |
| 4 | Verify edit saved — daily record shows new value 450 | Updated |
| 5 | Check `inventory_movements` in Drizzle Studio | New row: type `adjustment`, grade A, quantity = difference (-50), source = correction | Movement created |
| 6 | Verify correction_records row for `eggs_grade_a` field with old_value 500, new_value 450 | Audit row present |

**Pass/Fail:** ⬜

---

### LOCK-05: Lock Enforced at Service Level (Not Just UI)

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Obtain valid session token for `operator@lumich.test` | Token obtained |
| 2 | Craft direct POST to server action endpoint for `updateDailyRecord` with a record_date = 10 days ago | Request sent |
| 3 | Verify response: error message "Periode koreksi telah berakhir" or equivalent | Access denied at service level |

**Pass/Fail:** ⬜

---

## Regression Test Cases

### REG-01: Daily Production Input Still Works (No Lock Regression)

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `operator@lumich.test` | Success |
| 2 | Navigate to `/produksi` | Page loads |
| 3 | Enter today's daily record for an assigned coop | Form submits, record saved |
| 4 | Edit today's record | Edit works normally |

**Pass/Fail:** ⬜

---

### REG-02: Sales Order Confirm/Cancel Still Works

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Create a new sales order | SO created (status: draft) |
| 3 | Confirm SO | SO confirmed, invoice auto-created |
| 4 | Attempt to cancel a recent SO | Cancel works (within lock window) |

**Pass/Fail:** ⬜

---

### REG-03: Stock Adjustment Still Works

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to `/stok` | Stok page loads |
| 3 | Create a new stock adjustment for today | Adjustment saved, inventory_movements updated |
| 4 | Verify stock balance reflects adjustment | Balance correct |

**Pass/Fail:** ⬜

---

### REG-04: Admin Settings Page — All Existing Menus Present

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to `/admin` | Admin index loads |
| 3 | Verify existing cards present: Users, Kandang, Pelanggan, Fase Ayam, Template WhatsApp | All 5 present |
| 4 | Verify new cards: Import Data, Konfigurasi Alert | Both new cards present |
| 5 | Click "Import Data" | Navigates to `/admin/import` |
| 6 | Click "Konfigurasi Alert" | Navigates to `/admin/settings/alerts` |

**Pass/Fail:** ⬜

---

### REG-05: Dashboard and Invoice Pages Unaffected

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to `/dashboard` | Dashboard loads, KPI widgets visible |
| 3 | Navigate to `/penjualan/invoices` | Invoice list loads |
| 4 | Open any invoice detail | Detail page loads, payment form works |
| 5 | Navigate to `/laporan` | Aging report loads |

**Pass/Fail:** ⬜

---

## Summary

| Test ID | Description | Pass/Fail |
|---------|-------------|-----------|
| ALT-01 | Alert webhook authentication required | ⬜ |
| ALT-02 | Phase change alert fires once per phase | ⬜ |
| ALT-03 | HDP drop alert fires + 24h dedup | ⬜ |
| ALT-04 | FCR threshold configurable, affects alert | ⬜ |
| ALT-05 | Overdue invoice alert fires daily (no cooldown) | ⬜ |
| ALT-06 | Stock overstock alert fires + 24h dedup | ⬜ |
| NOTIF-01 | Bell icon badge count, mark as read | ⬜ |
| NOTIF-02 | Notification role targeting correct | ⬜ |
| NOTIF-03 | Alert settings admin-only access | ⬜ |
| IMP-01 | CSV template download per entity | ⬜ |
| IMP-02 | CSV preview shows valid/error counts before DB write | ⬜ |
| IMP-03 | Konfirmasi import saves valid rows | ⬜ |
| IMP-04 | FK validation — invalid coop_id caught in preview | ⬜ |
| IMP-05 | Duplicate check — duplicate daily record caught | ⬜ |
| IMP-06 | System error → full rollback | ⬜ |
| IMP-07 | Import admin-only access | ⬜ |
| LOCK-01 | Operator blocked past H+1 | ⬜ |
| LOCK-02 | Supervisor blocked past H+7 | ⬜ |
| LOCK-03 | Admin edit locked record requires reason → correction_records | ⬜ |
| LOCK-04 | eggs_grade_a correction creates compensating inventory_movements | ⬜ |
| LOCK-05 | Lock enforced at service level not just UI | ⬜ |
| REG-01 | Daily production input unaffected | ⬜ |
| REG-02 | SO confirm/cancel unaffected | ⬜ |
| REG-03 | Stock adjustment unaffected | ⬜ |
| REG-04 | Admin index has new + existing cards | ⬜ |
| REG-05 | Dashboard and invoice pages unaffected | ⬜ |

**Test user credentials (via Supabase Auth):**
- Admin: `admin@lumich.test` / Password123
- Supervisor: `supervisor@lumich.test` / Password123
- Operator: `operator@lumich.test` / Password123

**Known limitations:**
- pg_cron fires at 23:00 UTC (06:00 WIB) — use the `/api/alerts/run` webhook endpoint for manual testing
- Alert cooldowns persist in DB; clear `alert_cooldowns` table between test runs if re-testing same alert conditions
- Lock period tests require records with specific dates — seed or use existing historical records accordingly
- `ALERT_WEBHOOK_SECRET` must match exactly between `.env.local` and the `x-alert-secret` header in manual test calls
