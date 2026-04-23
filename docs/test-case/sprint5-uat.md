# Sprint 5 UAT Test Cases

**Date:** 2026-04-23
**Sprint:** 5 — Sales Order & Sales Return

---

## Test Environment

| Item | Value |
|-------|--------|
| Base URL | `http://localhost:3000` |
| Test Data | Pre-loaded: 2 customers, 1 flock with stock balance 5000 Grade A, 3000 Grade B |
| Test Users | supervisor@lumich.test (supervisor role), admin@lumich.test (admin role) |

---

## Functional Test Cases

### SO-01: Create Draft Sales Order (Supervisor)

| Step | Action | Expected Result |
|-------|--------|----------------|
| 1 | Login as `supervisor@lumich.test` | Success, redirected to dashboard |
| 2 | Navigate to `/penjualan` | SO list page loads |
| 3 | Click "Buat SO Baru" | Create SO form loads |
| 4 | Select customer "Toko Maju" (active) | Customer selected, no warning banner |
| 5 | Set tanggal to today | Date populated |
| 6 | Set payment method to "Tunai" | Method selected |
| 7 | Add 1 item: egg_grade_a, 1000 butir, Rp 1500, 0% diskon | Item row added, subtotal: Rp 1.500.000 |
| 8 | Set PPN to 11% | Tax calculated: Rp 165.000 |
| 9 | Verify total: Rp 1.665.000 | Correct total displayed |
| 10 | Click "Simpan Draft" | Success toast, redirect to SO detail |

**Pass/Fail:** ⬜

---

### SO-02: Attempt Create SO with Blocked Customer (Supervisor)

| Step | Action | Expected Result |
|-------|--------|----------------|
| 1 | Login as `supervisor@lumich.test` | Success |
| 2 | Navigate to `/penjualan/new` | Create SO form loads |
| 3 | Select customer "Toko Diblokir" (status: blocked) | Warning banner appears: "Pelanggan ini diblokir" |
| 4 | Attempt to submit form | Error: "Pelanggan diblokir" |
| 5 | Override reason field NOT shown (supervisor) | Field not visible |

**Pass/Fail:** ⬜

---

### SO-03: Create SO with Blocked Customer + Admin Override

| Step | Action | Expected Result |
|-------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to `/penjualan/new` | Create SO form loads |
| 3 | Select customer "Toko Diblokir" | Warning banner: "Pelanggan ini diblokir" |
| 4 | Override reason field SHOWN (admin-only) | Field visible |
| 5 | Enter override reason: "Override untuk pelanggan lama" | Text entered |
| 6 | Fill item: egg_grade_b, A00 butir, Rp 1200 | Item added |
| 7 | Click "Simpan Draft" | Success, SO created with override note in `notes` |

**Pass/Fail:** ⬜

---

### SO-04: Confirm and Fulfill Cash SO (Supervisor)

| Step | Action | Expected Result |
|-------|--------|----------------|
| 1 | Login as `supervisor@lumich.test` | Success |
| 2 | Navigate to `/penjualan` | SO list loads |
| 3 | Click detail for draft SO (from SO-01) | SO detail page loads |
| 4 | Verify status badge: "Draft" | Badge shows muted color |
| 5 | Click "Konfirmasi" button | Status changes to "Dikonfirmasi" (blue) |
| 6 | Click "Fulfill" button | Confirmation dialog appears |
| 7 | Confirm fulfillment | Status changes to "Dipenuhi" (teal) |
| 8 | Verify inventory balance decreased | Stock: Grade A decreased by 1000 |
| 9 | Click "Detail" or check invoice | Invoice created with type: "cash_receipt", status: "paid" |

**Pass/Fail:** ⬜

---

### SO-05: Attempt Fulfill with Insufficient Stock (Race Condition Test)

| Step | Action | Expected Result |
|-------|--------|----------------|
| 1 | Login as `supervisor@lumich.test` | Success |
| 2 | Create SO with 10000 butir Grade A (current stock: 4000) | Draft created |
| 3 | Confirm SO | Status: confirmed |
| 4 | Click "Fulfill" | Error: "Stok tidak mencukupi saat transaksi diproses" |
| 5 | Verify SO status unchanged | Status still: confirmed (not fulfilled) |

**Pass/Fail:** ⬜

---

### SO-06: Create and Fulfill Credit SO (Supervisor)

| Step | Action | Expected Result |
|-------|--------|----------------|
| 1 | Login as `supervisor@lumich.test` | Success |
| 2 | Create SO for customer "Toko Maju" (credit limit: 10.000.000) | Form loads |
| 3 | Payment method: "Kredit" | Method selected |
| 4 | Add item: 2000 butir Grade A, Rp 2000 | Subtotal: Rp 4.000.000 |
| 5 | Save draft, confirm, fulfill | SO processed successfully |
| 6 | Verify invoice created | Invoice type: "sales_invoice", status: "sent", paid: 0 |
| 7 | Check customer outstanding credit | Outstanding increased by Rp 4.000.000 |

**Pass/Fail:** ⬜

---

### SO-07: Attempt Credit SO Over Limit (Supervisor)

| Step | Action | Expected Result |
|-------|--------|----------------|
| 1 | Login as `supervisor@lumich.test` | Success |
| 2 | Create credit SO for customer with outstanding: 9.000.000 | Form loads |
| 3 | Add item totaling Rp 2.000.000 | Total: Rp 11.000.000 (exceeds limit 10.000.000) |
| 4 | Attempt fulfill | Error: "Credit limit pelanggan terlampaui" |
| 5 | Verify SO unchanged | Status: confirmed (not fulfilled) |

**Pass/Fail:** ⬜

---

### SO-08: Cancel Confirmed SO (Supervisor)

| Step | Action | Expected Result |
|-------|--------|----------------|
| 1 | Login as `supervisor@lumich.test` | Success |
| 2 | Navigate to confirmed SO | SO detail loads |
| 3 | Click "Batalkan" button | Status changes to "Dibatalkan" (red) |
| 4 | Verify no inventory movement | Stock unchanged |

**Pass/Fail:** ⬜

---

### SO-09: Delete Draft SO (Supervisor)

| Step | Action | Expected Result |
|-------|--------|----------------|
| 1 | Login as `supervisor@lumich.test` | Success |
| 2 | Navigate to draft SO | SO detail loads |
| 3 | Click "Hapus Draft" button | Confirmation dialog appears |
| 4 | Confirm deletion | SO removed from list |
| 5 | Verify SO items deleted | No database records remain |

**Pass/Fail:** ⬜

---

### SO-10: Attempt SO Operations as Operator (Access Control)

| Step | Action | Expected Result |
|-------|--------|----------------|
| 1 | Login as `operator@lumich.test` | Success |
| 2 | Navigate to `/penjualan` | Redirected to `/dashboard` (403) |
| 3 | Try direct access `/penjualan/new` | Redirected to `/dashboard` |
| 4 | Try direct access `/penjualan/:id` | Redirected to `/dashboard` |

**Pass/Fail:** ⬜

---

### SR-01: Create Sales Return (Supervisor)

| Step | Action | Expected Result |
|-------|--------|----------------|
| 1 | Login as `supervisor@lumich.test` | Success |
| 2 | Navigate to fulfilled SO (from SO-04) | SO detail loads |
| 3 | Click "Buat Return" button | Return form loads |
| 4 | Select reason: "Rusak" | Reason selected |
| 5 | Items pre-populated from SO | All SO items shown with max quantities |
| 6 | Set return quantity: 100 butir (max: 1000) | Quantity within limit |
| 7 | Click "Simpan Return" | Return created with status: "pending" |
| 8 | Navigate to return detail | Return number generated: RTN-202604-XXXX |

**Pass/Fail:** ⬜

---

### SR-02: Attempt Return Quantity > Original (Supervisor)

| Step | Action | Expected Result |
|-------|--------|----------------|
| 1 | Login as `supervisor@lumich.test` | Success |
| 2 | Navigate to fulfilled SO detail | SO detail loads |
| 3 | Click "Buat Return" | Return form loads |
| 4 | Set return quantity: 1500 butir (max: 1000) | Exceeds limit |
| 5 | Attempt submit | Error: "Jumlah return melebihi jumlah SO asli" |

**Pass/Fail:** ⬜

---

### SR-03: Attempt Return for Non-Fulfilled SO (Supervisor)

| Step | Action | Expected Result |
|-------|--------|----------------|
| 1 | Login as `supervisor@lumich.test` | Success |
| 2 | Navigate to draft or confirmed SO | SO detail loads |
| 3 | Verify "Buat Return" button HIDDEN | Button not visible |
| 4 | Try direct access `/penjualan/:id/return/new` | Error: "Return hanya bisa dibuat untuk SO yang sudah fulfilled" |

**Pass/Fail:** ⬜

---

### SR-04: Approve Return (Admin)

| Step | Action | Expected Result |
|-------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to pending return detail | Return detail loads |
| 3 | Verify status badge: "Pending" (blue) | Badge shows pending |
| 4 | Click "Setujui" button | Status changes to "Disetujui" (teal) |
| 5 | Verify inventory movement created | Stock: Grade A increased by return quantity |
| 6 | Verify credit note invoice created | Invoice type: "credit_note", amount negative |
| 7 | Verify customer credit entry created | `customer_credits` row with source_type: "credit_note" |

**Pass/Fail:** ⬜

---

### SR-05: Reject Return (Admin)

| Step | Action | Expected Result |
|-------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to pending return detail | Return detail loads |
| 3 | Click "Tolak" button | Status changes to "Ditolak" (red) |
| 4 | Verify NO inventory movement | Stock unchanged |
| 5 | Verify NO finance records | No credit note or customer credit created |

**Pass/Fail:** ⬜

---

### SR-06: Attempt Return Approval as Supervisor (Access Control)

| Step | Action | Expected Result |
|-------|--------|----------------|
| 1 | Login as `supervisor@lumich.test` | Success |
| 2 | Navigate to pending return detail | Return detail loads |
| 3 | Verify "Setujui" button HIDDEN | Button not visible (admin-only) |
| 4 | Try direct action call | Error: "Akses ditolak" |

**Pass/Fail:** ⬜

---

### SR-07: Attempt Approve Already-Processed Return (Admin)

| Step | Action | Expected Result |
|-------|--------|----------------|
| 1 | Login as `admin@lumich.test` | Success |
| 2 | Navigate to approved return detail | Return detail loads |
| 3 | Verify actions HIDDEN | "Setujui" and "Tolak" buttons not shown |
| 4 | Try direct action call | Error: "Status return tidak valid untuk operasi ini" |

**Pass/Fail:** ⬜

---

## Concurrency Test Cases

### CC-01: Concurrent Fulfill of Same SO (Race Condition)

| Step | Action | Expected Result |
|-------|--------|----------------|
| 1 | Open 2 browser tabs as same supervisor user | Both logged in |
| 2 | Navigate to same confirmed SO in both tabs | Both see SO detail |
| 3 | Tab 1: Click "Fulfill" | Tab 1 shows loading |
| 4 | Tab 2: Click "Fulfill" immediately after Tab 1 | Tab 2 attempts fulfill |
| 5 | Verify Tab 1 result: Success | SO fulfilled, inventory decreased |
| 6 | Verify Tab 2 result: Error | Error: "Stok tidak mencukupi..." (row-level lock blocked) |
| 7 | Verify database state | Single fulfillment only, atomic transaction |

**Pass/Fail:** ⬜

---

### CC-02: Concurrent Returns on Same SO

| Step | Action | Expected Result |
|-------|--------|----------------|
| 1 | Create return for SO (pending) | Return 1 created |
| 2 | Admin tab 1: Click "Setujui" | Tab 1 processes approval |
| 3 | Admin tab 2: Click "Setujui" immediately after | Tab 2 attempts approval |
| 4 | Verify Tab 1 result: Success | Return approved, inventory IN created |
| 5 | Verify Tab 2 result: Error | Error: "Status return tidak valid..." (no longer pending) |
| 6 | Verify database state | Single approval only, atomic transaction |

**Pass/Fail:** ⬜

---

## Edge Cases

### EC-01: SessionStorage Draft Persistence

| Step | Action | Expected Result |
|-------|--------|----------------|
| 1 | Navigate to `/penjualan/new` | Form loads empty |
| 2 | Fill partial form: customer selected, 1 item | Form partially populated |
| 3 | Refresh browser page | Page reloads |
| 4 | Verify toast: "Draft SO telah dipulih dari sesi sebelumnya" | Toast appears |
| 5 | Verify form restored | Customer and item restored from sessionStorage |
| 6 | Submit successfully | Draft saved, sessionStorage cleared |

**Pass/Fail:** ⬜

---

### EC-02: Price = 0 Item with Confirmation

| Step | Action | Expected Result |
|-------|--------|----------------|
| 1 | Navigate to `/penjualan/new` | Form loads |
| 2 | Add item: egg_grade_a, 100 butir, Rp 0 | Item added with zero price |
| 3 | Click "Simpan Draft" | Confirmation dialog: "Harga item 0. Lanjutkan?" |
| 4 | Confirm dialog | Draft saved successfully |
| 5 | Verify SO total = 0 | Total shows Rp 0 |

**Pass/Fail:** ⬜

---

### EC-03: Empty SO Items Validation

| Step | Action | Expected Result |
|-------|--------|----------------|
| 1 | Navigate to `/penjualan/new` | Form loads |
| 2 | Fill header fields only, add NO items | Form has no items |
| 3 | Click "Simpan Draft" | Error: "Item tidak boleh kosong" |
| 4 | Verify submit button disabled | Button disabled when items empty |

**Pass/Fail:** ⬜

---

## Test Summary

| Category | Cases | Expected | Actual |
|----------|--------|----------|--------|
| SO Functional | 10 | ⬜ |
| SR Functional | 7 | ⬜ |
| Access Control | 3 | ⬜ |
| Concurrency | 2 | ⬜ |
| Edge Cases | 3 | ⬜ |
| **Total** | **25** | **⬜** |

---

## Known Issues (If Any)

None

---

## Test Environment Setup

**SQL to seed test data:**
```sql
-- Insert test customers
INSERT INTO customers (id, name, type, status, credit_limit, created_by) VALUES
  ('cust-test-1', 'Toko Maju', 'retail', 'active', 10000000, 'admin-id'),
  ('cust-test-2', 'Toko Diblokir', 'retail', 'blocked', 5000000, 'admin-id');

-- Insert test flock
INSERT INTO flocks (id, coop_id, name, arrival_date, initial_count, status, created_by) VALUES
  ('flock-test-1', 'coop-test-1', 'Flock Test 1', '2026-01-01', 10000, 'active', 'admin-id');

-- Insert initial stock
INSERT INTO inventory_movements (flock_id, movement_type, source, source_type, source_id, grade, quantity, movement_date, created_by) VALUES
  ('flock-test-1', 'in', 'import', 'import', null, 'A', 5000, NOW(), 'admin-id'),
  ('flock-test-1', 'in', 'import', 'import', null, 'B', 3000, NOW(), 'admin-id');
```

**Test user credentials (via Supabase Auth):**
- Supervisor: `supervisor@lumich.test` / password123
- Admin: `admin@lumich.test` / password123
- Operator: `operator@lumich.test` / password123
