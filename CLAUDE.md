# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**lumich-flock** — ERP system for layer chicken farms (ayam petelur). Tracks egg production, inventory, sales, and flock management. Single-tenant MVP; one farm instance per deployment.

Full spec in [docs/PRD_ERP_Ayam_Petelur_v1_7.md](docs/PRD_ERP_Ayam_Petelur_v1_7.md). Sprint plan in [docs/development_plan.md](docs/development_plan.md).

## Planned Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind v4 + shadcn/ui |
| ORM | Drizzle ORM |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| Deploy | Vercel |

## Commands (once initialized)

```bash
npm run dev        # local dev server
npm run build      # production build
npm run lint       # ESLint
npm run db:push    # push Drizzle schema to Supabase
npm run db:studio  # Drizzle Studio GUI
```

## Architecture

```
app/
  (auth)/          # login, session
  (dashboard)/     # KPI widgets, HDP%, FCR, population
  production/      # daily egg input per coop
  inventory/       # stock ledger, adjustments, regrades
  sales/           # orders, returns, credit notes, invoices
  flocks/          # batch tracking with age/phase calc
  admin/           # user management, coop setup
lib/
  db/              # Drizzle schema + queries
  actions/         # Next.js Server Actions (mutations)
  auth/            # Supabase Auth helpers
components/
  ui/              # shadcn primitives
  forms/           # domain forms
```

## Key Domain Rules

### Inventory Ledger
- `inventory_movements` is source of truth — never mutate, only append.
- `inventory_snapshots` is a nightly cache for report performance — never trust it for live stock calculations.
- All stock mutations (sales, returns, adjustments) must be atomic transactions.

### Lock Period
- Operators: edit data up to H+1 only.
- Supervisors: up to H+7.
- Admins: unlimited. Edits past lock create `correction_records` (audit trail).

### Roles
Three roles: `operator`, `supervisor`, `admin`. Access enforced at server action level, not just UI. Operators are scoped to assigned coops via `user_coop_assignments`.

### Sales & Credit
- Sales orders must check available stock before fulfillment — atomic.
- Returns generate credit notes; credit notes applied to future invoices.
- Customer credit limit enforced at order creation.

## Database (37 tables, 5 modules)

Core tables to understand first:
- `flocks` — chicken batches with coop, arrival date, initial count
- `daily_records` — daily production input (eggs laid, deaths, feed consumed)
- `inventory_movements` — ledger for all stock in/out
- `sales_orders` + `sales_order_items` — SO header/lines
- `invoices` + `payments` — billing
- `correction_records` — audit trail for past-lock edits
- `notifications` + `alert_cooldowns` — alert system (pg_cron at 06:00 local)

## Server Action Rules (STRICT)

Server Actions = thin wrappers ONLY. No business logic inside actions.

Pattern wajib:
1. Validate input (zod schema)
2. Call service function dari `lib/services/`
3. Return result

FORBIDDEN di dalam Server Action files:
- Direct DB queries (pakai `lib/db/queries/`)
- Complex conditionals / business rules
- Side effects selain call ke service

Layer structure wajib:
```
lib/actions/     → thin wrappers (validate + delegate only)
lib/services/    → semua business logic
lib/db/queries/  → semua DB queries (Drizzle)
```

Alasan: kalau pola ini dijaga, migrasi ke native mobile app nanti tinggal wrap `lib/services/` dengan API routes — tidak perlu rewrite.

## Performance Targets
- Dashboard load: < 3 seconds
- PDF invoice generation: < 5 seconds
- All stock mutations: audited with user + timestamp
