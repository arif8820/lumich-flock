# Sidebar Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure sidebar navigation to group pages by functional domain with accordion expand/collapse behaviour.

**Architecture:** Replace the flat hardcoded `mainNav` array in `sidebar.tsx` with a typed nav config that supports accordion groups. Add client-side accordion state (`useState`) to track which group is open. Active sub-item detection auto-opens the correct group on page load. Single file change only — no route or permission changes needed.

**Tech Stack:** Next.js App Router, React `useState`, Lucide React icons, inline styles (existing pattern)

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `components/layout/sidebar.tsx` | Modify | Replace flat nav + ad-hoc sub-items with typed nav config + accordion component |

No other files change. Routes, roles, and page files are untouched.

---

### Task 1: Define nav config types and data structure

**Files:**
- Modify: `components/layout/sidebar.tsx`

- [ ] **Step 1: Add `'use client'` directive and import `useState`**

Current file has no client directive. Accordion needs `useState`.

Replace the top of the file (lines 1–13):

```tsx
'use client'
// client: needs useState for accordion open/close state

import { useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Egg, Package, DollarSign, Bird, Settings, LogOut, BarChart2, ChevronDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { SessionUser } from '@/lib/auth/get-session'
import type { Notification } from '@/lib/services/notification.service'
import { NotificationBell } from '@/components/ui/notification-bell'
```

- [ ] **Step 2: Add nav config types after imports**

```tsx
type NavSubItem = {
  href: string
  label: string
  /** roles that can see this sub-item. undefined = all roles */
  roles?: Array<'admin' | 'supervisor' | 'operator'>
}

type NavItem =
  | { kind: 'flat'; href: string; icon: LucideIcon; label: string; roles?: Array<'admin' | 'supervisor' | 'operator'> }
  | { kind: 'accordion'; id: string; icon: LucideIcon; label: string; roles?: Array<'admin' | 'supervisor' | 'operator'>; children: NavSubItem[] }
```

- [ ] **Step 3: Replace `mainNav` array with full nav config**

Remove old `mainNav` array and replace with:

```tsx
const NAV_SECTIONS: { section?: string; items: NavItem[] }[] = [
  {
    section: 'Menu Utama',
    items: [
      {
        kind: 'flat',
        href: '/dashboard',
        icon: LayoutDashboard,
        label: 'Dashboard',
      },
      {
        kind: 'accordion',
        id: 'produksi',
        icon: Egg,
        label: 'Produksi',
        children: [
          { href: '/produksi', label: 'Input Harian' },
          { href: '/admin/kandang', label: 'Kandang', roles: ['admin'] },
          { href: '/flock', label: 'Flock' },
        ],
      },
      {
        kind: 'flat',
        href: '/stok',
        icon: Package,
        label: 'Stok',
      },
      {
        kind: 'accordion',
        id: 'penjualan',
        icon: DollarSign,
        label: 'Penjualan',
        roles: ['admin', 'supervisor'],
        children: [
          { href: '/penjualan', label: 'Sales Order' },
          { href: '/penjualan/invoices', label: 'Invoice', roles: ['admin', 'supervisor'] },
          { href: '/admin/pelanggan', label: 'Pelanggan', roles: ['admin', 'supervisor'] },
        ],
      },
    ],
  },
  {
    section: 'Laporan',
    items: [
      {
        kind: 'accordion',
        id: 'laporan',
        icon: BarChart2,
        label: 'Laporan',
        roles: ['admin', 'supervisor'],
        children: [
          { href: '/laporan', label: 'Piutang' },
          { href: '/laporan/produksi', label: 'Produksi' },
        ],
      },
    ],
  },
  {
    section: 'Pengaturan',
    items: [
      {
        kind: 'flat',
        href: '/admin',
        icon: Settings,
        label: 'Admin',
        roles: ['admin'],
      },
    ],
  },
]
```

- [ ] **Step 4: Commit**

```bash
git add components/layout/sidebar.tsx
git commit -m "refactor(sidebar): add typed nav config with accordion structure"
```

---

### Task 2: Add accordion state and helper functions

**Files:**
- Modify: `components/layout/sidebar.tsx`

- [ ] **Step 1: Add role-visibility helper after `getRoleLabel`**

```tsx
function canSee(roles: Array<'admin' | 'supervisor' | 'operator'> | undefined, userRole: string): boolean {
  if (!roles) return true
  return roles.includes(userRole as 'admin' | 'supervisor' | 'operator')
}
```

- [ ] **Step 2: Add `getDefaultOpenId` helper — determines which accordion should be open on initial render**

```tsx
function getDefaultOpenId(
  sections: typeof NAV_SECTIONS,
  currentPath: string,
  userRole: string,
): string | null {
  for (const { items } of sections) {
    for (const item of items) {
      if (item.kind !== 'accordion') continue
      if (!canSee(item.roles, userRole)) continue
      const hasActiveChild = item.children.some(
        child => canSee(child.roles, userRole) && currentPath.startsWith(child.href),
      )
      if (hasActiveChild) return item.id
    }
  }
  return null
}
```

- [ ] **Step 3: Add `useState` inside `Sidebar` component, right after the opening brace**

Replace:
```tsx
export function Sidebar({
  user,
  currentPath,
  notifications,
  readNotificationIds,
}: {
  user: SessionUser
  currentPath: string
  notifications: Notification[]
  readNotificationIds: string[]
}) {
  return (
```

With:
```tsx
export function Sidebar({
  user,
  currentPath,
  notifications,
  readNotificationIds,
}: {
  user: SessionUser
  currentPath: string
  notifications: Notification[]
  readNotificationIds: string[]
}) {
  const [openId, setOpenId] = useState<string | null>(
    () => getDefaultOpenId(NAV_SECTIONS, currentPath, user.role),
  )

  function toggleAccordion(id: string) {
    setOpenId(prev => (prev === id ? null : id))
  }

  return (
```

- [ ] **Step 4: Commit**

```bash
git add components/layout/sidebar.tsx
git commit -m "refactor(sidebar): add accordion state and helpers"
```

---

### Task 3: Render new nav — replace old nav JSX

**Files:**
- Modify: `components/layout/sidebar.tsx`

- [ ] **Step 1: Replace entire `{/* Nav */}` block**

Find and replace from `{/* Nav */}` down to (but not including) `{/* User card */}`:

```tsx
      {/* Nav */}
      <div className="px-[10px] flex-1 overflow-y-auto">
        {NAV_SECTIONS.map(({ section, items }) => {
          const visibleItems = items.filter(item => canSee(item.roles, user.role))
          if (visibleItems.length === 0) return null
          return (
            <div key={section ?? 'nosection'}>
              {section && (
                <p
                  className="text-[10px] uppercase font-medium px-[10px] mt-4 mb-1.5 first:mt-0"
                  style={{ letterSpacing: '0.8px', color: '#b0bab0' }}
                >
                  {section}
                </p>
              )}
              {visibleItems.map(item => {
                if (item.kind === 'flat') {
                  const active = currentPath.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2.5 px-[10px] py-[9px] rounded-[9px] mb-0.5 transition-colors text-[13px]"
                      style={{
                        background: active ? '#e3f0f9' : 'transparent',
                        color: active ? '#3d7cb0' : '#5a6b5b',
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      <item.icon
                        size={16}
                        strokeWidth={1.8}
                        style={{ color: active ? '#7aadd4' : '#b0bab0', flexShrink: 0 }}
                      />
                      {item.label}
                    </Link>
                  )
                }

                // accordion
                const isOpen = openId === item.id
                const visibleChildren = item.children.filter(c => canSee(c.roles, user.role))
                const parentActive = visibleChildren.some(c => currentPath.startsWith(c.href))

                return (
                  <div key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggleAccordion(item.id)}
                      className="w-full flex items-center gap-2.5 px-[10px] py-[9px] rounded-[9px] mb-0.5 transition-colors text-[13px] text-left"
                      style={{
                        background: parentActive ? '#e3f0f9' : 'transparent',
                        color: parentActive ? '#3d7cb0' : '#5a6b5b',
                        fontWeight: parentActive ? 600 : 400,
                      }}
                    >
                      <item.icon
                        size={16}
                        strokeWidth={1.8}
                        style={{ color: parentActive ? '#7aadd4' : '#b0bab0', flexShrink: 0 }}
                      />
                      <span className="flex-1">{item.label}</span>
                      <ChevronDown
                        size={13}
                        strokeWidth={2}
                        style={{
                          color: '#b0bab0',
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 150ms ease',
                          flexShrink: 0,
                        }}
                      />
                    </button>
                    {isOpen && (
                      <div className="mb-1">
                        {visibleChildren.map(child => {
                          const childActive = currentPath.startsWith(child.href)
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="flex items-center gap-2.5 pl-[28px] pr-[10px] py-[7px] rounded-[9px] mb-0.5 transition-colors text-[12px]"
                              style={{
                                background: childActive ? '#e3f0f9' : 'transparent',
                                color: childActive ? '#3d7cb0' : '#7a8b7a',
                                fontWeight: childActive ? 600 : 400,
                              }}
                            >
                              <span
                                className="w-1 h-1 rounded-full flex-shrink-0"
                                style={{ background: childActive ? '#7aadd4' : '#b0bab0' }}
                              />
                              {child.label}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
```

- [ ] **Step 2: Verify file compiles**

```bash
cd d:/App/lumich-flock && npm run build 2>&1 | tail -20
```

Expected: no TypeScript errors. If errors appear, fix before continuing.

- [ ] **Step 3: Commit**

```bash
git add components/layout/sidebar.tsx
git commit -m "feat(sidebar): render accordion nav groups with role filtering"
```

---

### Task 4: Manual verification

**Files:** none (read-only testing)

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Open browser, login as admin. Verify:**

| Check | Expected |
|-------|----------|
| Dashboard active | No accordion open |
| Click "Produksi" parent | Expands sub-items (Input Harian, Kandang, Flock). No navigation. |
| Click "Penjualan" parent | Produksi closes, Penjualan opens |
| Navigate to `/produksi` | Produksi accordion auto-open, "Input Harian" highlighted |
| Navigate to `/produksi/input` | Same as above — `/produksi` prefix match |
| Navigate to `/flock` | Produksi accordion auto-open, "Flock" highlighted |
| Navigate to `/penjualan/invoices` | Penjualan accordion auto-open, "Invoice" highlighted |
| Navigate to `/admin/kandang` | Produksi accordion auto-open, "Kandang" highlighted |
| Navigate to `/admin/pelanggan` | Penjualan accordion auto-open, "Pelanggan" highlighted |
| Navigate to `/laporan` | Laporan accordion auto-open, "Piutang" highlighted |
| Navigate to `/laporan/produksi` | Laporan accordion auto-open, "Produksi" highlighted |
| Navigate to `/stok` | No accordion open, Stok flat link highlighted |
| Navigate to `/admin` | No accordion open, Admin flat link highlighted |

- [ ] **Step 3: Login as supervisor. Verify:**

| Check | Expected |
|-------|----------|
| Produksi accordion | Input Harian + Flock visible. **Kandang hidden.** |
| Penjualan accordion | Sales Order + Invoice + Pelanggan visible |
| Admin flat link | **Hidden** |

- [ ] **Step 4: Login as operator. Verify:**

| Check | Expected |
|-------|----------|
| Penjualan | **Hidden** |
| Laporan | **Hidden** |
| Admin | **Hidden** |
| Produksi accordion | Input Harian + Flock visible. Kandang hidden. |

- [ ] **Step 5: Final commit if any minor fixes applied**

```bash
git add components/layout/sidebar.tsx
git commit -m "fix(sidebar): address manual verification issues"
```

---

## Self-Review

**Spec coverage:**
- ✅ Accordion single-open (auto-close others) — `setOpenId(prev => prev === id ? null : id)`
- ✅ Parent click = expand only, no navigation — `<button>` not `<Link>`
- ✅ Active page auto-opens parent — `getDefaultOpenId` + `useState` lazy init
- ✅ Admin sub-items stay as grid cards — Admin is `kind: 'flat'` to `/admin`
- ✅ Kandang role admin only — `roles: ['admin']` on sub-item
- ✅ Pelanggan role admin+supervisor — `roles: ['admin', 'supervisor']`
- ✅ Stok flat, no sub — `kind: 'flat'`
- ✅ All existing roles unchanged

**Placeholder scan:** None found.

**Type consistency:** `NavItem`, `NavSubItem`, `canSee`, `getDefaultOpenId`, `toggleAccordion`, `openId` — all consistent across tasks.
