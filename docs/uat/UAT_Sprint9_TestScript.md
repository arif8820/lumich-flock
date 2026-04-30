# UAT Sprint 9 — Admin Role Test Script

**Date:** _____________
**Tester:** _____________
**Environment:** Staging
**Role under test:** Admin
**Build/Commit:** _____________

---

## Sign-off Criteria
- All 27 scenarios: Pass
- Zero critical bugs open
- Invoice PDF renders successfully
- Aging report data matches manual calculation

---

## Section A — User Management

| # | Step | Expected Result | Actual Result | Pass/Fail |
|---|------|----------------|---------------|-----------|
| 1 | Navigate to **Admin > Users**. Click **"Add User"**. Fill in: Name, Email, Role = Operator, Coop Assignment = Coop A. Click **Submit**. Open a new incognito window, log in as the new user with the credentials just created. | User record created and appears in the Users list. Login succeeds. Only "Coop A" is visible in the coop selector/dropdown throughout the app. No other coops are accessible. | | |
| 2 | Navigate to **Admin > Users**. Click **"Add User"**. Fill in: Name, Email, Role = Supervisor. Leave coop assignment empty (or "All Coops"). Click **Submit**. Open a new incognito window and log in as the new supervisor user. | User record created and appears in the Users list. Login succeeds. All coops are visible and selectable. No coop restriction applied. | | |
| 3 | Navigate to **Admin > Users**. Find an existing active user. Click **"Deactivate"** (or toggle the Active switch to Off). Confirm the dialog. Attempt to log in as that user in a new incognito window. | User status changes to Inactive in the Users list. Login attempt is blocked — an error message is displayed (e.g., "Akun Anda telah dinonaktifkan"). | | |

---

## Section B — Data Entry: Full Date Range

| # | Step | Expected Result | Actual Result | Pass/Fail |
|---|------|----------------|---------------|-----------|
| 4 | Navigate to **Produksi > Input Harian**. Select today's date. Select any coop. Fill in: eggs laid, deaths, feed consumed. Click **Submit**. Then navigate to **Dashboard**. | Record saves successfully. Success toast/message shown. Dashboard KPI widgets (HDP%, population, FCR) reflect the new data immediately. | | |
| 5 | Navigate to **Produksi > Input Harian**. Set date to **yesterday (H-1)**. Select a coop. Fill in all required fields. Click **Submit**. | Record saves successfully. No lock error displayed. Record visible in production history for H-1. | | |
| 6 | Navigate to **Produksi > Input Harian**. Set date to **two days ago (H-2)**. Select a coop. Fill in all required fields. Click **Submit**. | Record saves successfully. Admin is not subject to the H+1 operator lock or H+7 supervisor lock — edit allowed. No lock error displayed. | | |
| 7 | Navigate to **Produksi > Input Harian** (or find an existing record). Set date to **H-3 or earlier** (any date older than 3 days). Fill in or modify data. Click **Submit**. Then navigate to **Admin > Audit Trail** (or `correction_records` query) to verify. | Record saves successfully. A new entry is created in `correction_records` capturing: user ID, timestamp, table affected, old value, new value. Audit trail entry visible in Admin panel or logs. | | |

---

## Section C — Inventory

| # | Step | Expected Result | Actual Result | Pass/Fail |
|---|------|----------------|---------------|-----------|
| 8 | Navigate to **Stok > Penyesuaian Stok** (Stock Adjustment). Select item (e.g., Telur Grade A). Enter adjustment quantity (positive or negative). Add a reason/note. Click **Submit**. | Adjustment saved. A new row appended to `inventory_movements` (NOT an update to existing row). Stock balance in **Stok > Saldo Stok** reflects the change immediately. | | |
| 9 | Navigate to **Stok > Regrading**. Click **"Buat Regrading"**. Select source grade, target grade, and quantity. Click **Submit**. Check the regrade request list. | Regrade request created with status = **Pending**. Appears in the regrade request list awaiting approval. Stock not yet changed. | | |
| 10 | Navigate to **Stok > Regrading**. Find the pending regrade request created in scenario 9. Click **"Approve"**. Confirm the dialog. Check the regrade request status and stock balances. | Regrade request status changes to **Approved**. `inventory_movements` appended with two rows: deduction from source grade, addition to target grade. Stock balance for both grades updated accordingly. | | |
| 11 | Navigate to **Stok > Regrading**. Create a new regrade request (same steps as scenario 9). Then click **"Reject"** on the pending request. Confirm the dialog. Check the regrade request status and stock balances. | Regrade request status changes to **Rejected**. No new rows added to `inventory_movements`. Stock balances for source and target grade remain unchanged. | | |

---

## Section D — Sales

| # | Step | Expected Result | Actual Result | Pass/Fail |
|---|------|----------------|---------------|-----------|
| 12 | Navigate to **Sales > Sales Order**. Click **"Buat SO"**. Select a customer. Add a line item: select product (e.g., Telur Grade A), enter quantity **exceeding current stock**. Click **Submit** or **Save**. | System runs a stock availability check. An error or warning is displayed indicating insufficient stock. The SO is not confirmed/finalized. | | |
| 13 | Navigate to **Sales > Sales Order**. Click **"Buat SO"**. Select a customer. Add a line item with quantity **within available stock**. Save the SO as Draft. Then click **"Konfirmasi SO"**. | SO status changes from Draft to **Confirmed**. Stock quantity for the selected product is **reserved** (reserved quantity increases). Available stock decreases by the SO quantity. | | |
| 14 | Find the confirmed SO from scenario 13. Click **"Proses Fulfillment"** (or "Kirim / Fulfill"). Confirm the action. Navigate to **Stok > Saldo Stok** and check the invoice list. | SO status changes to **Fulfilled**. Reserved stock is released and actual stock is **deducted** (inventory_movements appended). An **Invoice** is automatically created and linked to the SO, visible in **Sales > Invoice**. | | |
| 15 | Navigate to **Sales > Retur**. Click **"Buat Retur"**. Select the fulfilled SO from scenario 14. Select returned items and quantity. Submit the return. Check **Sales > Credit Note**. | Return recorded. A **Credit Note** is automatically generated and linked to the customer account. Credit note appears in the Credit Note list with status = Available. Stock is restocked (inventory_movements appended with return entry). | | |
| 16 | Navigate to **Sales > Invoice**. Create or find an open invoice for the same customer. Click **"Terapkan Credit Note"**. Select the credit note from scenario 15. Confirm. | Credit note applied to the invoice. Invoice balance reduced by the credit note amount. Credit note status changes to **Used** (or partially used if partial). Invoice history shows the credit note application. | | |

---

## Section E — Finance

| # | Step | Expected Result | Actual Result | Pass/Fail |
|---|------|----------------|---------------|-----------|
| 17 | Navigate to **Sales > Invoice**. Find an unpaid invoice. Click **"Catat Pembayaran"**. Select method = **Cash**. Enter the payment amount equal to the invoice total. Click **Submit**. | Payment recorded. Invoice status changes to **Paid** (or Lunas). Payment entry appears in the payment history for this invoice. | | |
| 18 | Navigate to **Sales > Invoice**. Find another unpaid invoice. Click **"Catat Pembayaran"**. Select method = **Transfer Bank**. Enter amount, bank name, and a **reference number** (e.g., transfer receipt number). Click **Submit**. | Payment recorded with reference number saved. Invoice status updates. Reference number visible in payment detail view. | | |
| 19 | Navigate to **Sales > Invoice** or **Pelanggan > Kredit**. Find a customer with an available credit balance. Open an unpaid invoice for that customer. Click **"Terapkan Kredit Pelanggan"**. Enter the amount to apply (up to credit balance). Confirm. | Customer credit balance is reduced by the applied amount. Invoice balance decreases accordingly. If invoice fully covered, status = Paid. Credit application recorded in payment/credit history. | | |

---

## Section F — Import

| # | Step | Expected Result | Actual Result | Pass/Fail |
|---|------|----------------|---------------|-----------|
| 20 | Navigate to **Admin > Import Data**. Download the **Flocks CSV template**. Fill in 2–3 valid flock rows (batch name, coop, arrival date, initial count, breed). Upload the filled CSV. Click **"Import"**. | Import runs successfully. Success message shown with count of rows imported. New flock records appear in **Flock > Daftar Flock** with `is_imported = true` flag. No duplicate records created. | | |
| 21 | Navigate to **Admin > Import Data**. Prepare a CSV with deliberate validation errors (e.g., missing required field, invalid date format, non-existent coop ID). Upload the CSV. Click **"Import"**. | Import is **rejected entirely** — no partial import. An error report is displayed listing each row with its validation error and reason. Zero new flock records created in the database. | | |

---

## Section G — Reports

| # | Step | Expected Result | Actual Result | Pass/Fail |
|---|------|----------------|---------------|-----------|
| 22 | Navigate to **Laporan > Aging Piutang**. Set date range to include invoices that are overdue (past due date). Click **"Tampilkan"**. | Aging report loads and lists overdue invoices grouped by aging bucket (e.g., 1–30 days, 31–60 days, 61–90 days, >90 days). Each row shows: customer name, invoice number, invoice date, due date, outstanding amount, days overdue. Totals match sum of displayed rows. | | |
| 23 | On the Aging Piutang report page (from scenario 22), click **"Download CSV"** or **"Export CSV"**. Open the downloaded file in Excel/spreadsheet. | CSV file downloads successfully. Column headers match the UI table. Row data (customer, invoice number, amounts, days overdue) matches the values shown on the UI report. Totals row present. | | |
| 24 | Navigate to **Laporan > Produksi**. Set a date range spanning at least 7 days with existing daily records. Click **"Tampilkan"**. | Production report loads showing daily records aggregated by date and/or coop. Totals (total eggs, total deaths, total feed) match the sum of individual daily_records entries for the selected period. HDP% and FCR computed correctly. | | |
| 25 | Navigate to **Sales > Invoice**. Find any paid or open invoice. Click **"Generate PDF"** (or the PDF icon). If email notification is configured, check the configured email inbox. | Invoice PDF opens in a new browser tab or downloads within 5 seconds. PDF contains: invoice number, customer details, line items, totals, tax (if applicable), payment status. If email configured, email with PDF attachment received. | | |

---

## Section H — Coop Management

| # | Step | Expected Result | Actual Result | Pass/Fail |
|---|------|----------------|---------------|-----------|
| 26 | Navigate to **Admin > Kandang** (Coop Management). Click **"Tambah Kandang"**. Fill in: Coop Name (e.g., "Kandang D"), Capacity. Click **Submit**. Check the coop list. | New coop appears in the coop list immediately. Coop is also selectable in the coop dropdowns throughout the app (e.g., in Produksi > Input Harian, User assignment). | | |
| 27 | Navigate to **Admin > Kandang**. Find an existing coop. Click **"Edit"**. Change the Coop Name to a new value. Click **"Simpan"**. Then navigate to other sections that display coop names (e.g., Flock list, daily records, user assignments). | Coop name updated in the coop list. Updated name reflected everywhere the coop is referenced: flock list, daily records display, user coop assignment panel, dashboard coop selector. No orphaned references to the old name. | | |

---

## Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Admin (tester) | | | |
| Farm Owner / PIC | | | |

**Result:** ☐ Pass — ready for go-live &nbsp;&nbsp; ☐ Fail — bugs must be fixed first

**Open bugs (if any):**

| # | Description | Severity | Status |
|---|-------------|----------|--------|
| | | | |
