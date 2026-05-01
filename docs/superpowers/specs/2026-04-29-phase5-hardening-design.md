# Phase 5 Hardening Design

**Date:** 2026-04-29  
**Sprint:** 9 (1 week)  
**Status:** Approved

---

## Context

Phase 4 delivered full operations: import, alerts, billing, sales. Phase 5 makes the system safe for go-live. Three goals: harden security (rate limiting + role validation), verify performance targets with real data, and run UAT as admin to validate all 12 capabilities.

**Deferred to Phase 5b (after RBAC):** Backup/DR config, operator/supervisor UAT, custom RBAC feature itself.

---

## Scope

| Area | In Phase 5 | Deferred |
|------|-----------|---------|
| Rate limiting (Upstash) | ✅ | |
| Role validation audit (15 actions) | ✅ | |
| Input sanitization | ✅ | |
| Dashboard real data | ✅ | |
| Stock page performance | ✅ | |
| Aging CSV performance | ✅ | |
| Invoice PDF performance | ✅ | |
| UAT — Admin role | ✅ | |
| UAT — Operator/Supervisor | | Phase 5b |
| Backup/DR (PITR, pg_dump) | | Phase 5b |
| Custom RBAC (all 12 capabilities) | | Phase 5b |

---

## Section 1: Security Hardening

### 1a — Rate Limiting

**Library:** `@upstash/ratelimit` + `@upstash/redis`

**Target endpoints:**
- `POST /api/auth/login` (or Supabase auth redirect)
- `POST /api/auth/*`
- Auth-adjacent server actions called from login page

**Config:**
- Sliding window: 10 requests / 60 seconds per IP
- On exceed: HTTP 429, body `{ error: 'Terlalu banyak percobaan, coba lagi dalam 1 menit' }`

**Implementation:** Add to `middleware.ts`. Extract IP from `request.headers.get('x-forwarded-for')` (Vercel standard). Initialize Upstash client once at module scope.

**Env vars to add:**
```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### 1b — Role Validation Audit

**Scope:** All 15 files in `lib/actions/`

**Create `lib/auth/guards.ts`** with three helpers:
```typescript
requireAdmin()           // role === 'admin'
requireSupervisorOrAdmin() // role === 'supervisor' || 'admin'
requireAuth()            // any authenticated session
```

**Permission → guard mapping (per PHASE5_plan.md):**

| Action | Required Guard |
|--------|---------------|
| Backdate H-2 to H-3 | `requireSupervisorOrAdmin()` |
| Backdate > H-3 | `requireAdmin()` |
| Stock adjustment | `requireSupervisorOrAdmin()` |
| Regrade approve/reject | `requireAdmin()` |
| Create/confirm/fulfill SO | `requireSupervisorOrAdmin()` |
| Sales return approve/reject | `requireAdmin()` |
| Record payment | `requireSupervisorOrAdmin()` |
| Apply customer credit | `requireAdmin()` |
| Import CSV | `requireAdmin()` |
| User management | `requireAdmin()` |
| Coop add/edit | `requireAdmin()` |
| Daily input (today + H-1) | `requireAuth()` |

**Files to audit and patch:**
- `lib/actions/stock.actions.ts` — add `requireSupervisorOrAdmin()` to adjustment actions
- `lib/actions/sales-return.actions.ts` — add `requireAdmin()` to approve/reject
- `lib/actions/daily-record.actions.ts` — add coop scope check for operators
- `lib/actions/sales-order.actions.ts` — verify supervisor+ guards on confirm/fulfill
- All others — verify existing guards match table above

**Operator coop scoping:** For daily-record and stock actions, operators must be validated against `user_coop_assignments`. Pattern:
```typescript
const assignments = await getUserCoopAssignments(session.userId)
if (!assignments.includes(coopId)) return { success: false, error: 'Akses ditolak' }
```

### 1c — Input Sanitization

**Zod tightening:** All free-text string fields get `.trim()`. Fields without explicit `.max()` get `.max(500)` (notes, referenceNumber, description).

**Log audit:** Grep for `console.log` across `lib/actions/`, `lib/services/`, `app/api/`. Remove any that print session data, tokens, or user PII.

---

## Section 2: Performance Verification

### 2a — Dashboard Real Data

**Current state:** `app/(app)/dashboard/page.tsx` uses `MOCK_KPI`, `MOCK_CHART_DATA`, `MOCK_RECENT_RECORDS`.

**New `lib/services/dashboard.service.ts`** with:
- `getDashboardKpis(coopId?: string)` — HDP%, FCR, population, stock summary
- `getProductionChartData(days: 30)` — daily egg trend for chart

**Reuse existing:**
- `getRecentDailyRecords(limit: 7)` from `daily-record.service.ts`
- `getAgingData()` from `invoice.service.ts` (supervisor/admin only)

**Target:** `< 3s` cold load (Next.js server component, no client fetch waterfall)

**DB indexes to add if slow:**
- `daily_records(coop_id, date DESC)`
- `inventory_movements(created_at DESC)`

### 2b — Stock Page Performance

**Target:** `< 1s` stock summary load

Verify `stok/` page calls `getStockSummary()` from `stock.service.ts` (already exists). Measure with `time curl` or browser devtools. If slow: check for N+1 on inventory_movements aggregation, add index on `inventory_movements(type, created_at)`.

### 2c — Aging Report CSV

**Target:** `< 5s` with > 100 invoices

Seed 100+ invoices in staging. Measure `/api/laporan/aging-csv` response time. If slow:
- Add index `invoices(status, due_date)`
- Consider streaming CSV output (write headers → stream rows) instead of buffer

### 2d — Invoice PDF

**Target:** `< 5s`

Measure `generateInvoicePdf()` in `invoice.service.ts` with realistic invoice (10 line items). If slow:
- Pre-render static elements (company header/footer) once
- Use `renderToBuffer` with minimal JSX — avoid nested dynamic layouts

**Measurement approach:** Add `console.time` / `console.timeEnd` in staging, remove before go-live.

---

## Section 3: UAT — Admin Role

**Format:** Manual test script. Dev runs each scenario, marks Pass/Fail. Sign-off by farm owner or admin user.

**Doc location:** `docs/uat/UAT_Sprint9_TestScript.md`

### UAT Scenarios (Admin)

**A. User Management**
1. Create operator user, assign to Coop A → verify login works, only Coop A visible
2. Create supervisor user → verify login works, all coops visible
3. Deactivate user → verify login blocked

**B. Data Entry — Full Date Range**
4. Enter daily record for today → verify saves, appears in dashboard
5. Enter daily record for H-1 → verify allowed
6. Enter daily record for H-2 → verify allowed (admin unlimited)
7. Enter daily record for past H-3 → verify `correction_records` entry created

**C. Inventory**
8. Create stock adjustment → verify inventory_movements appended, stock balance updated
9. Submit regrade request (as admin) → verify pending status
10. Approve regrade (as admin) → verify stock updated, status = approved
11. Reject regrade (as admin) → verify stock unchanged, status = rejected

**D. Sales**
12. Create sales order → verify stock availability check
13. Confirm SO → verify stock reserved
14. Fulfill SO → verify stock deducted, invoice created
15. Create sales return → verify credit note generated
16. Apply credit note to future invoice → verify invoice balance reduced

**E. Finance**
17. Record cash payment → verify invoice status updates
18. Record transfer payment with reference number → verify saved
19. Apply customer credit → verify credit balance reduced, invoice updated

**F. Import**
20. Import CSV (flocks template) → verify flocks created, `is_imported = true`
21. Import CSV with validation errors → verify error report shown, no partial import

**G. Reports**
22. View aging report → verify overdue invoices listed correctly
23. Download aging CSV → verify file downloads, data matches UI
24. View production report → verify daily records aggregated correctly
25. Generate invoice PDF → verify PDF renders, email sent (if configured)

**H. Coop Management**
26. Add new coop → verify appears in coop list
27. Edit coop name → verify updated everywhere

### UAT Sign-off Criteria
- All 27 scenarios pass
- Zero critical bugs open
- Invoice PDF generated successfully
- Aging report data accurate vs manual calculation

---

## File Change Summary

**New files:**
- `lib/auth/guards.ts` — role guard helpers
- `lib/services/dashboard.service.ts` — KPI + chart data queries
- `docs/uat/UAT_Sprint9_TestScript.md` — UAT scenarios

**Modified files:**
- `middleware.ts` — add Upstash rate limiting
- `lib/actions/stock.actions.ts` — role guard fix
- `lib/actions/sales-return.actions.ts` — role guard fix
- `lib/actions/daily-record.actions.ts` — coop scope check
- `lib/actions/sales-order.actions.ts` — verify guards
- Other action files — Zod .trim()/.max() on free-text fields
- `app/(app)/dashboard/page.tsx` — replace mocks with real service calls

**DB migrations:**
- Indexes on `daily_records`, `inventory_movements`, `invoices` — only if benchmarks show need

**Env vars:**
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

---

## Verification

1. **Rate limiting:** `for i in {1..15}; do curl -X POST http://localhost:3000/api/auth/login; done` → 11th request returns 429
2. **Role audit:** Test each action with wrong role via Postman/curl → all return `{ success: false, error: 'Akses ditolak' }`
3. **Dashboard perf:** Browser devtools Network tab → page load < 3s with real data
4. **Stock page:** Response < 1s on staging
5. **Aging CSV:** < 5s with 100+ invoice seed
6. **Invoice PDF:** < 5s on staging
7. **UAT:** All 27 admin scenarios pass, sign-off documented

---

## Phase 5b (Next Sprint)

- Custom RBAC: 12 configurable permissions, admin UI to define roles
- Backup/DR: Supabase PITR + pg_dump schedule + restore drill
- UAT: Operator and supervisor scenarios
