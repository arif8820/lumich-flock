# Sprint 5 — Sales Order & Sales Return Design

**Date:** 2026-04-22
**Sprint:** 5 (Phase 3 — Sales & Finance)
**Scope:** Sales Order flow (draft→fulfilled) + Sales Return. Schema for full Phase 3 (Sprint 6 finance tables included, no Sprint 6 UI).

---

## Decisions & Context

| Decision | Choice | Reason |
|----------|--------|--------|
| Spec scope | Sprint 5 only | Sprint 6 (credit mgmt + invoice PDF) gets own spec |
| `inventory_movements` refactor | Option A — breaking refactor | Drop `flock_id` required, add `source_type`/`source_id` enum. Align 100% with PRD v1.7 |
| Draft persistence | sessionStorage | Form state survives reload/session expire, restored with toast |
| Fulfillment locking | Raw SQL `SELECT FOR UPDATE` in query layer | Drizzle no native FOR UPDATE; isolated in `sales-order.queries.ts` |
| Schema strategy | Option B — split migration | 5a = inventory refactor + sales schema; 5b = finance schema. Smaller rollback surface |
| Sprint 5 Sales Return | Full schema + flow | Approve creates inventory IN + credit_note invoice + customer_credits (all schema exists from 5b) |

---

## Migration Plan

### Migration 5a — Inventory Refactor + Sales Schema

#### `inventory_movements` Breaking Changes

- `flock_id`: required → **nullable**
- Add `source_type` enum: `daily_records | sales_order_items | stock_adjustments | regrade_requests | sales_returns | import`
- Add `source_id` uuid nullable (polymorphic FK, no DB constraint — enforced at service layer)
- Existing `referenceType`/`referenceId` data → migrate to `source_type`/`source_id` via data migration script
- Rename `movementType` values `IN`/`OUT` → `in`/`out` (lowercase, align PRD)
- Add `source` enum: `production | sale | adjustment | regrade | import`

#### New Tables

```
sales_orders
├── id (uuid PK)
├── order_number (text, unique)          -- SO-YYYYMM-XXXX
├── order_date (date)
├── customer_id (FK → customers)
├── payment_method (enum: cash/credit)
├── status (enum: draft/confirmed/fulfilled/cancelled)
├── tax_pct (numeric, default 0)
├── subtotal (numeric)
├── tax_amount (numeric)
├── total_amount (numeric)
├── notes (text, nullable)
├── created_by (FK → users)
├── updated_by (FK → users, nullable)
├── created_at (timestamptz)
└── updated_at (timestamptz)

sales_order_items
├── id (uuid PK)
├── order_id (FK → sales_orders)
├── item_type (enum: egg_grade_a/egg_grade_b/flock/other)
├── item_ref_id (uuid, nullable)         -- FK → flocks if item_type=flock
├── description (text, nullable)         -- required if item_type=other
├── quantity (integer)
├── unit (enum: butir/ekor/unit)
├── price_per_unit (numeric)
├── discount_pct (numeric, default 0)
└── subtotal (numeric)                   -- quantity × price × (1 − discount_pct/100)

sales_returns
├── id (uuid PK)
├── return_number (text, unique)         -- RTN-YYYYMM-XXXX
├── order_id (FK → sales_orders)
├── customer_id (FK → customers)
├── return_date (date)
├── reason_type (enum: wrong_grade/damaged/quantity_error/other)
├── notes (text, nullable)
├── status (enum: pending/approved/rejected)
├── submitted_by (FK → users)
├── reviewed_by (FK → users, nullable)
├── reviewed_at (timestamptz, nullable)
├── created_at (timestamptz)
└── updated_at (timestamptz)

sales_return_items
├── id (uuid PK)
├── return_id (FK → sales_returns)
├── item_type (enum: egg_grade_a/egg_grade_b/flock/other)
├── item_ref_id (uuid, nullable)
├── quantity (integer)
└── unit (enum: butir/ekor/unit)
```

#### `customers` Table Fix

Add `blocked` to `customer_status` enum: `active | inactive | blocked`

---

### Migration 5b — Finance Schema (schema only, no Sprint 5 UI)

```
invoices
├── id (uuid PK)
├── invoice_number (text, unique)        -- INV-/RCP-/CN- prefix per type
├── type (enum: sales_invoice/cash_receipt/credit_note)
├── order_id (FK → sales_orders)
├── reference_invoice_id (FK → invoices, nullable)  -- credit_note → original
├── return_id (FK → sales_returns, nullable)
├── customer_id (FK → customers)
├── issue_date (date)
├── due_date (date)
├── total_amount (numeric)               -- negative for credit_note
├── paid_amount (numeric, default 0)
├── status (enum: draft/sent/partial/paid/overdue/cancelled)
├── notes (text, nullable)
├── created_at (timestamptz)
└── updated_at (timestamptz)

payments
├── id (uuid PK)
├── invoice_id (FK → invoices)
├── payment_date (date)
├── amount (numeric)
├── method (enum: cash/transfer/cheque/credit)
├── reference_number (text, nullable)
├── created_by (FK → users)
└── updated_at (timestamptz)

customer_credits
├── id (uuid PK)
├── customer_id (FK → customers)
├── amount (numeric)                     -- always positive
├── source_type (enum: overpayment/credit_note)
├── source_payment_id (FK → payments, nullable)
├── source_invoice_id (FK → invoices, nullable)
├── used_amount (numeric, default 0)
├── notes (text, nullable)
└── created_at (timestamptz)

correction_records
├── id (uuid PK)
├── entity_type (enum: daily_records/inventory_movements/sales_orders)
├── entity_id (uuid)
├── field_name (text)
├── old_value (text)
├── new_value (text)
├── reason (text, NOT NULL)
├── corrected_by (FK → users)
├── corrected_at (timestamptz)
└── created_at (timestamptz)

notifications
├── id (uuid PK)
├── type (enum: production_alert/overdue_invoice/stock_warning/phase_change/other)
├── title (text)
├── body (text)
├── target_role (enum: operator/supervisor/admin/all)
├── related_entity_type (text, nullable)
├── related_entity_id (uuid, nullable)
└── created_at (timestamptz)

notification_reads
├── id (uuid PK)
├── notification_id (FK → notifications)
├── user_id (FK → users)
├── read_at (timestamptz)
└── UNIQUE(notification_id, user_id)

alert_cooldowns
├── id (uuid PK)
├── alert_type (text)
├── entity_type (text)
├── entity_id (uuid)
├── last_sent_at (timestamptz)
└── UNIQUE(alert_type, entity_id)
```

---

## File Structure

```
lib/
  db/
    schema/
      sales-orders.ts
      sales-order-items.ts
      sales-returns.ts
      sales-return-items.ts
      invoices.ts
      payments.ts
      customer-credits.ts
      correction-records.ts
      notifications.ts
      notification-reads.ts
      alert-cooldowns.ts
    queries/
      sales-order.queries.ts      -- includes raw SQL FOR UPDATE
      sales-return.queries.ts
      inventory.queries.ts        -- extend existing (refactored movements)
  services/
    sales-order.service.ts
    sales-order.service.test.ts
    sales-return.service.ts
    sales-return.service.test.ts
  actions/
    sales-order.actions.ts
    sales-return.actions.ts
  utils/
    order-number.ts               -- shared number generator (SO/RTN/INV/RCP/CN)

app/(app)/
  penjualan/
    page.tsx                      -- SO list (replace existing placeholder)
    new/
      page.tsx                    -- Create SO form
    [id]/
      page.tsx                    -- SO detail + status actions
      return/
        new/page.tsx              -- Create Sales Return form
    return/
      [id]/page.tsx               -- Return detail + approve/reject (admin)

components/
  sales/
    so-status-badge.tsx
    so-item-row.tsx
    so-summary-footer.tsx
    return-item-row.tsx

docs/
  unit-test/
    sprint5-unit-tests.md
  test-case/
    sprint5-uat.md
```

---

## Service Layer

### `lib/utils/order-number.ts`

Extracted immediately (will be used in 4+ places: SO, RTN, INV, RCP, CN).

```ts
// USED BY: [sales-order.service, sales-return.service, invoice creation] — count: 3+
export function generateOrderNumber(
  prefix: 'SO' | 'RTN' | 'INV' | 'RCP' | 'CN',
  lastSeq: number
): string
// → 'SO-202604-0001'
```

Sequence: query `COUNT(*)` filtered by prefix + current YYYYMM (not MAX — avoids gap issues), increment to get next seq, pad to 4 digits. Done inside transaction to avoid race condition.

---

### `sales-order.service.ts`

#### `createDraftSO(input, userId, role)`
1. Validate role ∈ `[supervisor, admin]`
2. Validate items array not empty
3. Fetch customer — throw if not found
4. If customer.status = `blocked` and no `overrideReason` → throw `'Pelanggan diblokir'`
5. If `overrideReason` provided (admin only) → append to SO notes
6. Calc subtotal per item, total subtotal, tax_amount, total_amount
7. Generate `order_number` inside transaction
8. Insert `sales_orders` (status: `draft`) + `sales_order_items` in one transaction
9. Return SO with items

#### `confirmSO(orderId, userId, role)`
1. Validate role ∈ `[supervisor, admin]`
2. Fetch SO — throw if not found
3. Validate status = `draft` → throw if not
4. Update status → `confirmed`, `updated_by = userId`

#### `cancelSO(orderId, userId, role)`
1. Validate role ∈ `[supervisor, admin]`
2. Fetch SO — throw if not found
3. Validate status = `confirmed` → throw if not
4. Update status → `cancelled`, `updated_by = userId`

#### `deleteDraftSO(orderId, userId, role)`
1. Validate role ∈ `[supervisor, admin]`
2. Fetch SO — throw if not found
3. Validate status = `draft` → throw if not
4. Hard delete `sales_order_items` then `sales_orders`

#### `fulfillSO(orderId, userId, role)` — critical path

```
BEGIN TRANSACTION
  1. SELECT sales_orders WHERE id = orderId FOR UPDATE
  2. Validate status = 'confirmed'
  3. Validate role ∈ [supervisor, admin]
  4. Per egg item (egg_grade_a / egg_grade_b):
       SELECT SUM(inventory_movements) - SUM(pending regrade) FOR UPDATE
       if quantity_available < item.quantity → ROLLBACK
       throw 'Stok tidak mencukupi saat transaksi diproses'
  5. If payment_method = 'credit':
       SELECT customer credit_limit - SUM(outstanding invoices)
       if remaining < SO.total_amount → ROLLBACK
       throw 'Credit limit pelanggan terlampaui'
  6. UPDATE sales_orders SET status = 'fulfilled', updated_by = userId
  7. Per egg item: INSERT inventory_movements (type: out, source: sale,
       source_type: sales_order_items, source_id: item.id)
  8. Per flock item: UPDATE flocks SET status = 'sold', retired_at = NOW()
  9. Generate invoice_number inside transaction
  10. INSERT invoices:
       cash  → type='cash_receipt', status='paid', paid_amount=total_amount, due_date=issue_date
       credit → type='sales_invoice', status='sent', paid_amount=0
COMMIT
```

---

### `sales-return.service.ts`

#### `createSalesReturn(input, userId, role)`
1. Validate role ∈ `[supervisor, admin]`
2. Fetch SO — validate status = `fulfilled`
3. Validate each return item quantity ≤ original SO item quantity
4. Generate `return_number` inside transaction
5. Insert `sales_returns` (status: `pending`) + `sales_return_items`

#### `approveSalesReturn(returnId, userId, role)` — admin only

```
BEGIN TRANSACTION
  1. SELECT sales_returns WHERE id = returnId FOR UPDATE
  2. Validate status = 'pending'
  3. Validate role = 'admin'
  4. Per item: INSERT inventory_movements (type: in, source: sale,
       source_type: sales_returns, source_id: returnId)
  5. Generate CN-number inside transaction
  6. INSERT invoices (type='credit_note', total_amount=negative,
       reference_invoice_id=original_invoice.id, return_id=returnId, status='sent')
  7. INSERT customer_credits (source_type='credit_note',
       source_invoice_id=credit_note.id, amount=ABS(credit_note.total_amount))
  8. UPDATE sales_returns SET status='approved', reviewed_by=userId, reviewed_at=NOW()
COMMIT
```

#### `rejectSalesReturn(returnId, userId, role)` — admin only
1. Validate role = `admin`
2. Fetch return — validate status = `pending`
3. Update status → `rejected`, `reviewed_by`, `reviewed_at`
4. No inventory or finance changes

---

## UI Pages

### `/penjualan` — SO List
Server Component. Columns: Nomor SO, Tanggal, Pelanggan, Total, Status badge, Aksi. Filter by status. Server-side pagination.

### `/penjualan/new` — Create SO
`'use client'` — needs onChange (sessionStorage) + dynamic item rows.

- Header: customer dropdown, tanggal, metode pembayaran, catatan
- Item rows: item_type → conditional flock picker or description field. Quantity, unit, harga, diskon. Subtotal auto-calc.
- Footer: subtotal, PPN toggle (default 0%), total
- Submit disabled if items empty
- Customer blocked → warning banner; admin gets override input + reason field
- Price = 0 → confirmation dialog
- sessionStorage key `so_draft` — save on change, restore on mount with toast, clear on submit success

### `/penjualan/[id]` — SO Detail
Server Component + client action buttons.

Status action buttons:
- `draft` → "Konfirmasi" + "Hapus"
- `confirmed` → "Fulfill" + "Batalkan"
- `fulfilled` → "Buat Return" (supervisor + admin)
- `cancelled` → no actions

Fulfill → confirmation dialog before submit.

### `/penjualan/[id]/return/new` — Create Return
`'use client'`. Item rows pre-populated from SO items, quantity editable (max = original). Fields: tanggal, reason dropdown, catatan (required if reason=other).

### `/penjualan/return/[id]` — Return Detail
Admin-only actions: "Approve" + "Reject" with confirmation dialogs. Shows linked SO (clickable), items, status, submitted by.

---

## Status Badge Colors

| Status | CSS Var |
|--------|---------|
| `draft` | `--lf-text-soft` (muted) |
| `confirmed` | `--lf-blue` |
| `fulfilled` | `--lf-teal` |
| `cancelled` | `--lf-danger-text` |

No new CSS vars — all existing tokens from `globals.css`.

---

## Error Handling

All server actions return `{ success: boolean, data?: T, error?: string }`. Never throw to client. Error messages in Bahasa Indonesia.

| Error | Message |
|-------|---------|
| Stok tidak cukup | `'Stok tidak mencukupi saat transaksi diproses'` |
| Credit limit | `'Credit limit pelanggan terlampaui'` |
| Customer blocked | `'Pelanggan diblokir'` |
| Status invalid | `'Status SO tidak valid untuk operasi ini'` |
| Return qty > SO qty | `'Jumlah return melebihi jumlah SO asli'` |
| SO not fulfilled | `'Return hanya bisa dibuat untuk SO yang sudah fulfilled'` |
| Unexpected DB error | `'Terjadi kesalahan sistem, coba lagi'` |

Role enforcement at service layer (not just UI). Admin blocked-customer override: pass `overrideReason` string — logged to SO notes.

---

## Testing

### Unit Tests — `docs/unit-test/sprint5-unit-tests.md`

**`sales-order.service.test.ts`**
- `createDraftSO`: valid input, customer blocked no override → throw, empty items → throw, blocked + admin override → SO created with override note
- `confirmSO`: draft→confirmed, non-draft → throw, wrong role → throw
- `cancelSO`: confirmed→cancelled, non-confirmed → throw, wrong role → throw
- `deleteDraftSO`: draft deleted (SO + items), non-draft → throw, wrong role → throw
- `fulfillSO`: stock sufficient → fulfilled + inventory OUT + invoice created, stock insufficient → throw no state change, credit limit exceeded → throw, cash SO → cash_receipt invoice paid, credit SO → sales_invoice sent, flock item → flocks.status=sold + retired_at set
- `generateOrderNumber`: format correct, padding 4 digits, monthly reset

**`sales-return.service.test.ts`**
- `createSalesReturn`: valid, qty > original → throw, SO not fulfilled → throw, wrong role → throw
- `approveSalesReturn`: inventory IN created per item, credit_note invoice created (negative amount), customer_credits entry created, all atomic, wrong role → throw
- `rejectSalesReturn`: status → rejected, no inventory change, no finance change

Mock: mock `lib/db/queries/` layer only — consistent with existing service test pattern.

### UAT — `docs/test-case/sprint5-uat.md`

Scenarios:
- Operator cannot access `/penjualan/new` (403)
- Supervisor creates SO draft, confirms, fulfills (cash) → inventory decreases, invoice auto-created paid
- Supervisor fulfills credit SO → invoice status `sent`, customer receivable increases
- Admin overrides blocked customer → SO created, override reason visible in SO notes
- Race condition: two concurrent fulfills for same SO → second fails with clear error
- Insufficient stock at fulfill → error, SO stays `confirmed`
- Credit limit exceeded → error, SO stays `confirmed`
- Supervisor creates sales return → status `pending`
- Admin approves return → inventory IN, credit_note invoice created, customer_credits entry created
- Admin rejects return → no changes
- sessionStorage draft: fill form, reload → draft restored with toast
- Price = 0 item → confirmation dialog appears before submit

---

## Acceptance Criteria

- [ ] Full SO flow draft → confirmed → fulfilled works
- [ ] Correct inventory OUT on fulfill (egg items only; flock items update flocks table)
- [ ] Invoice auto-created on fulfill (cash_receipt or sales_invoice per payment method)
- [ ] Sales return flow complete (pending → approved/rejected)
- [ ] Inventory IN on approved return
- [ ] credit_note invoice + customer_credits created on approved return (atomic)
- [ ] sessionStorage draft persistence works on SO form
- [ ] Role enforcement: operator cannot create/confirm/fulfill SO
- [ ] Blocked customer warning + admin override
- [ ] Concurrent fulfill race condition handled via row-level lock
- [ ] All schema tables from migration 5a + 5b created and migrated
- [ ] Unit tests pass for all service functions
- [ ] `docs/unit-test/sprint5-unit-tests.md` written
- [ ] `docs/test-case/sprint5-uat.md` written
