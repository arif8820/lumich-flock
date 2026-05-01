# Phase 5 Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden lumich-flock ERP for go-live — rate limiting on auth endpoints, role guards on all server actions, dashboard wired to real data, performance benchmarks verified, and admin UAT script written.

**Architecture:** Security-first sequence: (1) Upstash rate limiting in middleware, (2) centralized role guards extracted to `lib/auth/guards.ts` and applied to all 15 action files, (3) dashboard real data via new `lib/services/dashboard.service.ts`, (4) performance benchmarks on 4 endpoints, (5) UAT test script doc. No DB schema changes unless benchmarks show need for indexes.

**Tech Stack:** Next.js 15 App Router, Drizzle ORM, Supabase Auth, `@upstash/ratelimit` + `@upstash/redis`, Vitest, TypeScript strict

---

## File Map

**New files:**
- `lib/auth/guards.ts` — centralized role guard helpers (replaces inline guards duplicated across action files)
- `lib/services/dashboard.service.ts` — KPI, chart data, recent records queries
- `lib/db/queries/dashboard.queries.ts` — raw Drizzle queries for dashboard aggregations
- `docs/uat/UAT_Sprint9_TestScript.md` — admin UAT scenarios

**Modified files:**
- `middleware.ts` — add Upstash rate limiting block before auth logic
- `lib/actions/stock.actions.ts` — add `requireSupervisorOrAdmin()` to `createStockAdjustmentAction`, `submitRegradeRequestAction`
- `lib/actions/daily-record.actions.ts` — add coop scope check for operators in `createDailyRecordAction` and `updateDailyRecordAction`
- `lib/actions/invoice.actions.ts` — verify `requireAdmin()` on credit apply; add `.trim()` to free-text Zod fields
- `lib/actions/sales-order.actions.ts` — add `.trim()` to `notes`, `overrideReason` Zod fields
- `lib/actions/sales-return.actions.ts` — add `.trim()` to `notes` Zod field
- `lib/actions/coop.actions.ts` — verify `requireAdmin()` guard exists
- `lib/actions/import.actions.ts` — verify `requireAdmin()` guard exists
- `app/(app)/dashboard/page.tsx` — replace `MOCK_KPI`, `MOCK_CHART_DATA`, `MOCK_RECENT_RECORDS` with real service calls
- `.env.local` — add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

---

## Task 1: Install Upstash dependencies and configure env vars

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `.env.local`

- [ ] **Step 1: Install packages**

```bash
npm install @upstash/ratelimit @upstash/redis
```

Expected output: packages added, no errors.

- [ ] **Step 2: Create Upstash Redis database**

Go to [console.upstash.com](https://console.upstash.com) → Create Database → Region: closest to Vercel deployment (ap-southeast-1 for Indonesia). Copy REST URL and token.

- [ ] **Step 3: Add env vars to `.env.local`**

Open `.env.local` and append:
```
UPSTASH_REDIS_REST_URL=https://<your-db>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<your-token>
```

- [ ] **Step 4: Verify install**

```bash
node -e "require('@upstash/ratelimit'); require('@upstash/redis'); console.log('ok')"
```

Expected: `ok`

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @upstash/ratelimit and @upstash/redis"
```

---

## Task 2: Add rate limiting to middleware

**Files:**
- Modify: `middleware.ts`

**Context:** Current `middleware.ts` only handles Supabase session and login redirects. We add a rate limit block at the top that fires only for the login POST route. Upstash client must be initialized at module scope (not inside the function) to reuse connections.

- [ ] **Step 1: Write the complete updated `middleware.ts`**

Replace entire file content with:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  analytics: false,
})

export async function middleware(request: NextRequest) {
  // Rate limit auth endpoints
  if (
    request.method === 'POST' &&
    (request.nextUrl.pathname === '/login' || request.nextUrl.pathname.startsWith('/api/auth/'))
  ) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
    const { success } = await ratelimit.limit(ip)
    if (!success) {
      return NextResponse.json(
        { error: 'Terlalu banyak percobaan, coba lagi dalam 1 menit' },
        { status: 429 }
      )
    }
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  if (!user && !pathname.startsWith('/login') && !pathname.startsWith('/api/')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 2: Run dev server and verify no startup errors**

```bash
npm run dev
```

Expected: server starts, no TypeScript errors about missing env vars (Upstash SDK reads from `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` via `Redis.fromEnv()`).

- [ ] **Step 3: Test rate limiting manually**

With dev server running, send 11 rapid POSTs to login:
```bash
for i in $(seq 1 11); do curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/login; done
```

Expected: first 10 return 200 or 302 (redirect), 11th returns 429.

- [ ] **Step 4: Commit**

```bash
git add middleware.ts
git commit -m "feat(security): add Upstash rate limiting on auth endpoints (10 req/min)"
```

---

## Task 3: Create centralized role guards

**Files:**
- Create: `lib/auth/guards.ts`

**Context:** `lib/auth/` already has `get-session.ts`, `server.ts`, `admin.ts`. We add `guards.ts` with three reusable helpers that return early-exit objects on failure and `null` on success — matching the pattern already used in `sales-return.actions.ts` and `sales-order.actions.ts`.

- [ ] **Step 1: Create `lib/auth/guards.ts`**

```typescript
import { getSession } from './get-session'

type GuardFailure = { success: false; error: string }

export async function requireAuth(): Promise<GuardFailure | null> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }
  return null
}

export async function requireSupervisorOrAdmin(): Promise<GuardFailure | null> {
  const session = await getSession()
  if (!session || !['supervisor', 'admin'].includes(session.role)) {
    return { success: false, error: 'Akses ditolak' }
  }
  return null
}

export async function requireAdmin(): Promise<GuardFailure | null> {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return { success: false, error: 'Akses ditolak' }
  }
  return null
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors from `lib/auth/guards.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/auth/guards.ts
git commit -m "feat(security): add centralized role guard helpers to lib/auth/guards.ts"
```

---

## Task 4: Harden stock.actions.ts

**Files:**
- Modify: `lib/actions/stock.actions.ts`

**Context:** `createStockAdjustmentAction` and `submitRegradeRequestAction` currently only check `if (!session)`. They need `requireSupervisorOrAdmin()`. `approveRegradeRequestAction` and `rejectRegradeRequestAction` already check `session.role !== 'admin'` — replace with centralized guard and add `.trim()` to `notes` and `reason` Zod fields.

- [ ] **Step 1: Update `lib/actions/stock.actions.ts`**

Replace the file with:

```typescript
'use server'

import { z } from 'zod'
import { getSession } from '@/lib/auth/get-session'
import { requireSupervisorOrAdmin, requireAdmin } from '@/lib/auth/guards'
import {
  getStockBalance,
  createStockAdjustment,
  submitRegradeRequest,
  approveRegradeRequest,
  rejectRegradeRequest,
} from '@/lib/services/stock.service'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

const stockAdjustmentSchema = z.object({
  flockId: z.string().uuid(),
  adjustmentDate: z.coerce.date(),
  grade: z.enum(['A', 'B']),
  quantity: z.coerce.number().int(),
  reason: z.string().min(1).max(500).trim(),
  notes: z.string().max(500).trim().optional(),
})

const regradeRequestSchema = z.object({
  flockId: z.string().uuid(),
  gradeFrom: z.enum(['A', 'B']),
  gradeTo: z.enum(['A', 'B']),
  quantity: z.coerce.number().int().positive(),
  requestDate: z.coerce.date(),
  notes: z.string().max(500).trim().optional(),
})

export async function getStockBalanceAction(
  flockId: string,
  grade: 'A' | 'B'
): Promise<ActionResult<number>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }

  const parsed = z.object({ flockId: z.string().uuid(), grade: z.enum(['A', 'B']) }).safeParse({ flockId, grade })
  if (!parsed.success) return { success: false, error: 'Input tidak valid. Periksa kembali data yang diisi.' }

  try {
    const balance = await getStockBalance(parsed.data.flockId, parsed.data.grade)
    return { success: true, data: balance }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal memuat saldo stok' }
  }
}

export async function createStockAdjustmentAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const guard = await requireSupervisorOrAdmin()
  if (guard) return guard

  const session = await getSession()

  const parsed = stockAdjustmentSchema.safeParse({
    flockId: formData.get('flockId'),
    adjustmentDate: formData.get('adjustmentDate'),
    grade: formData.get('grade'),
    quantity: formData.get('quantity'),
    reason: formData.get('reason'),
    notes: formData.get('notes') || undefined,
  })
  if (!parsed.success) {
    return { success: false, error: 'Input tidak valid. Periksa kembali data yang diisi.' }
  }

  try {
    const result = await createStockAdjustment(parsed.data, session!.id, session!.role)
    return { success: true, data: { id: result.id } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menyimpan penyesuaian stok' }
  }
}

export async function submitRegradeRequestAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const guard = await requireSupervisorOrAdmin()
  if (guard) return guard

  const session = await getSession()

  const parsed = regradeRequestSchema.safeParse({
    flockId: formData.get('flockId'),
    gradeFrom: formData.get('gradeFrom'),
    gradeTo: formData.get('gradeTo'),
    quantity: formData.get('quantity'),
    requestDate: formData.get('requestDate'),
    notes: formData.get('notes') || undefined,
  })
  if (!parsed.success) {
    return { success: false, error: 'Input tidak valid. Periksa kembali data yang diisi.' }
  }

  try {
    const result = await submitRegradeRequest(parsed.data, session!.id)
    return { success: true, data: { id: result.id } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal mengajukan permintaan regrade' }
  }
}

export async function approveRegradeRequestAction(
  requestId: string
): Promise<ActionResult> {
  const guard = await requireAdmin()
  if (guard) return guard

  const session = await getSession()

  try {
    await approveRegradeRequest(requestId, session!.id)
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menyetujui permintaan regrade' }
  }
}

export async function rejectRegradeRequestAction(
  requestId: string
): Promise<ActionResult> {
  const guard = await requireAdmin()
  if (guard) return guard

  const session = await getSession()

  try {
    await rejectRegradeRequest(requestId, session!.id)
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menolak permintaan regrade' }
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/actions/stock.actions.ts
git commit -m "fix(security): require supervisor+ for stock adjustment and regrade submit"
```

---

## Task 5: Harden daily-record.actions.ts with coop scope check

**Files:**
- Modify: `lib/actions/daily-record.actions.ts`

**Context:** Operators are scoped to assigned coops via `user_coop_assignments`. The action currently passes `flockId` — we need to resolve which coop that flock belongs to and check against the operator's assignments. `findAssignedCoopIds` exists in `lib/db/queries/user-coop-assignment.queries.ts`. `findFlockById` exists in `lib/db/queries/flock.queries.ts`.

- [ ] **Step 1: Update `lib/actions/daily-record.actions.ts`**

Replace entire file with:

```typescript
'use server'

import { z } from 'zod'
import { getSession } from '@/lib/auth/get-session'
import { requireAuth } from '@/lib/auth/guards'
import { createDailyRecord, getFlockOptionsForInput, updateDailyRecord } from '@/lib/services/daily-record.service'
import { findAssignedCoopIds } from '@/lib/db/queries/user-coop-assignment.queries'
import { findFlockById } from '@/lib/db/queries/flock.queries'

const dailyRecordSchema = z.object({
  flockId: z.string().uuid('Flock tidak valid'),
  recordDate: z.coerce.date(),
  deaths: z.coerce.number().int().min(0),
  culled: z.coerce.number().int().min(0),
  eggsGradeA: z.coerce.number().int().min(0),
  eggsGradeB: z.coerce.number().int().min(0),
  eggsCracked: z.coerce.number().int().min(0),
  eggsAbnormal: z.coerce.number().int().min(0),
  avgWeightKg: z.coerce.number().optional(),
  feedKg: z.coerce.number().optional(),
})

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

async function assertCoopAccess(userId: string, role: string, flockId: string): Promise<{ success: false; error: string } | null> {
  if (role !== 'operator') return null // supervisor + admin can access all coops
  const flock = await findFlockById(flockId)
  if (!flock) return { success: false, error: 'Flock tidak ditemukan' }
  const assignedCoopIds = await findAssignedCoopIds(userId)
  if (!assignedCoopIds.includes(flock.coopId)) {
    return { success: false, error: 'Akses ditolak' }
  }
  return null
}

export async function createDailyRecordAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const guard = await requireAuth()
  if (guard) return guard

  const session = await getSession()

  const parsed = dailyRecordSchema.safeParse({
    flockId: formData.get('flockId'),
    recordDate: formData.get('recordDate'),
    deaths: formData.get('deaths'),
    culled: formData.get('culled'),
    eggsGradeA: formData.get('eggsGradeA'),
    eggsGradeB: formData.get('eggsGradeB'),
    eggsCracked: formData.get('eggsCracked'),
    eggsAbnormal: formData.get('eggsAbnormal'),
    avgWeightKg: formData.get('avgWeightKg') || undefined,
    feedKg: formData.get('feedKg') || undefined,
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }
  }

  const coopGuard = await assertCoopAccess(session!.id, session!.role, parsed.data.flockId)
  if (coopGuard) return coopGuard

  try {
    const record = await createDailyRecord(parsed.data, session!.id, session!.role)
    return { success: true, data: { id: record.id } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menyimpan data produksi' }
  }
}

const updateDailyRecordSchema = z.object({
  recordId: z.string().uuid(),
  flockId: z.string().uuid().optional(), // needed for coop scope check
  deaths: z.coerce.number().int().min(0).optional(),
  culled: z.coerce.number().int().min(0).optional(),
  eggsGradeA: z.coerce.number().int().min(0).optional(),
  eggsGradeB: z.coerce.number().int().min(0).optional(),
  eggsCracked: z.coerce.number().int().min(0).optional(),
  eggsAbnormal: z.coerce.number().int().min(0).optional(),
  avgWeightKg: z.coerce.number().optional(),
  feedKg: z.coerce.number().optional(),
})

export async function updateDailyRecordAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const guard = await requireAuth()
  if (guard) return guard

  const session = await getSession()

  const parsed = updateDailyRecordSchema.safeParse({
    recordId: formData.get('recordId'),
    flockId: formData.get('flockId') || undefined,
    deaths: formData.get('deaths') || undefined,
    culled: formData.get('culled') || undefined,
    eggsGradeA: formData.get('eggsGradeA') || undefined,
    eggsGradeB: formData.get('eggsGradeB') || undefined,
    eggsCracked: formData.get('eggsCracked') || undefined,
    eggsAbnormal: formData.get('eggsAbnormal') || undefined,
    avgWeightKg: formData.get('avgWeightKg') || undefined,
    feedKg: formData.get('feedKg') || undefined,
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }
  }

  if (parsed.data.flockId) {
    const coopGuard = await assertCoopAccess(session!.id, session!.role, parsed.data.flockId)
    if (coopGuard) return coopGuard
  }

  const { recordId, flockId: _flockId, ...patch } = parsed.data

  try {
    const updated = await updateDailyRecord(recordId, patch, session!.id, session!.role)
    return { success: true, data: { id: updated.id } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menyimpan data' }
  }
}

export type { FlockOption } from '@/lib/services/daily-record.service'

export async function getFlockOptionsForInputAction(): Promise<ActionResult<import('@/lib/services/daily-record.service').FlockOption[]>> {
  const guard = await requireAuth()
  if (guard) return guard

  const session = await getSession()

  try {
    const data = await getFlockOptionsForInput(session!.id, session!.role)
    return { success: true, data }
  } catch {
    return { success: false, error: 'Gagal memuat daftar flock' }
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/actions/daily-record.actions.ts
git commit -m "fix(security): add coop scope check for operators in daily-record actions"
```

---

## Task 6: Audit and harden remaining action files

**Files:**
- Modify: `lib/actions/sales-order.actions.ts` (add `.trim()` to notes fields)
- Modify: `lib/actions/sales-return.actions.ts` (add `.trim()` to notes field, switch to centralized guards)
- Modify: `lib/actions/invoice.actions.ts` (add `.trim()` to free-text fields)
- Modify: `lib/actions/coop.actions.ts` (verify requireAdmin, add `.trim()`)
- Modify: `lib/actions/import.actions.ts` (verify requireAdmin)
- Modify: `lib/actions/user.actions.ts` (switch to centralized guards)

**Context:** Most files already have correct role checks. This task standardizes them to use `lib/auth/guards.ts` and tightens Zod schemas on free-text fields. Read each file before editing — only change what's listed below.

- [ ] **Step 1: Update `lib/actions/sales-order.actions.ts` — add `.trim()` to Zod schema**

In the `createSalesOrderSchema`, update `notes` and `overrideReason` and the item `description` field:
```typescript
notes: z.string().max(500).trim().optional(),
overrideReason: z.string().max(500).trim().optional(),
// and in salesOrderItemSchema:
description: z.string().max(500).trim().optional(),
```

Also switch the inline `requireSupervisorOrAdmin()` to import from guards:
```typescript
import { requireSupervisorOrAdmin } from '@/lib/auth/guards'
```
Remove the inline `async function requireSupervisorOrAdmin()` definition.

- [ ] **Step 2: Update `lib/actions/sales-return.actions.ts` — switch to centralized guards and add `.trim()`**

Replace inline guard definitions with imports:
```typescript
import { requireSupervisorOrAdmin, requireAdmin } from '@/lib/auth/guards'
```
Remove the two inline `requireSupervisorOrAdmin` and `requireAdmin` function definitions (they are identical to the centralized ones). Update `notes` Zod field:
```typescript
notes: z.string().max(500).trim().optional(),
```

- [ ] **Step 3: Update `lib/actions/invoice.actions.ts` — add `.trim()` to free-text Zod fields**

Find and update: `referenceNumber`, `notes`, any other free-text string fields — add `.max(500).trim()`.

- [ ] **Step 4: Verify `lib/actions/coop.actions.ts` and `lib/actions/import.actions.ts` have requireAdmin**

Read each file. If `requireAdmin()` guard is missing, add it using the centralized import:
```typescript
import { requireAdmin } from '@/lib/auth/guards'
// at top of each action function:
const guard = await requireAdmin()
if (guard) return guard
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 6: Run existing tests**

```bash
npm run test:run
```

Expected: all tests pass (no service logic changed, only action wrappers).

- [ ] **Step 7: Commit**

```bash
git add lib/actions/
git commit -m "fix(security): standardize role guards and tighten Zod free-text fields across all actions"
```

---

## Task 7: Remove sensitive console.log statements

**Files:**
- Modify: any files in `lib/actions/`, `lib/services/`, `app/api/` that log session/token/PII data

- [ ] **Step 1: Grep for console.log across sensitive directories**

```bash
grep -rn "console\.log" lib/actions/ lib/services/ app/api/
```

Review each result. Flag any that print: session objects, user IDs in combination with other data, tokens, passwords, emails with context.

- [ ] **Step 2: Remove flagged log statements**

Delete or replace each flagged `console.log` line. Do not remove logs that print non-sensitive data (e.g., operation counts, timing benchmarks used for perf testing).

- [ ] **Step 3: Verify no regressions**

```bash
npm run test:run
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add lib/actions/ lib/services/ app/api/
git commit -m "fix(security): remove sensitive console.log statements from server-side code"
```

---

## Task 8: Create dashboard queries

**Files:**
- Create: `lib/db/queries/dashboard.queries.ts`

**Context:** Dashboard needs: (1) KPI aggregations across all active flocks for today and last 7 days, (2) 30-day daily production trend for charts, (3) recent 7 records. `findRecentDailyRecords` in `daily-record.queries.ts` is flock-scoped — dashboard needs cross-flock aggregation. New query file for dashboard-specific SQL.

- [ ] **Step 1: Create `lib/db/queries/dashboard.queries.ts`**

```typescript
import { db } from '@/lib/db'
import { dailyRecords, flocks, inventoryMovements } from '@/lib/db/schema'
import { desc, sql, isNull, gte, and, sum } from 'drizzle-orm'
import type { DailyRecord } from '@/lib/db/schema'

export type DashboardRecord = Pick<
  DailyRecord,
  'id' | 'flockId' | 'recordDate' | 'deaths' | 'culled' | 'eggsGradeA' | 'eggsGradeB' | 'feedKg' | 'isLateInput'
>

export async function getRecentDailyRecordsAcrossFlocks(limit: number): Promise<DashboardRecord[]> {
  return db
    .select({
      id: dailyRecords.id,
      flockId: dailyRecords.flockId,
      recordDate: dailyRecords.recordDate,
      deaths: dailyRecords.deaths,
      culled: dailyRecords.culled,
      eggsGradeA: dailyRecords.eggsGradeA,
      eggsGradeB: dailyRecords.eggsGradeB,
      feedKg: dailyRecords.feedKg,
      isLateInput: dailyRecords.isLateInput,
    })
    .from(dailyRecords)
    .innerJoin(flocks, sql`${dailyRecords.flockId} = ${flocks.id}`)
    .where(isNull(flocks.retiredAt))
    .orderBy(desc(dailyRecords.recordDate))
    .limit(limit)
}

export type DailyAggRow = {
  date: Date
  totalEggsA: number
  totalEggsB: number
  totalDeaths: number
  totalFeedKg: number
  totalPopulation: number
}

export async function getDailyProductionAgg(days: number): Promise<DailyAggRow[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const rows = await db
    .select({
      date: dailyRecords.recordDate,
      totalEggsA: sum(dailyRecords.eggsGradeA),
      totalEggsB: sum(dailyRecords.eggsGradeB),
      totalDeaths: sum(dailyRecords.deaths),
      totalFeedKg: sum(dailyRecords.feedKg),
    })
    .from(dailyRecords)
    .innerJoin(flocks, sql`${dailyRecords.flockId} = ${flocks.id}`)
    .where(and(isNull(flocks.retiredAt), gte(dailyRecords.recordDate, since)))
    .groupBy(dailyRecords.recordDate)
    .orderBy(desc(dailyRecords.recordDate))
    .limit(days)

  return rows.map((r) => ({
    date: r.date,
    totalEggsA: Number(r.totalEggsA ?? 0),
    totalEggsB: Number(r.totalEggsB ?? 0),
    totalDeaths: Number(r.totalDeaths ?? 0),
    totalFeedKg: Number(r.totalFeedKg ?? 0),
    totalPopulation: 0, // computed in service layer using flock initial counts
  }))
}

export type FlockPopulationRow = {
  flockId: string
  initialCount: number
  totalDeaths: number
  totalCulled: number
}

export async function getActiveFlockPopulations(): Promise<FlockPopulationRow[]> {
  const rows = await db
    .select({
      flockId: flocks.id,
      initialCount: flocks.initialCount,
      totalDeaths: sum(dailyRecords.deaths),
      totalCulled: sum(dailyRecords.culled),
    })
    .from(flocks)
    .leftJoin(dailyRecords, sql`${dailyRecords.flockId} = ${flocks.id}`)
    .where(isNull(flocks.retiredAt))
    .groupBy(flocks.id, flocks.initialCount)

  return rows.map((r) => ({
    flockId: r.flockId,
    initialCount: r.initialCount,
    totalDeaths: Number(r.totalDeaths ?? 0),
    totalCulled: Number(r.totalCulled ?? 0),
  }))
}

export type StockSummaryRow = {
  totalGradeA: number
  totalGradeB: number
}

export async function getStockSummary(): Promise<StockSummaryRow> {
  const rows = await db
    .select({
      type: inventoryMovements.movementType,
      grade: inventoryMovements.grade,
      qty: sum(inventoryMovements.quantity),
    })
    .from(inventoryMovements)
    .groupBy(inventoryMovements.movementType, inventoryMovements.grade)

  let gradeA = 0
  let gradeB = 0
  for (const r of rows) {
    const qty = Number(r.qty ?? 0)
    const sign = r.type === 'in' ? 1 : -1
    if (r.grade === 'A') gradeA += sign * qty
    if (r.grade === 'B') gradeB += sign * qty
  }
  return { totalGradeA: Math.max(0, gradeA), totalGradeB: Math.max(0, gradeB) }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/db/queries/dashboard.queries.ts
git commit -m "feat(dashboard): add cross-flock aggregation queries for dashboard KPIs"
```

---

## Task 9: Create dashboard.service.ts

**Files:**
- Create: `lib/services/dashboard.service.ts`

**Context:** Wraps `dashboard.queries.ts` with business logic: compute HDP%, FCR, population from raw aggregations. Returns typed structs consumed by dashboard page. Reuses `computeHDP`, `computeFCR`, `computeActivePopulation`, `computeFeedPerBird` already defined and exported from `lib/services/daily-record.service.ts`.

- [ ] **Step 1: Create `lib/services/dashboard.service.ts`**

```typescript
import {
  getRecentDailyRecordsAcrossFlocks,
  getDailyProductionAgg,
  getActiveFlockPopulations,
  getStockSummary,
  type DashboardRecord,
  type DailyAggRow,
} from '@/lib/db/queries/dashboard.queries'
import { computeHDP, computeFCR, computeFeedPerBird } from './daily-record.service'

export type DashboardKpis = {
  hdpPercent: number
  fcr7Day: number
  productionToday: number
  stockReadyToSell: number
  activePopulation: number
  feedPerBirdGrams: number
}

export type DashboardChartPoint = {
  date: string
  hdp: number
  fcr: number
  gradeA: number
  gradeB: number
  cumulativeDepletion: number
}

export type DashboardRecentRecord = {
  date: string
  gradeA: number
  gradeB: number
  deaths: number
  feedKg: number
  fcr: number
  isLate: boolean
}

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const [popRows, stockSummary, recentRecords] = await Promise.all([
    getActiveFlockPopulations(),
    getStockSummary(),
    getRecentDailyRecordsAcrossFlocks(7),
  ])

  const activePopulation = popRows.reduce(
    (acc, r) => acc + Math.max(0, r.initialCount - r.totalDeaths - r.totalCulled),
    0
  )

  const todayStr = new Date().toISOString().slice(0, 10)
  const todayRecords = recentRecords.filter(
    (r) => new Date(r.recordDate).toISOString().slice(0, 10) === todayStr
  )
  const productionToday = todayRecords.reduce((acc, r) => acc + r.eggsGradeA + r.eggsGradeB, 0)

  const last7EggsA = recentRecords.reduce((acc, r) => acc + r.eggsGradeA, 0)
  const last7EggsB = recentRecords.reduce((acc, r) => acc + r.eggsGradeB, 0)
  const last7FeedKg = recentRecords.reduce((acc, r) => acc + Number(r.feedKg ?? 0), 0)

  const hdpPercent = computeHDP(last7EggsA, last7EggsB, activePopulation * 7)
  const fcr7Day = computeFCR(last7FeedKg, last7EggsA, last7EggsB)
  const feedPerBirdGrams = computeFeedPerBird(last7FeedKg / 7, activePopulation)

  return {
    hdpPercent,
    fcr7Day,
    productionToday,
    stockReadyToSell: stockSummary.totalGradeA + stockSummary.totalGradeB,
    activePopulation,
    feedPerBirdGrams,
  }
}

export async function getProductionChartData(days: number = 30): Promise<DashboardChartPoint[]> {
  const [aggRows, popRows] = await Promise.all([
    getDailyProductionAgg(days),
    getActiveFlockPopulations(),
  ])

  const totalInitial = popRows.reduce((acc, r) => acc + r.initialCount, 0)
  const totalDepletion = popRows.reduce((acc, r) => acc + r.totalDeaths + r.totalCulled, 0)

  let cumulativeDepletion = totalDepletion
  return aggRows.map((r: DailyAggRow) => {
    const population = Math.max(0, totalInitial - cumulativeDepletion)
    const hdp = computeHDP(r.totalEggsA, r.totalEggsB, population)
    const fcr = computeFCR(r.totalFeedKg, r.totalEggsA, r.totalEggsB)
    cumulativeDepletion -= r.totalDeaths

    const d = new Date(r.date)
    const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`

    return {
      date: label,
      hdp: Math.round(hdp * 10) / 10,
      fcr: Math.round(fcr * 100) / 100,
      gradeA: r.totalEggsA,
      gradeB: r.totalEggsB,
      cumulativeDepletion: totalDepletion - cumulativeDepletion,
    }
  })
}

export async function getRecentDashboardRecords(limit: number = 7): Promise<DashboardRecentRecord[]> {
  const records: DashboardRecord[] = await getRecentDailyRecordsAcrossFlocks(limit)
  return records.map((r) => {
    const feedKg = Number(r.feedKg ?? 0)
    const d = new Date(r.recordDate)
    const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
    return {
      date: label,
      gradeA: r.eggsGradeA,
      gradeB: r.eggsGradeB,
      deaths: r.deaths,
      feedKg,
      fcr: computeFCR(feedKg, r.eggsGradeA, r.eggsGradeB),
      isLate: r.isLateInput ?? false,
    }
  })
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/services/dashboard.service.ts
git commit -m "feat(dashboard): add dashboard.service.ts with real KPI, chart, and recent records"
```

---

## Task 10: Wire dashboard page to real data

**Files:**
- Modify: `app/(app)/dashboard/page.tsx`

**Context:** Replace all three MOCK imports with calls to `dashboard.service.ts`. The `DashboardCharts` component expects `DailyChartPoint[]` — verify the shape matches `DashboardChartPoint` from the service. The recent records table expects `RecentRecord[]` — verify shape matches `DashboardRecentRecord`. Both types are structurally identical so no component changes needed.

- [ ] **Step 1: Update `app/(app)/dashboard/page.tsx`**

Replace entire file with:

```typescript
import Link from 'next/link'
import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { KpiCard } from '@/components/ui/kpi-card'
import { DashboardCharts } from '@/components/ui/charts/dashboard-charts'
import { getDashboardKpis, getProductionChartData, getRecentDashboardRecords } from '@/lib/services/dashboard.service'
import { getAgingData } from '@/lib/services/invoice.service'
import type { AgingRow } from '@/lib/db/queries/invoice.queries'

export default async function DashboardPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  const [kpis, chartData, recentRecords] = await Promise.all([
    getDashboardKpis(),
    getProductionChartData(30),
    getRecentDashboardRecords(7),
  ])

  let top5: AgingRow[] = []
  if (user.role !== 'operator') {
    try {
      const agingData = await getAgingData()
      top5 = agingData.slice(0, 5)
    } catch {
      top5 = []
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[var(--lf-text-dark)]">Dashboard</h1>
        <p className="text-sm text-[var(--lf-text-soft)] mt-0.5">Selamat datang, {user?.fullName}</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <KpiCard label="HDP%" value={`${kpis.hdpPercent.toFixed(1)}%`} />
        <KpiCard label="FCR 7 Hari" value={kpis.fcr7Day.toFixed(2)} />
        <KpiCard label="Produksi Hari Ini" value={kpis.productionToday.toLocaleString('id')} unit="butir" />
        <KpiCard label="Stok Siap Jual" value={kpis.stockReadyToSell.toLocaleString('id')} unit="butir" />
        <KpiCard label="Populasi Aktif" value={kpis.activePopulation.toLocaleString('id')} unit="ekor" />
        <KpiCard label="Pakan/Ekor" value={kpis.feedPerBirdGrams.toFixed(0)} unit="g" />
      </div>

      {/* Charts 2x2 */}
      <DashboardCharts data={chartData} />

      {/* Recent records table */}
      <div className="bg-white rounded-2xl p-4 shadow-lf-sm border border-[var(--lf-border)]">
        <p className="text-xs font-medium text-[var(--lf-text-soft)] uppercase tracking-wide mb-3">7 Catatan Terakhir</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-[var(--lf-text-soft)] uppercase tracking-wide border-b border-[var(--lf-border)]">
                <th className="text-left pb-2">Tanggal</th>
                <th className="text-right pb-2">Grade A</th>
                <th className="text-right pb-2">Grade B</th>
                <th className="text-right pb-2">Kematian</th>
                <th className="text-right pb-2">FCR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lf-border)]">
              {recentRecords.map((r) => (
                <tr key={r.date} className="py-2">
                  <td className="py-2 text-[var(--lf-text-dark)]">
                    {r.date}
                    {r.isLate && (
                      <span className="ml-2 text-[10px] bg-[var(--lf-danger-bg)] rounded px-1.5 py-0.5" style={{ color: 'var(--lf-danger-text)' }}>Terlambat</span>
                    )}
                  </td>
                  <td className="py-2 text-right text-[var(--lf-text-dark)]">{r.gradeA.toLocaleString('id')}</td>
                  <td className="py-2 text-right text-[var(--lf-text-dark)]">{r.gradeB.toLocaleString('id')}</td>
                  <td className="py-2 text-right text-[var(--lf-text-mid)]">{r.deaths}</td>
                  <td className="py-2 text-right font-medium" style={{ color: r.fcr > 2.1 ? 'var(--lf-danger-text)' : 'var(--lf-text-dark)' }}>
                    {r.fcr.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Aging widget — admin + supervisor only */}
      {user.role !== 'operator' && (
        <div className="bg-white rounded-[16px] p-6 shadow-lf-sm border border-[var(--lf-border)]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-[var(--lf-text-soft)] uppercase tracking-wide">5 Invoice Jatuh Tempo</p>
            <Link href="/laporan" className="text-xs font-medium" style={{ color: 'var(--lf-teal)' }}>Lihat semua</Link>
          </div>
          {top5.length === 0 ? (
            <p className="text-sm text-[var(--lf-text-soft)]">Tidak ada invoice jatuh tempo</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] text-[var(--lf-text-soft)] uppercase tracking-wide border-b border-[var(--lf-border)]">
                    <th className="text-left pb-2">Pelanggan</th>
                    <th className="text-left pb-2">No. Invoice</th>
                    <th className="text-right pb-2">Jatuh Tempo</th>
                    <th className="text-right pb-2">Sisa</th>
                    <th className="text-right pb-2">Hari Lewat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--lf-border)]">
                  {top5.map((row) => {
                    const days = row.daysOverdue
                    let daysColor = 'var(--lf-text-dark)'
                    let fontWeight: React.CSSProperties['fontWeight'] = 400
                    if (days > 30) { daysColor = '#c0392b'; fontWeight = 700 }
                    else if (days > 14) { daysColor = '#e74c3c' }
                    else if (days > 7) { daysColor = '#e67e22' }
                    return (
                      <tr key={row.invoiceId}>
                        <td className="py-2 text-[var(--lf-text-dark)]">{row.customerName}</td>
                        <td className="py-2 text-[var(--lf-text-dark)]">{row.invoiceNumber}</td>
                        <td className="py-2 text-right text-[var(--lf-text-mid)]">
                          {new Date(row.dueDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-2 text-right text-[var(--lf-text-dark)]">
                          Rp {Number(row.outstanding).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 text-right" style={{ color: daysColor, fontWeight }}>
                          {days} hari
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Start dev server and open dashboard**

```bash
npm run dev
```

Open `http://localhost:3000/dashboard`. Verify:
- KPI cards show real values (not fixed mock numbers like 87.5%)
- Chart renders with data (or empty state if no records in DB)
- Recent records table shows real data or empty state
- No console errors

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/dashboard/page.tsx
git commit -m "feat(dashboard): replace mock data with real DB queries"
```

---

## Task 11: Performance benchmarks

**Files:**
- Modify: migration file only if indexes needed (add via `npm run db:generate` + `npm run db:migrate`)

**Context:** Measure 4 endpoints against targets. Only add indexes if measured time exceeds target. Use staging environment with production-like data if possible.

- [ ] **Step 1: Benchmark dashboard load time**

With dev server running and some data in DB:
```bash
curl -o /dev/null -s -w "Total: %{time_total}s\n" http://localhost:3000/dashboard
```

Target: `< 3s`. If slow, check Next.js server logs for which query takes longest. Common fix: add composite index.

- [ ] **Step 2: Benchmark stock page**

```bash
curl -o /dev/null -s -w "Total: %{time_total}s\n" http://localhost:3000/stok
```

Target: `< 1s`.

- [ ] **Step 3: Benchmark aging CSV (requires auth cookie)**

Use browser devtools: open `/laporan`, click "Download CSV", check Network tab timing.

Target: `< 5s` with real invoice data.

- [ ] **Step 4: Benchmark invoice PDF generation**

In `lib/services/invoice.service.ts`, temporarily add:
```typescript
console.time('pdf-generation')
// ... existing renderToBuffer call ...
console.timeEnd('pdf-generation')
```

Trigger PDF generation via the invoice page. Check server logs for time.

Target: `< 5s`.

- [ ] **Step 5: Add DB indexes if benchmarks fail targets**

If dashboard or stock is slow, add to a new schema migration. First edit schema files to add indexes, then generate and migrate:

For `daily_records`:
```typescript
// In lib/db/schema/daily-records.ts, add to pgTable options:
// (drizzleOrm index syntax)
import { index } from 'drizzle-orm/pg-core'
// add as third arg to pgTable:
}, (table) => [
  index('daily_records_coop_date_idx').on(table.flockId, table.recordDate),
])
```

For `inventory_movements`:
```typescript
}, (table) => [
  index('inventory_movements_type_grade_idx').on(table.movementType, table.grade),
])
```

Then:
```bash
npm run db:generate
# Review generated SQL — verify no DROP statements
npm run db:migrate
```

- [ ] **Step 6: Remove timing console.time from invoice.service.ts**

```bash
# grep and manually remove the console.time/timeEnd lines added in Step 4
```

- [ ] **Step 7: Commit benchmark results and any schema changes**

```bash
git add lib/db/schema/ lib/db/migrations/
git commit -m "perf: add DB indexes for dashboard and stock query performance"
# or if no indexes needed:
git commit --allow-empty -m "perf: benchmarks verified — all 4 endpoints within targets"
```

---

## Task 12: Write UAT test script

**Files:**
- Create: `docs/uat/UAT_Sprint9_TestScript.md`

- [ ] **Step 1: Create `docs/uat/` directory and write UAT doc**

```bash
mkdir -p docs/uat
```

Create `docs/uat/UAT_Sprint9_TestScript.md`:

```markdown
# UAT Sprint 9 — Admin Role Test Script

**Phase:** 5 Hardening  
**Role tested:** Admin only  
**Tester:** _______________  
**Date:** _______________  
**Environment:** _______________  

## Pre-conditions
- Admin account exists and is active
- At least 1 coop configured
- At least 1 active flock in that coop

---

## A. User Management

| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 1 | Login as admin → go to Admin → Users → Create User (operator, assign to Coop A) | User created, appears in list with role=operator | |
| 2 | Login as the new operator in another browser/incognito → navigate to Produksi | Only Coop A visible in flock dropdown | |
| 3 | Back as admin → Users → Deactivate the operator account | Operator login attempt fails with auth error | |

---

## B. Data Entry — Full Date Range

| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 4 | As admin → Produksi → Input today's data (any coop) | Saves successfully, appears in dashboard 7 Catatan Terakhir | |
| 5 | As admin → Produksi → Input H-1 data | Saves successfully | |
| 6 | As admin → Produksi → Input H-2 data | Saves successfully (admin unlimited) | |
| 7 | As admin → Produksi → Input data from 5 days ago (H-5) | Saves, AND verify correction_records table has entry with this record's ID | |

---

## C. Inventory

| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 8 | As admin → Stok → Adjust stock (positive qty, Grade A) | inventory_movements has new 'adjustment' entry, stock balance updated | |
| 9 | As admin → Stok → Regrade → Submit regrade request (A→B, qty=10) | Regrade shows status=pending | |
| 10 | As admin → Stok → Regrade → Approve the pending request | Status changes to approved, Grade A stock -10, Grade B stock +10 | |
| 11 | As admin → Submit another regrade → Reject it | Status = rejected, stock unchanged | |

---

## D. Sales

| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 12 | As admin → Penjualan → Create SO (select customer, add Grade A eggs, qty within stock) | SO created with status=draft | |
| 13 | Confirm the SO | Status = confirmed | |
| 14 | Fulfill the SO | Status = fulfilled, inventory deducted, invoice auto-created | |
| 15 | As admin → Penjualan → Return → Create return for that SO | Credit note generated | |
| 16 | As admin → Finance → Invoices → Apply the credit note to a future invoice | Invoice balance reduced by credit amount | |

---

## E. Finance

| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 17 | As admin → Finance → Record cash payment for an invoice | Invoice status updates (partial or paid) | |
| 18 | Record transfer payment with reference number "TRF-001" | Payment saved, reference number visible in payment list | |
| 19 | As admin → Finance → Apply customer credit to invoice | Credit balance reduced, invoice outstanding reduced | |

---

## F. Import

| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 20 | As admin → Admin → Import → Import CSV (flocks template with valid data) | Flocks created, is_imported=true in DB | |
| 21 | Import CSV with intentional error (e.g. invalid date format) | Error report shown, no partial records created | |

---

## G. Reports

| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 22 | As admin → Laporan → Aging Report | Overdue invoices listed with correct days overdue | |
| 23 | Download aging CSV | File downloads, data matches what's shown in UI | |
| 24 | View production report | Daily records aggregated by date, matches input data | |
| 25 | Generate invoice PDF (from invoice detail page) | PDF renders with correct data, < 5 seconds | |

---

## H. Coop Management

| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 26 | As admin → Admin → Coops → Add new coop "Kandang Test" | Coop appears in coop list and in Produksi flock dropdown | |
| 27 | Edit the coop name to "Kandang Test Updated" | Name updated in all references | |

---

## Sign-off Criteria

- [ ] All 27 scenarios pass
- [ ] Zero critical bugs open
- [ ] Invoice PDF generated successfully
- [ ] Aging report data accurate vs manual calculation

**Sign-off:**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Admin / Farm Owner | | | |
| Developer | | | |
```

- [ ] **Step 2: Commit**

```bash
git add docs/uat/UAT_Sprint9_TestScript.md
git commit -m "docs(uat): add Sprint 9 admin UAT test script (27 scenarios)"
```

---

## Task 13: Final verification

- [ ] **Step 1: Run full test suite**

```bash
npm run test:run
```

Expected: all tests pass.

- [ ] **Step 2: TypeScript clean compile**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 4: Build**

```bash
npm run build
```

Expected: successful production build, no errors.

- [ ] **Step 5: Final security check — verify rate limiting active**

```bash
npm run dev
# In another terminal:
for i in $(seq 1 11); do curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/login; done
```

Expected: 429 on request 11.

- [ ] **Step 6: Verify dashboard loads with real data**

Open `http://localhost:3000/dashboard`. KPI values should reflect actual DB state, not mock values.

- [ ] **Step 7: Final commit if any fixes**

```bash
git add -A
git commit -m "fix: final Phase 5 cleanup"
```

---

## Acceptance Checklist

- [ ] Rate limiting: 10 req/min on auth endpoints, 429 on exceed
- [ ] All 15 action files use correct role guards per permission table
- [ ] Operators blocked from non-assigned coops in daily-record and stock actions
- [ ] No sensitive data in server-side console.log
- [ ] Dashboard loads with real data in < 3s
- [ ] Stock page loads in < 1s
- [ ] Aging CSV generates in < 5s
- [ ] Invoice PDF generates in < 5s
- [ ] UAT script written at `docs/uat/UAT_Sprint9_TestScript.md`
- [ ] All tests pass, build clean
