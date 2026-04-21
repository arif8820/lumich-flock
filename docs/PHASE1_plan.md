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