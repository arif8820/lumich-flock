# Sprint 6b UAT Test Cases

**Date:** 2026-04-26
**Sprint:** 6b — PDF Generation, WhatsApp Share, Email Send, WA Template Config

---

## Test Environment

| Item | Value |
|------|-------|
| Base URL | `http://localhost:3000` |
| Pre-req | Supabase Storage bucket `invoices` created (public: false) |
| Pre-req | `.env.local` has `RESEND_API_KEY` and `EMAIL_FROM` set |
| Pre-req | At least 1 invoice exists with status `sent` or `partial` |
| Test Users | `admin@lumich.test` (admin), `supervisor@lumich.test` (supervisor), `operator@lumich.test` (operator) |

---

## Functional Test Cases

### PDF-01: Generate PDF via API Route

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to `/penjualan/invoices`, click Detail on any invoice | Invoice detail page loads |
| 3 | Note the invoice ID from URL (`/penjualan/invoices/<uuid>`) | UUID recorded |
| 4 | Open new tab, navigate to `/api/invoices/<uuid>/pdf` | PDF file downloads or opens in browser |
| 5 | Verify PDF contains: company name "LumichFarm", invoice number, customer name, items table, totals | All fields present |
| 6 | Verify PDF title: "INVOICE" for sales_invoice, "KWITANSI" for cash_receipt, "NOTA KREDIT" for credit_note | Title correct |
| 7 | Verify download filename = `<invoiceNumber>.pdf` | Correct filename |

**Pass/Fail:** ⬜

---

### PDF-02: PDF Caching — Second Request Uses Cache

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to `/api/invoices/<uuid>/pdf` (first request) | PDF generated, response time noted |
| 3 | Navigate to same URL again (second request within 6 days) | PDF served faster (from cache) OR redirected to signed URL |
| 4 | Verify PDF content is identical | Same document |

**Pass/Fail:** ⬜

---

### PDF-03: PDF Access — Auth Required

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Log out of application | Logged out |
| 2 | Navigate to `/api/invoices/<uuid>/pdf` directly | Response: 401 "Tidak diizinkan" |
| 3 | Login as `operator@lumich.test` | Success |
| 4 | Navigate to `/api/invoices/<uuid>/pdf` | PDF accessible (no role restriction on PDF download) |

**Pass/Fail:** ⬜

---

### PDF-04: PDF Content — Items Table and Totals

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Open a sales invoice that has SO items attached | Invoice detail page |
| 3 | Download PDF via `/api/invoices/<uuid>/pdf` | PDF opens |
| 4 | Verify items table shows: Keterangan, Qty, Satuan, Harga/Satuan, Diskon %, Subtotal | All 6 columns present |
| 5 | Verify totals section: Subtotal, PPN (0%), Total, Terbayar, Sisa | All 5 rows present |
| 6 | Verify Total in PDF matches invoice total on detail page | Amounts match |

**Pass/Fail:** ⬜

---

### PDF-05: Cash Receipt — Stamp Area Present

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Find an invoice with type `cash_receipt` (RCP- prefix) | Invoice found |
| 3 | Download PDF via `/api/invoices/<uuid>/pdf` | PDF opens |
| 4 | Verify stamp area "Tanda Tangan & Cap" box is present at bottom | Stamp box visible |
| 5 | Download a `sales_invoice` PDF | PDF opens |
| 6 | Verify stamp area is NOT present (shows print date instead) | No stamp box |

**Pass/Fail:** ⬜

---

### WA-01: WhatsApp Share Button — Visible When Phone Present

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Pre-condition: customer has phone number stored in `/admin/pelanggan` | Phone number set |
| 2 | Login as `admin@lumich.test` | Success |
| 3 | Navigate to invoice detail for that customer | Detail page loads |
| 4 | Verify "Kirim WA" button is visible (green, WhatsApp color) | Button present |
| 5 | Click "Kirim WA" | New tab/window opens with `wa.me` URL |
| 6 | Verify WA message contains: customer name, invoice number, total (Rp format), due date, PDF URL (or "belum tersedia") | All variables substituted correctly |

**Pass/Fail:** ⬜

---

### WA-02: WhatsApp Share — E.164 Phone Normalisation

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Pre-condition: customer phone stored as `0812-3456-7890` (local Indonesian format) | Phone stored |
| 2 | Login as `admin@lumich.test` | Success |
| 3 | Navigate to invoice detail for that customer | Detail page loads |
| 4 | Click "Kirim WA" | wa.me URL in address bar |
| 5 | Verify URL starts with `https://wa.me/628123456789` (leading 0 → 62) | E.164 format correct |

**Pass/Fail:** ⬜

---

### WA-03: WhatsApp Button — Hidden When No Phone

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Pre-condition: customer has no phone number stored | Phone field blank |
| 2 | Login as `admin@lumich.test` | Success |
| 3 | Navigate to invoice detail for that customer | Detail page loads |
| 4 | Verify "Kirim WA" button is NOT visible | Button absent |

**Pass/Fail:** ⬜

---

### WA-04: WhatsApp Button — Hidden for Non-Admin

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `supervisor@lumich.test` | Success |
| 2 | Navigate to any invoice detail page | Detail page loads |
| 3 | Verify "Kirim WA" button is NOT visible (supervisor role) | Button absent |
| 4 | Logout, login as `operator@lumich.test` | Success |
| 5 | Navigate to any invoice detail (not redirected since supervisor can view) | — |
| Note | Operator is redirected at invoice list level; button check redundant | — |

**Pass/Fail:** ⬜

---

### WA-05: WhatsApp Button — Hidden When No WA Template Saved

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Pre-condition: delete/clear `wa_invoice_template` from `app_settings` in DB (or ensure it was never saved) | Template absent |
| 2 | Login as `admin@lumich.test` | Success |
| 3 | Navigate to invoice detail for customer with phone | Detail page loads |
| 4 | Verify "Kirim WA" button is NOT visible (no template = no button) | Button absent |

**Pass/Fail:** ⬜

---

### WA-06: WA Template Config — Save and Verify

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to `/admin/settings/wa-template` | WA template page loads |
| 3 | Verify current template shown in textarea | Default or saved template pre-filled |
| 4 | Verify variable hints section shows: `{customerName}`, `{invoiceNumber}`, `{totalAmount}`, `{dueDate}`, `{pdfUrl}` | All 5 variables listed |
| 5 | Verify preview section shows example message with variables replaced | Preview visible |
| 6 | Edit template: change greeting or add text | New text entered |
| 7 | Click "Simpan Template" | Success banner: "Template berhasil disimpan" |
| 8 | Refresh page | Updated template shown in textarea |
| 9 | Navigate to invoice detail with phone | WA button uses new template |

**Pass/Fail:** ⬜

---

### WA-07: WA Template Config — Access Control

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `supervisor@lumich.test` | Success |
| 2 | Navigate to `/admin/settings/wa-template` directly | Redirected to `/dashboard` |
| 3 | Login as `operator@lumich.test` | Success |
| 4 | Navigate to `/admin/settings/wa-template` directly | Redirected to `/dashboard` |
| 5 | Login as `admin@lumich.test` | Success |
| 6 | Navigate to `/admin/settings/wa-template` | Page loads successfully |

**Pass/Fail:** ⬜

---

### WA-08: WA Template Config — Validation

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to `/admin/settings/wa-template` | Page loads |
| 3 | Clear textarea, submit empty template | Error: "Template terlalu pendek" |
| 4 | Enter template < 10 characters, submit | Error: "Template terlalu pendek" |
| 5 | Enter template > 1000 characters, submit | Error: "Template terlalu panjang" |

**Pass/Fail:** ⬜

---

### WA-09: Admin Index — Template WhatsApp Menu Entry

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to `/admin` | Admin index page loads |
| 3 | Verify "Template WhatsApp" card is visible with MessageSquare icon | Card present |
| 4 | Click "Template WhatsApp" card | Navigates to `/admin/settings/wa-template` |

**Pass/Fail:** ⬜

---

### EMAIL-01: Send Invoice Email — Success

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Pre-condition: customer has email stored, `RESEND_API_KEY` + `EMAIL_FROM` set in `.env.local` | Setup complete |
| 2 | Login as `admin@lumich.test` | Success |
| 3 | Navigate to invoice detail for that customer | Detail page loads |
| 4 | Verify "Kirim Email" button visible (admin + customer has email) | Button present |
| 5 | Click "Kirim Email" | Loading state, then success banner: "Email berhasil dikirim" |
| 6 | Check customer inbox | Email received with subject "Invoice <INV-...> dari LumichFarm" |
| 7 | Verify email body contains: customer name, invoice number, total (Rp), due date | Content correct |
| 8 | Verify PDF attachment present, filename = `<invoiceNumber>.pdf` | Attachment present |

**Pass/Fail:** ⬜

---

### EMAIL-02: Send Email — Draft Invoice Transitions to Sent

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Pre-condition: invoice in status `draft` with customer email | Setup |
| 2 | Login as `admin@lumich.test` | Success |
| 3 | Navigate to draft invoice detail | Status shows `draft` |
| 4 | Click "Kirim Email" | Email sent |
| 5 | Verify invoice status changed to `sent` | Status badge: Sent |

**Pass/Fail:** ⬜

---

### EMAIL-03: Send Email — Button Hidden When No Email

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Pre-condition: customer has no email address stored | Email field blank |
| 2 | Login as `admin@lumich.test` | Success |
| 3 | Navigate to invoice detail for that customer | Detail page loads |
| 4 | Verify "Kirim Email" button is NOT visible | Button absent |

**Pass/Fail:** ⬜

---

### EMAIL-04: Send Email — Hidden for Non-Admin

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `supervisor@lumich.test` | Success |
| 2 | Navigate to any invoice detail | Detail page loads |
| 3 | Verify "Kirim Email" button is NOT visible | Button absent |

**Pass/Fail:** ⬜

---

### EMAIL-05: Send Email — Action Blocked Without RESEND_API_KEY

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Pre-condition: temporarily remove or blank `RESEND_API_KEY` from `.env.local`, restart dev server | Key absent |
| 2 | Login as `admin@lumich.test` | Success |
| 3 | Navigate to invoice detail with customer email | Detail page loads |
| 4 | Click "Kirim Email" | Error banner displayed (Gagal mengirim email) |
| 5 | Restore `RESEND_API_KEY` and restart dev server | Restored |

**Pass/Fail:** ⬜

---

## Regression Test Cases

### REG-01: Invoice Detail Page Still Works After Sprint 6b Changes

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to any invoice detail | Page loads correctly |
| 3 | Verify payment form still functional (record partial payment) | Payment recorded, status → partial |
| 4 | Verify apply credit still functional (if customer has credit) | Credit applied |
| 5 | Verify back link works | Returns to invoice list |

**Pass/Fail:** ⬜

---

### REG-02: Admin Settings Pages Unaffected

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to `/admin` | Admin index shows all existing pages AND new "Template WhatsApp" card |
| 3 | Navigate to `/admin/users` | User management loads correctly |
| 4 | Navigate to `/admin/pelanggan` | Customer management loads correctly |
| 5 | Navigate to `/admin/kandang` | Kandang page loads correctly |

**Pass/Fail:** ⬜

---

### REG-03: Dashboard and Laporan Unaffected

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to `/dashboard` | Dashboard loads, aging widget visible |
| 3 | Navigate to `/laporan` | Aging report loads, CSV export works |

**Pass/Fail:** ⬜

---

### REG-04: Penjualan (SO) Flow Unaffected

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Create new sales order, confirm, fulfill | SO fulfilled, invoice auto-created |
| 3 | Navigate to new invoice in `/penjualan/invoices` | Invoice shows PDF + WA + Email buttons (if customer has phone/email) |

**Pass/Fail:** ⬜

---

## Summary

| Test ID | Description | Pass/Fail |
|---------|-------------|-----------|
| PDF-01 | PDF generation via API route | ⬜ |
| PDF-02 | PDF caching — second request faster | ⬜ |
| PDF-03 | PDF auth required (401 if logged out) | ⬜ |
| PDF-04 | PDF items table and totals correct | ⬜ |
| PDF-05 | Cash receipt has stamp area | ⬜ |
| WA-01 | WA button visible when phone present | ⬜ |
| WA-02 | WA phone E.164 normalisation (0812 → 628) | ⬜ |
| WA-03 | WA button hidden when no phone | ⬜ |
| WA-04 | WA button hidden for non-admin | ⬜ |
| WA-05 | WA button hidden when no template | ⬜ |
| WA-06 | WA template save and verify | ⬜ |
| WA-07 | WA template access control | ⬜ |
| WA-08 | WA template validation | ⬜ |
| WA-09 | Admin index — Template WhatsApp menu | ⬜ |
| EMAIL-01 | Send invoice email success | ⬜ |
| EMAIL-02 | Email send transitions draft → sent | ⬜ |
| EMAIL-03 | Email button hidden when no email | ⬜ |
| EMAIL-04 | Email button hidden for non-admin | ⬜ |
| EMAIL-05 | Email blocked without RESEND_API_KEY | ⬜ |
| REG-01 | Invoice detail page still works | ⬜ |
| REG-02 | Admin settings pages unaffected | ⬜ |
| REG-03 | Dashboard and laporan unaffected | ⬜ |
| REG-04 | Penjualan (SO) flow unaffected | ⬜ |

**Test user credentials (via Supabase Auth):**
- Admin: `admin@lumich.test` / Password123
- Supervisor: `supervisor@lumich.test` / Password123
- Operator: `operator@lumich.test` / Password123

**Known limitations:**
- PDF signed URL valid 6 days max; WA link may break after 6 days without re-visiting PDF route
- Email action regenerates PDF fresh each send (not reusing cached Supabase Storage PDF)
- Bank details footer intentionally blank in MVP — configure `bank_details` key in `app_settings` to enable
