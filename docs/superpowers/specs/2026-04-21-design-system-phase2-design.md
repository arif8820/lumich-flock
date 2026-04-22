# Design: LumichFlock Design System + Phase 2 Production Core

**Date:** 2026-04-21  
**Scope:** Design system full restyle (all screens) + Phase 2 Sprint 2–4 features  
**Approach:** Layered — tokens → shell → screens → Phase 2 features  

---

## 1. Design Tokens

Source of truth: `design/README.md`

### Colors (CSS custom properties in `globals.css`)

```css
/* Primary — Pastel Blue */
--lf-blue:        #7aadd4   /* primary actions, active nav, button bg */
--lf-blue-dark:   #5090be   /* gradient dark end, hover */
--lf-blue-active: #3d7cb0   /* active text, active label */
--lf-blue-light:  #bbd5ee   /* avatar bg, disabled button */
--lf-blue-pale:   #e3f0f9   /* card active bg, sidebar highlight, accent */

/* Accent */
--lf-amber:       #d4a96a   /* Grade B chart bars */
--lf-amber-light: #f5e3c6
--lf-amber-pale:  #fdf6ed

/* Semantic chart colors */
--lf-teal:        #7ab8b0   /* FCR line, depletion area */
--lf-teal-pale:   #e4f4f2
--lf-rose:        #e8a5a0   /* stock ready-to-sell icon */
--lf-rose-pale:   #fdeeed   /* late-input badge bg */

/* Neutrals */
--lf-text-dark:   #2d3a2e   /* → --foreground */
--lf-text-mid:    #5a6b5b   /* → --muted-foreground */
--lf-text-soft:   #8fa08f   /* labels, subtitles, nav inactive */
--lf-border:      #e0e8df   /* → --border */
--lf-bg:          #f7f5f1   /* → --background */
--lf-bg-warm:     #f0ede8   /* period selector bg */
--lf-white:       #ffffff

/* Semantic */
--lf-success-text: #4a90d9
--lf-success-bg:   #e3f0f9
--lf-danger-text:  #e07a6a   /* → --destructive */
--lf-danger-bg:    #fdeeed
--lf-warning-bg:   #fffbf0
```

Override shadcn `:root` vars to map LumichFlock tokens:
- `--primary` → `#7aadd4`
- `--foreground` → `#2d3a2e`
- `--muted-foreground` → `#5a6b5b`
- `--border` → `#e0e8df`
- `--background` → `#f7f5f1`
- `--accent` → `#e3f0f9`
- `--destructive` → `#e07a6a`

### Typography

- Font: **DM Sans** — weights 300/400/500/600/700
- Load via `next/font/google` (`DM_Sans`) in `app/layout.tsx`
- Replace current Geist import
- Scale: xs=10px, sm=11–12px, base=13–14px, md=16–18px, lg=22–26px (KPI values), xl=28px
- Letter-spacing: -0.3px to -0.5px on large headings

### Radius

```css
--radius: 1rem   /* 16px — card desktop */
/* shadcn scale: --radius-sm = 0.6×, --radius-md = 0.8× */
/* button/input explicit: border-radius: 10px */
/* icon containers: 9–11px */
/* login card: 20px */
```

### Shadows (add to `globals.css` via `@layer utilities`)

```css
.shadow-lf-sm  { box-shadow: 0 1px 4px rgba(45,58,46,0.06), 0 2px 12px rgba(45,58,46,0.04); }
.shadow-lf-md  { box-shadow: 0 2px 8px rgba(45,58,46,0.08), 0 8px 24px rgba(45,58,46,0.06); }
.shadow-lf-btn { box-shadow: 0 4px 12px rgba(122,173,212,0.35); }
.shadow-lf-logo{ box-shadow: 0 4px 16px rgba(122,173,212,0.35); }
```

---

## 2. Shell Components Restyle

### Login Page (`app/(auth)/login/page.tsx` + `components/forms/login-form.tsx`)

- Full viewport, `min-h-screen`, bg: `linear-gradient(145deg, #e3f0f9 0%, #fdf6ed 50%, #e4f4f2 100%)`
- Center content vertically + horizontally, max-width 400px
- **Logo block** (above card):
  - 64×64px container, `border-radius: 18px`, bg `linear-gradient(135deg, #7aadd4, #5090be)`, `shadow-lf-logo`
  - Chicken SVG icon 32px white (inline SVG, no external dep)
  - Farm name 22px bold `#2d3a2e`, subtitle 13px `#8fa08f`
- **Login card**: bg white, `border-radius: 20px`, padding 28px 28px 32px, `shadow: 0 4px 24px rgba(45,58,46,0.10)`
  - Heading "Selamat datang 👋" 18px weight 600
  - Label 13px weight 500 `#5a6b5b`, input border `1.5px solid #e0e8df`, radius 10px, bg `#fafaf9`
  - Focus: border → `#7aadd4`, transition 0.2s
  - Password field: eye toggle button absolute right-12px, icon 16px `#8fa08f`
  - Error container: 12px `#e07a6a`, bg `#fdeeed`, radius 8px, padding 8px 12px
  - "Lupa password?" link: right-align, 12px `#7aadd4` weight 500
  - Submit btn: full-width, padding 13px, radius 10px, bg gradient `#7aadd4 → #5090be`, `shadow-lf-btn`
  - Loading: spinner 14×14px, border 2px, rotate 360deg 0.8s linear
  - Disabled: bg `#bbd5ee`, no shadow, cursor default
- Footer: "© 2026 LumichFlock · v2.1.0", 12px `#8fa08f`, center

### Sidebar (`components/layout/sidebar.tsx`)

- Expand from 56px icon-only → **220px full sidebar**
- `hidden md:flex`, `w-[220px]`, `flex-col`, bg white, border-right `#e0e8df`
- **Brand area** (top): logo 38×38px radius 10px gradient + "LumichFlock" 13px bold + "ERP Peternakan" 11px `#8fa08f`
- **Farm info box**: margin 12px 10px, padding 12px 14px, bg `#e3f0f9`, radius 10px
  - Label "KANDANG AKTIF" 10px uppercase, farm name bold, status dot green + "Aktif · {population} ekor"
  - Population from `getSession()` user data or static for now
- **Nav items**: padding 9px 10px, radius 9px, gap 10px, font 13px
  - Active: bg `#e3f0f9`, color `#3d7cb0`, weight 600, icon `#7aadd4`
  - Inactive: bg transparent, color `#5a6b5b`, icon `#b0bab0`
  - Icon size: 16px (down from 18px)
- **Section labels**: 10px uppercase, letter-spacing 0.8px, color `#b0bab0`
  - "MENU UTAMA" above main nav, "PENGATURAN" above admin
- **User card** (bottom): padding 8px 10px, bg `#f7f5f1`, radius 9px
  - Avatar 30×30px radius 8px bg `#bbd5ee`, initials text
  - Name 12px bold + role 10px `#8fa08f`
  - Logout icon right (existing logout action)
- App shell layout: `grid-template-columns: 220px 1fr` on `md:` breakpoint

### Bottom Nav (`components/layout/bottom-nav.tsx`)

- Remove "More" drawer pattern — replace with direct 5 tabs
- Tabs: **Beranda** (Home icon) / **Kandang** (Bird) / **Produksi** (Egg) / **Stok** (Package) / **Laporan** (FileText)
- Fixed bottom, full-width, bg white, border-top `1px solid #e0e8df`
- Active: icon + label `#7aadd4`. Inactive: `#c0c8bf`
- `pb-safe` (iOS safe area via `padding-bottom: env(safe-area-inset-bottom)`)
- Remove `more-drawer.tsx` component (no longer needed)

### App Shell (`components/layout/app-shell.tsx`)

- Remove drawer state — no longer needed
- Layout: `min-h-screen bg-[#f7f5f1] md:grid md:grid-cols-[220px_1fr]`
- `<main>`: `flex-1 overflow-auto pb-16 md:pb-0`

---

## 3. Existing Pages Restyle

Apply design tokens to all existing pages. No new features — visual polish only.

### Dashboard stub (`app/(app)/dashboard/page.tsx`)
- Add period selector (4 buttons: H-1 / 7 hari / 14 hari / 30 hari) — local state, no data wiring yet
- Placeholder grid for 6 KPI cards (skeleton state)
- Page header: title 18px weight 700 letter-spacing -0.3px, subtitle 12px `#8fa08f`

### Admin pages (`app/(app)/admin/`)
- Restyle tables: font 13px, header 12px `#8fa08f` weight 600, border-bottom `2px solid #e0e8df`
- Row hover: bg `#fafaf8`
- Buttons: use gradient primary style
- Cards: `shadow-lf-sm`, radius 16px

### Flock, Kandang, Pelanggan pages
- Same table + card restyle as admin
- Phase badges (production phase): `bg #e3f0f9 text #3d7cb0` (normal), `bg #fdeeed text #e07a6a` (warning)

---

## 4. Phase 2 — Sprint 2: Daily Production Input

### Database Schema (Drizzle)

New tables in `lib/db/schema/`:

**`daily-records.ts`**
```
daily_records:
  id uuid PK
  flock_id uuid FK → flocks.id
  record_date date NOT NULL
  deaths int default 0
  culled int default 0
  eggs_grade_a int default 0
  eggs_grade_b int default 0
  eggs_cracked int default 0
  eggs_abnormal int default 0
  avg_weight_gram numeric(6,2)
  feed_kg numeric(8,2)
  is_late_input boolean default false
  submitted_by uuid FK → users.id
  submitted_at timestamptz default now()
  notes text
  UNIQUE(flock_id, record_date)
```

**`inventory-movements.ts`**
```
inventory_movements:
  id uuid PK
  egg_category text CHECK IN ('grade_a','grade_b','cracked','abnormal')
  movement_type text CHECK IN ('in','out','adjustment','regrade')
  quantity int NOT NULL  -- always positive; direction from movement_type
  source text CHECK IN ('daily_record','sale','return','adjustment','regrade','import')
  source_id uuid  -- FK to daily_records / sales_orders etc
  movement_date date NOT NULL
  notes text
  created_by uuid FK → users.id
  created_at timestamptz default now()
  INDEX(egg_category, movement_date)
```

**`inventory-snapshots.ts`**
```
inventory_snapshots:
  id uuid PK
  snapshot_date date NOT NULL
  egg_category text
  quantity int
  created_at timestamptz default now()
  UNIQUE(snapshot_date, egg_category)
```

### Service Layer (`lib/services/daily-record.service.ts`)

- `createDailyRecord(input, userId, userRole)`:
  1. Validate backdate: Operator ≤ H-1, Supervisor ≤ H-3, Admin unlimited. Throw if violated.
  2. Check unique constraint — return error if duplicate (flock_id + record_date).
  3. Compute `is_late_input`: submitted after 23:59 on record_date.
  4. DB transaction:
     - INSERT `daily_records`
     - INSERT `inventory_movements` (grade_a IN, grade_b IN) — source: `daily_record`
  5. Return `{ success, data, error }`.

- `getDailyRecords(flockId?, coopId?, userId, userRole)`: filtered by coop assignment for Operator.
- `getDailyRecordByDate(flockId, date)`: for duplicate check UI feedback.

### Query Layer (`lib/db/queries/daily-record.queries.ts`)

- `insertDailyRecord(tx, data)`
- `insertInventoryMovements(tx, movements[])`
- `getDailyRecordsByFlock(flockId, limit)`
- `getDailyRecordsByDateRange(coopId?, startDate, endDate)`

### UI (`app/(app)/produksi/`)

**`/produksi/input`** — new page, Operator + Supervisor + Admin

- Form fields:
  - Flock dropdown (active flocks, coop-filtered for Operator)
  - Date picker (max date enforced per role)
  - Deaths, culled (int inputs, min 0)
  - Eggs: Grade A, Grade B, Cracked, Abnormal (int inputs, min 0)
  - Avg weight (g), Feed (kg)
  - Notes (optional textarea)
- Live auto-calc panel (client-side, updates as user types):
  - Total depletion = deaths + culled
  - Active population = prev_population - total_depletion
  - HDP% = (grade_a + grade_b) / active_population × 100
  - Feed/bird = feed_kg × 1000 / active_population
  - FCR = feed_kg / ((grade_a + grade_b) × avg_weight_gram / 1000)
- Validation: negative values blocked, total depletion > population → warning + block submit
- sessionStorage key: `lf-daily-input-draft` — persist + restore on mount
- On submit: server action → `daily-record.service.ts`

**`/produksi`** — existing page, add records table

- Last 7 records table per active flock
- Columns: Tanggal, HDP%, Prod A, Prod B, Mati, FCR, Pakan, Status
- Late-input badge: bg `#fdeeed`, text `#e07a6a`, "⚠ Late Input"

### Server Action (`lib/actions/daily-record.actions.ts`)

```ts
// Pattern: validate → delegate → return
export async function createDailyRecordAction(formData: unknown) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Sesi tidak valid' }
  const parsed = dailyRecordSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: 'Input tidak valid' }
  return dailyRecordService.createDailyRecord(parsed.data, session.id, session.role)
}
```

### Zod Schema

`dailyRecordSchema` — all fields, with min/max constraints, date validation.

---

## 5. Phase 2 — Sprint 3: Inventory Ledger

### Database Schema

**`stock-adjustments.ts`**
```
stock_adjustments:
  id uuid PK
  egg_category text
  quantity int  -- signed: positive = add, negative = reduce (UI enforces; service converts to always-positive inventory_movements with correct movement_type)
  reason text NOT NULL
  notes text
  photo_url text
  adjustment_date date NOT NULL
  created_by uuid FK → users.id
  created_at timestamptz
```

**`regrade-requests.ts`**
```
regrade_requests:
  id uuid PK
  from_grade text CHECK IN ('grade_a','grade_b')
  to_grade text  -- auto: opposite of from_grade
  quantity int NOT NULL
  reason text NOT NULL
  notes text
  photo_url text
  status text CHECK IN ('pending','approved','rejected') default 'pending'
  requested_by uuid FK → users.id
  reviewed_by uuid FK → users.id
  requested_at timestamptz default now()
  reviewed_at timestamptz
```

### Service Layer

**`stock.service.ts`**:
- `getCurrentStock(category?)`: SUM(inventory_movements) — use snapshot + delta since last snapshot for performance
- `createAdjustment(input, userId)`: validate stock won't go negative → INSERT stock_adjustments + inventory_movements adjustment
- `submitRegradeRequest(input, userId)`: INSERT regrade_requests status pending
- `approveRegrade(id, adminId)`: DB transaction — INSERT 2x inventory_movements (OUT + IN) + UPDATE status
- `rejectRegrade(id, adminId)`: UPDATE status rejected only

### UI (`app/(app)/stok/`)

- **`/stok`**: stock summary card (Grade A / Grade B / total), movement history table paginated, "Sesuaikan Stok" button (Supervisor+Admin), "Regrade" button (Supervisor+Admin)
- **`/stok/sesuaikan`**: adjustment form
- **`/stok/regrade`**: regrade request form
- **`/stok/regrade/[id]`**: Admin approve/reject view with notification trigger

Pending regrade: blocked quantity shown in stock display ("X butir dalam proses regrade").

---

## 6. Phase 2 — Sprint 4: Dashboard KPI + Charts

### Mock Data Structure

File: `lib/mock/dashboard.mock.ts` — export typed mock data matching real query shapes. Used until Sprint 2–3 tables populated.

```ts
interface KpiData {
  hdp: number           // e.g. 86
  fcr7day: number       // e.g. 1.90
  prodToday: number     // butir
  stockReady: number    // butir (grade A + B)
  activePopulation: number
  feedPerBird: number   // gram
}

interface DailyPoint { label: string; val: number }
interface ProdPoint   { label: string; a: number; b: number }
interface TableRow {
  tgl: string; hdp: string; prodA: number; prodB: number
  fcr: string; pakan: string; deplesi: number; flag: boolean
}
```

### Dashboard Page (`app/(app)/dashboard/page.tsx`)

Full rebuild:

**Layout (desktop):**
- Top bar: title + subtitle + period selector (bg `#f0ede8`, radius 9px, active tab bg white shadow)
- KPI grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3`
- Charts: `grid-cols-1 md:grid-cols-2 gap-4` (2 rows × 2 cols)
- Data table: full-width below charts

**Layout (mobile):**
- Period selector: 4-button flex, gap 6px
- KPI: `grid-cols-2 gap-2.5`
- Charts: full-width stacked
- Bottom nav (already handled in shell)

### KPI Card Component (`components/ui/kpi-card.tsx`)

```ts
interface KpiCardProps {
  label: string
  value: string | number
  unit?: string
  sub?: string
  icon: React.ReactNode
  iconBg: string
  trend?: 'up' | 'down'
  trendVal?: string
}
```

- bg white, radius 16px desktop / 14px mobile, padding 18px 20px desktop / 14px 16px mobile, `shadow-lf-sm`
- Row 1: label 12px uppercase `#8fa08f` + icon container 32×32px radius 9px
- Row 2: value 26px bold `#2d3a2e` + unit 13px `#8fa08f`
- Row 3: trend chip (TrendingUp/Down 12px, up=`#4a90d9`, down=`#e07a6a`) + sub text 12px

### Chart Components (`components/ui/charts/`)

All `'use client'`, dynamic import with `ssr: false`.

- **`hdp-line-chart.tsx`**: Recharts `<LineChart>`, color `#7aadd4`, area gradient fill
- **`fcr-line-chart.tsx`**: Recharts `<LineChart>`, color `#7ab8b0`
- **`production-bar-chart.tsx`**: Recharts `<BarChart>` stacked, Grade A `#7aadd4` / Grade B `#d4a96a`
- **`depletion-area-chart.tsx`**: Recharts `<AreaChart>`, color `#7ab8b0`, gradient fill

All charts: responsive container, custom tooltip styled with LumichFlock tokens, no chart border/grid lines except subtle `#e0e8df`.

### Section Card Component (`components/ui/section-card.tsx`)

Wrapper for charts + table:
- bg white, radius 16px, padding 20px, `shadow-lf-sm`
- Header: title 14px weight 600 `#2d3a2e` + optional action link 12px `#7aadd4`

### Coop Filter

- Operator: no filter shown, data pre-filtered server-side by coop assignment
- Supervisor + Admin: dropdown to select coop or "Semua Kandang"
- Period filter: client-side state `'7'|'14'|'30'`, passed to data fetch

### Empty State

When no data in period: KPI cards show `--` or `0`, charts show empty axes with "Belum ada data" label.

---

## 7. CLAUDE.md Update

Add section after "## Architecture":

```markdown
## Design System

Source of truth: [`design/README.md`](design/README.md)

- **Colors:** LumichFlock CSS vars (`--lf-blue`, `--lf-teal`, etc.) defined in `globals.css`. Shadcn vars (`--primary`, `--foreground`, etc.) mapped to LumichFlock tokens.
- **Font:** DM Sans via `next/font/google` in `app/layout.tsx`
- **Shadows:** `.shadow-lf-sm`, `.shadow-lf-md`, `.shadow-lf-btn` in `@layer utilities`
- **Radius:** `--radius: 1rem` (16px cards), explicit 10px for inputs/buttons, 20px for login card
- **Components:** KPI card → `components/ui/kpi-card.tsx`, Section card → `components/ui/section-card.tsx`, Charts → `components/ui/charts/`
```

---

## 8. Key Constraints

| Rule | Detail |
|------|--------|
| inventory_movements | Source of truth — append only, never mutate |
| Daily record submit | DB transaction: daily_records + inventory_movements in one tx |
| Backdate enforcement | Service layer checks, not just UI |
| Negative values | Blocked in service layer, not just frontend |
| Mock data | `lib/mock/dashboard.mock.ts` — replace with real queries after Sprint 2–3 |
| Charts | Dynamic import `ssr: false` — Recharts not SSR-safe |
| Coop filtering | Operator: server-side pre-filtered; Supervisor+Admin: dropdown |

---

## 9. File Inventory

### New files
- `lib/db/schema/daily-records.ts`
- `lib/db/schema/inventory-movements.ts`
- `lib/db/schema/inventory-snapshots.ts`
- `lib/db/schema/stock-adjustments.ts`
- `lib/db/schema/regrade-requests.ts`
- `lib/db/queries/daily-record.queries.ts`
- `lib/db/queries/inventory.queries.ts`
- `lib/services/daily-record.service.ts`
- `lib/services/daily-record.service.test.ts`
- `lib/services/stock.service.ts`
- `lib/services/stock.service.test.ts`
- `lib/actions/daily-record.actions.ts`
- `lib/actions/stock.actions.ts`
- `lib/mock/dashboard.mock.ts`
- `components/ui/kpi-card.tsx`
- `components/ui/section-card.tsx`
- `components/ui/charts/hdp-line-chart.tsx`
- `components/ui/charts/fcr-line-chart.tsx`
- `components/ui/charts/production-bar-chart.tsx`
- `components/ui/charts/depletion-area-chart.tsx`
- `app/(app)/produksi/input/page.tsx`
- `app/(app)/stok/sesuaikan/page.tsx`
- `app/(app)/stok/regrade/page.tsx`
- `app/(app)/stok/regrade/[id]/page.tsx`

### Modified files
- `app/globals.css` — design tokens
- `app/layout.tsx` — DM Sans font
- `app/(auth)/login/page.tsx` — restyle
- `components/forms/login-form.tsx` — restyle + eye toggle
- `components/layout/sidebar.tsx` — 220px full sidebar
- `components/layout/bottom-nav.tsx` — 5-tab direct (remove drawer)
- `components/layout/app-shell.tsx` — grid layout, remove drawer state
- `app/(app)/dashboard/page.tsx` — full KPI dashboard
- `app/(app)/produksi/page.tsx` — records table
- `app/(app)/stok/page.tsx` — stock display + movement history
- `lib/db/schema/index.ts` — export new schemas
- `CLAUDE.md` — add Design System section

### Deleted files
- `components/layout/more-drawer.tsx`

### DB migration step
After adding all new schemas: run `npm run db:push` (Drizzle push to Supabase). Must be done before Sprint 2 service layer can be tested.
