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
