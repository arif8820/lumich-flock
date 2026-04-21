# Development Plan — ERP Ayam Petelur MVP
**Based on:** PRD v1.7  
**Total duration:** ~15 weeks (9 sprints)  
**Stack:** Next.js 16, Tailwind v4, shadcn/ui, Supabase, Drizzle ORM

---

## Phase Overview

| Phase | Sprints | Focus |
|-------|---------|-------|
| **Phase 1: Foundation** | Sprint 1 | Project setup, auth, master data |
| **Phase 2: Production Core** | Sprint 2–4 | Daily input, inventory ledger, dashboard |
| **Phase 3: Sales & Finance** | Sprint 5–6 | Sales orders, returns, credit, invoices |
| **Phase 4: Operations** | Sprint 7–8 | Alerts, notifications, imports, lock period |
| **Phase 5: Hardening** | Sprint 9 | Security, backup drill, UAT |

---

## Phase 1: Foundation (Sprint 1 — 2 weeks)

### Goals
- Project runs locally and on Vercel
- Auth works (login, session, invite flow)
- Admin can manage users and master data

### Tasks

#### 1.1 Project Setup
- [ ] Init Next.js 16 + Tailwind v4 + shadcn/ui
- [ ] Setup Supabase project (Cloud)
- [ ] Configure Drizzle ORM + DB connection
- [ ] Setup environment variables (local + Vercel)
- [ ] Configure Supabase RLS (Row Level Security) skeleton
- [ ] Setup CI/CD: GitHub → Vercel auto-deploy

#### 1.2 Database Schema — Core Tables
Create all tables per Section 8 (PRD v1.7):
- [ ] `users` (sync with Supabase Auth)
- [ ] `coops` (master kandang)
- [ ] `flocks` (with `coop_id FK`, `retired_at`)
- [ ] `customers`
- [ ] `user_coop_assignments`

#### 1.3 Authentication (Section 6.7)
- [ ] Email + password login via Supabase Auth
- [ ] Admin-only user creation (no self-registration)
- [ ] Email invitation flow — user sets own password
- [ ] Session timeout: 8h inactive / 24h max
- [ ] Password policy: 8 chars, 1 uppercase, 1 number
- [ ] Deactivate user (is_active = false) — blocks login
- [ ] Admin: change role, reset password
- [ ] Middleware: validate `is_active` on every request

#### 1.4 Master Data — Coops
- [ ] CRUD coops (Admin only)
- [ ] List coops (all roles view)

#### 1.5 Master Data — Flocks (Section 6.3.1)
- [ ] Create/edit flock (Supervisor + Admin)
- [ ] Auto-calc: age in days/weeks, production phase badge
- [ ] Retire/close flock (Admin only)
- [ ] Coop assignment via `coop_id FK`
- [ ] `user_coop_assignments` management (Admin)

#### 1.6 Master Data — Customers (Section 6.2.3)
- [ ] CRUD customers (Admin only)
- [ ] Fields: name, type, phone, address, credit_limit, payment_terms, status, notes, created_by
- [ ] Supervisor: view only

### Acceptance Criteria
- [ ] All listed roles can log in
- [ ] Deactivated user cannot log in
- [ ] Admin can create user; invite email sent < 1 min
- [ ] Flock phase calculated correctly
- [ ] Multi-coop assignment works for Operator

---

## Phase 2: Production Core (Sprint 2–4 — 6 weeks)

### Goals
- Daily production input works with role-based backdate rules
- Inventory ledger (`inventory_movements`) tracks all stock changes
- Dashboard shows live KPIs and trends

---

### Sprint 2 — Daily Production Input (2 weeks)

#### Database
- [ ] `daily_records` table
- [ ] `inventory_movements` table (ledger foundation)
- [ ] `inventory_snapshots` table

#### Features (Section 6.1.1)
- [ ] Daily input form: deaths, culled, eggs grade A/B/cracked/abnormal, weight, feed
- [ ] Auto-fill today's date
- [ ] Flock dropdown — active flocks only, filtered by coop assignment for Operator
- [ ] Auto-calc on form: total depletion, active population, HDP%, feed/bird, FCR
- [ ] First-day logic: pull `initial_count` from `flocks` if no prior `daily_records`
- [ ] Backdate rules per role (Operator: H-1, Supervisor: H-3, Admin: unlimited)
- [ ] `is_late_input` flag + badge in table
- [ ] Double-submit guard (unique constraint on flock_id + record_date)
- [ ] On submit: create `inventory_movements IN` (grade A + B only)
- [ ] Form state persisted in `sessionStorage` (restore after re-login with toast)

#### Edge cases
- [ ] Negative values blocked (frontend + backend)
- [ ] Total depletion > active population → warning + block submit
- [ ] Network error → form data preserved, retry enabled
- [ ] Session expired → form restored after re-login

### Acceptance Criteria Sprint 2
- [ ] Input completes in < 2 min
- [ ] Operator cannot submit for date > H-1
- [ ] Late input badge visible in table
- [ ] `inventory_movements` row created on submit

---

### Sprint 3 — Inventory Ledger & Stock Management (2 weeks)

#### Features (Section 6.2.1–6.2.2)

**Stock Ledger**
- [ ] Real-time stock = `SUM(inventory_movements)` per egg_category
- [ ] Performance: use `inventory_snapshots` + delta since last snapshot
- [ ] Nightly snapshot via Supabase scheduled function (pg_cron, midnight)
- [ ] Stock display: Grade A (butir), Grade B (butir), total, estimated weight (kg)
- [ ] Movement history with pagination (server-side)
- [ ] Index: `inventory_movements(egg_category, movement_date)`

**Stock Adjustment — Regular (6.2.2a)**
- [ ] Form: date, category, quantity (+/-), reason, notes, photo
- [ ] Supervisor + Admin only
- [ ] Immediate effect (no approval needed)
- [ ] Creates `inventory_movements adjustment` (source: manual)
- [ ] Cannot reduce below zero

**Regrading (6.2.2b)**
- [ ] Form: date, from_grade, to_grade (auto-fill), quantity, reason, notes, photo
- [ ] Submit → `regrade_requests` status: pending
- [ ] Pending blocks quantity from sale: `available = stock - SUM(pending regrade from that grade)`
- [ ] Admin approve → 2x `inventory_movements` in one DB transaction (OUT + IN, source: regrade)
- [ ] Admin reject → no movement, request closed
- [ ] Admin receives in-app notification on new regrade request
- [ ] Admin self-approve allowed
- [ ] Warning if stock drops below pending during review

#### Database
- [ ] `stock_adjustments` table
- [ ] `regrade_requests` table

### Acceptance Criteria Sprint 3
- [ ] Stock real-time correct after any mutation
- [ ] Regrading flow complete (pending → approved/rejected)
- [ ] Pending regrade blocks stock from sale
- [ ] Stock history paginated, loads < 3s

---

### Sprint 4 — Dashboard KPI (2 weeks)

#### Features (Section 6.1.2, 6.1.4)

**KPI Cards**
- [ ] HDP% today
- [ ] FCR (7-day rolling) — label "(< 7 hari)" if insufficient data
- [ ] FCR Cumulative on flock detail page
- [ ] Total production today (butir)
- [ ] Stock ready to sell (Grade A + B)
- [ ] Active population
- [ ] Feed per bird (gr)

**Charts**
- [ ] HDP% trend (7/14/30 days) — line chart
- [ ] FCR trend (7/14/30 days) — line chart
- [ ] Daily production (Grade A vs B) — bar chart
- [ ] Cumulative depletion — area chart

**Table**
- [ ] Last 7 daily records with late-input badge

**Filters**
- [ ] Time range: 7d / 14d / 30d / custom
- [ ] Operator: only assigned coops
- [ ] Supervisor + Admin: filter per coop or all coops
- [ ] Empty state shown when no data in range

### Acceptance Criteria Sprint 4
- [ ] Dashboard loads < 3s (even with > 1 year data)
- [ ] FCR 7-day and cumulative computed correctly
- [ ] Operator sees only assigned coop data

---

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

## Phase 4: Operations (Sprint 7–8 — 2 weeks)

### Goals
- Alert system running on schedule
- Data import for onboarding
- Lock period and correction record enforcement

---

### Sprint 7 — Alerts & Notifications (1 week)

#### Database
- [ ] `notifications` table
- [ ] `notification_reads` table (per-user read tracking)
- [ ] `alert_cooldowns` table (deduplication)

#### Features (Section 6.3.2, 6.3.3)

**Alert Conditions**
- [ ] Flock phase change (1x per phase, no repeat)
- [ ] HDP drop > 5% from previous day (cooldown: 24h)
- [ ] Daily depletion > 0.5% population (cooldown: 24h)
- [ ] FCR > threshold/default 2.5 (cooldown: 24h)
- [ ] Stock > max threshold (cooldown: 24h)
- [ ] Invoice overdue (no cooldown — daily escalation)

**Trigger Mechanism**
- [ ] Supabase pg_cron: runs daily 06:00 local time
- [ ] Checks all alert conditions, creates `notifications`, updates `alert_cooldowns`
- [ ] Dedup: check `alert_cooldowns` before creating notification

**In-App Notification**
- [ ] Bell icon in navbar with unread count badge
- [ ] Real-time via Supabase Realtime
- [ ] Mark as read on click (writes `notification_reads`)
- [ ] All roles see relevant notifications

**Email Digest**
- [ ] Daily summary at 07:00 local time (opt-in)
- [ ] Admin/Owner only

**WhatsApp**
- [ ] "Kirim ke WA" button on alert detail (Admin/Supervisor)
- [ ] Opens WA Web/App with pre-filled message

**Admin Config**
- [ ] FCR threshold configurable
- [ ] Stock max threshold configurable
- [ ] Overdue alert delay configurable

### Acceptance Criteria Sprint 7
- [ ] pg_cron fires daily, creates correct notifications
- [ ] Dedup works — no duplicate alerts within cooldown window
- [ ] Unread badge count accurate per user

---

### Sprint 8 — Import CSV, Lock Period, Correction Records (1 week)

#### Database
- [ ] `correction_records` table

#### Features

**Import CSV (Section 6.4)**
- [ ] Download CSV template (per entity)
- [ ] Upload CSV → validate → preview (Admin only)
- [ ] Preview: rows valid/error count, first 5 rows sample
- [ ] Error report per row: column + reason; downloadable
- [ ] User must click "Konfirmasi Import" after preview
- [ ] Partial import (valid rows imported, error rows skipped) — user confirmed first
- [ ] System error during import → full rollback, no partial save
- [ ] All imported records: `is_imported = true`, `imported_by`
- [ ] Backdate import unlimited — Admin only

**Entities supported:**
- Flocks (master)
- Daily records (production history)
- Customers
- Opening stock balance (one import per cutover date; `inventory_movements IN`, source: import)

**Lock Period (Section 6.5)**
- [ ] Operator: can edit own record up to H+1 from record_date
- [ ] Supervisor: can edit any record up to H+7 from record_date
- [ ] Admin: can edit any time (no limit)
- [ ] Form blocked for roles past their lock window
- [ ] Admin edit on locked record → must fill reason → creates `correction_records`
- [ ] Old value preserved (no overwrite)
- [ ] UI shows correction indicator; click to view history
- [ ] Correction on `eggs_grade_a` / `eggs_grade_b` → compensating `inventory_movements adjustment` in same transaction

### Acceptance Criteria Sprint 8
- [ ] Import preview shows before DB write
- [ ] Failed import fully rolled back
- [ ] Lock period enforced per role
- [ ] Correction record created and linked to original

---

## Phase 5: Hardening (Sprint 9 — 1 week)

### Goals
- System safe for go-live
- UAT passed by real farm operators

### Tasks (Section 9.2, 9.3)

**Security Hardening**
- [ ] Supabase RLS review — all tables have correct policies
- [ ] Every API endpoint validates role (backend, not just frontend hide)
- [ ] Rate limiting on auth endpoints
- [ ] Input sanitization review
- [ ] No sensitive data in client-side logs

**Backup & Disaster Recovery**
- [ ] Supabase PITR enabled (7-day)
- [ ] pg_dump scheduled to Storage/S3 (30-day retention)
- [ ] Restore drill — full restore from backup to staging env
- [ ] Admin alert on backup failure

**Performance Verification**
- [ ] Dashboard < 3s with > 1 year data
- [ ] Stock real-time endpoint < 1s
- [ ] Aging report < 5s with > 100 invoices
- [ ] Invoice PDF < 5s

**UAT**
- [ ] Operator scenario: complete daily input workflow
- [ ] Supervisor scenario: review, approve adjustments, create SO
- [ ] Admin scenario: user management, invoices, credit, reports
- [ ] All critical bugs fixed before sign-off

### Acceptance Criteria Sprint 9
- [ ] Restore drill successful
- [ ] All RLS policies verified
- [ ] UAT sign-off from farm operator and supervisor
- [ ] Zero critical bugs open

---

## Role Permission Summary (Reference)

| Feature | Operator | Supervisor | Admin |
|---------|----------|-----------|-------|
| Daily input (today + H-1) | ✅ | ✅ | ✅ |
| Backdate H-2 to H-3 | ❌ | ✅ | ✅ |
| Backdate > H-3 | ❌ | ❌ | ✅ |
| Stock adjustment | ❌ | ✅ | ✅ |
| Regrade approve/reject | ❌ | ❌ | ✅ |
| Create/confirm/fulfill SO | ❌ | ✅ | ✅ |
| Sales return approve/reject | ❌ | ❌ | ✅ |
| Record payment | ❌ | ✅ | ✅ |
| Apply customer credit | ❌ | ❌ | ✅ |
| Import CSV | ❌ | ❌ | ✅ |
| User management | ❌ | ❌ | ✅ |
| Coop add/edit | ❌ | ❌ | ✅ |

---

## Key Technical Constraints

| Constraint | Detail |
|-----------|--------|
| Stock source of truth | `inventory_movements` table — always butir, never kg |
| Fulfilled SO | Must be one DB transaction (inventory + invoice) |
| Sales return approved | Must be one DB transaction (inventory IN + credit_note + customer_credits) |
| Regrade approved | Must be one DB transaction (2x inventory_movements) |
| Correction records | Must be one DB transaction with compensating inventory adjustment |
| Lock period enforcement | Both frontend (hide/block form) AND backend (middleware check) |
| Role enforcement | Both frontend (hide UI) AND backend (per-endpoint middleware) |
| Concurrent writes | Row-level lock on `inventory_movements` insert |

---

*Plan derived from PRD v1.7 — April 2026*
