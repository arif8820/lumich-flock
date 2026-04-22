## Phase 3: Sales & Finance (Sprint 5–6 — 4 weeks)

### Goals
- Sales Order flow complete (draft → confirmed → fulfilled)
- Sales Returns with credit notes
- Customer credit balance tracked
- Invoice PDF generated and shareable

---

### Sprint 5 — Sales Orders & Stock Adjustment (2 weeks)

#### Database
- [ ] `sales_orders` table
- [ ] `sales_order_items` table
- [ ] `sales_returns` table
- [ ] `sales_return_items` table

#### Features (Section 6.2.5)

**Sales Order**
- [ ] Create SO (Supervisor + Admin): header + multi-item rows
- [ ] Auto-gen SO number: `SO-YYYYMM-XXXX`
- [ ] Item types: egg_grade_a, egg_grade_b, flock, other
- [ ] Discount per item; subtotal auto-calc
- [ ] PPN per transaction (default 0%)
- [ ] Status flow: draft → confirmed → fulfilled / cancelled
- [ ] Draft: editable, deletable
- [ ] Confirmed: can cancel (→ cancelled), cannot delete
- [ ] Fulfilled: one DB transaction — inventory OUT + invoice auto-created
  - Cash: invoice type `cash_receipt`, status `paid`
  - Credit: invoice type `sales_invoice`, status `sent`
  - flock item: `flocks.status = sold`, `retired_at` set, no inventory movement
- [ ] Stock validation at fulfill (backend row-level lock)
- [ ] Credit limit validation at fulfill
- [ ] `sessionStorage` draft persistence

**Edge Cases**
- [ ] Blocked customer → warning, Admin override with reason
- [ ] Insufficient stock race condition → error message, transaction rolled back
- [ ] No items → submit disabled
- [ ] Price = 0 → confirmation prompt

**Sales Return (Section 6.2.5a)**
- [ ] Submit return against fulfilled SO (Supervisor + Admin)
- [ ] Auto-gen return number: `RTN-YYYYMM-XXXX`
- [ ] Item quantity ≤ original SO quantity
- [ ] Pending → Admin approve/reject
- [ ] Approved: one DB transaction — inventory IN + credit_note invoice + customer_credits entry
- [ ] Rejected: no changes
- [ ] All status changes audit-logged

### Acceptance Criteria Sprint 5
- [ ] Full SO flow from draft to fulfilled works
- [ ] Correct inventory movement on fulfill
- [ ] Sales return flow complete
- [ ] Credit note auto-created on approved return

---

### Sprint 6 — Credit Management, Invoice & PDF (2 weeks)

#### Database
- [ ] `invoices` table (with `type`, `reference_invoice_id`, `return_id`)
- [ ] `payments` table
- [ ] `customer_credits` table

#### Features (Section 6.2.4, 6.2.6)

**Invoice**
- [ ] Auto-create on SO fulfilled (not manual)
- [ ] Types: `sales_invoice` (INV-), `cash_receipt` (RCP-), `credit_note` (CN-)
- [ ] PDF generation < 5s via react-pdf
- [ ] Mobile-friendly PDF (no distortion)
- [ ] WhatsApp send: open WA with pre-filled message + PDF link + customer phone auto-filled
- [ ] Email send with PDF attachment (if enabled)
- [ ] Print-friendly layout
- [ ] Status history auto-logged on every change

**Customer Credit Management**
- [ ] Receivables real-time per customer
- [ ] Invoice list with payment status
- [ ] Record payment (full or partial)
- [ ] Oldest-first auto-allocation; Admin can override and pick invoice
- [ ] Overpayment → auto credit balance + Admin notification
- [ ] Apply customer credit to invoice (Admin only):
  - "Gunakan Kredit" button if `available_credit > 0`
  - FIFO display of credit entries
  - Partial per entry allowed
  - Each application: `payments` row (method: credit) + update `used_amount`
- [ ] Credit + cash combo payment on same invoice
- [ ] Rounding: 2 decimal; < Rp1 rounding diff doesn't keep status as Partial

**Aging Report**
- [ ] Buckets: 0–7d / 8–14d / 15–30d / > 30d
- [ ] Loads < 5s for > 100 invoices
- [ ] Export to CSV/Excel (Admin only)

**Alerts**
- [ ] Block transaction if credit limit exceeded
- [ ] Overdue alert H+1 after due date (configurable)
- [ ] Admin override block with reason logged

### Acceptance Criteria Sprint 6
- [ ] Invoice PDF correct, generates < 5s
- [ ] WhatsApp button works on mobile
- [ ] Credit allocation oldest-first works
- [ ] Aging report exports correctly

---
