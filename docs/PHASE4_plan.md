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
