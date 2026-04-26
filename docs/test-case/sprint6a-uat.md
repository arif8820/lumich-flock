# Sprint 6a UAT Test Cases

**Date:** 2026-04-25
**Sprint:** 6a — Invoice, Payment Recording, Credit Application, Aging Report

---

## Test Environment

| Item | Value |
|------|-------|
| Base URL | `http://localhost:3000` |
| Test Data | Pre-loaded: 2 active customers (Toko Maju: credit limit Rp 10.000.000 / payment terms 30 days; Toko Cepat: cash), 1 fulfilled credit SO (INV-202604-0001 status: sent, total Rp 1.500.000), 1 fulfilled cash SO (RCP-202604-0001 status: paid) |
| Test Users | `supervisor@lumich.test` (supervisor), `admin@lumich.test` (admin), `operator@lumich.test` (operator) |

---

## Functional Test Cases

### INV-01: Invoice Auto-Created on SO Fulfillment (Credit)

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success, redirected to dashboard |
| 2 | Navigate to `/penjualan`, find a confirmed credit SO | SO detail page loads |
| 3 | Click "Fulfill" | SO status changes to `fulfilled` |
| 4 | Navigate to `/penjualan/invoices` | Invoice list shows new `sales_invoice` with status `sent` |
| 5 | Verify invoice number format: `INV-YYYYMM-XXXX` | Correct format displayed |
| 6 | Verify total amount matches SO total | Amounts match |
| 7 | Verify due date = issue date + customer payment terms (days) | Due date correct |

**Pass/Fail:** ⬜

---

### INV-02: Invoice Auto-Created on SO Fulfillment (Cash)

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Fulfill a confirmed cash SO | SO status: `fulfilled` |
| 3 | Navigate to `/penjualan/invoices` | Invoice list shows new `cash_receipt` with status `paid` |
| 4 | Verify invoice number format: `RCP-YYYYMM-XXXX` | Correct format |
| 5 | Verify paid amount = total amount | Fully paid on creation |

**Pass/Fail:** ⬜

---

### INV-03: Invoice List Page Access Control

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `operator@lumich.test` | Success |
| 2 | Navigate to `/penjualan/invoices` directly | Redirected to `/dashboard` |
| 3 | Logout, login as `supervisor@lumich.test` | Success |
| 4 | Navigate to `/penjualan/invoices` | Invoice list page loads successfully |
| 5 | Login as `admin@lumich.test` | Invoice list accessible |

**Pass/Fail:** ⬜

---

### INV-04: Invoice List — Status Filter

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `supervisor@lumich.test` | Success |
| 2 | Navigate to `/penjualan/invoices` | All invoices listed (Semua tab active) |
| 3 | Click filter button "Sent" | Only invoices with status `sent` shown |
| 4 | Click filter button "Paid" | Only invoices with status `paid` shown |
| 5 | Click filter button "Partial" | Only invoices with status `partial` shown |
| 6 | Click filter button "Semua" | All invoices shown again |
| 7 | Verify table columns: Nomor Invoice, Tanggal, Jatuh Tempo, Pelanggan, Total, Terbayar, Status, Detail | All 8 columns present |

**Pass/Fail:** ⬜

---

### INV-05: Invoice Detail Page — Info Display

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `supervisor@lumich.test` | Success |
| 2 | Navigate to `/penjualan/invoices`, click "Detail" on a credit invoice | Invoice detail page loads |
| 3 | Verify invoice info card shows: number, status badge, type, issue date, due date, customer name, SO link | All fields present |
| 4 | Verify financial summary shows: Total, Terbayar, Sisa | Values correct; Sisa = Total − Terbayar |
| 5 | Click SO link in info card | Navigates to correct SO detail page |
| 6 | Navigate back to invoice detail | Detail page reloads correctly |

**Pass/Fail:** ⬜

---

### INV-06: Record Payment — Partial

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to detail of invoice INV-202604-0001 (status: `sent`, total Rp 1.500.000) | Detail page loads |
| 3 | Verify "Catat Pembayaran" form is visible (admin + status sent) | Form present |
| 4 | Enter amount: Rp 500.000, method: transfer, payment date: today | Fields filled |
| 5 | Submit form | Success banner: "Pembayaran berhasil dicatat" |
| 6 | Verify invoice status changed to `partial` | Status badge shows Partial |
| 7 | Verify Terbayar = Rp 500.000, Sisa = Rp 1.000.000 | Financial summary updated |
| 8 | Verify payment history table shows 1 row: Rp 500.000 transfer today | Row visible |

**Pass/Fail:** ⬜

---

### INV-07: Record Payment — Full (Status → Paid)

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to invoice in status `partial` with Sisa Rp 1.000.000 | Detail page loads |
| 3 | Enter amount: Rp 1.000.000, method: cash, payment date: today | Fields filled |
| 4 | Submit form | Success banner displayed |
| 5 | Verify invoice status changed to `paid` | Status badge shows Paid |
| 6 | Verify "Catat Pembayaran" form is now hidden | Form not visible |
| 7 | Verify Terbayar = Total, Sisa = Rp 0 | Summary correct |

**Pass/Fail:** ⬜

---

### INV-08: Record Payment — Rp 1 Rounding Tolerance

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to invoice with total Rp 1.500.000, currently Terbayar Rp 0 | Detail page |
| 3 | Enter amount: Rp 1.499.999 (1 rupiah short of total) | Field filled |
| 4 | Submit payment | Invoice status changes to `paid` (Rp 1 rounding tolerance applied) |

**Pass/Fail:** ⬜

---

### INV-09: Record Payment — Overpayment Creates Customer Credit

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to invoice in status `sent`, total Rp 1.500.000 | Detail page |
| 3 | Enter amount: Rp 2.000.000 (overpay by Rp 500.000) | Field filled |
| 4 | Submit payment | Success, invoice status `paid` |
| 5 | Check notifications (admin) | Notification: "Kelebihan Bayar" for Rp 500.000 |
| 6 | Future invoice for same customer should show Rp 500.000 credit in Available Credits section | Credit visible |

**Pass/Fail:** ⬜

---

### INV-10: Record Payment — Blocked for Supervisor

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `supervisor@lumich.test` | Success |
| 2 | Navigate to any unpaid invoice detail page | Detail page loads |
| 3 | Verify "Catat Pembayaran" form is NOT visible | Form hidden for supervisor |

**Pass/Fail:** ⬜

---

### INV-11: Record Payment — Hidden on Paid/Cancelled Invoice

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to invoice with status `paid` | Detail page loads |
| 3 | Verify "Catat Pembayaran" form is NOT visible | Form hidden |
| 4 | Navigate to invoice with status `cancelled` | Detail page loads |
| 5 | Verify form is NOT visible | Form hidden |

**Pass/Fail:** ⬜

---

### INV-12: Apply Credit to Invoice

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Pre-condition: customer has an available credit note (from a sales return or overpayment) | Credit exists |
| 2 | Login as `admin@lumich.test` | Success |
| 3 | Navigate to an unpaid invoice for that customer | Detail page loads |
| 4 | Verify "Kredit Tersedia" section shows the credit with correct available amount | Section visible |
| 5 | Enter amount to apply (less than available credit), click "Terapkan" | Success banner: "Kredit berhasil diterapkan" |
| 6 | Verify invoice Terbayar increased by applied amount | Financial summary updated |
| 7 | Verify available credit balance reduced accordingly | Credit amount reduced |
| 8 | If applied amount covers full invoice → status becomes `paid` | Status badge correct |

**Pass/Fail:** ⬜

---

### INV-13: Apply Credit — Insufficient Amount Rejected

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to unpaid invoice, open Available Credits section | Section visible |
| 3 | Enter amount greater than available credit balance | Field filled |
| 4 | Submit | Error message displayed: kredit tidak mencukupi |

**Pass/Fail:** ⬜

---

### INV-14: Credit Note Created from Sales Return

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Approve a pending sales return | Return approved |
| 3 | Navigate to `/penjualan/invoices` | Credit note with type `credit_note` appears in list |
| 4 | Navigate to original paid invoice | Available Credits section shows the credit note |

**Pass/Fail:** ⬜

---

### LAP-01: Aging Report — Access Control

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `operator@lumich.test` | Success |
| 2 | Navigate to `/laporan` directly | Redirected to `/dashboard` |
| 3 | Logout, login as `supervisor@lumich.test` | Success |
| 4 | Navigate to `/laporan` | Aging report page loads |
| 5 | Login as `admin@lumich.test` | Aging report accessible |

**Pass/Fail:** ⬜

---

### LAP-02: Aging Report — KPI Cards and Table

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to `/laporan` | Page loads |
| 3 | Verify 4 KPI cards present: 0–7 Hari, 8–14 Hari, 15–30 Hari, >30 Hari | All 4 cards visible |
| 4 | Verify each KPI shows sum of outstanding for that bucket | Amounts correct |
| 5 | Verify table columns: Pelanggan, No. Invoice, Tgl Terbit, Jatuh Tempo, Total, Terbayar, Sisa, Hari Lewat, Kategori | All 9 columns present |
| 6 | Verify "Hari Lewat" 0–7 = neutral color, 8–14 = orange, 15–30 = red, >30 = bold red | Color coding correct |
| 7 | Verify only overdue invoices appear (status: sent/partial/overdue, dueDate < today) | No future-due or paid invoices shown |

**Pass/Fail:** ⬜

---

### LAP-03: Aging Report — CSV Export (Admin)

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to `/laporan` | CSV export button visible |
| 3 | Click "Export CSV" | File `aging-report.csv` downloads |
| 4 | Open CSV in spreadsheet | Correct columns: invoiceNumber, customerName, issueDate, dueDate, totalAmount, paidAmount, outstanding, daysOverdue, bucket |
| 5 | Verify row data matches table on page | Data consistent |

**Pass/Fail:** ⬜

---

### LAP-04: Aging Report — CSV Export (Supervisor)

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `supervisor@lumich.test` | Success |
| 2 | Navigate to `/laporan` | Export CSV button visible (supervisor also has access) |
| 3 | Click "Export CSV" | File downloads successfully |

**Pass/Fail:** ⬜

---

### LAP-05: Aging Report — Empty State

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Ensure all invoices are paid or not yet due | Pre-condition set |
| 3 | Navigate to `/laporan` | Page shows "Tidak ada data piutang jatuh tempo" or all KPIs at Rp 0 with empty table |

**Pass/Fail:** ⬜

---

### DASH-01: Dashboard Aging Widget — Admin/Supervisor

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to `/dashboard` | Dashboard loads |
| 3 | Scroll to bottom | Aging widget "5 Invoice Jatuh Tempo" visible |
| 4 | Verify widget shows up to 5 overdue invoices with: Pelanggan, No. Invoice, Jatuh Tempo, Sisa, Hari Lewat | Columns correct |
| 5 | Verify "Hari Lewat" color-coded same as laporan page | Colors match |
| 6 | Click "Lihat semua" link | Navigates to `/laporan` |
| 7 | Logout, login as `supervisor@lumich.test` | Success |
| 8 | Navigate to `/dashboard` | Aging widget visible for supervisor too |

**Pass/Fail:** ⬜

---

### DASH-02: Dashboard Aging Widget — Operator Hidden

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `operator@lumich.test` | Success |
| 2 | Navigate to `/dashboard` | Dashboard loads |
| 3 | Scroll to bottom | Aging widget NOT visible | 

**Pass/Fail:** ⬜

---

### NAV-01: Sidebar Navigation — Laporan and Invoices Links

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Check sidebar | "Laporan Piutang" nav item visible (BarChart2 icon) |
| 3 | Check sidebar under Penjualan | "Invoice" sub-link visible, indented under Penjualan |
| 4 | Click "Invoice" | Navigates to `/penjualan/invoices` |
| 5 | Click "Laporan Piutang" | Navigates to `/laporan` |
| 6 | Verify active state highlighted for current page | Active item highlighted in sidebar |
| 7 | Logout, login as `operator@lumich.test` | Success |
| 8 | Check sidebar | "Laporan Piutang" and "Invoice" sub-link NOT visible for operator |

**Pass/Fail:** ⬜

---

## Regression Test Cases

### REG-01: SO Fulfillment Still Works

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Create and confirm a new credit SO | SO status: `confirmed` |
| 3 | Fulfill the SO | SO status: `fulfilled`, invoice auto-created |
| 4 | Navigate to `/penjualan/invoices` | New invoice present |

**Pass/Fail:** ⬜

---

### REG-02: Sales Return Still Creates Credit Note

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Create and approve a sales return against a paid invoice | Return approved |
| 3 | Navigate to `/penjualan/invoices` | Credit note (type: `credit_note`) appears in list |
| 4 | Navigate to customer's next unpaid invoice | Credit note visible in Available Credits section |

**Pass/Fail:** ⬜

---

### REG-03: Stock Balance Unaffected by Payment Operations

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Note current stock balance at `/stok` | Balance recorded |
| 3 | Record a payment on an existing invoice | Payment recorded |
| 4 | Apply a credit to an existing invoice | Credit applied |
| 5 | Navigate to `/stok` | Stock balance unchanged from step 2 |

**Pass/Fail:** ⬜

---

## Summary

| Test ID | Description | Pass/Fail |
|---------|-------------|-----------|
| INV-01 | Invoice auto-created on credit SO fulfillment | ⬜ |
| INV-02 | Invoice auto-created on cash SO fulfillment | ⬜ |
| INV-03 | Invoice list access control | ⬜ |
| INV-04 | Invoice list status filter | ⬜ |
| INV-05 | Invoice detail info display | ⬜ |
| INV-06 | Record partial payment | ⬜ |
| INV-07 | Record full payment → paid status | ⬜ |
| INV-08 | Rp 1 rounding tolerance | ⬜ |
| INV-09 | Overpayment creates customer credit | ⬜ |
| INV-10 | Payment form hidden for supervisor | ⬜ |
| INV-11 | Payment form hidden on paid/cancelled | ⬜ |
| INV-12 | Apply credit to invoice | ⬜ |
| INV-13 | Apply credit — insufficient rejected | ⬜ |
| INV-14 | Credit note from sales return | ⬜ |
| LAP-01 | Aging report access control | ⬜ |
| LAP-02 | Aging report KPI cards and table | ⬜ |
| LAP-03 | CSV export — admin | ⬜ |
| LAP-04 | CSV export — supervisor | ⬜ |
| LAP-05 | Aging report empty state | ⬜ |
| DASH-01 | Dashboard aging widget — admin/supervisor | ⬜ |
| DASH-02 | Dashboard aging widget — operator hidden | ⬜ |
| NAV-01 | Sidebar Laporan + Invoices links | ⬜ |
| REG-01 | SO fulfillment regression | ⬜ |
| REG-02 | Sales return credit note regression | ⬜ |
| REG-03 | Stock balance unaffected by payments | ⬜ |

**Test user credentials (via Supabase Auth):**
- Supervisor: `supervisor@lumich.test` / Password123
- Admin: `admin@lumich.test` / Password123
- Operator: `operator@lumich.test` / Password123