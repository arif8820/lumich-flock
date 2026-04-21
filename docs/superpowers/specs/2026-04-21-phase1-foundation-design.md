# Phase 1: Foundation — Design Spec
**Tanggal:** 2026-04-21  
**Status:** Approved  
**PRD Ref:** v1.7 → perubahan akan masuk v1.8

---

## 1. Stack & Approach

**Approach:** Monolith Next.js App Router (Option A) — satu repo, satu deploy ke Vercel.

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 App Router |
| Styling | Tailwind v4 + shadcn/ui, tema Light |
| ORM | Drizzle ORM + migration files |
| Backend | Supabase Cloud (sudah ada) |
| Deploy | Vercel + GitHub auto-deploy |
| UI Language | Bahasa Indonesia |

**Migrations:** `drizzle-kit generate` → commit files → `drizzle-kit migrate` di CI. Command: `npm run db:migrate`.

---

## 2. Folder Structure

```
app/
  (auth)/
    login/page.tsx
    layout.tsx
  (app)/
    layout.tsx                  # shell: bottom-tab mobile, sidebar desktop
    dashboard/page.tsx
    produksi/page.tsx
    stok/page.tsx
    penjualan/page.tsx
    flock/page.tsx
    admin/
      users/page.tsx
      kandang/page.tsx
      pelanggan/page.tsx
      flock-phases/page.tsx

lib/
  actions/                      # thin wrappers only — validate + delegate
  services/                     # semua business logic
  db/
    schema/                     # drizzle schema per-module
    queries/                    # drizzle queries
    migrations/                 # generated migration files
  auth/                         # supabase auth helpers

components/
  ui/                           # shadcn primitives
  forms/                        # domain forms
  layout/                       # shell, nav-bottom, sidebar
```

**Layer rule (STRICT — dicatat di CLAUDE.md):**
- `lib/actions/` = thin wrapper: validate (zod) → call service → return
- `lib/services/` = semua business logic
- `lib/db/queries/` = semua Drizzle queries

---

## 3. Authentication

### Model
- **Login:** Email + password via Supabase Auth — semua role
- **Create/manage user:** Admin only via UI — pakai Supabase Service Role key di server
- **Tidak ada** invite email flow, tidak ada self-registration

### Admin user operations
| Operasi | Supabase Admin API |
|---------|-------------------|
| Create user | `auth.admin.createUser({ email, password, email_confirm: true })` |
| Change password | `auth.admin.updateUserById(userId, { password })` |
| Deactivate | Set `users.is_active = false` (dihandle di middleware) |
| Change role | Update `users.role` |

Service Role key hanya dipakai di server (Server Actions) — tidak pernah expose ke client.

### Session
- 8 jam inactive → logout otomatis
- 24 jam max → force re-login
- Dikonfigurasi di Supabase Auth settings

### Password policy
- Min 8 karakter, 1 uppercase, 1 angka
- Enforce di: Supabase Auth settings + zod schema di form admin

### Middleware chain (`middleware.ts`)
1. Cek session valid (Supabase Auth)
2. Cek `users.is_active = true` — kalau false: redirect `/login`, pesan "Akun dinonaktifkan"
3. Cek role vs route (`/admin/*` → hanya admin)
4. Pass ke halaman

### Routes auth
```
/login              # semua user
/                   # redirect ke /dashboard kalau sudah login
```

---

## 4. Database Schema (Phase 1 — 6 tabel)

### `users`
```sql
id          uuid PRIMARY KEY  -- sama dengan auth.users.id
email       text UNIQUE NOT NULL
full_name   text NOT NULL
role        enum('operator','supervisor','admin') NOT NULL
is_active   boolean DEFAULT true
created_by  uuid REFERENCES users(id)
created_at  timestamptz DEFAULT now()
updated_at  timestamptz
```

### `coops`
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
name        text UNIQUE NOT NULL
capacity    integer
status      enum('active','inactive') DEFAULT 'active'
notes       text
created_at  timestamptz DEFAULT now()
updated_at  timestamptz
```

### `flocks`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
coop_id       uuid NOT NULL REFERENCES coops(id)
name          text NOT NULL
arrival_date  date NOT NULL
initial_count integer NOT NULL
breed         text
notes         text
retired_at    timestamptz   -- null = masih aktif
created_by    uuid REFERENCES users(id)
updated_by    uuid REFERENCES users(id)
created_at    timestamptz DEFAULT now()
updated_at    timestamptz
```

### `flock_phases`
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
name        text NOT NULL        -- 'Starter', 'Grower', dll
min_weeks   integer NOT NULL
max_weeks   integer              -- null = no upper limit
sort_order  integer NOT NULL
created_at  timestamptz DEFAULT now()
updated_at  timestamptz
```

Seed data default:
| name | min_weeks | max_weeks | sort_order |
|------|-----------|-----------|------------|
| Starter | 0 | 6 | 1 |
| Grower | 7 | 18 | 2 |
| Layer | 19 | 72 | 3 |
| Late-layer | 73 | null | 4 |

### `customers`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
name            text NOT NULL
type            enum('retail','wholesale','distributor')
phone           text
address         text
credit_limit    numeric(15,2) DEFAULT 0
payment_terms   integer DEFAULT 0   -- hari
status          enum('active','inactive') DEFAULT 'active'
notes           text
created_by      uuid REFERENCES users(id)
created_at      timestamptz DEFAULT now()
updated_at      timestamptz
```

### `user_coop_assignments`
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id     uuid NOT NULL REFERENCES users(id)
coop_id     uuid NOT NULL REFERENCES coops(id)
created_at  timestamptz DEFAULT now()
UNIQUE(user_id, coop_id)
```

### `updated_at` convention
Semua tabel yang punya `updated_at`: gunakan Drizzle `$onUpdateFn(() => new Date())` di schema definition. Tidak perlu trigger DB manual.

### RLS Policy
- Semua tabel: RLS enabled
- Policy awal: `authenticated` role bisa SELECT
- Mutations: via Service Role (Server Actions bypass RLS) — aman untuk Next.js + Supabase pattern

### Flock phase calculation
- Logic di `lib/services/flock.service.ts`
- Query `flock_phases` dari DB, bukan hardcode
- Result di-cache dengan `unstable_cache` — tidak hit DB setiap render

---

## 5. Nav Shell

**Theme:** Light — white background, slate text, sky-500 accent

### Mobile (< 768px): Bottom Tab Bar
```
📊 Dashboard  |  🥚 Produksi  |  📦 Stok  |  ☰ Lainnya
```
"Lainnya" → drawer berisi: Penjualan, Flock, Admin (jika admin)

### Desktop (≥ 768px): Sidebar Icon (48px lebar)
```
🐔  (logo)
📊  Dashboard
🥚  Produksi
📦  Stok
💰  Penjualan
🐣  Flock
─────
⚙️  Admin      ← hanya render jika role === 'admin'
```

**Role-based nav:** Check di layout server component — tidak perlu client hide.

---

## 6. Access Control per Fitur (Phase 1)

| Fitur | Operator | Supervisor | Admin |
|-------|----------|------------|-------|
| Login | ✅ | ✅ | ✅ |
| Lihat coops | ✅ | ✅ | ✅ |
| CRUD coops | ❌ | ❌ | ✅ |
| Create/edit flock | ❌ | ✅ | ✅ |
| Retire flock | ❌ | ❌ | ✅ |
| Lihat customers | ❌ | ✅ (view) | ✅ |
| CRUD customers | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Setting flock phases | ❌ | ❌ | ✅ |
| user_coop_assignments | ❌ | ❌ | ✅ |

---

## 7. Acceptance Criteria

- [ ] Semua 3 role bisa login
- [ ] User dengan `is_active = false` tidak bisa login, dapat pesan jelas
- [ ] Admin bisa create user, set password langsung (tidak pakai email invite)
- [ ] Admin bisa change password user lain
- [ ] Admin bisa deactivate/activate user
- [ ] Admin bisa change role user
- [ ] Flock phase dihitung dari `flock_phases` table, configurable via UI
- [ ] Multi-coop assignment untuk Operator bekerja
- [ ] Operator hanya bisa akses coop yang di-assign
- [ ] `/admin/*` routes redirect non-admin ke dashboard
- [ ] Migration files ter-commit, `db:migrate` berhasil di fresh Supabase project

---

## 8. Design Changes vs PRD v1.7 (→ masuk v1.8)

| # | Perubahan | Alasan |
|---|-----------|--------|
| 1 | Auth: hapus invite flow — admin create+manage semua user via Service Role API | Simplifikasi, sesuai kebutuhan user |
| 2 | `flock_phases` jadi tabel DB, bukan hardcode | User bisa konfigurasi mandiri |
| 3 | Nav: bottom tab mobile + sidebar icon desktop | Mobile-first untuk operator |
| 4 | UI language: Bahasa Indonesia | Sesuai user persona |
| 5 | Migrations: drizzle-kit generate + migrate (bukan push) | Production-grade audit trail |
| 6 | Layer architecture: thin actions → services → queries | Future-proof untuk mobile native |
| 7 | Tambah `flock_phases` table ke schema Phase 1 | Diperlukan untuk flock phase calc |
