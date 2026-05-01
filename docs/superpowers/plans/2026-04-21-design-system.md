# Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply LumichFlock design system (colors, typography, shadows, spacing) pixel-perfect to all existing screens — login, sidebar, bottom nav, dashboard stub, and all content pages.

**Architecture:** Layered — wire CSS tokens in globals.css first, then shell components (login, sidebar, bottom nav, app-shell), then content pages. Visual-only changes; no business logic touched.

**Tech Stack:** Next.js 15, Tailwind v4, shadcn/ui, Lucide React, DM Sans (next/font/google)

---

## File Map

| File | Action | Reason |
|------|--------|--------|
| `app/globals.css` | Modify | Replace shadcn oklch defaults with LumichFlock hex tokens; add shadow utilities |
| `app/layout.tsx` | Modify | Replace Geist with DM Sans |
| `app/(auth)/layout.tsx` | Modify | Add gradient background |
| `app/(auth)/login/page.tsx` | Modify | Add logo block above card |
| `components/forms/login-form.tsx` | Modify | Restyle inputs/button; add eye toggle |
| `components/layout/sidebar.tsx` | Modify | 56px icon-only → 220px full sidebar |
| `components/layout/bottom-nav.tsx` | Modify | 3+More tabs → 5 direct tabs; remove onMoreClick prop |
| `components/layout/app-shell.tsx` | Modify | Grid layout; remove drawer state |
| `components/layout/more-drawer.tsx` | Delete | Replaced by direct 5-tab bottom nav |
| `app/(app)/laporan/page.tsx` | Create | Stub page for Laporan bottom nav tab |
| `app/(app)/dashboard/page.tsx` | Modify | Page header + period selector + KPI skeleton grid |
| `app/(app)/flock/page.tsx` | Modify | Restyle table with LumichFlock tokens |
| `app/(app)/admin/users/page.tsx` | Modify | Restyle table |
| `app/(app)/admin/kandang/page.tsx` | Modify | Restyle table |
| `CLAUDE.md` | Modify | Add Design System section |

---

## Task 1: Design tokens in globals.css

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Replace entire globals.css**

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-heading: var(--font-sans);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

:root {
  /* LumichFlock design tokens */
  --lf-blue:         #7aadd4;
  --lf-blue-dark:    #5090be;
  --lf-blue-active:  #3d7cb0;
  --lf-blue-light:   #bbd5ee;
  --lf-blue-pale:    #e3f0f9;
  --lf-amber:        #d4a96a;
  --lf-amber-light:  #f5e3c6;
  --lf-amber-pale:   #fdf6ed;
  --lf-teal:         #7ab8b0;
  --lf-teal-pale:    #e4f4f2;
  --lf-rose:         #e8a5a0;
  --lf-rose-pale:    #fdeeed;
  --lf-text-dark:    #2d3a2e;
  --lf-text-mid:     #5a6b5b;
  --lf-text-soft:    #8fa08f;
  --lf-border:       #e0e8df;
  --lf-bg:           #f7f5f1;
  --lf-bg-warm:      #f0ede8;
  --lf-success-text: #4a90d9;
  --lf-success-bg:   #e3f0f9;
  --lf-danger-text:  #e07a6a;
  --lf-danger-bg:    #fdeeed;
  --lf-warning-bg:   #fffbf0;

  /* shadcn vars — mapped to LumichFlock tokens */
  --background: #f7f5f1;
  --foreground: #2d3a2e;
  --card: #ffffff;
  --card-foreground: #2d3a2e;
  --popover: #ffffff;
  --popover-foreground: #2d3a2e;
  --primary: #7aadd4;
  --primary-foreground: #ffffff;
  --secondary: #f0ede8;
  --secondary-foreground: #2d3a2e;
  --muted: #f0ede8;
  --muted-foreground: #5a6b5b;
  --accent: #e3f0f9;
  --accent-foreground: #3d7cb0;
  --destructive: #e07a6a;
  --border: #e0e8df;
  --input: #e0e8df;
  --ring: #7aadd4;
  --chart-1: #7aadd4;
  --chart-2: #7ab8b0;
  --chart-3: #d4a96a;
  --chart-4: #e8a5a0;
  --chart-5: #5090be;
  --radius: 1rem;
  --sidebar: #ffffff;
  --sidebar-foreground: #2d3a2e;
  --sidebar-primary: #7aadd4;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #e3f0f9;
  --sidebar-accent-foreground: #3d7cb0;
  --sidebar-border: #e0e8df;
  --sidebar-ring: #7aadd4;
}

@layer utilities {
  .shadow-lf-sm   { box-shadow: 0 1px 4px rgba(45,58,46,0.06), 0 2px 12px rgba(45,58,46,0.04); }
  .shadow-lf-md   { box-shadow: 0 2px 8px rgba(45,58,46,0.08), 0 8px 24px rgba(45,58,46,0.06); }
  .shadow-lf-btn  { box-shadow: 0 4px 12px rgba(122,173,212,0.35); }
  .shadow-lf-logo { box-shadow: 0 4px 16px rgba(122,173,212,0.35); }
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}
```

- [ ] **Step 2: Verify build compiles**

```bash
npm run build
```

Expected: no errors. Tailwind v4 will pick up the new CSS vars automatically.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add LumichFlock design tokens and shadow utilities to globals.css"
```

---

## Task 2: Replace font with DM Sans

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace layout.tsx**

```tsx
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import "./globals.css"

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "LumichFlock",
  description: "ERP sistem peternakan ayam petelur",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Verify build — DM Sans downloads at build time**

```bash
npm run build
```

Expected: no errors. Next.js downloads the font subset at build time.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: replace Geist with DM Sans font"
```

---

## Task 3: Auth layout — gradient background

**Files:**
- Modify: `app/(auth)/layout.tsx`

- [ ] **Step 1: Update auth layout to add gradient bg**

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(145deg, #e3f0f9 0%, #fdf6ed 50%, #e4f4f2 100%)' }}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(auth)/layout.tsx"
git commit -m "feat: gradient background for auth layout"
```

---

## Task 4: Login page — logo block + card restyle + eye toggle

**Files:**
- Modify: `app/(auth)/login/page.tsx`
- Modify: `components/forms/login-form.tsx`

- [ ] **Step 1: Update login/page.tsx — add logo block and card wrapper**

```tsx
import { LoginForm } from '@/components/forms/login-form'
import { Bird } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="w-full max-w-[400px] space-y-6">
      {/* Logo block */}
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-16 h-16 rounded-[18px] flex items-center justify-center shadow-lf-logo"
          style={{ background: 'linear-gradient(135deg, #7aadd4, #5090be)' }}
        >
          <Bird size={32} color="white" strokeWidth={1.8} />
        </div>
        <div className="text-center">
          <h1
            className="text-[22px] font-bold"
            style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}
          >
            LumichFlock
          </h1>
          <p className="text-[13px] mt-1" style={{ color: '#8fa08f' }}>
            ERP Peternakan Ayam Petelur
          </p>
        </div>
      </div>

      {/* Login card */}
      <div
        className="bg-white rounded-[20px] px-7 pt-7 pb-8"
        style={{ boxShadow: '0 4px 24px rgba(45,58,46,0.10), 0 1px 4px rgba(45,58,46,0.06)' }}
      >
        <div className="mb-6">
          <h2 className="text-[18px] font-semibold" style={{ color: '#2d3a2e' }}>
            Selamat datang 👋
          </h2>
          <p className="text-[13px] mt-1" style={{ color: '#8fa08f' }}>
            Masuk ke akun Anda untuk melanjutkan
          </p>
        </div>

        {params.error === 'akun-nonaktif' && (
          <div
            className="mb-4 text-[12px] rounded-lg px-3 py-2"
            style={{ background: '#fdeeed', color: '#e07a6a' }}
          >
            Akun Anda telah dinonaktifkan. Hubungi administrator.
          </div>
        )}

        <LoginForm />
      </div>

      {/* Footer */}
      <p className="text-center text-[12px]" style={{ color: '#8fa08f' }}>
        © 2026 LumichFlock · v2.1.0
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Replace login-form.tsx — restyle inputs, button, add eye toggle**

```tsx
// client: needs form state, submit handler, and eye toggle
'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Eye, EyeOff } from 'lucide-react'

const inputStyle: React.CSSProperties = {
  border: '1.5px solid #e0e8df',
  borderRadius: '10px',
  background: '#fafaf9',
  fontSize: '14px',
  padding: '12px 14px',
  width: '100%',
  outline: 'none',
  color: '#2d3a2e',
  transition: 'border-color 0.2s',
}

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = useMemo(
    () => createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ),
    []
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('Email atau password salah')
        return
      }
      router.push('/dashboard')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div className="space-y-1.5">
        <label className="block text-[13px] font-medium" style={{ color: '#5a6b5b' }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="nama@contoh.com"
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#7aadd4' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#e0e8df' }}
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="block text-[13px] font-medium" style={{ color: '#5a6b5b' }}>
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{ ...inputStyle, paddingRight: '42px' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#7aadd4' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e0e8df' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: '#8fa08f' }}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
          </button>
        </div>
      </div>

      {/* Forgot password */}
      <div className="text-right">
        <span className="text-[12px] font-medium" style={{ color: '#7aadd4', cursor: 'pointer' }}>
          Lupa password?
        </span>
      </div>

      {/* Error */}
      {error && (
        <div
          className="text-[12px] rounded-lg px-3 py-2"
          style={{ background: '#fdeeed', color: '#e07a6a' }}
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-[13px] rounded-[10px] text-[14px] font-semibold text-white transition-all"
        style={loading
          ? { background: '#bbd5ee', cursor: 'default' }
          : { background: 'linear-gradient(135deg, #7aadd4, #5090be)', boxShadow: '0 4px 12px rgba(122,173,212,0.35)' }
        }
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white inline-block"
              style={{ animation: 'spin 0.8s linear infinite' }}
            />
            Masuk...
          </span>
        ) : 'Masuk'}
      </button>
    </form>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: no type errors.

- [ ] **Step 4: Visual check — start dev server and open /login**

```bash
npm run dev
```

Navigate to `http://localhost:3000/login`. Verify:
- Gradient background
- Logo block: blue gradient 64×64 container, Bird icon, "LumichFlock" title
- White card with rounded corners and shadow
- Input focus → border changes to `#7aadd4`
- Eye toggle shows/hides password
- Submit button has gradient + shadow; disabled state shows `#bbd5ee`
- Footer "© 2026 LumichFlock · v2.1.0" visible

- [ ] **Step 5: Commit**

```bash
git add "app/(auth)/login/page.tsx" components/forms/login-form.tsx
git commit -m "feat: restyle login page with logo block, gradient card, eye toggle"
```

---

## Task 5: Sidebar — 56px → 220px full sidebar

**Files:**
- Modify: `components/layout/sidebar.tsx`

> **Before coding:** Check the existing logout mechanism. Run: `grep -r "logout\|signOut\|sign-out" app/ components/ --include="*.tsx" -l` and adapt the logout button to match the real logout route/action.

- [ ] **Step 1: Replace sidebar.tsx**

```tsx
import Link from 'next/link'
import { LayoutDashboard, Egg, Package, DollarSign, Bird, Settings, LogOut } from 'lucide-react'
import type { SessionUser } from '@/lib/auth/get-session'

const mainNav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/produksi', icon: Egg, label: 'Produksi' },
  { href: '/stok', icon: Package, label: 'Stok' },
  { href: '/penjualan', icon: DollarSign, label: 'Penjualan' },
  { href: '/flock', icon: Bird, label: 'Flock' },
]

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getRoleLabel(role: string) {
  const map: Record<string, string> = { admin: 'Administrator', supervisor: 'Supervisor', operator: 'Operator' }
  return map[role] ?? role
}

export function Sidebar({ user, currentPath }: { user: SessionUser; currentPath: string }) {
  return (
    <aside className="hidden md:flex w-[220px] flex-shrink-0 flex-col bg-white h-screen sticky top-0" style={{ borderRight: '1px solid #e0e8df' }}>
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4">
        <div
          className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7aadd4, #5090be)' }}
        >
          <Bird size={20} color="white" strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-[13px] font-bold leading-tight" style={{ color: '#2d3a2e' }}>LumichFlock</p>
          <p className="text-[11px]" style={{ color: '#8fa08f' }}>ERP Peternakan</p>
        </div>
      </div>

      {/* Farm info box */}
      <div className="mx-[10px] mb-3 px-[14px] py-3 rounded-[10px]" style={{ background: '#e3f0f9' }}>
        <p className="text-[10px] uppercase font-medium mb-1" style={{ letterSpacing: '0.8px', color: '#8fa08f' }}>
          Kandang Aktif
        </p>
        <p className="text-[12px] font-semibold" style={{ color: '#2d3a2e' }}>LumichFarm</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
          <span className="text-[11px]" style={{ color: '#5a6b5b' }}>Aktif</span>
        </div>
      </div>

      {/* Nav */}
      <div className="px-[10px] flex-1 overflow-y-auto">
        <p className="text-[10px] uppercase font-medium px-[10px] mb-1.5" style={{ letterSpacing: '0.8px', color: '#b0bab0' }}>
          Menu Utama
        </p>
        {mainNav.map(({ href, icon: Icon, label }) => {
          const active = currentPath.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-[10px] py-[9px] rounded-[9px] mb-0.5 transition-colors text-[13px]"
              style={{ background: active ? '#e3f0f9' : 'transparent', color: active ? '#3d7cb0' : '#5a6b5b', fontWeight: active ? 600 : 400 }}
            >
              <Icon size={16} strokeWidth={1.8} style={{ color: active ? '#7aadd4' : '#b0bab0', flexShrink: 0 }} />
              {label}
            </Link>
          )
        })}

        {user.role === 'admin' && (
          <>
            <p className="text-[10px] uppercase font-medium px-[10px] mt-4 mb-1.5" style={{ letterSpacing: '0.8px', color: '#b0bab0' }}>
              Pengaturan
            </p>
            {(() => {
              const active = currentPath.startsWith('/admin')
              return (
                <Link
                  href="/admin"
                  className="flex items-center gap-2.5 px-[10px] py-[9px] rounded-[9px] mb-0.5 transition-colors text-[13px]"
                  style={{ background: active ? '#e3f0f9' : 'transparent', color: active ? '#3d7cb0' : '#5a6b5b', fontWeight: active ? 600 : 400 }}
                >
                  <Settings size={16} strokeWidth={1.8} style={{ color: active ? '#7aadd4' : '#b0bab0', flexShrink: 0 }} />
                  Admin
                </Link>
              )
            })()}
          </>
        )}
      </div>

      {/* User card */}
      <div className="mx-[10px] mb-4 px-[10px] py-2 rounded-[9px] flex items-center gap-2.5" style={{ background: '#f7f5f1' }}>
        <div
          className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-[11px] font-bold flex-shrink-0"
          style={{ background: '#bbd5ee', color: '#3d7cb0' }}
        >
          {getInitials(user.fullName)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold truncate" style={{ color: '#2d3a2e' }}>{user.fullName}</p>
          <p className="text-[10px]" style={{ color: '#8fa08f' }}>{getRoleLabel(user.role)}</p>
        </div>
        {/* Adapt href/action to match existing logout mechanism found in more-drawer.tsx */}
        <a href="/auth/logout" style={{ color: '#8fa08f' }}>
          <LogOut size={14} strokeWidth={1.8} />
        </a>
      </div>
    </aside>
  )
}
```

> **Important:** The logout `<a href="/auth/logout">` must match the real logout route. Open `components/layout/more-drawer.tsx` before deleting it and copy the logout mechanism to the user card.

- [ ] **Step 2: Commit**

```bash
git add components/layout/sidebar.tsx
git commit -m "feat: expand sidebar from 56px icon-only to 220px full sidebar"
```

---

## Task 6: Bottom nav — 5 direct tabs + delete more-drawer

**Files:**
- Modify: `components/layout/bottom-nav.tsx`
- Delete: `components/layout/more-drawer.tsx`

- [ ] **Step 1: Read more-drawer.tsx for logout mechanism, then copy it to sidebar user card if not already done**

```bash
cat components/layout/more-drawer.tsx
```

- [ ] **Step 2: Replace bottom-nav.tsx — 5 tabs, no More button, no props**

```tsx
// client: needs usePathname for active state
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Bird, Egg, Package, FileText } from 'lucide-react'

const tabs = [
  { href: '/dashboard', icon: Home, label: 'Beranda' },
  { href: '/flock', icon: Bird, label: 'Kandang' },
  { href: '/produksi', icon: Egg, label: 'Produksi' },
  { href: '/stok', icon: Package, label: 'Stok' },
  { href: '/laporan', icon: FileText, label: 'Laporan' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white flex"
      style={{ borderTop: '1px solid #e0e8df', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors"
            style={{ color: active ? '#7aadd4' : '#c0c8bf' }}
          >
            <Icon size={20} strokeWidth={1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 3: Delete more-drawer.tsx**

```bash
git rm components/layout/more-drawer.tsx
```

- [ ] **Step 4: Commit**

```bash
git add components/layout/bottom-nav.tsx
git commit -m "feat: replace bottom nav More drawer with 5 direct tabs"
```

---

## Task 7: App shell — grid layout, remove drawer state

**Files:**
- Modify: `components/layout/app-shell.tsx`

- [ ] **Step 1: Replace app-shell.tsx**

```tsx
// client: needs usePathname for sidebar active state
'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { BottomNav } from './bottom-nav'
import type { SessionUser } from '@/lib/auth/get-session'

export function AppShell({
  user,
  children,
}: {
  user: SessionUser
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div
      className="min-h-screen flex md:grid md:grid-cols-[220px_1fr]"
      style={{ background: '#f7f5f1' }}
    >
      <Sidebar user={user} currentPath={pathname} />
      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 2: Verify build — catches any lingering more-drawer imports**

```bash
npm run build
```

Expected: no errors. If error mentions `MoreDrawer` or `onMoreClick`, search and fix the import.

- [ ] **Step 3: Commit**

```bash
git add components/layout/app-shell.tsx
git commit -m "feat: update app shell to 220px grid layout, remove drawer"
```

---

## Task 8: Create /laporan stub page

**Files:**
- Create: `app/(app)/laporan/page.tsx`

- [ ] **Step 1: Create stub page**

```tsx
export default function LaporanPage() {
  return (
    <div className="p-6">
      <h1
        className="text-[18px] font-bold"
        style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}
      >
        Laporan
      </h1>
      <p className="text-[13px] mt-1" style={{ color: '#8fa08f' }}>
        Modul ini akan tersedia di Phase 3.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(app)/laporan/page.tsx"
git commit -m "feat: add Laporan stub page for bottom nav tab"
```

---

## Task 9: Restyle existing content pages

**Files:**
- Modify: `app/(app)/dashboard/page.tsx`
- Modify: `app/(app)/flock/page.tsx`
- Modify: `app/(app)/admin/users/page.tsx`
- Modify: `app/(app)/admin/kandang/page.tsx`

- [ ] **Step 1: Update dashboard/page.tsx — page header, period selector, KPI skeleton**

```tsx
import { getSession } from '@/lib/auth/get-session'

export default async function DashboardPage() {
  const user = await getSession()

  return (
    <div className="p-6 space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
            Dashboard Produksi
          </h1>
          <p className="text-[12px] mt-0.5" style={{ color: '#8fa08f' }}>
            Selamat datang, {user?.fullName}
          </p>
        </div>
        {/* Period selector — client state wired in Phase 2 Sprint 4 */}
        <div className="flex items-center gap-1 p-1 rounded-[9px]" style={{ background: '#f0ede8' }}>
          {(['H-1', '7 hari', '14 hari', '30 hari'] as const).map((label, i) => (
            <span
              key={label}
              className="px-3 py-1.5 rounded-[7px] text-[11px] font-semibold select-none"
              style={i === 1
                ? { background: '#ffffff', color: '#2d3a2e', boxShadow: '0 1px 4px rgba(45,58,46,0.08)' }
                : { color: '#8fa08f', cursor: 'pointer' }
              }
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* KPI skeleton — replaced with real KpiCard components in Phase 2 Sprint 4 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-lf-sm animate-pulse" style={{ minHeight: '110px' }}>
            <div className="h-2.5 rounded mb-3" style={{ background: '#e0e8df', width: '55%' }} />
            <div className="h-7 rounded mb-2" style={{ background: '#e0e8df', width: '75%' }} />
            <div className="h-2 rounded" style={{ background: '#f0ede8', width: '45%' }} />
          </div>
        ))}
      </div>

      {/* Chart skeleton — replaced with real chart components in Phase 2 Sprint 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-lf-sm" style={{ minHeight: '200px' }}>
            <div className="h-4 rounded animate-pulse mb-4" style={{ background: '#e0e8df', width: '40%' }} />
            <div className="h-36 rounded animate-pulse" style={{ background: '#f0ede8' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update flock/page.tsx — restyle table with LumichFlock tokens**

```tsx
import { getSession } from '@/lib/auth/get-session'
import { getAllActiveFlocks } from '@/lib/services/flock.service'

export default async function FlockPage() {
  await getSession()
  const flocks = await getAllActiveFlocks()

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
        Manajemen Flock
      </h1>
      <div className="bg-white rounded-2xl shadow-lf-sm overflow-hidden">
        <table className="w-full" style={{ fontSize: '13px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e0e8df' }}>
              {['Nama', 'Kandang', 'Tgl Masuk', 'Umur', 'Fase', 'Populasi Awal'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: '#8fa08f', fontSize: '12px' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {flocks.map((flock) => (
              <tr key={flock.id} className="transition-colors hover:bg-[#fafaf8]" style={{ borderBottom: '1px solid #f0ede8' }}>
                <td className="px-4 py-3 font-medium" style={{ color: '#2d3a2e' }}>{flock.name}</td>
                <td className="px-4 py-3" style={{ color: '#5a6b5b' }}>{flock.coopName}</td>
                <td className="px-4 py-3" style={{ color: '#5a6b5b' }}>
                  {new Date(flock.arrivalDate).toLocaleDateString('id-ID')}
                </td>
                <td className="px-4 py-3" style={{ color: '#5a6b5b' }}>{flock.ageWeeks} minggu</td>
                <td className="px-4 py-3">
                  {flock.phase ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ background: '#e3f0f9', color: '#3d7cb0' }}>
                      {flock.phase.name}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3" style={{ color: '#5a6b5b' }}>
                  {flock.initialCount.toLocaleString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Update admin/users/page.tsx — restyle table**

```tsx
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAllUsers } from '@/lib/services/user.service'

export default async function UsersPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/dashboard')
  const users = await getAllUsers()

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
        Manajemen User
      </h1>
      <div className="bg-white rounded-2xl shadow-lf-sm overflow-hidden">
        <table className="w-full" style={{ fontSize: '13px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e0e8df' }}>
              {['Nama', 'Email', 'Role', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: '#8fa08f', fontSize: '12px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-[#fafaf8]" style={{ borderBottom: '1px solid #f0ede8' }}>
                <td className="px-4 py-3 font-medium" style={{ color: '#2d3a2e' }}>{user.fullName}</td>
                <td className="px-4 py-3" style={{ color: '#5a6b5b' }}>{user.email}</td>
                <td className="px-4 py-3 capitalize" style={{ color: '#5a6b5b' }}>{user.role}</td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold"
                    style={user.isActive ? { background: '#e3f0f9', color: '#3d7cb0' } : { background: '#fdeeed', color: '#e07a6a' }}
                  >
                    {user.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Update admin/kandang/page.tsx — restyle table**

```tsx
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAllCoops } from '@/lib/services/coop.service'

export default async function KandangPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/dashboard')
  const coops = await getAllCoops()

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
        Manajemen Kandang
      </h1>
      <div className="bg-white rounded-2xl shadow-lf-sm overflow-hidden">
        <table className="w-full" style={{ fontSize: '13px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e0e8df' }}>
              {['Nama', 'Kapasitas', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: '#8fa08f', fontSize: '12px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coops.map((coop) => (
              <tr key={coop.id} className="transition-colors hover:bg-[#fafaf8]" style={{ borderBottom: '1px solid #f0ede8' }}>
                <td className="px-4 py-3 font-medium" style={{ color: '#2d3a2e' }}>{coop.name}</td>
                <td className="px-4 py-3" style={{ color: '#5a6b5b' }}>
                  {coop.capacity ? coop.capacity.toLocaleString('id-ID') : '—'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold"
                    style={coop.status === 'active' ? { background: '#e3f0f9', color: '#3d7cb0' } : { background: '#f0ede8', color: '#5a6b5b' }}
                  >
                    {coop.status === 'active' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Verify full build**

```bash
npm run build
```

Expected: 0 errors.

- [ ] **Step 6: Commit all page restyles**

```bash
git add "app/(app)/dashboard/page.tsx" "app/(app)/flock/page.tsx" "app/(app)/admin/users/page.tsx" "app/(app)/admin/kandang/page.tsx"
git commit -m "feat: restyle content pages with LumichFlock design tokens"
```

---

## Task 10: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Insert Design System section after the `## Architecture` section**

Add the following block immediately after the closing ` ``` ` of the Architecture code block:

```markdown
## Design System

Source of truth: [`design/README.md`](design/README.md)

- **Colors:** LumichFlock CSS vars (`--lf-blue`, `--lf-teal`, etc.) in `app/globals.css`. Shadcn vars (`--primary`, `--foreground`, etc.) are mapped to LumichFlock hex values.
- **Font:** DM Sans via `next/font/google` (`DM_Sans`, variable `--font-sans`) in `app/layout.tsx`
- **Shadows:** `.shadow-lf-sm`, `.shadow-lf-md`, `.shadow-lf-btn`, `.shadow-lf-logo` — defined in `@layer utilities` in `globals.css`
- **Radius:** `--radius: 1rem` (16px for cards via shadcn scale), explicit `border-radius: 10px` for inputs/buttons, 20px for login card
- **Shared components:** KPI card → `components/ui/kpi-card.tsx`, Section card → `components/ui/section-card.tsx`, Charts → `components/ui/charts/`
- **Do not use** slate/sky/green/red Tailwind color utilities — use `style={{ color: '#...' }}` with LumichFlock hex values or CSS vars
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add Design System section to CLAUDE.md"
```

---

## Task 11: Final verification

- [ ] **Step 1: Full build and lint**

```bash
npm run build && npm run lint
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 2: Visual smoke test — dev server**

```bash
npm run dev
```

Check all routes on desktop (1280px) and simulated mobile (390px):
- `/login` — gradient bg, Bird logo, white card, eye toggle, gradient submit button
- `/dashboard` — 220px sidebar visible on desktop, "Menu Utama" section label, user card at bottom; KPI skeleton grid 6 cards; 5-tab bottom nav on mobile
- `/flock` — table with `#e3f0f9` phase badge, `#fafaf8` row hover
- `/admin/users` — restyled table, blue/red status badges
- `/admin/kandang` — restyled table
- `/laporan` — stub page renders

- [ ] **Step 3: Confirm font change**

In browser DevTools, inspect `<html>` element: class should contain the DM Sans font variable. Inspect body text: `font-family` should resolve to `DM Sans`.
