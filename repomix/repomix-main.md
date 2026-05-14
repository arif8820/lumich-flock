This file is a merged representation of the entire codebase, combined into a single document by Repomix.
The content has been processed where content has been compressed (code blocks are separated by ⋮---- delimiter).

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Content has been compressed - code blocks are separated by ⋮---- delimiter
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
.env.example
.gitignore
app/(app)/admin/flock-phases/page.tsx
app/(app)/admin/import/import-panel.tsx
app/(app)/admin/import/page.tsx
app/(app)/admin/kandang/page.tsx
app/(app)/admin/kas/account-form.tsx
app/(app)/admin/kas/account-list.tsx
app/(app)/admin/kas/category-form.tsx
app/(app)/admin/kas/category-list.tsx
app/(app)/admin/kas/page.tsx
app/(app)/admin/layout.tsx
app/(app)/admin/page.tsx
app/(app)/admin/pelanggan/page.tsx
app/(app)/admin/roles/page.tsx
app/(app)/admin/roles/RoleManagementClient.tsx
app/(app)/admin/settings/alerts/page.tsx
app/(app)/admin/settings/wa-template/page.tsx
app/(app)/admin/stok-katalog/page.tsx
app/(app)/admin/users/[id]/kandang/page.tsx
app/(app)/admin/users/page.tsx
app/(app)/dashboard/flock-only-filter.tsx
app/(app)/dashboard/page.tsx
app/(app)/flock/[id]/page.tsx
app/(app)/flock/layout.tsx
app/(app)/flock/new/page.tsx
app/(app)/flock/page.tsx
app/(app)/forbidden/page.tsx
app/(app)/kas/[accountId]/page.tsx
app/(app)/kas/layout.tsx
app/(app)/kas/page.tsx
app/(app)/kas/transaksi/baru/page.tsx
app/(app)/kas/transfer/baru/page.tsx
app/(app)/laporan/flock/page.tsx
app/(app)/laporan/keuangan/kas/page.tsx
app/(app)/laporan/keuangan/layout.tsx
app/(app)/laporan/keuangan/piutang/page.tsx
app/(app)/laporan/layout.tsx
app/(app)/laporan/page.tsx
app/(app)/laporan/penjualan/customer/page.tsx
app/(app)/laporan/penjualan/page.tsx
app/(app)/laporan/produksi/page.tsx
app/(app)/laporan/stok/mutasi/page.tsx
app/(app)/laporan/stok/page.tsx
app/(app)/layout.tsx
app/(app)/penjualan/[id]/page.tsx
app/(app)/penjualan/[id]/return/new/page.tsx
app/(app)/penjualan/invoices/[id]/page.tsx
app/(app)/penjualan/invoices/page.tsx
app/(app)/penjualan/layout.tsx
app/(app)/penjualan/new/page.tsx
app/(app)/penjualan/page.tsx
app/(app)/penjualan/return/[id]/page.tsx
app/(app)/produksi/[id]/edit/edit-form.tsx
app/(app)/produksi/[id]/edit/page.tsx
app/(app)/produksi/flock-filter.tsx
app/(app)/produksi/input/page.tsx
app/(app)/produksi/layout.tsx
app/(app)/produksi/page.tsx
app/(app)/profil/page.tsx
app/(app)/stok/beli/page.tsx
app/(app)/stok/layout.tsx
app/(app)/stok/page.tsx
app/(app)/stok/regrade/[id]/page.tsx
app/(app)/stok/regrade/page.tsx
app/(app)/stok/sesuaikan/page.tsx
app/(auth)/layout.tsx
app/(auth)/login/page.tsx
app/(auth)/logout/route.ts
app/api/alerts/run/route.ts
app/api/invoices/[id]/pdf/route.tsx
app/api/laporan/aging-csv/route.ts
app/api/laporan/flock-csv/route.ts
app/api/laporan/kas-csv/route.ts
app/api/laporan/penjualan-csv/route.ts
app/api/laporan/penjualan-customer-csv/route.ts
app/api/laporan/produksi-csv/route.ts
app/api/laporan/stok-csv/route.ts
app/api/laporan/stok-mutasi-csv/route.ts
app/changelog/ChangelogSeenMarker.tsx
app/changelog/page.tsx
app/favicon.ico
app/globals.css
app/layout.tsx
app/page.tsx
components.json
components/forms/add-delivery-form.tsx
components/forms/coop-assignment-panel.tsx
components/forms/coop-management-client.tsx
components/forms/create-coop-form.tsx
components/forms/create-customer-form.tsx
components/forms/create-flock-form.tsx
components/forms/create-return-client.tsx
components/forms/create-so-client.tsx
components/forms/create-user-form.tsx
components/forms/customer-management-client.tsx
components/forms/daily-input-form.tsx
components/forms/edit-coop-form.tsx
components/forms/edit-customer-form.tsx
components/forms/flock-detail-client.tsx
components/forms/flock-list-client.tsx
components/forms/kas/transaction-form.tsx
components/forms/kas/transfer-form.tsx
components/forms/laporan-filter.tsx
components/forms/login-form.tsx
components/forms/production-report-filter.tsx
components/forms/stock-item-cascade-form.tsx
components/forms/user-management-client.tsx
components/layout/app-shell.tsx
components/layout/bottom-nav.tsx
components/layout/more-drawer.tsx
components/layout/sidebar.tsx
components/layout/version-badge.tsx
components/pdf/invoice-pdf-document.tsx
components/profil/info-akun-form.tsx
components/profil/password-form.tsx
components/profil/profil-tabs.tsx
components/providers/progress-bar.tsx
components/ui/badge.tsx
components/ui/button.tsx
components/ui/charts/dashboard-charts.tsx
components/ui/charts/deaths-bar-chart.tsx
components/ui/charts/depletion-area-chart.tsx
components/ui/charts/fcr-line-chart.tsx
components/ui/charts/hdp-line-chart.tsx
components/ui/charts/production-bar-chart.tsx
components/ui/dialog.tsx
components/ui/drawer.tsx
components/ui/form.tsx
components/ui/input.tsx
components/ui/invoice-status-badge.tsx
components/ui/kpi-card.tsx
components/ui/label.tsx
components/ui/notification-bell.tsx
components/ui/return-item-row.tsx
components/ui/sheet.tsx
components/ui/so-item-row.tsx
components/ui/so-status-badge.tsx
components/ui/so-summary-footer.tsx
components/ui/sonner.tsx
components/ui/stepper-input.tsx
components/ui/table.tsx
components/ui/tabs.tsx
drizzle.config.ts
eslint.config.mjs
lib/actions/app-settings.actions.ts
lib/actions/cash.actions.ts
lib/actions/changelog.actions.ts
lib/actions/coop.actions.ts
lib/actions/customer.actions.ts
lib/actions/daily-record.actions.ts
lib/actions/flock-delivery.actions.ts
lib/actions/flock-phase.actions.ts
lib/actions/flock.actions.ts
lib/actions/import.actions.ts
lib/actions/invoice.actions.ts
lib/actions/lock-period.actions.ts
lib/actions/notification.actions.ts
lib/actions/profil.actions.ts
lib/actions/role.actions.ts
lib/actions/sales-order.actions.ts
lib/actions/sales-return.actions.ts
lib/actions/stock-catalog.actions.ts
lib/actions/stock.actions.ts
lib/actions/user-coop-assignment.actions.ts
lib/actions/user.actions.ts
lib/admin/provision-farm.ts
lib/auth/admin.ts
lib/auth/get-session.ts
lib/auth/guards.ts
lib/auth/permissions.ts
lib/auth/server.ts
lib/changelog/data.ts
lib/changelog/index.ts
lib/changelog/types.ts
lib/db/farm-template.sql
lib/db/index.ts
lib/db/queries/alert-cooldown.queries.ts
lib/db/queries/app-settings.queries.ts
lib/db/queries/cash-account.queries.ts
lib/db/queries/cash-category.queries.ts
lib/db/queries/cash-transaction.queries.ts
lib/db/queries/coop.queries.ts
lib/db/queries/correction-record.queries.ts
lib/db/queries/customer-credit.queries.ts
lib/db/queries/customer.queries.ts
lib/db/queries/daily-record.queries.ts
lib/db/queries/dashboard.queries.ts
lib/db/queries/flock-delivery.queries.ts
lib/db/queries/flock-phase.queries.ts
lib/db/queries/flock.queries.ts
lib/db/queries/inventory.queries.ts
lib/db/queries/invoice.queries.ts
lib/db/queries/kas.queries.ts
lib/db/queries/notification.queries.ts
lib/db/queries/payment.queries.ts
lib/db/queries/profil.queries.ts
lib/db/queries/roles.queries.ts
lib/db/queries/sales-order.queries.ts
lib/db/queries/sales-return.queries.ts
lib/db/queries/stock-catalog.queries.ts
lib/db/queries/user-coop-assignment.queries.ts
lib/db/queries/user.queries.ts
lib/db/schema-factory.ts
lib/db/schema/alert-cooldowns.ts
lib/db/schema/app-settings.ts
lib/db/schema/cash-account.ts
lib/db/schema/cash-category.ts
lib/db/schema/cash-transaction.ts
lib/db/schema/coops.ts
lib/db/schema/correction-records.ts
lib/db/schema/customer-credits.ts
lib/db/schema/customers.ts
lib/db/schema/daily-egg-records.ts
lib/db/schema/daily-feed-records.ts
lib/db/schema/daily-records.ts
lib/db/schema/daily-vaccine-records.ts
lib/db/schema/farm-users.ts
lib/db/schema/farms.ts
lib/db/schema/flock-deliveries.ts
lib/db/schema/flock-phases.ts
lib/db/schema/flocks.ts
lib/db/schema/index.ts
lib/db/schema/inventory-movements.ts
lib/db/schema/invoices.ts
lib/db/schema/notification-reads.ts
lib/db/schema/notifications.ts
lib/db/schema/payments.ts
lib/db/schema/regrade-requests.ts
lib/db/schema/role-permissions.ts
lib/db/schema/roles.ts
lib/db/schema/sales-order-items.ts
lib/db/schema/sales-orders.ts
lib/db/schema/sales-return-items.ts
lib/db/schema/sales-returns.ts
lib/db/schema/stock-adjustments.ts
lib/db/schema/stock-categories.ts
lib/db/schema/stock-items.ts
lib/db/schema/user-coop-assignments.ts
lib/db/schema/users.ts
lib/db/seed-sales.ts
lib/db/seed.ts
lib/mock/dashboard.mock.ts
lib/services/alert.service.ts
lib/services/app-settings.service.ts
lib/services/cash.service.test.ts
lib/services/cash.service.ts
lib/services/coop.service.test.ts
lib/services/coop.service.ts
lib/services/customer.service.test.ts
lib/services/customer.service.ts
lib/services/daily-record.service.test.ts
lib/services/daily-record.service.ts
lib/services/dashboard.service.ts
lib/services/email.service.ts
lib/services/flock-delivery.service.test.ts
lib/services/flock-delivery.service.ts
lib/services/flock-phase.service.test.ts
lib/services/flock-phase.service.ts
lib/services/flock.service.test.ts
lib/services/flock.service.ts
lib/services/import.service.test.ts
lib/services/import.service.ts
lib/services/invoice.service.test.ts
lib/services/invoice.service.ts
lib/services/lock-period.service.test.ts
lib/services/lock-period.service.ts
lib/services/notification.service.ts
lib/services/profil.service.test.ts
lib/services/profil.service.ts
lib/services/role.service.ts
lib/services/sales-order.service.test.ts
lib/services/sales-order.service.ts
lib/services/sales-return.service.test.ts
lib/services/sales-return.service.ts
lib/services/stock-catalog.service.ts
lib/services/stock.service.test.ts
lib/services/stock.service.ts
lib/services/user.service.test.ts
lib/services/user.service.ts
lib/utils.ts
lib/utils/order-number.test.ts
lib/utils/order-number.ts
middleware.ts
next.config.ts
package.json
playwright.config.ts
postcss.config.mjs
README.md
repomix.config.json
scripts/benchmark.ts
scripts/seed-laporan-perms.js
tsconfig.json
vitest.config.ts
```

# Files

## File: .gitignore
````
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*
!.env.example

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# project-specific
.worktrees/
.superpowers/
.env.local
.scratch/
.playwright-mcp/
.claude/
design/

# superpowers
docs/superpowers/*
PORT=5555
nohup.out
PORT=5555
nohup.out
````

## File: app/(app)/admin/kas/account-form.tsx
````typescript
// client: needs form state
⋮----
import { useActionState } from 'react'
import { createAccountAction } from '@/lib/actions/cash.actions'
⋮----
type State = { success: boolean; error?: string } | null
````

## File: app/(app)/admin/kas/account-list.tsx
````typescript
// client: needs toggle state for inline edit
⋮----
import { useState } from 'react'
import { updateAccountAction } from '@/lib/actions/cash.actions'
import type { CashAccount } from '@/lib/db/schema/cash-account'
⋮----
type AccountWithTx = CashAccount & { hasTx: boolean }
⋮----
async function handleSubmit(fd: FormData)
⋮----
// checkbox unchecked = no value in FormData; normalize explicitly
````

## File: app/(app)/admin/kas/category-form.tsx
````typescript
// client: needs form state
⋮----
import { useActionState } from 'react'
import { createCategoryAction } from '@/lib/actions/cash.actions'
⋮----
type State = { success: boolean; error?: string } | null
````

## File: app/(app)/admin/kas/category-list.tsx
````typescript
// client: needs toggle state for inline edit
⋮----
import { useState } from 'react'
import { updateCategoryAction } from '@/lib/actions/cash.actions'
import type { CashCategory } from '@/lib/db/schema/cash-category'
⋮----
async function handleSubmit(fd: FormData)
⋮----
// checkbox unchecked = no value in FormData; normalize explicitly
````

## File: app/(app)/dashboard/flock-only-filter.tsx
````typescript
// client: needs onClick and onChange for URL navigation
⋮----
import { useRouter, usePathname } from 'next/navigation'
⋮----
interface Props {
  flocks: { id: string; name: string }[]
  selectedFlockId?: string
  selectedDays?: number
}
⋮----
export default function FlockOnlyFilter(
⋮----
function navigate(flockId: string, days: number)
⋮----
function handleFlockChange(e: React.ChangeEvent<HTMLSelectElement>)
⋮----
function handleDaysClick(days: number)
````

## File: app/(app)/produksi/[id]/edit/edit-form.tsx
````typescript
'use client' // client: tabs, dynamic state, form submission
⋮----
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { DailyRecord } from '@/lib/db/schema'
import type { StockItem } from '@/lib/db/schema'
import type { DailySubRecords } from '@/lib/db/queries/daily-record.queries'
import { saveDailyRecordAction } from '@/lib/actions/daily-record.actions'
import { correctDailyRecordAction } from '@/lib/actions/lock-period.actions'
⋮----
type StockItemWithBalance = StockItem & { balance: number }
⋮----
type Props = {
  record: DailyRecord
  subRecords: DailySubRecords
  eggItems: StockItem[]
  feedItems: StockItemWithBalance[]
  vaccineItems: StockItemWithBalance[]
  requireReason: boolean
}
⋮----
type EggEntry = { stockItemId: string; qtyButir: number; qtyKg: number }
type FeedEntry = { stockItemId: string; qtyUsed: number }
⋮----
type TabKey = typeof TABS[number]['key']
⋮----
function updateEggButir(idx: number, val: number)
function updateEggKg(idx: number, val: number)
function updateFeed(idx: number, val: number)
function updateVaccine(idx: number, val: number)
⋮----
function handleSubmit(e: React.FormEvent<HTMLFormElement>)
⋮----
{/* Tab strip */}
⋮----
{/* Tab content */}
⋮----
<input type="number" min=
⋮----
onChange=
````

## File: app/(auth)/layout.tsx
````typescript
export default function AuthLayout(
````

## File: app/api/alerts/run/route.ts
````typescript
/**
 * POST /api/alerts/run
 * Called by pg_cron via supabase.net HTTP extension at 06:00 WIB daily.
 * Protected by ALERT_WEBHOOK_SECRET env var.
 */
⋮----
import { runDailyAlerts } from '@/lib/services/alert.service'
import { db } from '@/lib/db'
import { farms } from '@/lib/db/schema'
⋮----
export async function POST(request: Request): Promise<Response>
⋮----
// Secret not configured — fail closed (don't allow requests through)
````

## File: app/api/invoices/[id]/pdf/route.tsx
````typescript
export const runtime = 'nodejs' // REQUIRED — react-pdf fails on edge runtime
⋮----
import { renderToBuffer } from '@react-pdf/renderer'
import { getSession } from '@/lib/auth/get-session'
import { createSupabaseServiceClient } from '@/lib/auth/server'
import { getInvoiceForPdf, savePdfMetadata } from '@/lib/services/invoice.service'
import { InvoicePdfDocument } from '@/components/pdf/invoice-pdf-document'
⋮----
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response>
⋮----
// 1. Auth check
⋮----
// 2. Extract id
⋮----
// 3. Fetch invoice (throws 'Invoice tidak ditemukan' if not found)
⋮----
// 4. Cache check — redirect to existing signed URL if still valid (age < 7 days)
⋮----
// 5–9. Generate, upload, sign, update, respond
⋮----
// 5. Render PDF to buffer
⋮----
// 6. Upload to Supabase Storage (service role to bypass RLS)
⋮----
// 7. Create signed URL (valid 7 days)
⋮----
// 8. Persist PDF metadata on invoice record
⋮----
// 9. Return PDF bytes — convert Buffer to Uint8Array for Web Response compatibility
````

## File: app/page.tsx
````typescript
import { redirect } from 'next/navigation'
⋮----
export default function RootPage()
````

## File: components.json
````json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
````

## File: components/forms/add-delivery-form.tsx
````typescript
// client: needs form state and submit handler
⋮----
import { useState } from 'react'
import { createFlockDeliveryAction } from '@/lib/actions/flock-delivery.actions'
⋮----
// USED BY: [add-delivery-form, create-flock-form] — count: 2
function todayISO()
⋮----
interface Props {
  flockId: string
  onSuccess: () => void
  onCancel: () => void
}
⋮----
async function onSubmit(e: React.FormEvent)
````

## File: components/forms/coop-assignment-panel.tsx
````typescript
// client: coop assignment add/remove for operator user
⋮----
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { assignCoopToUserAction, removeCoopFromUserAction } from '@/lib/actions/user-coop-assignment.actions'
⋮----
interface Assignment {
  id: string
  coopId: string
  coopName: string
}
⋮----
interface Props {
  userId: string
  assignments: Assignment[]
  availableCoops: { id: string; name: string }[]
}
⋮----
async function handleAdd()
⋮----
async function handleRemove(coopId: string)
⋮----
{/* Add assignment */}
⋮----
{/* Current assignments */}
⋮----
onClick=
````

## File: components/forms/create-coop-form.tsx
````typescript
// client: form state, submit handler
⋮----
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCoopAction } from '@/lib/actions/coop.actions'
⋮----
interface Props {
  onSuccess: () => void
  onCancel: () => void
}
⋮----
export function CreateCoopForm(
⋮----
async function onSubmit(e: React.FormEvent)
⋮----
onChange=
````

## File: components/forms/create-customer-form.tsx
````typescript
// client: form state, submit handler
⋮----
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCustomerAction } from '@/lib/actions/customer.actions'
⋮----
interface Props {
  onSuccess: () => void
  onCancel: () => void
}
⋮----
async function onSubmit(e: React.FormEvent)
````

## File: components/forms/create-flock-form.tsx
````typescript
// client: form state, submit handler, router.push on success
⋮----
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createFlockAction } from '@/lib/actions/flock.actions'
⋮----
// USED BY: [add-delivery-form, create-flock-form] — count: 2
function todayISO()
⋮----
interface Props {
  activeCoops: { id: string; name: string }[]
}
⋮----
async function onSubmit(e: React.FormEvent)
⋮----
// arrivalDate = firstDeliveryDate (derived, not shown to user)
⋮----
{/* Informasi Flock */}
⋮----
{/* Kedatangan Pertama */}
````

## File: components/forms/create-return-client.tsx
````typescript
// client: needs useState for form state
⋮----
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSalesReturnAction } from '@/lib/actions/sales-return.actions'
import { Button } from '@/components/ui/button'
import { ReturnItemRow } from '@/components/ui/return-item-row'
import type { SalesOrderItem } from '@/lib/db/schema'
⋮----
type ReturnItem = {
  itemType: 'egg_grade_a' | 'egg_grade_b' | 'flock' | 'other'
  itemRefId?: string
  quantity: number
  unit: 'butir' | 'ekor' | 'unit'
}
⋮----
type ReturnInput = {
  returnDate: string
  reasonType: 'wrong_grade' | 'damaged' | 'quantity_error' | 'other'
  notes?: string
  items: ReturnItem[]
}
⋮----
interface Props {
  orderId: string
  soItems: SalesOrderItem[]
}
⋮----
const addItem = (originalItem: SalesOrderItem) =>
⋮----
const updateItem = (index: number, field: keyof ReturnItem, value: unknown) =>
⋮----
const removeItem = (index: number) =>
⋮----
const handleSubmit = async (e: React.FormEvent) =>
⋮----
{/* Available SO items to add to return */}
⋮----
onQuantityChange=
````

## File: components/forms/customer-management-client.tsx
````typescript
// client: interactive customer table with create form, inline edit, activate/deactivate
⋮----
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreateCustomerForm } from './create-customer-form'
import { EditCustomerForm } from './edit-customer-form'
import { activateCustomerAction, deactivateCustomerAction } from '@/lib/actions/customer.actions'
import type { Customer } from '@/lib/db/schema'
⋮----
interface Props {
  customers: Customer[]
}
⋮----
async function handleToggleActive(customer: Customer)
⋮----
onSuccess=
⋮----
onClick=
⋮----
onCancel=
````

## File: components/forms/edit-coop-form.tsx
````typescript
// client: form state, submit handler
⋮----
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateCoopAction } from '@/lib/actions/coop.actions'
⋮----
interface CoopData {
  id: string
  name: string
  capacity: number | null
  notes: string | null
}
⋮----
interface Props {
  coop: CoopData
  onSuccess: () => void
  onCancel: () => void
}
⋮----
async function onSubmit(e: React.FormEvent)
````

## File: components/forms/edit-customer-form.tsx
````typescript
// client: form state, submit handler
⋮----
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateCustomerAction } from '@/lib/actions/customer.actions'
import type { Customer } from '@/lib/db/schema'
⋮----
interface Props {
  customer: Customer
  onSuccess: () => void
  onCancel: () => void
}
⋮----
// creditLimit is Drizzle numeric → TS string; strip trailing DB zeros
⋮----
async function onSubmit(e: React.FormEvent)
````

## File: components/forms/kas/transfer-form.tsx
````typescript
// client: needs form state and submission feedback
⋮----
import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { createTransferAction } from '@/lib/actions/cash.actions'
import type { CashAccount } from '@/lib/db/schema/cash-account'
⋮----
type Props = {
  accounts: CashAccount[]
  defaultFromId?: string
}
⋮----
type State = { success: boolean; error?: string } | null
⋮----
function handleSubmit(e: React.FormEvent<HTMLFormElement>)
⋮----
{/* From account */}
⋮----
{/* To account */}
⋮----
{/* Amount */}
⋮----
{/* Date */}
⋮----
{/* Reference */}
⋮----
{/* Description */}
````

## File: components/forms/login-form.tsx
````typescript
// client: needs form state, submit handler, and eye toggle
⋮----
import { useMemo, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Eye, EyeOff } from 'lucide-react'
⋮----
async function handleSubmit(e: React.FormEvent)
⋮----
{/* Email */}
⋮----
onBlur=
⋮----
{/* Password */}
⋮----
{/* Forgot password */}
⋮----
{/* Error */}
⋮----
{/* Submit */}
````

## File: components/forms/production-report-filter.tsx
````typescript
// client: needs onChange handlers for date inputs
⋮----
import { useRouter, useSearchParams } from 'next/navigation'
⋮----
type Props = {
  defaultFrom: string
  defaultTo: string
}
⋮----
function handleFromChange(value: string)
⋮----
function handleToChange(value: string)
````

## File: components/forms/stock-item-cascade-form.tsx
````typescript
// client: needs onChange to cascade category→item dropdown
⋮----
import { useState } from 'react'
import type { StockCategory, StockItem } from '@/lib/db/schema'
⋮----
type Props = {
  categories: (StockCategory & { items?: StockItem[] })[]
  action: (formData: FormData) => Promise<void>
  extraFields?: React.ReactNode
  submitLabel: string
}
⋮----
export default function StockItemCascadeForm(
````

## File: components/pdf/invoice-pdf-document.tsx
````typescript
// react-pdf: server-only — rendered via renderToBuffer() in the PDF API route
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { InvoiceDetails } from '@/lib/db/queries/invoice.queries'
import type { Invoice, SalesOrderItem } from '@/lib/db/schema'
⋮----
// ---------- types ----------
⋮----
export type InvoicePdfProps = {
  invoice: InvoiceDetails & { items: SalesOrderItem[] }
}
⋮----
// ---------- constants ----------
⋮----
// TODO: configure via app_settings 'bank_details' key in a future sprint
⋮----
function getTitleByType(type: Invoice['type']): string
⋮----
function formatDate(d: Date | string | null | undefined): string
⋮----
function formatCurrency(val: string | number | null | undefined): string
⋮----
function formatQty(val: string | number): string
⋮----
function formatPct(val: string | number | null | undefined): string
⋮----
// ---------- styles ----------
⋮----
// Header
⋮----
// Info grid
⋮----
// Table
⋮----
// Column widths
⋮----
// Totals
⋮----
// Notes
⋮----
// Footer
⋮----
// Stamp area (cash_receipt only)
⋮----
// ---------- sub-components ----------
⋮----
function InfoGrid(
⋮----
function ItemsTable(
⋮----
{/* Table header */}
⋮----
{/* Table rows */}
⋮----
const ppnPercent = 0 // MVP: PPN = 0%
⋮----
// ---------- main component ----------
⋮----
{/* Header */}
⋮----
{/* Info grid */}
⋮----
{/* Items table */}
⋮----
{/* Totals */}
⋮----
{/* Notes (optional) */}
⋮----
Dicetak:
````

## File: components/providers/progress-bar.tsx
````typescript
// client: needs usePathname + useSearchParams + useState to detect navigation and show overlay
⋮----
import { useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
⋮----
export function ProgressBar()
⋮----
// track pending hide timeout so fast navigations don't flicker
⋮----
// intercept link clicks to show overlay immediately
⋮----
function handleClick(e: MouseEvent)
````

## File: components/ui/badge.tsx
````typescript
import { cva, type VariantProps } from "class-variance-authority"
⋮----
import { cn } from "@/lib/utils"
⋮----
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}
⋮----
function Badge(
⋮----
<div className=
````

## File: components/ui/button.tsx
````typescript
import Link from "next/link"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
⋮----
import { cn } from "@/lib/utils"
⋮----
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  href?: string
  loading?: boolean
}
````

## File: components/ui/charts/dashboard-charts.tsx
````typescript
// client: dynamic ssr:false requires Client Component in Next.js 15
⋮----
import type { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import type { DepletionPoint, ProductionChartPoint } from '@/lib/services/dashboard.service'
import type { HdpPoint, FcrPoint } from '@/lib/db/queries/dashboard.queries'
⋮----
type DashboardChartsProps = {
  depletionData: DepletionPoint[]
  hdpData: HdpPoint[]
  fcrData: FcrPoint[]
  productionData: ProductionChartPoint[]
  skuKeys: string[]
}
⋮----
function ChartCard(
⋮----
export function DashboardCharts({
  depletionData,
  hdpData,
  fcrData,
  productionData,
  skuKeys,
}: DashboardChartsProps)
⋮----
{/* any: ProductionChartPoint index sig is string|number; chart expects number values only — safe at runtime */}
````

## File: components/ui/charts/deaths-bar-chart.tsx
````typescript
// client: Recharts requires DOM APIs
⋮----
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
⋮----
type DataPoint = { date: string; deaths: number }
````

## File: components/ui/charts/depletion-area-chart.tsx
````typescript
// client: Recharts requires DOM APIs
⋮----
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
⋮----
type DataPoint = { date: string; deaths: number }
⋮----
<CartesianGrid strokeDasharray="3 3" stroke="#e0e8df" /* --lf-border */ />
<XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8fa08f' /* --lf-text-soft */ }} />
<YAxis tick={{ fontSize: 11, fill: '#8fa08f' /* --lf-text-soft */ }} allowDecimals={false} />
⋮----
<Bar dataKey="deaths" fill="#e8a5a0" /* --lf-rose */ radius={[3, 3, 0, 0]} />
````

## File: components/ui/charts/fcr-line-chart.tsx
````typescript
// client: Recharts requires DOM APIs
⋮----
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
⋮----
type DataPoint = { date: string; fcr: number }
⋮----
<CartesianGrid strokeDasharray="3 3" stroke="#e0e8df" /* --lf-border */ />
<XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8fa08f' /* --lf-text-soft */ }} />
<YAxis domain={[1, 3]} tick={{ fontSize: 11, fill: '#8fa08f' /* --lf-text-soft */ }} />
````

## File: components/ui/charts/hdp-line-chart.tsx
````typescript
// client: Recharts requires DOM APIs
⋮----
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
⋮----
type DataPoint = { date: string; hdp: number }
````

## File: components/ui/charts/production-bar-chart.tsx
````typescript
// client: Recharts requires DOM APIs
⋮----
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
⋮----
type ProductionBarChartProps = {
  data: Array<{ date: string } & Record<string, number>>
  skuKeys: string[]
}
````

## File: components/ui/dialog.tsx
````typescript
// client: uses Radix Dialog which requires focus trap and portal
⋮----
import { X } from "lucide-react"
⋮----
import { cn } from "@/lib/utils"
⋮----
className=
````

## File: components/ui/drawer.tsx
````typescript
// client: uses Vaul drawer which requires touch/pointer event handlers
⋮----
import { Drawer as DrawerPrimitive } from "vaul"
⋮----
import { cn } from "@/lib/utils"
⋮----
className=
````

## File: components/ui/form.tsx
````typescript
// client: uses React context and useId for form field state
⋮----
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"
⋮----
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
⋮----
type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}
⋮----
const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) =>
⋮----
const useFormField = () =>
⋮----
type FormItemContextValue = {
  id: string
}
⋮----
className=
````

## File: components/ui/input.tsx
````typescript
import { cn } from "@/lib/utils"
````

## File: components/ui/invoice-status-badge.tsx
````typescript
import type { Invoice } from '@/lib/db/schema'
⋮----
export function InvoiceStatusBadge(
````

## File: components/ui/kpi-card.tsx
````typescript
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
⋮----
type KpiTrend = {
  direction: 'up' | 'down' | 'neutral'
  label: string
}
⋮----
type KpiCardProps = {
  label: string
  value: string | number
  unit?: string
  subText?: string
  trend?: KpiTrend
  icon?: ReactNode
  iconBg?: string
  className?: string
}
⋮----
<div className=
````

## File: components/ui/label.tsx
````typescript
// client: uses Radix Label which requires DOM refs
⋮----
import { cva, type VariantProps } from "class-variance-authority"
⋮----
import { cn } from "@/lib/utils"
````

## File: components/ui/notification-bell.tsx
````typescript
'use client' // client: needs useState + onClick for dropdown + real-time updates
⋮----
import { useState, useTransition, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Bell, Check, CheckCheck } from 'lucide-react'
import {
  getNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from '@/lib/actions/notification.actions'
import type { Notification } from '@/lib/services/notification.service'
⋮----
type Props = {
  initialNotifications: Notification[]
  readIds: string[]
}
⋮----
function handleToggle()
⋮----
function handleRead(id: string)
⋮----
function handleReadAll()
⋮----
{/* Backdrop */}
⋮----
{/* Dropdown */}
⋮----
{/* Header */}
⋮----
{/* List */}
⋮----
onClick=
````

## File: components/ui/return-item-row.tsx
````typescript
import type { SalesReturnItem } from '@/lib/db/schema'
⋮----
interface ReturnItemRowProps {
  item: SalesReturnItem
  index: number
  originalQuantity?: number
  onRemove?: (index: number) => void
  onQuantityChange?: (index: number, quantity: number) => void
}
````

## File: components/ui/sheet.tsx
````typescript
// client: uses Radix Sheet which requires focus trap and portal
⋮----
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
⋮----
import { cn } from "@/lib/utils"
⋮----
className=
````

## File: components/ui/so-item-row.tsx
````typescript
import type { SalesOrderItem } from '@/lib/db/schema'
⋮----
interface SOItemRowProps {
  item: SalesOrderItem
  index: number
  onRemove?: (index: number) => void
  onQuantityChange?: (index: number, quantity: number) => void
  onPriceChange?: (index: number, price: number) => void
  onDiscountChange?: (index: number, discount: number) => void
}
````

## File: components/ui/so-status-badge.tsx
````typescript
import type { SalesOrder } from '@/lib/db/schema'
⋮----
interface SOStatusBadgeProps {
  status: SalesOrder['status']
}
⋮----
export function SOStatusBadge(
````

## File: components/ui/so-summary-footer.tsx
````typescript
interface SOSummaryFooterProps {
  subtotal: number
  taxPct: number
  taxAmount: number
  totalAmount: number
}
````

## File: components/ui/sonner.tsx
````typescript
// client: wraps Sonner toast library which requires browser APIs
⋮----
import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
⋮----
type ToasterProps = React.ComponentProps<typeof Sonner>
````

## File: components/ui/table.tsx
````typescript
import { cn } from "@/lib/utils"
````

## File: drizzle.config.ts
````typescript
import { defineConfig } from 'drizzle-kit'
````

## File: eslint.config.mjs
````javascript
// Override default ignores of eslint-config-next.
⋮----
// Default ignores of eslint-config-next:
⋮----
// Git worktrees created by superpowers:using-git-worktrees
⋮----
// Brainstorming canvas — not app code
````

## File: lib/auth/admin.ts
````typescript
import { createClient } from '@supabase/supabase-js'
⋮----
// Service role client — server only, never expose to client
````

## File: lib/auth/server.ts
````typescript
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
⋮----
/** Service-role client — bypasses RLS. Use only for server-side storage operations. */
export function createSupabaseServiceClient()
⋮----
export async function createSupabaseServerClient()
⋮----
getAll()
setAll(cookiesToSet)
````

## File: lib/db/index.ts
````typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
⋮----
prepare: false,      // safer with Supabase pooler (both session + transaction mode)
max: 3,              // allow a few concurrent connections on free-tier pool
idle_timeout: 20,    // release idle connections after 20s (avoids stale conn on hot reload)
connect_timeout: 10, // fail fast instead of hanging indefinitely
⋮----
export type DrizzleTx = Parameters<Parameters<(typeof db)['transaction']>[0]>[0]
````

## File: lib/db/queries/alert-cooldown.queries.ts
````typescript
import { db, DrizzleTx } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, and, gt } from 'drizzle-orm'
⋮----
// USED BY: [alert.service] — count: 1
⋮----
export async function findActiveCooldown(
  farmSchema: string,
  alertType: string,
  entityId: string,
  cooldownHours: number,
  tx?: DrizzleTx
): Promise<
⋮----
export async function upsertCooldown(
  farmSchema: string,
  alertType: string,
  entityType: string,
  entityId: string,
  tx?: DrizzleTx
): Promise<void>
````

## File: lib/db/queries/app-settings.queries.ts
````typescript
import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq } from 'drizzle-orm'
⋮----
// USED BY: [app-settings.service] — count: 1
export async function getAppSetting(farmSchema: string, key: string): Promise<string | null>
⋮----
export async function upsertAppSetting(farmSchema: string, key: string, value: string, updatedBy: string): Promise<void>
````

## File: lib/db/queries/cash-account.queries.ts
````typescript
import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, sql } from 'drizzle-orm'
⋮----
export async function listAccounts(farmSchema: string)
⋮----
export async function findAccountById(farmSchema: string, id: string)
⋮----
export async function createAccount(farmSchema: string, input:
⋮----
export async function updateAccount(farmSchema: string, id: string, input:
⋮----
export async function getAccountBalance(farmSchema: string, id: string): Promise<number>
⋮----
// Use raw schema-qualified column refs inside FILTER — Drizzle interpolates column refs
// as parameter bindings in sql`` templates, which breaks FILTER (WHERE col IN (...)) syntax.
⋮----
export async function countTransactionsByAccount(farmSchema: string, id: string): Promise<number>
````

## File: lib/db/queries/cash-category.queries.ts
````typescript
import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq } from 'drizzle-orm'
⋮----
export async function listCategories(farmSchema: string)
⋮----
export async function listActiveCategories(farmSchema: string, type?: 'in' | 'out' | 'both')
⋮----
export async function findCategoryById(farmSchema: string, id: string)
⋮----
export async function createCategory(farmSchema: string, input:
⋮----
export async function updateCategory(farmSchema: string, id: string, input:
````

## File: lib/db/queries/correction-record.queries.ts
````typescript
import { db, DrizzleTx } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, desc, and } from 'drizzle-orm'
⋮----
// USED BY: [lock-period.service] — count: 1
⋮----
// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
export async function insertCorrectionRecord(
  farmSchema: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  tx?: DrizzleTx
)
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
export type CorrectionRecordWithUser = {
  id: string
  entityType: string
  entityId: string
  fieldName: string
  oldValue: string | null
  newValue: string | null
  reason: string
  correctedBy: string
  correctedAt: Date
  createdAt: Date
  correctedByName: string | null
}
⋮----
export async function findCorrectionsByEntity(
  farmSchema: string,
  entityType: string,
  entityId: string
): Promise<CorrectionRecordWithUser[]>
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
````

## File: lib/db/queries/customer-credit.queries.ts
````typescript
import { db, DrizzleTx } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, sql, desc, and } from 'drizzle-orm'
⋮----
export async function listCreditsByCustomer(farmSchema: string, customerId: string)
⋮----
export async function getAvailableCredit(farmSchema: string, customerId: string): Promise<number>
⋮----
export async function findCreditById(farmSchema: string, id: string, tx?: DrizzleTx)
⋮----
// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
export async function createCustomerCredit(
  farmSchema: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  credit: any,
  tx?: DrizzleTx
): Promise<void>
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
export async function updateCreditUsedAmount(
  farmSchema: string,
  creditId: string,
  additionalUsed: number,
  tx?: DrizzleTx
): Promise<void>
````

## File: lib/db/queries/customer.queries.ts
````typescript
import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq } from 'drizzle-orm'
⋮----
export async function findCustomerById(farmSchema: string, id: string)
⋮----
export async function listCustomers(farmSchema: string)
⋮----
// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function insertCustomer(farmSchema: string, data: any)
⋮----
// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateCustomer(farmSchema: string, id: string, data: any)
````

## File: lib/db/queries/dashboard.queries.ts
````typescript
import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { desc, isNull, and, sum, eq, inArray, SQL, sql, asc } from 'drizzle-orm'
⋮----
export type DashboardRecord = {
  id: string
  flockId: string
  recordDate: string | Date
  deaths: number
  culled: number
  isLateInput: boolean
}
⋮----
export async function getRecentDailyRecordsAcrossFlocks(farmSchema: string, limit: number, flockIds?: string[]): Promise<DashboardRecord[]>
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
export type DailyAggRow = {
  date: string
  totalEggs: number
  totalDeaths: number
}
⋮----
export async function getDailyProductionAgg(farmSchema: string, since: string, until: string, flockIds?: string[]): Promise<DailyAggRow[]>
⋮----
// totalEggs intentionally not computed here — this query feeds the depletion chart only.
// For egg production data use getExtendedDailyRecords or getProductionBySkuTrend.
⋮----
export type FlockPopulationRow = {
  flockId: string
  totalCount: number
  totalDeaths: number
  totalCulled: number
}
⋮----
export async function getActiveFlockPopulations(farmSchema: string, flockIds?: string[]): Promise<FlockPopulationRow[]>
⋮----
export type StockSummaryRow = {
  totalEggs: number
}
⋮----
export async function getStockSummary(farmSchema: string): Promise<StockSummaryRow>
⋮----
export type HdpPoint = { date: string; hdp: number }
⋮----
export async function getHdpTrend(farmSchema: string, since: string, until: string, flockIds?: string[]): Promise<HdpPoint[]>
⋮----
// Population snapshot: cumulative active birds as of now (not per-date).
// Acceptable approximation for dashboard trend display; use /laporan for precision.
⋮----
export type FcrPoint = { date: string; fcr: number }
⋮----
export async function getFcrTrend(farmSchema: string, since: string, until: string, flockIds?: string[]): Promise<FcrPoint[]>
⋮----
export type FeedPerBirdPoint = { date: string; feedGram: number }
⋮----
export async function getFeedPerBirdTrend(farmSchema: string, since: string, until: string, flockIds?: string[]): Promise<FeedPerBirdPoint[]>
⋮----
// Population snapshot: cumulative active birds as of now (not per-date).
// Acceptable approximation for dashboard trend display; use /laporan for precision.
⋮----
export type ProductionBySkuRow = {
  date: string
  skuBreakdown: Record<string, number>
}
⋮----
export async function getProductionBySkuTrend(
  farmSchema: string,
  since: string,
  until: string,
  flockIds?: string[]
): Promise<ProductionBySkuRow[]>
⋮----
// SKU name is used as the chart data key. Safe: stock_items has unique(category_id, name).
⋮----
export type ExtendedDashboardRecord = {
  date: string
  totalEggs: number
  totalFeedKg: number
  deaths: number
  culled: number
  isLateInput: boolean
}
⋮----
export async function getExtendedDailyRecords(
  farmSchema: string,
  since: string,
  until: string,
  flockIds?: string[]
): Promise<ExtendedDashboardRecord[]>
````

## File: lib/db/queries/flock-delivery.queries.ts
````typescript
import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, sum } from 'drizzle-orm'
⋮----
// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function insertFlockDelivery(farmSchema: string, data: any)
⋮----
export async function findDeliveriesByFlockId(farmSchema: string, flockId: string)
⋮----
export async function sumDeliveriesQuantityByFlockId(farmSchema: string, flockId: string): Promise<number>
````

## File: lib/db/queries/flock-phase.queries.ts
````typescript
import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, asc } from 'drizzle-orm'
⋮----
export async function findAllFlockPhases(farmSchema: string)
⋮----
// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function insertFlockPhase(farmSchema: string, data: any)
⋮----
// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateFlockPhase(farmSchema: string, id: string, data: any)
⋮----
export async function deleteFlockPhase(farmSchema: string, id: string): Promise<void>
````

## File: lib/db/queries/notification.queries.ts
````typescript
import { db, DrizzleTx } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, and, not, inArray, sql, desc } from 'drizzle-orm'
⋮----
// USED BY: [notification.service, alert.service] — count: 2
⋮----
// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
export async function createNotification(
  farmSchema: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  notification: any,
  tx?: DrizzleTx
)
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
export async function listNotificationsForRole(
  farmSchema: string,
  role: 'operator' | 'supervisor' | 'admin',
  limit = 50
)
⋮----
export async function countUnreadForUser(
  farmSchema: string,
  userId: string,
  role: 'operator' | 'supervisor' | 'admin'
): Promise<number>
⋮----
// Get all notification IDs already read by the user
⋮----
export async function markNotificationRead(
  farmSchema: string,
  notificationId: string,
  userId: string
): Promise<void>
⋮----
export async function markAllReadForUser(
  farmSchema: string,
  userId: string,
  role: 'operator' | 'supervisor' | 'admin'
): Promise<void>
⋮----
export async function getReadNotificationIdsForUser(
  farmSchema: string,
  userId: string
): Promise<
````

## File: lib/db/queries/payment.queries.ts
````typescript
import { db, DrizzleTx } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, sql, asc } from 'drizzle-orm'
⋮----
// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createPayment(farmSchema: string, payment: any, tx?: DrizzleTx)
⋮----
export async function listPaymentsByInvoice(farmSchema: string, invoiceId: string)
⋮----
export async function sumPaymentsByInvoice(farmSchema: string, invoiceId: string, tx?: DrizzleTx): Promise<number>
````

## File: lib/db/queries/sales-return.queries.ts
````typescript
import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, desc, sql, count, getTableColumns } from 'drizzle-orm'
⋮----
export async function findSalesReturnById(farmSchema: string, id: string)
⋮----
export async function findSalesReturnItems(farmSchema: string, returnId: string)
⋮----
export async function countSalesReturnsThisMonth(farmSchema: string, prefix: string): Promise<number>
⋮----
// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
export async function insertSalesReturnWithItems(
  farmSchema: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ret: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[]
)
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
export async function approveSalesReturnTx(
  farmSchema: string,
  returnId: string,
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  movements: any[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  creditNoteInvoice: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customerCredit: any
): Promise<void>
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
// Insert inventory movements
⋮----
// Insert credit note invoice
⋮----
// Insert customer credit with created invoice id
⋮----
// Update return status
⋮----
export async function rejectSalesReturn(
  farmSchema: string,
  returnId: string,
  userId: string
): Promise<void>
⋮----
export async function findSalesReturnsByOrderId(farmSchema: string, orderId: string)
⋮----
export async function listSalesReturnsWithOrder(
  farmSchema: string,
  page: number = 1,
  pageSize: number = 20,
  status?: string
)
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
export async function listSalesReturns(
  farmSchema: string,
  page: number = 1,
  pageSize: number = 20,
  status?: string
)
````

## File: lib/db/queries/stock-catalog.queries.ts
````typescript
import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, and } from 'drizzle-orm'
⋮----
export async function findAllCategories(farmSchema: string)
⋮----
export async function findCategoryById(farmSchema: string, id: string)
⋮----
export async function findCategoryByName(farmSchema: string, name: string)
⋮----
export async function findItemsByCategory(farmSchema: string, categoryId: string)
⋮----
export async function findActiveItemsByCategory(farmSchema: string, categoryId: string)
⋮----
export async function findItemById(farmSchema: string, id: string)
⋮----
// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function insertCategory(farmSchema: string, data: any)
⋮----
// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function insertStockItem(farmSchema: string, data: any)
⋮----
export async function updateStockItemActive(farmSchema: string, id: string, isActive: boolean): Promise<void>
````

## File: lib/db/queries/user-coop-assignment.queries.ts
````typescript
import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, and } from 'drizzle-orm'
⋮----
export async function findAssignmentsByUser(farmSchema: string, userId: string)
⋮----
export async function findAssignedCoopIds(farmSchema: string, userId: string): Promise<string[]>
⋮----
export async function insertAssignment(farmSchema: string, userId: string, coopId: string)
⋮----
export async function deleteAssignment(farmSchema: string, userId: string, coopId: string): Promise<void>
````

## File: lib/db/schema/alert-cooldowns.ts
````typescript
import { pgTable, uuid, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
⋮----
export type AlertCooldown = typeof alertCooldowns.$inferSelect
export type NewAlertCooldown = typeof alertCooldowns.$inferInsert
````

## File: lib/db/schema/app-settings.ts
````typescript
import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'
⋮----
export type AppSetting = typeof appSettings.$inferSelect
export type NewAppSetting = typeof appSettings.$inferInsert
````

## File: lib/db/schema/cash-account.ts
````typescript
import { pgTable, uuid, text, boolean, numeric, timestamp, pgEnum } from 'drizzle-orm/pg-core'
⋮----
export type CashAccount = typeof cashAccounts.$inferSelect
export type NewCashAccount = typeof cashAccounts.$inferInsert
````

## File: lib/db/schema/cash-category.ts
````typescript
import { pgTable, uuid, text, boolean, pgEnum } from 'drizzle-orm/pg-core'
⋮----
export type CashCategory = typeof cashCategories.$inferSelect
export type NewCashCategory = typeof cashCategories.$inferInsert
````

## File: lib/db/schema/coops.ts
````typescript
import { pgTable, uuid, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core'
⋮----
export type Coop = typeof coops.$inferSelect
export type NewCoop = typeof coops.$inferInsert
````

## File: lib/db/schema/correction-records.ts
````typescript
import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users'
⋮----
export type CorrectionRecord = typeof correctionRecords.$inferSelect
export type NewCorrectionRecord = typeof correctionRecords.$inferInsert
````

## File: lib/db/schema/customer-credits.ts
````typescript
import { pgTable, uuid, numeric, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { customers } from './customers'
import { payments } from './payments'
import { invoices } from './invoices'
⋮----
export type CustomerCredit = typeof customerCredits.$inferSelect
export type NewCustomerCredit = typeof customerCredits.$inferInsert
````

## File: lib/db/schema/customers.ts
````typescript
import { pgTable, uuid, text, integer, numeric, timestamp, pgEnum, boolean } from 'drizzle-orm/pg-core'
import { users } from './users'
⋮----
export type Customer = typeof customers.$inferSelect
export type NewCustomer = typeof customers.$inferInsert
````

## File: lib/db/schema/daily-egg-records.ts
````typescript
import { pgTable, uuid, integer, numeric, uniqueIndex, timestamp } from 'drizzle-orm/pg-core'
import { dailyRecords } from './daily-records'
import { stockItems } from './stock-items'
⋮----
export type DailyEggRecord = typeof dailyEggRecords.$inferSelect
export type NewDailyEggRecord = typeof dailyEggRecords.$inferInsert
````

## File: lib/db/schema/daily-feed-records.ts
````typescript
import { pgTable, uuid, numeric, uniqueIndex, timestamp } from 'drizzle-orm/pg-core'
import { dailyRecords } from './daily-records'
import { stockItems } from './stock-items'
⋮----
export type DailyFeedRecord = typeof dailyFeedRecords.$inferSelect
export type NewDailyFeedRecord = typeof dailyFeedRecords.$inferInsert
````

## File: lib/db/schema/daily-records.ts
````typescript
import { pgTable, uuid, integer, date, timestamp, boolean, text, uniqueIndex } from 'drizzle-orm/pg-core'
import { flocks } from './flocks'
import { users } from './users'
⋮----
export type DailyRecord = typeof dailyRecords.$inferSelect
export type NewDailyRecord = typeof dailyRecords.$inferInsert
````

## File: lib/db/schema/daily-vaccine-records.ts
````typescript
import { pgTable, uuid, numeric, uniqueIndex, timestamp } from 'drizzle-orm/pg-core'
import { dailyRecords } from './daily-records'
import { stockItems } from './stock-items'
⋮----
export type DailyVaccineRecord = typeof dailyVaccineRecords.$inferSelect
export type NewDailyVaccineRecord = typeof dailyVaccineRecords.$inferInsert
````

## File: lib/db/schema/farm-users.ts
````typescript
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { farms } from './farms'
⋮----
export type FarmUser = typeof farmUsers.$inferSelect
export type NewFarmUser = typeof farmUsers.$inferInsert
````

## File: lib/db/schema/farms.ts
````typescript
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
⋮----
export type Farm = typeof farms.$inferSelect
export type NewFarm = typeof farms.$inferInsert
````

## File: lib/db/schema/flock-phases.ts
````typescript
import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core'
⋮----
export type FlockPhase = typeof flockPhases.$inferSelect
export type NewFlockPhase = typeof flockPhases.$inferInsert
````

## File: lib/db/schema/inventory-movements.ts
````typescript
import { pgTable, uuid, integer, date, timestamp, text, pgEnum, boolean } from 'drizzle-orm/pg-core'
import { stockItems } from './stock-items'
import { flocks } from './flocks'
import { users } from './users'
⋮----
export type InventoryMovement = typeof inventoryMovements.$inferSelect
export type NewInventoryMovement = typeof inventoryMovements.$inferInsert
````

## File: lib/db/schema/notification-reads.ts
````typescript
import { pgTable, uuid, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { notifications } from './notifications'
import { users } from './users'
⋮----
export type NotificationRead = typeof notificationReads.$inferSelect
export type NewNotificationRead = typeof notificationReads.$inferInsert
````

## File: lib/db/schema/notifications.ts
````typescript
import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
⋮----
export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert
````

## File: lib/db/schema/regrade-requests.ts
````typescript
import { pgTable, uuid, integer, date, timestamp, text, pgEnum } from 'drizzle-orm/pg-core'
import { stockItems } from './stock-items'
import { users } from './users'
⋮----
export type RegradeRequest = typeof regradeRequests.$inferSelect
export type NewRegradeRequest = typeof regradeRequests.$inferInsert
````

## File: lib/db/schema/sales-order-items.ts
````typescript
import { pgTable, uuid, text, integer, numeric, pgEnum } from 'drizzle-orm/pg-core'
import { salesOrders } from './sales-orders'
⋮----
export type SalesOrderItem = typeof salesOrderItems.$inferSelect
export type NewSalesOrderItem = typeof salesOrderItems.$inferInsert
````

## File: lib/db/schema/sales-return-items.ts
````typescript
import { pgTable, uuid, integer } from 'drizzle-orm/pg-core'
import { salesReturns } from './sales-returns'
import { salesItemTypeEnum, salesUnitEnum } from './sales-order-items'
⋮----
export type SalesReturnItem = typeof salesReturnItems.$inferSelect
export type NewSalesReturnItem = typeof salesReturnItems.$inferInsert
````

## File: lib/db/schema/stock-adjustments.ts
````typescript
import { pgTable, uuid, integer, date, timestamp, text } from 'drizzle-orm/pg-core'
import { stockItems } from './stock-items'
import { flocks } from './flocks'
import { users } from './users'
⋮----
export type StockAdjustment = typeof stockAdjustments.$inferSelect
export type NewStockAdjustment = typeof stockAdjustments.$inferInsert
````

## File: lib/db/schema/stock-categories.ts
````typescript
import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'
⋮----
export type StockCategory = typeof stockCategories.$inferSelect
export type NewStockCategory = typeof stockCategories.$inferInsert
````

## File: lib/db/schema/stock-items.ts
````typescript
import { pgTable, uuid, text, boolean, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { stockCategories } from './stock-categories'
⋮----
export type StockItem = typeof stockItems.$inferSelect
export type NewStockItem = typeof stockItems.$inferInsert
````

## File: lib/db/schema/user-coop-assignments.ts
````typescript
import { pgTable, uuid, timestamp, unique } from 'drizzle-orm/pg-core'
import { users } from './users'
import { coops } from './coops'
⋮----
export type UserCoopAssignment = typeof userCoopAssignments.$inferSelect
export type NewUserCoopAssignment = typeof userCoopAssignments.$inferInsert
````

## File: lib/db/seed-sales.ts
````typescript
import { db } from './index'
import { customers, flocks, inventoryMovements } from './schema'
import { eq, and } from 'drizzle-orm'
⋮----
async function seedSalesTestData()
⋮----
// Check if customers exist
⋮----
// Check if flock exists
⋮----
// Check if stock exists
````

## File: lib/db/seed.ts
````typescript
import { db } from './index'
import { flockPhases, stockCategories, stockItems } from './schema'
⋮----
async function seed()
````

## File: lib/mock/dashboard.mock.ts
````typescript
export type DailyChartPoint = {
  date: string
  hdp: number
  fcr: number
  gradeA: number
  gradeB: number
  cumulativeDepletion: number
}
⋮----
export type RecentRecord = {
  date: string
  gradeA: number
  gradeB: number
  deaths: number
  feedKg: number
  fcr: number
  isLate: boolean
}
````

## File: lib/services/app-settings.service.ts
````typescript
import { getAppSetting as getSettingQuery, upsertAppSetting } from '@/lib/db/queries/app-settings.queries'
⋮----
export async function getAppSetting(farmSchema: string, key: string): Promise<string | null>
⋮----
export async function saveAppSetting(farmSchema: string, key: string, value: string, updatedBy: string): Promise<void>
````

## File: lib/services/cash.service.test.ts
````typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
⋮----
import {
  createTransaction,
  createTransfer,
  getAccountWithBalance,
  updateAccountSettings,
} from './cash.service'
````

## File: lib/services/coop.service.test.ts
````typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
⋮----
import { createCoop, getAllCoops, deactivateCoop } from './coop.service'
⋮----
vi.mocked(coopQueries.updateCoop).mockResolvedValue({ id: 'coop-1', status: 'inactive' } as any) // any: partial Coop for mock
````

## File: lib/services/customer.service.test.ts
````typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
⋮----
import { createCustomer, deactivateCustomer } from './customer.service'
⋮----
vi.mocked(customerQueries.updateCustomer).mockResolvedValue({ id: 'cust-1', status: 'inactive' } as any) // any: partial Customer for mock
````

## File: lib/services/customer.service.ts
````typescript
import {
  listCustomers as findAllCustomers,
  findCustomerById,
  insertCustomer,
  updateCustomer,
} from '@/lib/db/queries/customer.queries'
import type { Customer } from '@/lib/db/schema'
⋮----
type CreateCustomerInput = {
  name: string
  type?: 'retail' | 'wholesale' | 'distributor'
  phone?: string
  address?: string
  creditLimit?: number
  paymentTerms?: number
  notes?: string
  createdBy: string
}
⋮----
export async function createCustomer(farmSchema: string, input: CreateCustomerInput): Promise<Customer>
⋮----
export async function getAllCustomers(farmSchema: string): Promise<Customer[]>
⋮----
export async function getCustomerById(farmSchema: string, id: string): Promise<Customer | null>
⋮----
export async function updateCustomerById(
  farmSchema: string,
  id: string,
  input: Partial<Omit<CreateCustomerInput, 'createdBy'>>
): Promise<Customer | null>
⋮----
export async function deactivateCustomer(farmSchema: string, id: string): Promise<void>
⋮----
export async function activateCustomer(farmSchema: string, id: string): Promise<void>
````

## File: lib/services/dashboard.service.ts
````typescript
import {
  getDailyProductionAgg,
  getActiveFlockPopulations,
  getStockSummary,
  getHdpTrend,
  getFcrTrend,
  getFeedPerBirdTrend,
  getProductionBySkuTrend,
  getExtendedDailyRecords,
  type DailyAggRow,
  type HdpPoint,
  type FcrPoint,
} from '@/lib/db/queries/dashboard.queries'
⋮----
export type DashboardKpis = {
  hdpToday: number
  fcrCumulative: number
  productionToday: number
  stockTotalEggs: number
  activePopulation: number
  depletionToday: number
  feedPerBirdToday: number
}
⋮----
export type DepletionPoint = {
  date: string
  deaths: number
}
⋮----
export type DashboardRecentRecord = {
  date: string
  totalEggs: number
  totalFeedKg: number
  deaths: number
  culled: number
  hdp: number
  fcr: number
  feedGram: number
  isLate: boolean
}
⋮----
export type ProductionChartPoint = {
  date: string
  [key: string]: string | number
}
⋮----
function formatDate(dateStr: string): string
⋮----
export async function getDashboardKpis(farmSchema: string, since: string, until: string, flockIds?: string[]): Promise<DashboardKpis>
⋮----
// Aggregate HDP over the period (average of daily values)
⋮----
// FCR cumulative over the period
⋮----
// Production total over the period
⋮----
// Feed per bird: average over period
⋮----
// Depletion: total over period
⋮----
export async function getHdpChartData(farmSchema: string, since: string, until: string, flockIds?: string[]): Promise<HdpPoint[]>
⋮----
export async function getFcrChartData(farmSchema: string, since: string, until: string, flockIds?: string[]): Promise<FcrPoint[]>
⋮----
export async function getProductionBySkuChartData(
  farmSchema: string,
  since: string,
  until: string,
  flockIds?: string[]
): Promise<ProductionChartPoint[]>
⋮----
export async function getProductionChartData(farmSchema: string, since: string, until: string, flockIds?: string[]): Promise<DepletionPoint[]>
⋮----
export async function getRecentDashboardRecords(
  farmSchema: string,
  since: string,
  until: string,
  flockIds?: string[]
): Promise<DashboardRecentRecord[]>
⋮----
// FCR approximation: assume 60g average egg weight for dashboard table
````

## File: lib/services/email.service.ts
````typescript
import { Resend } from 'resend'
import type { InvoiceDetails } from '@/lib/db/queries/invoice.queries'
import type { SalesOrderItem } from '@/lib/db/schema'
⋮----
// Lazy-init so build does not fail when RESEND_API_KEY is not set
function getResend(): Resend
⋮----
export async function sendInvoiceEmail(
  to: string,
  invoice: InvoiceDetails & { items: SalesOrderItem[] },
  pdfBuffer: Buffer
): Promise<void>
````

## File: lib/services/flock-delivery.service.test.ts
````typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
⋮----
import { createFlockDelivery } from './flock-delivery.service'
import type { FlockDelivery } from '@/lib/db/schema'
````

## File: lib/services/flock-phase.service.test.ts
````typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
⋮----
import { getPhaseForWeeks, getAllFlockPhases } from './flock-phase.service'
````

## File: lib/services/flock-phase.service.ts
````typescript
import { unstable_cache } from 'next/cache'
import {
  findAllFlockPhases,
  insertFlockPhase,
  updateFlockPhase,
  deleteFlockPhase,
} from '@/lib/db/queries/flock-phase.queries'
import type { FlockPhase } from '@/lib/db/schema'
⋮----
export async function getPhaseForWeeks(farmSchema: string, ageWeeks: number): Promise<FlockPhase | null>
⋮----
export async function createFlockPhase(farmSchema: string, input: {
  name: string
  minWeeks: number
  maxWeeks?: number
  sortOrder: number
}): Promise<FlockPhase>
⋮----
export async function updateFlockPhaseById(
  farmSchema: string,
  id: string,
  input: Partial<{ name: string; minWeeks: number; maxWeeks: number | null; sortOrder: number }>
): Promise<FlockPhase | null>
⋮----
export async function deleteFlockPhaseById(farmSchema: string, id: string): Promise<void>
````

## File: lib/services/flock.service.test.ts
````typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
⋮----
import { db } from '@/lib/db'
import { getFlockAgeDays, getFlockAgeWeeks, createFlock, retireFlock } from './flock.service'
⋮----
const today = new Date('2025-01-11') // 10 days later
⋮----
const today = new Date('2025-03-12') // 70 days
⋮----
const today = new Date('2025-01-06') // 5 days
⋮----
const today = new Date('2025-01-08') // 7 days
⋮----
const today = new Date('2025-03-12') // 70 days
⋮----
// any: partial Flock for mock
⋮----
// any: tx is a partial mock of PgTransaction for testing purposes
⋮----
// docDate should equal firstDeliveryDate (Jan 10 - 0 days = Jan 10)
⋮----
// any: tx is a partial mock of PgTransaction for testing purposes
⋮----
// docDate should be Jan 20 - 10 days = Jan 10
⋮----
// any: tx is a partial mock of PgTransaction for testing purposes
````

## File: lib/services/invoice.service.test.ts
````typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
⋮----
// Mock db.transaction to immediately invoke callback with a mock tx that has insert
⋮----
import { db } from '@/lib/db'
import {
  getInvoiceDetails,
  recordPayment,
  applyCredit,
  getAgingData,
  getInvoiceForPdf,
} from './invoice.service'
⋮----
vi.mocked(notificationQueries.createNotification).mockResolvedValue(undefined as any) // any: mock doesn't need full Notification shape
⋮----
// Verify query-layer functions were called for customerCredit and notification
````

## File: lib/services/lock-period.service.test.ts
````typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
⋮----
import { canEdit, assertCanEdit, isLocked } from './lock-period.service'
⋮----
function daysAgo(n: number): Date
````

## File: lib/services/lock-period.service.ts
````typescript
/**
 * Lock Period Service — Sprint 8
 * Enforces edit windows per role and creates correction_records for admin edits past lock.
 *
 * Rules (from PRD Section 6.5):
 *   Operator  → H+1 from record_date
 *   Supervisor→ H+7 from record_date
 *   Admin     → unlimited
 *
 * When admin edits a locked record → must supply reason → creates correction_record.
 * Old value is preserved; no overwrite without audit trail.
 */
⋮----
import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq } from 'drizzle-orm'
import { insertCorrectionRecord } from '@/lib/db/queries/correction-record.queries'
import type { CorrectionRecord } from '@/lib/db/schema'
⋮----
type Role = 'operator' | 'supervisor' | 'admin'
⋮----
/**
 * Returns true if the given role can edit a record with the given record_date at `now`.
 */
export function canEdit(recordDate: Date, role: Role, now: Date = new Date()): boolean
⋮----
const limit = role === 'operator' ? 1 : 7 // supervisor = H+7
⋮----
/**
 * Throws if the role cannot edit this record date.
 * Admin always passes (no throw).
 */
export function assertCanEdit(recordDate: Date, role: Role, now: Date = new Date()): void
⋮----
/**
 * Checks whether a record is in a locked state for a given role.
 * Admins editing a locked record must supply a reason and the result will
 * create correction_records.
 */
export function isLocked(recordDate: Date, role: Role, now: Date = new Date()): boolean
⋮----
// ─── daily_record correction ──────────────────────────────────────────────────
⋮----
type DailyRecordPatch = {
  deaths?: number
  culled?: number
  eggsCracked?: number
  eggsAbnormal?: number
}
⋮----
/**
 * Admin-only: apply corrections to a daily_record past lock window.
 * Creates one correction_record per changed field.
 * Egg/feed/vaccine corrections are handled via new input entries in the sub-tables;
 * this service only patches the core daily_record fields.
 */
export async function correctDailyRecord(
  farmSchema: string,
  recordId: string,
  patch: DailyRecordPatch,
  reason: string,
  adminId: string
): Promise<CorrectionRecord[]>
⋮----
// Build update set
````

## File: lib/services/notification.service.ts
````typescript
import {
  createNotification,
  listNotificationsForRole,
  countUnreadForUser,
  markNotificationRead,
  markAllReadForUser,
  getReadNotificationIdsForUser,
} from '@/lib/db/queries/notification.queries'
import type { Notification, NewNotification } from '@/lib/db/schema'
⋮----
export async function getNotificationsForRole(
  farmSchema: string,
  role: 'operator' | 'supervisor' | 'admin',
  limit = 50
): Promise<Notification[]>
⋮----
export async function getUnreadCount(
  farmSchema: string,
  userId: string,
  role: 'operator' | 'supervisor' | 'admin'
): Promise<number>
⋮----
export async function readNotification(
  farmSchema: string,
  notificationId: string,
  userId: string
): Promise<void>
⋮----
export async function readAllNotifications(
  farmSchema: string,
  userId: string,
  role: 'operator' | 'supervisor' | 'admin'
): Promise<void>
⋮----
export async function pushNotification(
  farmSchema: string,
  data: NewNotification
): Promise<Notification>
⋮----
export async function getReadNotificationIds(farmSchema: string, userId: string): Promise<string[]>
````

## File: lib/services/sales-order.service.test.ts
````typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
⋮----
assertCanEdit: vi.fn(), // no-op by default
⋮----
import {
  createDraftSO,
  confirmSO,
  cancelSO,
  deleteDraftSO,
  fulfillSO,
} from './sales-order.service'
⋮----
type CreateDraftInput = {
  customerId: string
  orderDate: Date
  paymentMethod: 'cash' | 'credit'
  items: Array<{
    itemType: 'egg_grade_a' | 'egg_grade_b' | 'flock' | 'other'
    itemRefId?: string
    description?: string
    quantity: number
    unit: 'butir' | 'ekor' | 'unit'
    pricePerUnit: number
    discountPct?: number

  }>
  taxPct?: number
  notes?: string
  overrideReason?: string
}
````

## File: lib/services/sales-return.service.test.ts
````typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
⋮----
import {
  createSalesReturn,
  approveSalesReturn,
  rejectSalesReturn,
} from './sales-return.service'
⋮----
type CreateReturnInput = {
  orderId: string
  returnDate: Date
  reasonType: 'wrong_grade' | 'damaged' | 'quantity_error' | 'other'
  items: Array<{
    itemType: 'egg_grade_a' | 'egg_grade_b' | 'flock' | 'other'
    itemRefId?: string
    quantity: number
    unit: 'butir' | 'ekor' | 'unit'
  }>
  notes?: string
}
````

## File: lib/services/stock-catalog.service.ts
````typescript
import {
  findAllCategories,
  findCategoryById,
  findCategoryByName,
  findActiveItemsByCategory,
  findItemsByCategory,
  findItemById,
  insertCategory,
  insertStockItem,
  updateStockItemActive,
} from '@/lib/db/queries/stock-catalog.queries'
import type { StockCategory, StockItem } from '@/lib/db/schema'
⋮----
type CreateCategoryInput = { name: string; unit: string }
type CreateStockItemInput = { categoryId: string; name: string }
⋮----
export async function getCategories(farmSchema: string): Promise<StockCategory[]>
⋮----
export type CategoryWithItems = StockCategory & { items: StockItem[] }
⋮----
export async function getCategoriesWithActiveItems(farmSchema: string): Promise<CategoryWithItems[]>
⋮----
export async function getCategoryWithItems(
  farmSchema: string,
  categoryId: string
): Promise<
⋮----
export async function getActiveItemsByCategory(farmSchema: string, categoryId: string): Promise<StockItem[]>
⋮----
export async function getActiveItemsByCategoryName(farmSchema: string, name: string): Promise<StockItem[]>
⋮----
export async function getActiveEggItems(farmSchema: string): Promise<StockItem[]>
⋮----
export async function getActiveFeedItems(farmSchema: string): Promise<StockItem[]>
⋮----
export async function getActiveVaccineItems(farmSchema: string): Promise<StockItem[]>
⋮----
export async function createCategory(farmSchema: string, input: CreateCategoryInput): Promise<StockCategory>
⋮----
export async function createStockItem(farmSchema: string, input: CreateStockItemInput): Promise<StockItem>
⋮----
export async function toggleStockItemActive(farmSchema: string, itemId: string): Promise<void>
````

## File: lib/services/stock.service.test.ts
````typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
⋮----
assertCanEdit: vi.fn(), // no-op by default
⋮----
import {
  validateStockNotBelowZero,
  createStockAdjustment,
  submitRegradeRequest,
  approveRegradeRequest,
  rejectRegradeRequest,
} from './stock.service'
⋮----
vi.mocked(q.insertStockAdjustmentWithMovement).mockResolvedValue({ id: 'adj-1' } as any) // any: partial mock
⋮----
vi.mocked(q.insertStockAdjustmentWithMovement).mockResolvedValue({ id: 'adj-1' } as any) // any: partial mock
⋮----
vi.mocked(q.insertRegradeRequest).mockResolvedValue({ id: 'rr-1' } as any) // any: partial mock
⋮----
vi.mocked(q.findRegradeRequestById).mockResolvedValue({ id: 'req-1', status: 'APPROVED' } as any) // any: partial mock
⋮----
vi.mocked(q.findRegradeRequestById).mockResolvedValue({ id: 'req-1', status: 'PENDING' } as any) // any: partial mock
⋮----
vi.mocked(q.findRegradeRequestById).mockResolvedValue({ id: 'req-1', status: 'PENDING' } as any) // any: partial mock
````

## File: lib/utils.ts
````typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
⋮----
export function cn(...inputs: ClassValue[])
````

## File: lib/utils/order-number.test.ts
````typescript
import { describe, it, expect, vi } from 'vitest'
import { generateOrderNumber } from './order-number'
````

## File: lib/utils/order-number.ts
````typescript
// USED BY: [sales-order.service, sales-return.service, invoice creation] — count: 3+
export function generateOrderNumber(
  prefix: 'SO' | 'RTN' | 'INV' | 'RCP' | 'CN',
  lastSeq: number
): string
````

## File: next.config.ts
````typescript
import type { NextConfig } from "next";
⋮----
/* config options here */
````

## File: package.json
````json
{
  "name": "phase1-foundation",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest",
    "test:run": "vitest run",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx lib/db/seed.ts"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-slot": "^1.2.4",
    "@react-pdf/renderer": "^4.5.1",
    "@supabase/ssr": "^0.10.2",
    "@supabase/supabase-js": "^2.104.0",
    "@upstash/ratelimit": "^2.0.8",
    "@upstash/redis": "^1.37.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "drizzle-orm": "^0.45.2",
    "lucide-react": "^1.8.0",
    "next": "^15.5.15",
    "next-themes": "^0.4.6",
    "postgres": "^3.4.9",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "react-hook-form": "^7.73.1",
    "recharts": "^3.8.1",
    "resend": "^6.12.2",
    "server-only": "^0.0.1",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.5.0",
    "tw-animate-css": "^1.4.0",
    "vaul": "^1.1.2",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@playwright/test": "^1.59.1",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react": "^6.0.1",
    "drizzle-kit": "^0.31.10",
    "eslint": "^9",
    "eslint-config-next": "16.2.4",
    "shadcn": "^4.3.1",
    "tailwindcss": "^4",
    "tsx": "^4.21.0",
    "typescript": "^5",
    "vite-tsconfig-paths": "^6.1.1",
    "vitest": "^4.1.4"
  }
}
````

## File: playwright.config.ts
````typescript
import { defineConfig } from '@playwright/test';
````

## File: postcss.config.mjs
````javascript

````

## File: README.md
````markdown
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
````

## File: repomix.config.json
````json
{
  "$schema": "https://repomix.com/schemas/latest/schema.json",
  "input": {
    "maxFileSize": 52428800
  },
  "output": {
    "filePath": "./repomix/repomix-main.md",
    "style": "markdown",
    "parsableStyle": false,
    "fileSummary": true,
    "directoryStructure": true,
    "files": true,
    "removeComments": false,
    "removeEmptyLines": false,
    "compress": false,
    "topFilesLength": 5,
    "showLineNumbers": false,
    "truncateBase64": false,
    "copyToClipboard": false,
    "includeFullDirectoryStructure": false,
    "tokenCountTree": false,
    "git": {
      "sortByChanges": true,
      "sortByChangesMaxCommits": 100,
      "includeDiffs": false,
      "includeLogs": false,
      "includeLogsCount": 50
    }
  },
  "include": [],
  "ignore": {
    "useGitignore": true,
    "useDotIgnore": true,
    "useDefaultPatterns": true,
    "customPatterns": []
  },
  "security": {
    "enableSecurityCheck": true
  },
  "tokenCount": {
    "encoding": "o200k_base"
  }
}
````

## File: scripts/benchmark.ts
````typescript
import { chromium } from 'playwright'
⋮----
interface Result { page: string; ms: number; pass: boolean; target: number; note?: string }
⋮----
async function measure(url: string, label: string, targetMs: number): Promise<Result>
⋮----
// Use 'load' (not 'networkidle') — networkidle waits for all connections including
// long-lived SSE/polling which skews results unrealistically.
⋮----
async function main()
⋮----
// Note: these pages require auth. We measure cold response including any redirect.
// Pages redirect to /login if unauthenticated — that is expected and still exercises the server.
// The goal is to verify the server responds fast, not that the full authenticated page renders.
⋮----
// Output JSON for easy parsing
````

## File: tsconfig.json
````json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": [
        "./*"
      ]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": [
    "node_modules"
  ]
}
````

## File: vitest.config.ts
````typescript
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
````

## File: app/(app)/admin/flock-phases/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAllFlockPhases } from '@/lib/services/flock-phase.service'
````

## File: app/(app)/admin/kas/page.tsx
````typescript
import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { listAccounts, countTransactionsByAccount } from '@/lib/db/queries/cash-account.queries'
import { listCategories } from '@/lib/db/queries/cash-category.queries'
import { AccountForm } from './account-form'
import { CategoryForm } from './category-form'
import { AccountList } from './account-list'
import { CategoryList } from './category-list'
⋮----
{/* Accounts */}
⋮----
{/* Categories */}
````

## File: app/(app)/admin/layout.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
⋮----
export default async function AdminLayout(
````

## File: app/(app)/admin/page.tsx
````typescript
import Link from 'next/link'
import { Users, Settings, MessageSquare, Bell, Upload, Package, Wallet, Shield } from 'lucide-react'
````

## File: app/(app)/admin/pelanggan/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getAllCustomers } from '@/lib/services/customer.service'
import { CustomerManagementClient } from '@/components/forms/customer-management-client'
⋮----
export default async function PelangganPage()
````

## File: app/(app)/admin/settings/alerts/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAppSetting } from '@/lib/services/app-settings.service'
import { updateAlertSettings } from '@/lib/actions/app-settings.actions'
````

## File: app/(app)/admin/settings/wa-template/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAppSetting } from '@/lib/services/app-settings.service'
import { saveWaTemplateAction } from '@/lib/actions/app-settings.actions'
⋮----
function renderPreview(template: string): string
⋮----
async function handleSaveTemplate(formData: FormData)
⋮----
{/* Header */}
⋮----
{/* Alerts */}
⋮----
{/* Form */}
⋮----
{/* Variable hints */}
⋮----
{/* Preview */}
````

## File: app/(app)/admin/stok-katalog/page.tsx
````typescript
import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { getCategories } from '@/lib/services/stock-catalog.service'
import { findItemsByCategory } from '@/lib/db/queries/stock-catalog.queries'
import { createCategoryAction, createStockItemAction, toggleStockItemActiveAction } from '@/lib/actions/stock-catalog.actions'
⋮----
async function handleCreateCategory(formData: FormData)
⋮----
async function handleCreateItem(formData: FormData)
⋮----
{/* Category list */}
⋮----
async function handleToggle()
⋮----
{/* Add category */}
````

## File: app/(app)/admin/users/[id]/kandang/page.tsx
````typescript
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth/get-session'
import { getUserById } from '@/lib/services/user.service'
import { getAllCoops } from '@/lib/services/coop.service'
import { findAssignmentsByUser } from '@/lib/db/queries/user-coop-assignment.queries'
import { CoopAssignmentPanel } from '@/components/forms/coop-assignment-panel'
⋮----
export default async function UserKandangPage(
````

## File: app/(app)/dashboard/page.tsx
````typescript
import Link from 'next/link'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'
import { KpiCard } from '@/components/ui/kpi-card'
import { DashboardCharts } from '@/components/ui/charts/dashboard-charts'
import {
  getDashboardKpis,
  getProductionChartData,
  getRecentDashboardRecords,
  getHdpChartData,
  getFcrChartData,
  getProductionBySkuChartData,
} from '@/lib/services/dashboard.service'
import { getAgingData } from '@/lib/services/invoice.service'
import { findAllActiveFlocks } from '@/lib/db/queries/flock.queries'
import FlockOnlyFilter from './flock-only-filter'
import type { AgingRow } from '@/lib/db/queries/invoice.queries'
⋮----
function getPeriodRange(days: number):
⋮----
// Union all SKU keys across all rows to avoid missing SKUs absent from first row
⋮----
{/* Header */}
⋮----
{/* KPI Grid — 2 cols mobile / 3 cols tablet / 6 cols desktop */}
⋮----
{/* Charts 2x2 */}
⋮----
{/* Recent records table — 7 columns */}
⋮----
{/* Aging widget — admin + supervisor only */}
````

## File: app/(app)/flock/[id]/page.tsx
````typescript
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { findFlockById } from '@/lib/db/queries/flock.queries'
import { findDeliveriesByFlockId } from '@/lib/db/queries/flock-delivery.queries'
import { getCoopById } from '@/lib/services/coop.service'
import { FlockDetailClient } from '@/components/forms/flock-detail-client'
⋮----
canAddDelivery=
````

## File: app/(app)/flock/layout.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
⋮----
export default async function FlockLayout(
````

## File: app/(app)/flock/new/page.tsx
````typescript
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getAllCoops } from '@/lib/services/coop.service'
import { findAllActiveFlocks } from '@/lib/db/queries/flock.queries'
import { CreateFlockForm } from '@/components/forms/create-flock-form'
⋮----
export default async function NewFlockPage()
````

## File: app/(app)/forbidden/page.tsx
````typescript
import Link from 'next/link'
⋮----
export default function ForbiddenPage()
````

## File: app/(app)/kas/layout.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
⋮----
export default async function KasLayout(
````

## File: app/(app)/kas/transaksi/baru/page.tsx
````typescript
import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { listAccounts } from '@/lib/db/queries/cash-account.queries'
import { listActiveCategories } from '@/lib/db/queries/cash-category.queries'
import { TransactionForm } from '@/components/forms/kas/transaction-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
````

## File: app/(app)/kas/transfer/baru/page.tsx
````typescript
import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { listAccounts } from '@/lib/db/queries/cash-account.queries'
import { TransferForm } from '@/components/forms/kas/transfer-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
````

## File: app/(app)/laporan/keuangan/layout.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
⋮----
export default async function KeuanganLaporanLayout(
````

## File: app/(app)/laporan/layout.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
⋮----
export default async function LaporanLayout(
````

## File: app/(app)/penjualan/[id]/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import {
  findSalesOrderById,
  findSalesOrderItems,
} from '@/lib/db/queries/sales-order.queries'
import {
  confirmSOAction,
  cancelSOAction,
  deleteDraftSOAction,
  fulfillSOAction,
} from '@/lib/actions/sales-order.actions'
import { findSalesReturnsByOrderId } from '@/lib/db/queries/sales-return.queries'
import { SOStatusBadge } from '@/components/ui/so-status-badge'
import { Button } from '@/components/ui/button'
⋮----
async function confirmAction()
async function cancelAction()
async function deleteAction()
async function fulfillAction()
⋮----
{/* SO Items */}
⋮----
{/* Sales Returns */}
⋮----
{/* Status Actions */}
````

## File: app/(app)/penjualan/[id]/return/new/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { findSalesOrderById, findSalesOrderItems } from '@/lib/db/queries/sales-order.queries'
import { CreateReturnClient } from '@/components/forms/create-return-client'
⋮----
export default async function CreateReturnPage({
  params,
}: {
  params: Promise<{ id: string }>
})
````

## File: app/(app)/penjualan/invoices/[id]/page.tsx
````typescript
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getInvoiceDetails } from '@/lib/services/invoice.service'
import { recordPaymentAction, applyCreditAction, sendInvoiceEmailAction } from '@/lib/actions/invoice.actions'
import { getAppSetting } from '@/lib/services/app-settings.service'
import { InvoiceStatusBadge } from '@/components/ui/invoice-status-badge'
import { Button } from '@/components/ui/button'
⋮----
// WA share setup (admin only)
⋮----
// Inline server actions
async function handleRecordPayment(formData: FormData)
⋮----
async function handleSendEmail()
⋮----
{/* Header */}
⋮----
{/* Download PDF button */}
⋮----
{/* WA share button — admin only, requires customer phone */}
⋮----
{/* Email send button — admin only, requires customer email */}
⋮----
{/* Alerts */}
⋮----
{/* Financial summary */}
⋮----
{/* Payment history */}
⋮----
{/* Record Payment form (admin only, status not paid/cancelled/draft) */}
⋮----
{/* Available credits (admin only) */}
⋮----
async function handleApplyCredit(formData: FormData)
````

## File: app/(app)/penjualan/invoices/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { listInvoices } from '@/lib/db/queries/invoice.queries'
import { InvoiceStatusBadge } from '@/components/ui/invoice-status-badge'
import { Button } from '@/components/ui/button'
import type { Invoice } from '@/lib/db/schema'
⋮----
{/* Header */}
⋮----
{/* Status filter buttons */}
⋮----
{/* Table */}
⋮----
{/* Pagination */}
````

## File: app/(app)/penjualan/layout.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
⋮----
export default async function PenjualanLayout(
````

## File: app/(app)/penjualan/new/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getAllCustomers } from '@/lib/services/customer.service'
import { CreateSOClient } from '@/components/forms/create-so-client'
⋮----
export default async function CreateSOPage()
````

## File: app/(app)/penjualan/page.tsx
````typescript
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { listSalesOrders } from '@/lib/db/queries/sales-order.queries'
import { listSalesReturnsWithOrder } from '@/lib/db/queries/sales-return.queries'
import { SOStatusBadge } from '@/components/ui/so-status-badge'
import { Button } from '@/components/ui/button'
⋮----
// USED BY: [penjualan/page, return/[id]/page] — count: 2
⋮----
{/* Page header */}
⋮----
{/* Tab strip */}
⋮----
{/* SO Tab Content */}
⋮----
{/* SO Status Filter */}
⋮----
{/* SO Table */}
⋮----
{/* SO Pagination */}
⋮----
{/* Return Tab Content */}
⋮----
{/* Return Status Filter */}
⋮----
{/* Return Table */}
⋮----
{/* Return Pagination */}
````

## File: app/(app)/penjualan/return/[id]/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import {
  findSalesReturnById,
  findSalesReturnItems,
} from '@/lib/db/queries/sales-return.queries'
import { findSalesOrderById } from '@/lib/db/queries/sales-order.queries'
import {
  approveSalesReturnAction,
  rejectSalesReturnAction,
} from '@/lib/actions/sales-return.actions'
import { Button } from '@/components/ui/button'
⋮----
// USED BY: [penjualan/page, return/[id]/page] — count: 2
⋮----
async function approveAction()
async function rejectAction()
⋮----
{/* Return Items */}
⋮----
{/* Admin Actions - only for pending returns */}
````

## File: app/(app)/produksi/flock-filter.tsx
````typescript
// client: needs onChange for URL navigation and derived coop/flock state
⋮----
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
⋮----
interface FlockOption {
  id: string
  name: string
  coopId: string
  coopName: string
  isActive: boolean
  arrivalDate: string
}
⋮----
interface Props {
  flocks: FlockOption[]
  selectedFlockId?: string
  selectedCoopId?: string
}
⋮----
function sortFlocks(list: FlockOption[])
⋮----
export default function FlockFilter(
⋮----
function navigate(newCoopId: string, newFlockId: string)
⋮----
function handleCoopChange(e: React.ChangeEvent<HTMLSelectElement>)
⋮----
function handleFlockChange(e: React.ChangeEvent<HTMLSelectElement>)
````

## File: app/(app)/produksi/layout.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
⋮----
export default async function ProduksiLayout(
````

## File: app/(app)/profil/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { ProfilTabs } from '@/components/profil/profil-tabs'
⋮----
export default async function ProfilPage()
````

## File: app/(app)/stok/beli/page.tsx
````typescript
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'
import { getCategoriesWithActiveItems } from '@/lib/services/stock-catalog.service'
import { createStockPurchaseAction } from '@/lib/actions/stock.actions'
import StockItemCascadeForm from '@/components/forms/stock-item-cascade-form'
⋮----
// Exclude Telur — eggs enter via production input, not purchase
⋮----
async function handleSubmit(formData: FormData)
````

## File: app/(app)/stok/layout.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
⋮----
export default async function StokLayout(
````

## File: app/(app)/stok/regrade/[id]/page.tsx
````typescript
import { getSession } from '@/lib/auth/get-session'
import { redirect, notFound } from 'next/navigation'
import { findRegradeRequestById } from '@/lib/db/queries/inventory.queries'
import { findItemById } from '@/lib/db/queries/stock-catalog.queries'
import { approveRegradeRequestAction, rejectRegradeRequestAction } from '@/lib/actions/stock.actions'
⋮----
async function approve()
⋮----
async function reject()
````

## File: app/(app)/stok/sesuaikan/page.tsx
````typescript
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'
import { getCategoriesWithActiveItems } from '@/lib/services/stock-catalog.service'
import { createStockAdjustmentAction } from '@/lib/actions/stock.actions'
import StockItemCascadeForm from '@/components/forms/stock-item-cascade-form'
⋮----
async function handleSubmit(formData: FormData)
````

## File: app/(auth)/logout/route.ts
````typescript
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/auth/server'
import type { NextRequest } from 'next/server'
⋮----
export async function GET(request: NextRequest)
⋮----
// Use NEXT_PUBLIC_APP_URL in prod to avoid redirecting to internal reverse-proxy origin
````

## File: app/api/laporan/aging-csv/route.ts
````typescript
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getAgingData } from '@/lib/services/invoice.service'
⋮----
export async function GET(): Promise<Response>
````

## File: app/api/laporan/flock-csv/route.ts
````typescript
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getFlockPerformanceData } from '@/lib/services/daily-record.service'
⋮----
function parseSafe(s: string | null, d: Date)
function esc(v: string)
⋮----
export async function GET(request: Request): Promise<Response>
````

## File: app/api/laporan/kas-csv/route.ts
````typescript
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getCashFlowReport } from '@/lib/db/queries/kas.queries'
⋮----
function parseSafe(s: string | null, d: Date)
⋮----
function esc(v: string)
⋮----
export async function GET(request: Request): Promise<Response>
````

## File: app/api/laporan/penjualan-csv/route.ts
````typescript
import { type NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getSalesReport } from '@/lib/db/queries/sales-order.queries'
⋮----
function esc(v: string)
⋮----
function parseSafe(s: string | null, d: Date)
⋮----
export async function GET(request: NextRequest): Promise<Response>
````

## File: app/api/laporan/penjualan-customer-csv/route.ts
````typescript
import { type NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getSalesPerCustomerReport } from '@/lib/db/queries/sales-order.queries'
⋮----
function esc(v: string)
⋮----
function parseSafe(s: string | null, d: Date)
⋮----
function formatRupiah(n: number)
⋮----
export async function GET(request: NextRequest): Promise<Response>
````

## File: app/api/laporan/stok-csv/route.ts
````typescript
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getAllStockBalances } from '@/lib/db/queries/inventory.queries'
⋮----
function esc(v: string)
⋮----
export async function GET(): Promise<Response>
````

## File: app/api/laporan/stok-mutasi-csv/route.ts
````typescript
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getStockMovementReport } from '@/lib/db/queries/inventory.queries'
⋮----
function parseSafe(s: string | null, d: Date)
function esc(v: string)
⋮----
export async function GET(request: Request): Promise<Response>
````

## File: app/changelog/ChangelogSeenMarker.tsx
````typescript
// client: needs useEffect to fire server action on mount
⋮----
import { useEffect } from 'react'
import { markChangelogSeen } from '@/lib/actions/changelog.actions'
⋮----
export function ChangelogSeenMarker()
````

## File: app/layout.tsx
````typescript
import type { Metadata, Viewport } from "next"
import { DM_Sans } from "next/font/google"
import { Suspense } from 'react'
⋮----
import { ProgressBar } from '@/components/providers/progress-bar'
⋮----
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>)
````

## File: components/forms/coop-management-client.tsx
````typescript
// client: interactive coop table with create form, inline edit, activate/deactivate
⋮----
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreateCoopForm } from './create-coop-form'
import { EditCoopForm } from './edit-coop-form'
import { activateCoopAction, deactivateCoopAction } from '@/lib/actions/coop.actions'
import type { CoopWithPopulation } from '@/lib/services/coop.service'
⋮----
interface Props {
  coops: CoopWithPopulation[]
}
⋮----
function flockAge(docDate: Date): string
⋮----
async function handleToggleActive(coop: CoopWithPopulation)
⋮----
onSuccess=
⋮----
onClick=
⋮----
onCancel=
````

## File: components/forms/create-so-client.tsx
````typescript
// client: needs useState, useEffect for sessionStorage draft persistence
⋮----
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createDraftSOAction } from '@/lib/actions/sales-order.actions'
import { Button } from '@/components/ui/button'
import { SOItemRow } from '@/components/ui/so-item-row'
import { SOSummaryFooter } from '@/components/ui/so-summary-footer'
import type { Customer } from '@/lib/db/schema'
⋮----
type SalesOrderItem = {
  itemType: 'egg_grade_a' | 'egg_grade_b' | 'flock' | 'other'
  itemRefId?: string
  description?: string
  quantity: number
  unit: 'butir' | 'ekor' | 'unit'
  pricePerUnit: number
  discountPct: number
}
⋮----
type DraftSO = {
  customerId?: string
  orderDate: string
  paymentMethod: 'cash' | 'credit'
  taxPct: number
  notes?: string
  overrideReason?: string
  items: SalesOrderItem[]
}
⋮----
interface Props {
  customers: Customer[]
  isAdmin: boolean
}
⋮----
const addItem = () =>
⋮----
const updateItem = (index: number, field: keyof SalesOrderItem, value: unknown) =>
⋮----
const removeItem = (index: number) =>
⋮----
const handleSubmit = async (e: React.FormEvent) =>
⋮----
onPriceChange=
onDiscountChange=
````

## File: components/forms/create-user-form.tsx
````typescript
// client: form state, submit handler, eye toggle
⋮----
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { createUserAction } from '@/lib/actions/user.actions'
⋮----
type RoleOption = { id: string; displayName: string }
⋮----
interface Props {
  roles: RoleOption[]
  onSuccess: () => void
  onCancel: () => void
}
⋮----
async function onSubmit(e: React.FormEvent)
````

## File: components/forms/flock-detail-client.tsx
````typescript
// client: needs add-delivery form state and retire action
⋮----
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { retireFlockAction } from '@/lib/actions/flock.actions'
import { AddDeliveryForm } from '@/components/forms/add-delivery-form'
import type { Flock, FlockDelivery } from '@/lib/db/schema'
⋮----
interface Props {
  flock: Flock
  deliveries: FlockDelivery[]
  coopName: string
  canAddDelivery: boolean
  canRetire: boolean
}
⋮----
function formatDate(date: Date | string | null): string
⋮----
async function handleRetire()
⋮----
function handleDeliverySuccess()
⋮----
{/* Header card */}
⋮----
{/* Deliveries section */}
⋮----
{/* Inline add delivery form */}
````

## File: components/forms/kas/transaction-form.tsx
````typescript
// client: needs form state and submission feedback
⋮----
import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { createTransactionAction } from '@/lib/actions/cash.actions'
import type { CashAccount } from '@/lib/db/schema/cash-account'
import type { CashCategory } from '@/lib/db/schema/cash-category'
⋮----
type Props = {
  accounts: CashAccount[]
  categories: CashCategory[]
  defaultAccountId?: string
  defaultType?: 'in' | 'out'
}
⋮----
type State = { success: boolean; error?: string } | null
⋮----
function handleSubmit(e: React.FormEvent<HTMLFormElement>)
⋮----
{/* Type */}
⋮----
{/* Account */}
⋮----
{/* Amount */}
⋮----
{/* Date */}
⋮----
{/* Category */}
⋮----
{/* Reference */}
⋮----
{/* Description */}
````

## File: components/forms/laporan-filter.tsx
````typescript
// client: needs onChange handlers for date inputs and entity selector
⋮----
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
⋮----
type Entity = { id: string; label: string }
⋮----
type Props = {
  defaultFrom: string
  defaultTo: string
  entityType?: 'coop' | 'flock' | 'customer' | 'stockItem'
  entities?: Entity[]
  entityParamName?: string // URL param name, default = entityType
}
⋮----
entityParamName?: string // URL param name, default = entityType
⋮----
function buildUrl(updates: Record<string, string>)
````

## File: components/layout/bottom-nav.tsx
````typescript
// client: needs usePathname for active state + drawer trigger
⋮----
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Egg, Package, Heart, FileText, Menu } from 'lucide-react'
⋮----
interface Props {
  onMoreClick: () => void
  isMoreOpen: boolean
}
````

## File: components/layout/version-badge.tsx
````typescript
import Link from 'next/link'
import { CURRENT_VERSION } from '@/lib/changelog/data'
````

## File: components/ui/tabs.tsx
````typescript
// client: tab state managed with React context
⋮----
import { cn } from '@/lib/utils'
⋮----
interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}
⋮----
function useTabs()
⋮----
interface TabsProps {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}
⋮----
function Tabs(
⋮----
function handleChange(v: string)
⋮----
function TabsList(
⋮----
className=
⋮----
function TabsTrigger(
⋮----
function TabsContent(
⋮----
return <div className=
````

## File: lib/actions/app-settings.actions.ts
````typescript
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getRequiredSession, requirePermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { saveAppSetting } from '@/lib/services/app-settings.service'
⋮----
export async function updateAlertSettings(formData: FormData): Promise<void>
⋮----
type ActionResult = { success: true } | { success: false; error: string }
⋮----
export async function saveWaTemplateAction(formData: FormData): Promise<ActionResult>
````

## File: lib/actions/cash.actions.ts
````typescript
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getRequiredSession, requirePermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import {
  createTransaction,
  createTransfer,
  createAccount,
  updateAccountSettings,
} from '@/lib/services/cash.service'
⋮----
import { countTransactionsByAccount } from '@/lib/db/queries/cash-account.queries'
⋮----
type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string }
⋮----
// ── Schemas ──────────────────────────────────────────────────
⋮----
function maxDate()
⋮----
// ── Actions ───────────────────────────────────────────────────
⋮----
export async function createTransactionAction(
  formData: FormData
): Promise<ActionResult<
⋮----
export async function createTransferAction(
  formData: FormData
): Promise<ActionResult<
⋮----
export async function createAccountAction(
  formData: FormData
): Promise<ActionResult<
⋮----
export async function updateAccountAction(
  formData: FormData
): Promise<ActionResult>
⋮----
export async function createCategoryAction(
  formData: FormData
): Promise<ActionResult<
⋮----
export async function updateCategoryAction(
  formData: FormData
): Promise<ActionResult>
````

## File: lib/actions/coop.actions.ts
````typescript
import { z } from 'zod'
import { getRequiredSession, requirePermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { createCoop, getAllCoops, updateCoop, deactivateCoop, activateCoop } from '@/lib/services/coop.service'
⋮----
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
⋮----
export async function createCoopAction(formData: FormData): Promise<ActionResult<
⋮----
export async function updateCoopAction(id: string, formData: FormData): Promise<ActionResult>
⋮----
export async function deactivateCoopAction(id: string): Promise<ActionResult>
⋮----
export async function activateCoopAction(id: string): Promise<ActionResult>
⋮----
export async function getCoopsAction(): Promise<ActionResult<Awaited<ReturnType<typeof getAllCoops>>>>
````

## File: lib/actions/customer.actions.ts
````typescript
import { z } from 'zod'
import { getRequiredSession, requirePermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import {
  createCustomer,
  getAllCustomers,
  updateCustomerById,
  deactivateCustomer,
  activateCustomer,
} from '@/lib/services/customer.service'
⋮----
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
⋮----
export async function createCustomerAction(formData: FormData): Promise<ActionResult<
⋮----
export async function updateCustomerAction(id: string, formData: FormData): Promise<ActionResult>
⋮----
export async function deactivateCustomerAction(id: string): Promise<ActionResult>
⋮----
export async function activateCustomerAction(id: string): Promise<ActionResult>
⋮----
export async function getCustomersAction(): Promise<ActionResult<Awaited<ReturnType<typeof getAllCustomers>>>>
````

## File: lib/actions/daily-record.actions.ts
````typescript
import { z } from 'zod'
import { getRequiredSession } from '@/lib/auth/guards'
import { saveDailyRecord, getFlockOptionsForInput, type Role } from '@/lib/services/daily-record.service'
import { findAssignedCoopIds } from '@/lib/db/queries/user-coop-assignment.queries'
import { findFlockById } from '@/lib/db/queries/flock.queries'
⋮----
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
⋮----
async function assertCoopAccess(farmSchema: string, userId: string, role: string, flockId: string): Promise<
⋮----
export async function saveDailyRecordAction(
  data: unknown
): Promise<ActionResult<
⋮----
export async function getFlockOptionsForInputAction(): Promise<ActionResult<import('@/lib/services/daily-record.service').FlockOption[]>>
````

## File: lib/actions/flock-delivery.actions.ts
````typescript
import { z } from 'zod'
import { getRequiredSession, requirePermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { createFlockDelivery } from '@/lib/services/flock-delivery.service'
⋮----
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
⋮----
export async function createFlockDeliveryAction(formData: FormData): Promise<ActionResult<
````

## File: lib/actions/flock-phase.actions.ts
````typescript
import { z } from 'zod'
import { getRequiredSession, requirePermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import {
  createFlockPhase,
  updateFlockPhaseById,
  deleteFlockPhaseById,
} from '@/lib/services/flock-phase.service'
import { revalidateTag } from 'next/cache'
⋮----
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
⋮----
export async function createFlockPhaseAction(formData: FormData): Promise<ActionResult>
⋮----
export async function updateFlockPhaseAction(id: string, formData: FormData): Promise<ActionResult>
⋮----
export async function deleteFlockPhaseAction(id: string): Promise<ActionResult>
````

## File: lib/actions/flock.actions.ts
````typescript
import { z } from 'zod'
import { getRequiredSession, requirePermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import {
  getAllActiveFlocks,
  createFlock,
  retireFlock,
} from '@/lib/services/flock.service'
⋮----
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
⋮----
export async function createFlockAction(formData: FormData): Promise<ActionResult<
⋮----
export async function retireFlockAction(flockId: string): Promise<ActionResult>
⋮----
export async function getActiveFlocksAction(): Promise<ActionResult<Awaited<ReturnType<typeof getAllActiveFlocks>>>>
````

## File: lib/actions/invoice.actions.ts
````typescript
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getRequiredSession, requirePermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { recordPayment, applyCredit, getInvoiceForPdf, markInvoiceSent } from '@/lib/services/invoice.service'
import { sendInvoiceEmail } from '@/lib/services/email.service'
import { InvoicePdfDocument } from '@/components/pdf/invoice-pdf-document'
⋮----
type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string }
⋮----
export async function recordPaymentAction(
  formData: FormData
): Promise<ActionResult<
⋮----
export async function applyCreditAction(
  invoiceId: string,
  creditId: string,
  amount: number
): Promise<ActionResult>
⋮----
export async function sendInvoiceEmailAction(invoiceId: string): Promise<ActionResult>
⋮----
// any: renderToBuffer expects ReactElement<DocumentProps> but InvoicePdfDocument
// returns a <Document> wrapper — the runtime shape is correct, cast is safe.
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
````

## File: lib/actions/lock-period.actions.ts
````typescript
import { z } from 'zod'
import { getRequiredSession } from '@/lib/auth/guards'
// no requirePermission needed — uses session.isAdmin directly
import { correctDailyRecord } from '@/lib/services/lock-period.service'
import { findCorrectionsByEntity } from '@/lib/db/queries/correction-record.queries'
import type { CorrectionRecordWithUser } from '@/lib/db/queries/correction-record.queries'
⋮----
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
⋮----
export async function correctDailyRecordAction(
  formData: FormData
): Promise<ActionResult<
⋮----
export async function getCorrectionHistoryAction(
  entityId: string
): Promise<ActionResult<CorrectionRecordWithUser[]>>
````

## File: lib/actions/notification.actions.ts
````typescript
import { getRequiredSession } from '@/lib/auth/guards'
import {
  getNotificationsForRole,
  getUnreadCount,
  readNotification,
  readAllNotifications,
} from '@/lib/services/notification.service'
import type { Notification } from '@/lib/services/notification.service'
⋮----
type NotificationRole = 'operator' | 'supervisor' | 'admin'
⋮----
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
⋮----
export async function getNotificationsAction(): Promise<ActionResult<Notification[]>>
⋮----
export async function getUnreadCountAction(): Promise<ActionResult<number>>
⋮----
export async function markNotificationReadAction(
  notificationId: string
): Promise<ActionResult>
⋮----
export async function markAllNotificationsReadAction(): Promise<ActionResult>
````

## File: lib/actions/profil.actions.ts
````typescript
import { z } from 'zod'
import { getRequiredSession } from '@/lib/auth/guards'
import { updateInfoAkunService, gantiPasswordService } from '@/lib/services/profil.service'
⋮----
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
⋮----
export async function updateInfoAkunAction(
  formData: FormData
): Promise<ActionResult<
⋮----
export async function gantiPasswordAction(
  formData: FormData
): Promise<ActionResult>
````

## File: lib/actions/sales-order.actions.ts
````typescript
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getRequiredSession, requirePermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import {
  createDraftSO,
  confirmSO,
  cancelSO,
  deleteDraftSO,
  fulfillSO,
} from '@/lib/services/sales-order.service'
⋮----
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }
⋮----
export async function createDraftSOAction(formData: FormData): Promise<ActionResult<
⋮----
// Parse items array from FormData
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let items: any[] // any: raw JSON from FormData, validated by zod immediately after
⋮----
export async function confirmSOAction(orderId: string): Promise<ActionResult<undefined>>
⋮----
export async function cancelSOAction(orderId: string): Promise<ActionResult<undefined>>
⋮----
export async function deleteDraftSOAction(orderId: string): Promise<ActionResult<undefined>>
⋮----
export async function fulfillSOAction(orderId: string): Promise<ActionResult<undefined>>
````

## File: lib/actions/sales-return.actions.ts
````typescript
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getRequiredSession, requirePermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import {
  createSalesReturn,
  approveSalesReturn,
  rejectSalesReturn,
} from '@/lib/services/sales-return.service'
⋮----
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }
⋮----
export async function createSalesReturnAction(formData: FormData): Promise<ActionResult<
⋮----
// Parse items array from FormData
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let items: any[] // any: raw JSON from FormData, validated by zod immediately after
⋮----
export async function approveSalesReturnAction(returnId: string): Promise<ActionResult<undefined>>
⋮----
export async function rejectSalesReturnAction(returnId: string): Promise<ActionResult<undefined>>
````

## File: lib/actions/stock-catalog.actions.ts
````typescript
import { z } from 'zod'
import { getRequiredSession, requirePermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import {
  createCategory,
  createStockItem,
  toggleStockItemActive,
} from '@/lib/services/stock-catalog.service'
⋮----
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
⋮----
export async function createCategoryAction(
  formData: FormData
): Promise<ActionResult<
⋮----
export async function createStockItemAction(
  formData: FormData
): Promise<ActionResult<
⋮----
export async function toggleStockItemActiveAction(
  itemId: string
): Promise<ActionResult>
````

## File: lib/actions/stock.actions.ts
````typescript
import { z } from 'zod'
import { getRequiredSession, requirePermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import {
  getStockBalance,
  getAllStockBalances,
  createStockAdjustment,
  submitRegradeRequest,
  approveRegradeRequest,
  rejectRegradeRequest,
  createStockPurchase,
  type StockBalance,
} from '@/lib/services/stock.service'
⋮----
type StockRole = 'operator' | 'supervisor' | 'admin'
⋮----
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
⋮----
export async function getStockBalanceAction(
  stockItemId: string
): Promise<ActionResult<number>>
⋮----
export async function getAllStockBalancesAction(): Promise<ActionResult<StockBalance[]>>
⋮----
export async function createStockAdjustmentAction(
  formData: FormData
): Promise<ActionResult<
⋮----
export async function submitRegradeRequestAction(
  formData: FormData
): Promise<ActionResult<
⋮----
export async function approveRegradeRequestAction(
  requestId: string
): Promise<ActionResult>
⋮----
export async function rejectRegradeRequestAction(
  requestId: string
): Promise<ActionResult>
⋮----
export async function createStockPurchaseAction(
  formData: FormData
): Promise<ActionResult>
````

## File: lib/actions/user-coop-assignment.actions.ts
````typescript
import { getRequiredSession, requirePermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import {
  findAssignmentsByUser,
  findAssignedCoopIds,
  insertAssignment,
  deleteAssignment,
} from '@/lib/db/queries/user-coop-assignment.queries'
⋮----
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
⋮----
export async function getAssignmentsForUserAction(
  userId: string
): Promise<ActionResult<Awaited<ReturnType<typeof findAssignmentsByUser>>>>
⋮----
export async function getAssignedCoopIdsAction(userId: string): Promise<string[]>
⋮----
// User bisa lihat coop assignment mereka sendiri; admin bisa lihat semua
⋮----
export async function assignCoopToUserAction(userId: string, coopId: string): Promise<ActionResult>
⋮----
export async function removeCoopFromUserAction(userId: string, coopId: string): Promise<ActionResult>
````

## File: lib/auth/guards.ts
````typescript
import { getSession } from './get-session'
import type { SessionUser } from './get-session'
import type { PermissionKey } from './permissions'
⋮----
type GuardFailure = { success: false; error: string }
⋮----
export async function requireAuth(): Promise<GuardFailure | null>
⋮----
export function hasPermission(session: SessionUser, key: PermissionKey): boolean
⋮----
export function requirePermission(session: SessionUser, key: PermissionKey): GuardFailure | null
⋮----
// Helper: get session and fail fast if not authenticated
export async function getRequiredSession(): Promise<SessionUser | GuardFailure>
⋮----
/** @deprecated Use requirePermission() instead. Will be removed in Task 6. */
export async function requireSupervisorOrAdmin(): Promise<GuardFailure | null>
⋮----
/** @deprecated Use requirePermission() instead. Will be removed in Task 6. */
export async function requireAdmin(): Promise<GuardFailure | null>
````

## File: lib/changelog/index.ts
````typescript

````

## File: lib/db/queries/cash-transaction.queries.ts
````typescript
import { db, DrizzleTx } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, and, desc, gte, lte, lt, sql, getTableColumns } from 'drizzle-orm'
⋮----
export type TransactionFilter = {
  accountId?: string
  type?: 'in' | 'out' | 'transfer_in' | 'transfer_out'
  categoryId?: string
  dateFrom?: Date
  dateTo?: Date
  limit?: number
  offset?: number
}
⋮----
export async function listTransactions(farmSchema: string, filter: TransactionFilter =
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Drizzle enum type inference
⋮----
export async function insertTransaction(
  farmSchema: string,
  input: {
    accountId: string
    type: 'in' | 'out' | 'transfer_in' | 'transfer_out'
    amount: string
    transactionDate: Date
    categoryId?: string | null
    referenceNumber?: string | null
    description?: string | null
    transferRefId?: string | null
    sourceType?: string | null
    sourceId?: string | null
    createdBy: string
  },
  tx?: DrizzleTx
)
⋮----
export async function updateTransferRefId(
  farmSchema: string,
  id: string,
  transferRefId: string,
  tx?: DrizzleTx
)
⋮----
export type DailyReportRow = {
  transactionDate: string
  beginningBalance: number
  totalIn: number
  totalOut: number
  endingBalance: number
}
⋮----
export async function getDailyReport(
  farmSchema: string,
  accountId: string,
  dateFrom: Date,
  dateTo: Date
): Promise<DailyReportRow[]>
````

## File: lib/db/queries/coop.queries.ts
````typescript
import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, sql, isNull, sum } from 'drizzle-orm'
⋮----
export async function findAllCoops(farmSchema: string)
⋮----
export async function findCoopById(farmSchema: string, id: string)
⋮----
// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function insertCoop(farmSchema: string, data: any)
⋮----
// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateCoop(farmSchema: string, id: string, data: any)
⋮----
export async function deleteCoop(farmSchema: string, id: string): Promise<void>
⋮----
export type CoopWithPopulation = {
  id: string
  name: string
  capacity: number | null
  status: 'active' | 'inactive'
  notes: string | null
  createdAt: Date
  updatedAt: Date | null
  livePopulation: number
  activeFlock: { name: string; docDate: Date } | null
}
⋮----
export async function findAllCoopsWithPopulation(farmSchema: string): Promise<CoopWithPopulation[]>
````

## File: lib/db/queries/flock.queries.ts
````typescript
import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, isNull, and } from 'drizzle-orm'
⋮----
export async function findAllActiveFlocks(farmSchema: string)
⋮----
export async function findAllFlocks(farmSchema: string)
⋮----
export async function findFlockById(farmSchema: string, id: string)
⋮----
// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function insertFlock(farmSchema: string, data: any)
⋮----
// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateFlock(farmSchema: string, id: string, data: any)
⋮----
export async function findActiveFlockByCoopId(farmSchema: string, coopId: string)
````

## File: lib/db/queries/invoice.queries.ts
````typescript
import { db, DrizzleTx } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, and, asc, desc, count, getTableColumns, sql, inArray } from 'drizzle-orm'
⋮----
export type AgingBucket = '0-7' | '8-14' | '15-30' | '>30'
⋮----
export type AgingRow = {
  invoiceId: string
  invoiceNumber: string
  customerId: string
  customerName: string
  issueDate: string
  dueDate: string
  totalAmount: number
  paidAmount: number
  outstanding: number
  daysOverdue: number
  bucket: AgingBucket
}
⋮----
export async function countInvoicesThisMonth(farmSchema: string, prefix: string): Promise<number>
⋮----
export async function findInvoiceByOrderId(farmSchema: string, orderId: string)
⋮----
export async function listInvoices(
  farmSchema: string,
  page: number = 1,
  pageSize: number = 20,
  status?: string,
  customerId?: string
)
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
export async function getInvoiceWithDetails(farmSchema: string, id: string)
⋮----
// Query 1: invoice + customer join + SO join
⋮----
// Query 2: all payments for this invoice
⋮----
// Query 3: available customer credits (amount > usedAmount)
⋮----
export type InvoiceDetails = NonNullable<Awaited<ReturnType<typeof getInvoiceWithDetails>>>
⋮----
export async function updateInvoiceStatus(
  farmSchema: string,
  id: string,
  status: string,
  tx?: DrizzleTx
): Promise<void>
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
export async function updateInvoicePaidAmount(
  farmSchema: string,
  id: string,
  paidAmount: number,
  tx?: DrizzleTx
): Promise<void>
⋮----
export async function getOverdueInvoices(farmSchema: string)
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
export async function updateInvoicePdfInfo(farmSchema: string, id: string, pdfUrl: string, pdfGeneratedAt: Date): Promise<void>
⋮----
export async function getAgingReport(farmSchema: string): Promise<AgingRow[]>
````

## File: lib/db/queries/profil.queries.ts
````typescript
import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq } from 'drizzle-orm'
⋮----
export async function getUserProfil(farmSchema: string, userId: string)
⋮----
export async function updateUserProfil(
  farmSchema: string,
  userId: string,
  data: { fullName: string; phone: string | null }
)
````

## File: lib/db/queries/roles.queries.ts
````typescript
import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, and, desc, asc, count } from 'drizzle-orm'
⋮----
export async function getRoles(farmSchema: string)
⋮----
export async function getRoleById(farmSchema: string, roleId: string)
⋮----
export async function getRolePermissions(farmSchema: string, roleId: string): Promise<string[]>
⋮----
export async function getUserRolePermissions(
  farmSchema: string,
  userId: string
): Promise<
⋮----
export async function getRoleUserCount(farmSchema: string, roleId: string): Promise<number>
⋮----
export async function createRoleQuery(
  farmSchema: string,
  data: { name: string; displayName: string; createdBy: string }
)
⋮----
export async function updateRoleQuery(
  farmSchema: string,
  roleId: string,
  data: { displayName: string }
)
⋮----
export async function deleteRoleQuery(farmSchema: string, roleId: string)
⋮----
export async function upsertRolePermission(
  farmSchema: string,
  roleId: string,
  permissionKey: string,
  grantedBy: string
)
⋮----
export async function deleteRolePermission(
  farmSchema: string,
  roleId: string,
  permissionKey: string
)
⋮----
export async function deleteAllRolePermissions(farmSchema: string, roleId: string)
````

## File: lib/db/schema/cash-transaction.ts
````typescript
import { pgTable, uuid, text, numeric, date, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { cashAccounts } from './cash-account'
import { cashCategories } from './cash-category'
import { users } from './users'
⋮----
transferRefId: uuid('transfer_ref_id'), // self-ref — set after both rows inserted
sourceType: text('source_type'), // 'invoice'|'sales_order'|null — integration hook
⋮----
export type CashTransaction = typeof cashTransactions.$inferSelect
export type NewCashTransaction = typeof cashTransactions.$inferInsert
````

## File: lib/db/schema/flock-deliveries.ts
````typescript
import { pgTable, uuid, date, integer, text, timestamp } from 'drizzle-orm/pg-core'
import { flocks } from './flocks'
import { users } from './users'
⋮----
export type FlockDelivery = typeof flockDeliveries.$inferSelect
export type NewFlockDelivery = typeof flockDeliveries.$inferInsert
````

## File: lib/db/schema/flocks.ts
````typescript
import { pgTable, uuid, text, date, timestamp, boolean } from 'drizzle-orm/pg-core'
import { coops } from './coops'
import { users } from './users'
⋮----
export type Flock = typeof flocks.$inferSelect
export type NewFlock = typeof flocks.$inferInsert
````

## File: lib/db/schema/index.ts
````typescript

````

## File: lib/db/schema/invoices.ts
````typescript
import { pgTable, uuid, text, numeric, date, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { salesOrders } from './sales-orders'
import { salesReturns } from './sales-returns'
import { customers } from './customers'
import { users } from './users'
⋮----
export type Invoice = typeof invoices.$inferSelect
export type NewInvoice = typeof invoices.$inferInsert
````

## File: lib/db/schema/payments.ts
````typescript
import { pgTable, uuid, text, numeric, date, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { invoices } from './invoices'
import { users } from './users'
⋮----
export type Payment = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert
````

## File: lib/db/schema/role-permissions.ts
````typescript
import { pgTable, uuid, text, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { roles } from './roles'
⋮----
export type RolePermission = typeof rolePermissions.$inferSelect
export type NewRolePermission = typeof rolePermissions.$inferInsert
````

## File: lib/db/schema/roles.ts
````typescript
import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'
⋮----
export type Role = typeof roles.$inferSelect
export type NewRole = typeof roles.$inferInsert
````

## File: lib/db/schema/sales-orders.ts
````typescript
import { pgTable, uuid, text, numeric, date, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { customers } from './customers'
import { users } from './users'
⋮----
export type SalesOrder = typeof salesOrders.$inferSelect
export type NewSalesOrder = typeof salesOrders.$inferInsert
````

## File: lib/db/schema/sales-returns.ts
````typescript
import { pgTable, uuid, text, date, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { salesOrders } from './sales-orders'
import { customers } from './customers'
import { users } from './users'
⋮----
export type SalesReturn = typeof salesReturns.$inferSelect
export type NewSalesReturn = typeof salesReturns.$inferInsert
````

## File: lib/services/alert.service.ts
````typescript
/**
 * Alert Service — Sprint 7
 * Evaluates all alert conditions and creates notifications with dedup cooldowns.
 * Called by the pg_cron webhook at 06:00 WIB (23:00 UTC).
 */
⋮----
import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, isNull, desc, and, lte, sql, inArray } from 'drizzle-orm'
// sql is used in checkDepletionAlerts aggregation
import { getAppSetting } from '@/lib/services/app-settings.service'
import { findActiveCooldown, upsertCooldown } from '@/lib/db/queries/alert-cooldown.queries'
import { createNotification } from '@/lib/db/queries/notification.queries'
import { getPhaseForWeeks } from '@/lib/services/flock-phase.service'
import { getAllStockBalances } from '@/lib/db/queries/inventory.queries'
import { sumDeliveriesQuantityByFlockId } from '@/lib/db/queries/flock-delivery.queries'
⋮----
// ─── helpers ──────────────────────────────────────────────────────────────────
⋮----
function daysSince(date: Date): number
⋮----
function weeksOld(arrivalDate: Date): number
⋮----
async function getNumericSetting(farmSchema: string, key: string, fallback: number): Promise<number>
⋮----
async function getTotalEggsForRecord(farmSchema: string, dailyRecordId: string): Promise<number>
⋮----
async function getTotalFeedKgForRecord(farmSchema: string, dailyRecordId: string): Promise<number>
⋮----
// ─── alert conditions ─────────────────────────────────────────────────────────
⋮----
/**
 * Phase change alert — fires once per phase per flock, no repeat.
 * Dedup key: alert_cooldowns with alertType = 'phase_change:<phaseName>'
 */
async function checkPhaseChangeAlerts(farmSchema: string): Promise<void>
⋮----
// Cooldown = unlimited (never fire same phase again for same flock)
⋮----
/**
 * HDP drop alert — fires if today's HDP dropped > threshold% vs yesterday.
 * Cooldown: 24h per flock.
 */
async function checkHdpDropAlerts(farmSchema: string, hdpDropThreshold: number): Promise<void>
⋮----
// Use live population (initialCount - cumulative deaths - culls) as denominator
⋮----
/**
 * Daily depletion alert — fires if deaths+culled > threshold% of population.
 * Cooldown: 24h per flock.
 */
async function checkDepletionAlerts(farmSchema: string, depletionThreshold: number): Promise<void>
⋮----
// Compute current population
⋮----
/**
 * FCR alert — fires if FCR > threshold.
 * Cooldown: 24h per flock.
 */
async function checkFcrAlerts(farmSchema: string, fcrThreshold: number): Promise<void>
⋮----
/**
 * Invoice overdue alert — fires every day an invoice is overdue (no cooldown).
 */
async function checkOverdueInvoiceAlerts(farmSchema: string, overdueDelayDays: number): Promise<void>
⋮----
// No cooldown — fires daily
⋮----
/**
 * Stock overstock alert — fires if total Telur stock > threshold.
 * Cooldown: 24h (fixed entity id '00000000-0000-0000-0000-000000000001').
 */
async function checkStockAlerts(farmSchema: string, threshold: number): Promise<void>
⋮----
// ─── main entry ───────────────────────────────────────────────────────────────
⋮----
/**
 * runDailyAlerts — called by the pg_cron webhook API route.
 * Evaluates all alert conditions in sequence.
 */
export async function runDailyAlerts(farmSchema: string): Promise<void>
⋮----
// Run sequentially to avoid DB contention
````

## File: lib/services/coop.service.ts
````typescript
import {
  findAllCoops,
  findCoopById,
  insertCoop,
  updateCoop as dbUpdateCoop,
  findAllCoopsWithPopulation,
} from '@/lib/db/queries/coop.queries'
⋮----
import type { Coop } from '@/lib/db/schema'
⋮----
type CreateCoopInput = {
  name: string
  capacity?: number
  notes?: string
}
⋮----
export async function createCoop(farmSchema: string, input: CreateCoopInput): Promise<Coop>
⋮----
export async function getAllCoops(farmSchema: string): Promise<Coop[]>
⋮----
export async function getAllCoopsWithPopulation(farmSchema: string)
⋮----
export async function getCoopById(farmSchema: string, id: string): Promise<Coop | null>
⋮----
export async function updateCoop(farmSchema: string, id: string, input: Partial<CreateCoopInput>): Promise<Coop | null>
⋮----
export async function deactivateCoop(farmSchema: string, id: string): Promise<void>
⋮----
export async function activateCoop(farmSchema: string, id: string): Promise<void>
````

## File: lib/services/daily-record.service.test.ts
````typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
⋮----
assertCanEdit: vi.fn(), // no-op by default
⋮----
import {
  validateBackdate,
  computeIsLateInput,
  computeActivePopulation,
  saveDailyRecord,
  getProductionReportData,
} from './daily-record.service'
⋮----
// activePopulation = 1000 - (5 + 2) = 993
⋮----
// KPI aggregates
⋮----
vi.mocked(flockQueries.findFlockById).mockResolvedValue({ id: 'f1', initialCount: 5000 } as any) // any: partial mock
⋮----
vi.mocked(queries.upsertDailyRecordTx).mockResolvedValue({ id: 'dr-1' } as any) // any: partial mock
````

## File: lib/services/flock-delivery.service.ts
````typescript
import { insertFlockDelivery, findDeliveriesByFlockId } from '@/lib/db/queries/flock-delivery.queries'
import { findFlockById } from '@/lib/db/queries/flock.queries'
import { findAssignedCoopIds } from '@/lib/db/queries/user-coop-assignment.queries'
import type { FlockDelivery } from '@/lib/db/schema'
⋮----
type CreateFlockDeliveryInput = {
  flockId: string
  deliveryDate: Date
  quantity: number
  ageAtArrivalDays?: number
  notes?: string
  createdBy: string
}
⋮----
export async function createFlockDelivery(
  farmSchema: string,
  input: CreateFlockDeliveryInput,
  callerRole?: 'operator' | 'supervisor' | 'admin'
): Promise<FlockDelivery>
⋮----
export async function getDeliveriesByFlockId(farmSchema: string, flockId: string): Promise<FlockDelivery[]>
````

## File: lib/services/invoice.service.ts
````typescript
import { findSalesOrderItems } from '@/lib/db/queries/sales-order.queries'
import { db } from '@/lib/db'
import type { InvoiceDetails, AgingRow } from '@/lib/db/queries/invoice.queries'
import type { Invoice, SalesOrderItem } from '@/lib/db/schema'
⋮----
export async function getInvoiceDetails(farmSchema: string, id: string): Promise<InvoiceDetails>
⋮----
type RecordPaymentInput = {
  amount: number
  method: 'cash' | 'transfer' | 'cheque' | 'credit'
  referenceNumber?: string
  paymentDate: Date
}
⋮----
export async function recordPayment(
  farmSchema: string,
  invoiceId: string,
  input: RecordPaymentInput,
  userId: string
): Promise<
⋮----
export async function applyCredit(
  farmSchema: string,
  invoiceId: string,
  creditId: string,
  amount: number,
  userId: string
): Promise<void>
⋮----
// Pre-validation outside transaction (fast fail)
⋮----
// Re-check inside transaction to prevent TOCTOU race
⋮----
export async function getAgingData(farmSchema: string): Promise<AgingRow[]>
⋮----
export async function savePdfMetadata(farmSchema: string, id: string, pdfUrl: string, pdfGeneratedAt: Date): Promise<void>
⋮----
export async function getInvoiceForPdf(
  farmSchema: string,
  id: string
): Promise<InvoiceDetails &
⋮----
export async function markInvoiceSent(farmSchema: string, id: string): Promise<void>
````

## File: lib/services/profil.service.test.ts
````typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
⋮----
import { updateInfoAkunService, gantiPasswordService } from './profil.service'
⋮----
vi.mocked(profilQueries.updateUserProfil).mockResolvedValue(mockUpdated as any) // any: partial user row for mock
⋮----
vi.mocked(profilQueries.updateUserProfil).mockResolvedValue(null as any) // any: simulating null return
⋮----
} as any) // any: partial SupabaseClient for mock
⋮----
} as any) // any: partial SupabaseClient for mock
⋮----
} as any) // any: partial ServiceClient for mock
⋮----
} as any) // any: partial SupabaseClient for mock
⋮----
} as any) // any: partial ServiceClient for mock
````

## File: lib/services/stock.service.ts
````typescript
import {
  getStockBalance as _getStockBalance,
  getAllStockBalances as _getAllStockBalances,
  insertInventoryMovement,
  insertStockAdjustmentWithMovement,
  findPendingRegradeRequests,
  findRegradeRequestById,
  insertRegradeRequest,
  updateRegradeRequestStatus,
  approveRegradeRequestTx,
  type StockBalance,
} from '@/lib/db/queries/inventory.queries'
import { assertCanEdit } from '@/lib/services/lock-period.service'
import type { StockAdjustment, RegradeRequest } from '@/lib/db/schema'
⋮----
type Role = 'operator' | 'supervisor' | 'admin'
⋮----
export async function getStockBalance(farmSchema: string, stockItemId: string): Promise<number>
⋮----
export async function getAllStockBalances(farmSchema: string): Promise<StockBalance[]>
⋮----
export function validateStockNotBelowZero(currentBalance: number, quantity: number): void
⋮----
type AdjustmentInput = {
  stockItemId: string
  adjustmentDate: string // YYYY-MM-DD
  quantity: number // signed
  reason: string
  notes?: string
}
⋮----
adjustmentDate: string // YYYY-MM-DD
quantity: number // signed
⋮----
export async function createStockAdjustment(
  farmSchema: string,
  input: AdjustmentInput,
  userId: string,
  role: Role = 'admin',
  now: Date = new Date()
): Promise<StockAdjustment>
⋮----
// any: farm schema date fields (adjustmentDate: Date) differ from public StockAdjustment (adjustmentDate: string)
⋮----
type RegradeInput = {
  fromItemId: string
  toItemId: string
  quantity: number
  requestDate: string // YYYY-MM-DD
  notes?: string
}
⋮----
requestDate: string // YYYY-MM-DD
⋮----
export async function submitRegradeRequest(
  farmSchema: string,
  input: RegradeInput,
  userId: string
): Promise<RegradeRequest>
⋮----
// any: farm schema date fields (requestDate: Date) differ from public RegradeRequest (requestDate: string)
⋮----
export async function approveRegradeRequest(farmSchema: string, requestId: string, adminId: string): Promise<void>
⋮----
export async function rejectRegradeRequest(farmSchema: string, requestId: string, adminId: string): Promise<void>
⋮----
export async function getPendingRegradeRequests(farmSchema: string): Promise<RegradeRequest[]>
⋮----
// any: farm schema date fields (requestDate: Date) differ from public RegradeRequest (requestDate: string)
⋮----
type StockPurchaseInput = {
  stockItemId: string
  quantity: number
  purchaseDate: string // YYYY-MM-DD
  notes?: string
}
⋮----
purchaseDate: string // YYYY-MM-DD
⋮----
export async function createStockPurchase(
  farmSchema: string,
  input: StockPurchaseInput,
  userId: string
): Promise<void>
````

## File: lib/services/user.service.test.ts
````typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
⋮----
import { supabaseAdmin } from '@/lib/auth/admin'
import { createUser, updateUserRole, deactivateUser, changeUserPassword } from './user.service'
⋮----
} as any) // any: Supabase return type is complex union
⋮----
} as any) // any: Supabase return type is complex union
⋮----
} as any) // any: partial User for mock
⋮----
} as any) // any: Supabase return type is complex union
````

## File: middleware.ts
````typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis/cloudflare'
⋮----
export async function middleware(request: NextRequest)
⋮----
// Rate limit auth endpoints
⋮----
getAll()
setAll(cookiesToSet)
````

## File: scripts/seed-laporan-perms.js
````javascript
// Use session mode pooler port 5432 with options.connection to set search_path
// Alternatively try the direct host
⋮----
async function run()
````

## File: app/(app)/admin/import/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { findAllActiveFlocks } from '@/lib/db/queries/flock.queries'
import { ImportPanel } from './import-panel'
⋮----
export default async function ImportPage()
````

## File: app/(app)/admin/kandang/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAllCoopsWithPopulation } from '@/lib/services/coop.service'
import { CoopManagementClient } from '@/components/forms/coop-management-client'
⋮----
export default async function KandangPage()
````

## File: app/(app)/admin/roles/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { listRoles } from '@/lib/services/role.service'
import { RoleManagementClient } from './RoleManagementClient'
⋮----
export default async function RolesPage()
````

## File: app/(app)/admin/users/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAllUsers, getAllRoles } from '@/lib/services/user.service'
import { UserManagementClient } from '@/components/forms/user-management-client'
⋮----
export default async function UsersPage()
````

## File: app/(app)/kas/page.tsx
````typescript
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { listAccounts, getAccountBalance } from '@/lib/db/queries/cash-account.queries'
import { listTransactions } from '@/lib/db/queries/cash-transaction.queries'
import { Wallet, ArrowUpCircle, ArrowDownCircle, ArrowLeftRight, Plus } from 'lucide-react'
⋮----
function formatRupiah(amount: number)
⋮----
function formatDate(date: Date | string)
⋮----
{/* Header */}
⋮----
{/* Total balance card */}
⋮----
{/* Account cards */}
⋮----
<p className="text-[18px] font-bold" style=
⋮----
{/* Recent transactions */}
⋮----
````

## File: app/(app)/laporan/flock/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getFlockPerformanceData } from '@/lib/services/daily-record.service'
import { LaporanFilter } from '@/components/forms/laporan-filter'
import { KpiCard } from '@/components/ui/kpi-card'
import { findAllActiveFlocks } from '@/lib/db/queries/flock.queries'
⋮----
function toISODate(d: Date)
⋮----
function parseSafe(s: string, d: Date)
````

## File: app/(app)/laporan/keuangan/kas/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getCashFlowReport } from '@/lib/db/queries/kas.queries'
import type { CashFlowReport } from '@/lib/db/queries/kas.queries'
import { LaporanFilter } from '@/components/forms/laporan-filter'
import { KpiCard } from '@/components/ui/kpi-card'
⋮----
function toISODate(d: Date)
⋮----
function parseSafe(s: string, d: Date)
⋮----
function formatRupiah(n: number)
⋮----
// DB error — render empty state
````

## File: app/(app)/laporan/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import {
  Egg, Bird, Package, ShoppingCart, Users, Landmark, ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
⋮----
type ReportCard = {
  href: string
  icon: React.ElementType
  title: string
  description: string
  permissionKey: string
}
````

## File: app/(app)/laporan/penjualan/customer/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getSalesPerCustomerReport } from '@/lib/db/queries/sales-order.queries'
import type { SalesPerCustomerRow } from '@/lib/db/queries/sales-order.queries'
import { listCustomers } from '@/lib/db/queries/customer.queries'
import { LaporanFilter } from '@/components/forms/laporan-filter'
import { KpiCard } from '@/components/ui/kpi-card'
⋮----
function toISODate(d: Date)
⋮----
function parseSafe(s: string, d: Date)
function formatRupiah(n: number)
⋮----
try { customers = await listCustomers(session.farmSchema) } catch { /* empty */ }
⋮----
try { rows = await getSalesPerCustomerReport(session.farmSchema, safeFrom, safeTo, customerId) } catch { /* empty */ }
````

## File: app/(app)/laporan/penjualan/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getSalesReport } from '@/lib/db/queries/sales-order.queries'
import type { SalesReportRow } from '@/lib/db/queries/sales-order.queries'
import { LaporanFilter } from '@/components/forms/laporan-filter'
import { KpiCard } from '@/components/ui/kpi-card'
⋮----
function toISODate(d: Date)
⋮----
function parseSafe(s: string, d: Date)
function formatRupiah(n: number)
⋮----
try { rows = await getSalesReport(session.farmSchema, safeFrom, safeTo) } catch { /* empty */ }
````

## File: app/(app)/laporan/stok/mutasi/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getStockMovementReport, getAllStockBalances } from '@/lib/db/queries/inventory.queries'
import { LaporanFilter } from '@/components/forms/laporan-filter'
⋮----
function toISODate(d: Date)
⋮----
function parseSafe(s: string, d: Date)
⋮----
// movementType is 'in' | 'out'; source carries semantic meaning (production, sale, adjustment, regrade, import, purchase)
````

## File: app/(app)/laporan/stok/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getAllStockBalances } from '@/lib/db/queries/inventory.queries'
import { KpiCard } from '@/components/ui/kpi-card'
⋮----
try { rows = await getAllStockBalances(session.farmSchema) } catch { /* empty state */ }
````

## File: app/(app)/produksi/[id]/edit/page.tsx
````typescript
import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { findDailyRecordById, findDailySubRecordsByRecordId } from '@/lib/db/queries/daily-record.queries'
import { canEdit } from '@/lib/services/lock-period.service'
import { getActiveEggItems, getActiveFeedItems, getActiveVaccineItems } from '@/lib/services/stock-catalog.service'
import { getAllStockBalances } from '@/lib/db/queries/inventory.queries'
import { DailyRecordEditForm } from './edit-form'
⋮----
type Props = { params: Promise<{ id: string }> }
````

## File: app/(app)/produksi/input/page.tsx
````typescript
import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { getFlockOptionsForInput } from '@/lib/services/daily-record.service'
import { getActiveEggItems, getActiveFeedItems, getActiveVaccineItems } from '@/lib/services/stock-catalog.service'
import { getAllStockBalances } from '@/lib/db/queries/inventory.queries'
import { DailyInputForm } from '@/components/forms/daily-input-form'
⋮----
export default async function ProduksiInputPage()
````

## File: app/(app)/stok/regrade/page.tsx
````typescript
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'
import { getActiveEggItems } from '@/lib/services/stock-catalog.service'
import { findPendingRegradeRequests } from '@/lib/db/queries/inventory.queries'
import { submitRegradeRequestAction } from '@/lib/actions/stock.actions'
import Link from 'next/link'
⋮----
async function handleSubmit(formData: FormData)
````

## File: app/(auth)/login/page.tsx
````typescript
import { LoginForm } from '@/components/forms/login-form'
import Image from 'next/image'
⋮----
{/* Logo block */}
⋮----
{/* Login card */}
⋮----
{/* Footer */}
````

## File: app/api/laporan/produksi-csv/route.ts
````typescript
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getProductionReportData } from '@/lib/services/daily-record.service'
import type { Role, ProductionReportResult } from '@/lib/services/daily-record.service'
⋮----
function parseSafeISODate(str: string | null, fallback: Date): string
⋮----
function escapeField(value: string): string
⋮----
export async function GET(request: Request): Promise<Response>
````

## File: app/globals.css
````css
@theme inline {
⋮----
/* Fix iOS auto-zoom: inputs must be >= 16px */
input:not([type="checkbox"]):not([type="radio"]),
⋮----
:root {
⋮----
/* LumichFlock design tokens */
⋮----
/* shadcn vars — mapped to LumichFlock tokens */
⋮----
@layer utilities {
⋮----
.shadow-lf-sm   { box-shadow: 0 1px 4px rgba(45,58,46,0.06), 0 2px 12px rgba(45,58,46,0.04); }
.shadow-lf-md   { box-shadow: 0 2px 8px rgba(45,58,46,0.08), 0 8px 24px rgba(45,58,46,0.06); }
.shadow-lf-btn  { box-shadow: 0 4px 12px rgba(122,173,212,0.35); }
.shadow-lf-logo { box-shadow: 0 4px 16px rgba(122,173,212,0.35); }
.press-feedback {
⋮----
&:active { transform: scale(0.97); filter: brightness(0.93); }
⋮----
@layer base {
⋮----
* {
body {
html {
⋮----
@apply font-sans;
⋮----
.no-print {
aside,
````

## File: components/forms/user-management-client.tsx
````typescript
// client: interactive user table with create form, role change, activate/deactivate
⋮----
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CreateUserForm } from './create-user-form'
import { updateUserRoleAction, activateUserAction, deactivateUserAction } from '@/lib/actions/user.actions'
import type { UserWithRoleSlug } from '@/lib/db/queries/user.queries'
⋮----
type RoleOption = { id: string; name: string; displayName: string; isSystem: boolean }
⋮----
interface Props {
  users: UserWithRoleSlug[]
  roles: RoleOption[]
}
⋮----
async function handleRoleChange(userId: string, newRoleId: string)
⋮----
async function handleToggleActive(user: UserWithRoleSlug)
⋮----
onSuccess=
⋮----
onCancel=
⋮----
onClick=
````

## File: components/profil/info-akun-form.tsx
````typescript
// client: form state, submit handler, isDirty tracking
⋮----
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle2 } from 'lucide-react'
import { updateInfoAkunAction } from '@/lib/actions/profil.actions'
⋮----
function inputClass(saved: boolean)
⋮----
interface Props {
  defaultFullName: string
  defaultPhone: string | null
}
⋮----
function handleChange(setter: (v: string) => void)
⋮----
async function onSubmit(e: React.FormEvent)
⋮----
className=
⋮----
onChange=
````

## File: components/profil/profil-tabs.tsx
````typescript
// client: tab state (shadcn Tabs)
⋮----
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InfoAkunForm } from './info-akun-form'
import { PasswordForm } from './password-form'
⋮----
interface Props {
  defaultFullName: string
  defaultPhone: string | null
}
⋮----
export function ProfilTabs(
````

## File: lib/actions/changelog.actions.ts
````typescript
import { cookies } from 'next/headers'
import { CURRENT_VERSION } from '@/lib/changelog/data'
⋮----
export async function markChangelogSeen(): Promise<
⋮----
httpOnly: false, // intentional: UI-state only, not sensitive
````

## File: lib/actions/import.actions.ts
````typescript
import { getSession } from '@/lib/auth/get-session'
import { requireAdmin } from '@/lib/auth/guards'
import {
  parseDailyRecordsCsv,
  parseCustomersCsv,
  commitImport,
  getCsvTemplate,
  generateDailyRecordsCsvTemplate,
} from '@/lib/services/import.service'
import type { ImportEntity, ParseResult, ParsedRow, ImportResult } from '@/lib/services/import.service'
⋮----
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
⋮----
export async function parseCsvAction(
  entity: ImportEntity,
  csvText: string
  // any: ParseResult generic varies by entity
): Promise<ActionResult<ParseResult<Record<string, unknown>>>>
⋮----
// any: ParseResult generic varies by entity
⋮----
// any: cast for unified return type
⋮----
export async function commitImportAction(
  entity: ImportEntity,
  // any: parsed rows from dynamic parse step
  rows: ParsedRow<Record<string, unknown>>[]
): Promise<ActionResult<ImportResult>>
⋮----
// any: parsed rows from dynamic parse step
⋮----
// requireAdmin() already confirmed session exists — getSession() is safe
⋮----
// Drizzle wraps errors from db.transaction() — walk cause chain for the postgres error
⋮----
export async function getCsvTemplateAction(
  entity: ImportEntity
): Promise<ActionResult<string>>
````

## File: lib/actions/role.actions.ts
````typescript
import { z } from 'zod'
import { getRequiredSession } from '@/lib/auth/guards'
import { requirePermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import {
  listRoles,
  getRoleWithPermissions,
  createRole,
  updateRole,
  deleteRole,
  updatePermission,
  setAllPermissions,
} from '@/lib/services/role.service'
⋮----
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
⋮----
export async function getRolesAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof listRoles>>>
> {
  const session = await getRequiredSession()
  if ('error' in session) return session

  const denied = requirePermission(session, PERMISSIONS.ROLE.MANAGE)
  if (denied) return denied

  try {
    const roles = await listRoles(session.farmSchema)
    return { success: true, data: roles }
} catch (e)
⋮----
export async function getRoleWithPermissionsAction(
  roleId: string
): Promise<
  ActionResult<Awaited<ReturnType<typeof getRoleWithPermissions>>>
> {
  const session = await getRequiredSession()
  if ('error' in session) return session

  const denied = requirePermission(session, PERMISSIONS.ROLE.MANAGE)
  if (denied) return denied

  try {
    const roleWithPermissions = await getRoleWithPermissions(session.farmSchema, roleId)
if (!roleWithPermissions)
⋮----
export async function createRoleAction(
  formData: unknown
): Promise<ActionResult>
⋮----
export async function updateRoleAction(
  roleId: string,
  formData: unknown
): Promise<ActionResult>
⋮----
export async function deleteRoleAction(roleId: string): Promise<ActionResult>
⋮----
export async function updatePermissionAction(
  roleId: string,
  permissionKey: string,
  granted: boolean
): Promise<ActionResult>
⋮----
export async function setAllPermissionsAction(
  roleId: string,
  permissionKeys: string[]
): Promise<ActionResult>
````

## File: lib/actions/user.actions.ts
````typescript
import { z } from 'zod'
import { getRequiredSession, requirePermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import {
  createUser,
  getAllUsers,
  getAllRoles,
  updateUserRole,
  deactivateUser,
  activateUser,
  changeUserPassword,
} from '@/lib/services/user.service'
⋮----
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
⋮----
export async function createUserAction(
  formData: FormData
): Promise<ActionResult<
⋮----
export async function updateUserRoleAction(
  userId: string,
  roleId: string
): Promise<ActionResult>
⋮----
export async function getAllRolesAction(): Promise<ActionResult<Awaited<ReturnType<typeof getAllRoles>>>>
⋮----
export async function deactivateUserAction(userId: string): Promise<ActionResult>
⋮----
export async function activateUserAction(userId: string): Promise<ActionResult>
⋮----
export async function changeUserPasswordAction(
  userId: string,
  newPassword: string
): Promise<ActionResult>
⋮----
export async function getUsersAction(): Promise<ActionResult<Awaited<ReturnType<typeof getAllUsers>>>>
````

## File: lib/changelog/types.ts
````typescript
export type ChangeType = 'feature' | 'fix' | 'improvement' | 'breaking'
⋮----
export type ChangeEntry = {
  type: ChangeType
  text: string
}
⋮----
export type VersionEntry = {
  version: string
  date: string        // ISO "YYYY-MM-DD"
  title: string
changes: ChangeEntry[]
}
⋮----
date: string        // ISO "YYYY-MM-DD"
````

## File: lib/db/farm-template.sql
````sql
-- Farm DDL Template
-- Execute after: SET search_path = "<schema_name>";
-- Creates all operational tables for a single farm schema.
-- Tables "farms" and "farm_users" are NOT included — they live in public schema only.

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE "coop_status" AS ENUM('active', 'inactive');
CREATE TYPE "customer_status" AS ENUM('active', 'inactive', 'blocked');
CREATE TYPE "customer_type" AS ENUM('retail', 'wholesale', 'distributor');
CREATE TYPE "movement_type" AS ENUM('in', 'out');
CREATE TYPE "movement_source" AS ENUM('production', 'sale', 'adjustment', 'regrade', 'import', 'purchase');
CREATE TYPE "movement_source_type" AS ENUM('daily_egg_records', 'daily_feed_records', 'daily_vaccine_records', 'sales_order_items', 'stock_adjustments', 'regrade_requests', 'sales_returns', 'import');
CREATE TYPE "regrade_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "sales_order_status" AS ENUM('draft', 'confirmed', 'fulfilled', 'cancelled');
CREATE TYPE "payment_method" AS ENUM('cash', 'credit');
CREATE TYPE "sales_item_type" AS ENUM('egg_grade_a', 'egg_grade_b', 'flock', 'other');
CREATE TYPE "sales_unit" AS ENUM('butir', 'ekor', 'unit');
CREATE TYPE "sales_return_status" AS ENUM('pending', 'approved', 'rejected');
CREATE TYPE "return_reason_type" AS ENUM('wrong_grade', 'damaged', 'quantity_error', 'other');
CREATE TYPE "invoice_type" AS ENUM('sales_invoice', 'cash_receipt', 'credit_note');
CREATE TYPE "invoice_status" AS ENUM('draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled');
CREATE TYPE "payment_method_type" AS ENUM('cash', 'transfer', 'cheque', 'credit');
CREATE TYPE "credit_source_type" AS ENUM('overpayment', 'credit_note');
CREATE TYPE "correction_entity_type" AS ENUM('daily_records', 'inventory_movements', 'sales_orders');
CREATE TYPE "notification_type" AS ENUM('production_alert', 'overdue_invoice', 'stock_warning', 'phase_change', 'other');
CREATE TYPE "notification_target_role" AS ENUM('operator', 'supervisor', 'admin', 'all');

-- ============================================
-- CORE TABLES
-- ============================================

CREATE TABLE "roles" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "display_name" text NOT NULL,
    "is_system" boolean DEFAULT false NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "created_by" uuid,
    CONSTRAINT "roles_name_unique" UNIQUE("name")
);

CREATE TABLE "role_permissions" (
    "role_id" uuid NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
    "permission_key" text NOT NULL,
    "granted_at" timestamp with time zone DEFAULT now() NOT NULL,
    "granted_by" uuid,
    PRIMARY KEY ("role_id", "permission_key")
);

CREATE TABLE "users" (
    "id" uuid PRIMARY KEY NOT NULL,
    "email" text NOT NULL,
    "full_name" text NOT NULL,
    "phone" text,
    "role_id" uuid NOT NULL REFERENCES "roles"("id"),
    "is_active" boolean DEFAULT true NOT NULL,
    "created_by" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone,
    CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE "coops" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "capacity" integer,
    "status" "coop_status" DEFAULT 'active' NOT NULL,
    "notes" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone,
    CONSTRAINT "coops_name_unique" UNIQUE("name")
);

CREATE TABLE "flock_phases" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "min_weeks" integer NOT NULL,
    "max_weeks" integer,
    "sort_order" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone
);

CREATE TABLE "customers" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "type" "customer_type",
    "phone" text,
    "address" text,
    "email" text,
    "credit_limit" numeric(15, 2) DEFAULT '0' NOT NULL,
    "payment_terms" integer DEFAULT 0 NOT NULL,
    "status" "customer_status" DEFAULT 'active' NOT NULL,
    "notes" text,
    "is_imported" boolean DEFAULT false NOT NULL,
    "imported_by" uuid,
    "created_by" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone
);

CREATE TABLE "flocks" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "coop_id" uuid NOT NULL,
    "name" text NOT NULL,
    "arrival_date" date NOT NULL,
    "doc_date" date NOT NULL,
    "breed" text,
    "notes" text,
    "is_imported" boolean DEFAULT false NOT NULL,
    "imported_by" uuid,
    "retired_at" timestamp with time zone,
    "created_by" uuid,
    "updated_by" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone
);

CREATE TABLE "flock_deliveries" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "flock_id" uuid NOT NULL,
    "delivery_date" date NOT NULL,
    "quantity" integer NOT NULL,
    "age_at_arrival_days" integer,
    "notes" text,
    "created_by" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "user_coop_assignments" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "coop_id" uuid NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "user_coop_assignments_user_id_coop_id_unique" UNIQUE("user_id","coop_id")
);

-- ============================================
-- PRODUCTION TABLES
-- ============================================

CREATE TABLE "daily_records" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "flock_id" uuid NOT NULL,
    "record_date" date NOT NULL,
    "deaths" integer DEFAULT 0 NOT NULL,
    "culled" integer DEFAULT 0 NOT NULL,
    "eggs_cracked" integer DEFAULT 0 NOT NULL,
    "eggs_abnormal" integer DEFAULT 0 NOT NULL,
    "is_late_input" boolean DEFAULT false NOT NULL,
    "notes" text,
    "is_imported" boolean DEFAULT false NOT NULL,
    "imported_by" uuid,
    "created_by" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "daily_egg_records" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "daily_record_id" uuid NOT NULL,
    "stock_item_id" uuid NOT NULL,
    "qty_butir" integer DEFAULT 0 NOT NULL,
    "qty_kg" numeric(8, 2) DEFAULT '0' NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone
);

CREATE TABLE "daily_feed_records" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "daily_record_id" uuid NOT NULL,
    "stock_item_id" uuid NOT NULL,
    "qty_used" numeric(8, 2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone
);

CREATE TABLE "daily_vaccine_records" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "daily_record_id" uuid NOT NULL,
    "stock_item_id" uuid NOT NULL,
    "qty_used" numeric(8, 2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone
);

-- ============================================
-- INVENTORY TABLES
-- ============================================

CREATE TABLE "stock_categories" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "unit" text NOT NULL,
    "is_system" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone,
    CONSTRAINT "stock_categories_name_unique" UNIQUE("name")
);

CREATE TABLE "stock_items" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "category_id" uuid NOT NULL,
    "name" text NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone
);

CREATE TABLE "inventory_movements" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "flock_id" uuid,
    "stock_item_id" uuid NOT NULL,
    "movement_type" "movement_type" NOT NULL,
    "source" "movement_source" NOT NULL,
    "source_type" "movement_source_type",
    "source_id" uuid,
    "quantity" integer NOT NULL,
    "note" text,
    "movement_date" date NOT NULL,
    "is_imported" boolean DEFAULT false NOT NULL,
    "imported_by" uuid,
    "created_by" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "stock_adjustments" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "flock_id" uuid,
    "stock_item_id" uuid NOT NULL,
    "adjustment_date" date NOT NULL,
    "quantity" integer NOT NULL,
    "reason" text NOT NULL,
    "notes" text,
    "created_by" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "regrade_requests" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "from_item_id" uuid NOT NULL,
    "to_item_id" uuid NOT NULL,
    "quantity" integer NOT NULL,
    "status" "regrade_status" DEFAULT 'PENDING' NOT NULL,
    "request_date" date NOT NULL,
    "notes" text,
    "created_by" uuid,
    "reviewed_by" uuid,
    "reviewed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- ============================================
-- SALES TABLES
-- ============================================

CREATE TABLE "sales_orders" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "order_number" text NOT NULL,
    "order_date" date NOT NULL,
    "customer_id" uuid NOT NULL,
    "payment_method" "payment_method" NOT NULL,
    "status" "sales_order_status" DEFAULT 'draft' NOT NULL,
    "tax_pct" numeric(5, 2) DEFAULT '0' NOT NULL,
    "subtotal" numeric(15, 2) NOT NULL,
    "tax_amount" numeric(15, 2) NOT NULL,
    "total_amount" numeric(15, 2) NOT NULL,
    "notes" text,
    "created_by" uuid,
    "updated_by" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone,
    CONSTRAINT "sales_orders_order_number_unique" UNIQUE("order_number")
);

CREATE TABLE "sales_order_items" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "order_id" uuid NOT NULL,
    "item_type" "sales_item_type" NOT NULL,
    "item_ref_id" uuid,
    "description" text,
    "quantity" integer NOT NULL,
    "unit" "sales_unit" NOT NULL,
    "price_per_unit" numeric(15, 2) NOT NULL,
    "discount_pct" numeric(5, 2) DEFAULT '0' NOT NULL,
    "subtotal" numeric(15, 2) NOT NULL
);

CREATE TABLE "sales_returns" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "return_number" text NOT NULL,
    "order_id" uuid NOT NULL,
    "customer_id" uuid NOT NULL,
    "return_date" date NOT NULL,
    "reason_type" "return_reason_type" NOT NULL,
    "notes" text,
    "status" "sales_return_status" DEFAULT 'pending' NOT NULL,
    "submitted_by" uuid,
    "reviewed_by" uuid,
    "reviewed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone,
    CONSTRAINT "sales_returns_return_number_unique" UNIQUE("return_number")
);

CREATE TABLE "sales_return_items" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "return_id" uuid NOT NULL,
    "item_type" "sales_item_type" NOT NULL,
    "item_ref_id" uuid,
    "quantity" integer NOT NULL,
    "unit" "sales_unit" NOT NULL
);

-- ============================================
-- FINANCE TABLES
-- ============================================

CREATE TABLE "invoices" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "invoice_number" text NOT NULL,
    "type" "invoice_type" NOT NULL,
    "order_id" uuid,
    "reference_invoice_id" uuid,
    "return_id" uuid,
    "customer_id" uuid NOT NULL,
    "issue_date" date NOT NULL,
    "due_date" date NOT NULL,
    "total_amount" numeric(15, 2) NOT NULL,
    "paid_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
    "status" "invoice_status" NOT NULL,
    "pdf_url" text,
    "pdf_generated_at" timestamp with time zone,
    "notes" text,
    "created_by" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone,
    CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);

CREATE TABLE "payments" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "invoice_id" uuid NOT NULL,
    "payment_date" date NOT NULL,
    "amount" numeric(15, 2) NOT NULL,
    "method" "payment_method_type" NOT NULL,
    "reference_number" text,
    "created_by" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone
);

CREATE TABLE "customer_credits" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "customer_id" uuid NOT NULL,
    "amount" numeric(15, 2) NOT NULL,
    "source_type" "credit_source_type" NOT NULL,
    "source_payment_id" uuid,
    "source_invoice_id" uuid,
    "used_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
    "notes" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- ============================================
-- KAS (CASH LEDGER) TABLES
-- ============================================

CREATE TYPE "cash_account_type" AS ENUM('cash', 'bank', 'ewallet');
CREATE TYPE "cash_transaction_type" AS ENUM('in', 'out', 'transfer_in', 'transfer_out');
CREATE TYPE "cash_category_type" AS ENUM('in', 'out', 'both');

CREATE TABLE "cash_categories" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "type" "cash_category_type" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE "cash_accounts" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "type" "cash_account_type" NOT NULL,
    "beginning_balance" numeric(15, 2) DEFAULT '0' NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone
);

CREATE TABLE "cash_transactions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "account_id" uuid NOT NULL,
    "type" "cash_transaction_type" NOT NULL,
    "amount" numeric(15, 2) NOT NULL,
    "transaction_date" date NOT NULL,
    "category_id" uuid,
    "reference_number" text,
    "description" text,
    "transfer_ref_id" uuid,
    "source_type" text,
    "source_id" uuid,
    "created_by" uuid NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- ============================================
-- AUDIT / OPERATIONS TABLES
-- ============================================

CREATE TABLE "correction_records" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "entity_type" "correction_entity_type" NOT NULL,
    "entity_id" uuid NOT NULL,
    "field_name" text NOT NULL,
    "old_value" text,
    "new_value" text,
    "reason" text NOT NULL,
    "corrected_by" uuid NOT NULL,
    "corrected_at" timestamp with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "notifications" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "type" "notification_type" NOT NULL,
    "title" text NOT NULL,
    "body" text NOT NULL,
    "target_role" "notification_target_role" NOT NULL,
    "related_entity_type" text,
    "related_entity_id" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "notification_reads" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "notification_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "read_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "alert_cooldowns" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "alert_type" text NOT NULL,
    "entity_type" text NOT NULL,
    "entity_id" uuid NOT NULL,
    "last_sent_at" timestamp with time zone NOT NULL
);

CREATE TABLE "app_settings" (
    "key" text PRIMARY KEY NOT NULL,
    "value" text NOT NULL,
    "updated_by" uuid,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- ============================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================

ALTER TABLE "flocks" ADD CONSTRAINT "flocks_coop_id_coops_id_fk" FOREIGN KEY ("coop_id") REFERENCES "coops"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "flocks" ADD CONSTRAINT "flocks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "flocks" ADD CONSTRAINT "flocks_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "flocks" ADD CONSTRAINT "flocks_imported_by_users_id_fk" FOREIGN KEY ("imported_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "flock_deliveries" ADD CONSTRAINT "flock_deliveries_flock_id_flocks_id_fk" FOREIGN KEY ("flock_id") REFERENCES "flocks"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "flock_deliveries" ADD CONSTRAINT "flock_deliveries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "customers" ADD CONSTRAINT "customers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "customers" ADD CONSTRAINT "customers_imported_by_users_id_fk" FOREIGN KEY ("imported_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "user_coop_assignments" ADD CONSTRAINT "user_coop_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "user_coop_assignments" ADD CONSTRAINT "user_coop_assignments_coop_id_coops_id_fk" FOREIGN KEY ("coop_id") REFERENCES "coops"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "daily_records" ADD CONSTRAINT "daily_records_flock_id_flocks_id_fk" FOREIGN KEY ("flock_id") REFERENCES "flocks"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "daily_records" ADD CONSTRAINT "daily_records_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "daily_records" ADD CONSTRAINT "daily_records_imported_by_users_id_fk" FOREIGN KEY ("imported_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "daily_egg_records" ADD CONSTRAINT "daily_egg_records_daily_record_id_daily_records_id_fk" FOREIGN KEY ("daily_record_id") REFERENCES "daily_records"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "daily_egg_records" ADD CONSTRAINT "daily_egg_records_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "stock_items"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "daily_feed_records" ADD CONSTRAINT "daily_feed_records_daily_record_id_daily_records_id_fk" FOREIGN KEY ("daily_record_id") REFERENCES "daily_records"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "daily_feed_records" ADD CONSTRAINT "daily_feed_records_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "stock_items"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "daily_vaccine_records" ADD CONSTRAINT "daily_vaccine_records_daily_record_id_daily_records_id_fk" FOREIGN KEY ("daily_record_id") REFERENCES "daily_records"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "daily_vaccine_records" ADD CONSTRAINT "daily_vaccine_records_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "stock_items"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "stock_items" ADD CONSTRAINT "stock_items_category_id_stock_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "stock_categories"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_flock_id_flocks_id_fk" FOREIGN KEY ("flock_id") REFERENCES "flocks"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "stock_items"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_imported_by_users_id_fk" FOREIGN KEY ("imported_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_flock_id_flocks_id_fk" FOREIGN KEY ("flock_id") REFERENCES "flocks"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "stock_items"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "regrade_requests" ADD CONSTRAINT "regrade_requests_from_item_id_stock_items_id_fk" FOREIGN KEY ("from_item_id") REFERENCES "stock_items"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "regrade_requests" ADD CONSTRAINT "regrade_requests_to_item_id_stock_items_id_fk" FOREIGN KEY ("to_item_id") REFERENCES "stock_items"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "regrade_requests" ADD CONSTRAINT "regrade_requests_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "regrade_requests" ADD CONSTRAINT "regrade_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_order_id_sales_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "sales_orders"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "sales_returns" ADD CONSTRAINT "sales_returns_order_id_sales_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "sales_orders"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "sales_returns" ADD CONSTRAINT "sales_returns_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "sales_returns" ADD CONSTRAINT "sales_returns_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "sales_returns" ADD CONSTRAINT "sales_returns_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "sales_return_items" ADD CONSTRAINT "sales_return_items_return_id_sales_returns_id_fk" FOREIGN KEY ("return_id") REFERENCES "sales_returns"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "invoices" ADD CONSTRAINT "invoices_order_id_sales_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "sales_orders"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_return_id_sales_returns_id_fk" FOREIGN KEY ("return_id") REFERENCES "sales_returns"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "payments" ADD CONSTRAINT "payments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "customer_credits" ADD CONSTRAINT "customer_credits_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "customer_credits" ADD CONSTRAINT "customer_credits_source_payment_id_payments_id_fk" FOREIGN KEY ("source_payment_id") REFERENCES "payments"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "customer_credits" ADD CONSTRAINT "customer_credits_source_invoice_id_invoices_id_fk" FOREIGN KEY ("source_invoice_id") REFERENCES "invoices"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "correction_records" ADD CONSTRAINT "correction_records_corrected_by_users_id_fk" FOREIGN KEY ("corrected_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "notification_reads" ADD CONSTRAINT "notification_reads_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "notification_reads" ADD CONSTRAINT "notification_reads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "app_settings" ADD CONSTRAINT "app_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "cash_transactions" ADD CONSTRAINT "cash_transactions_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "cash_accounts"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "cash_transactions" ADD CONSTRAINT "cash_transactions_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "cash_categories"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "cash_transactions" ADD CONSTRAINT "cash_transactions_created_by_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

-- ============================================
-- INDEXES
-- ============================================

CREATE UNIQUE INDEX "daily_records_flock_date_idx" ON "daily_records" USING btree ("flock_id","record_date");
CREATE UNIQUE INDEX "notification_reads_unique" ON "notification_reads" USING btree ("notification_id","user_id");
CREATE UNIQUE INDEX "alert_cooldowns_unique" ON "alert_cooldowns" USING btree ("alert_type","entity_id");
CREATE UNIQUE INDEX "stock_items_category_name_unique" ON "stock_items" USING btree ("category_id","name");
CREATE UNIQUE INDEX "daily_egg_records_record_item_unique" ON "daily_egg_records" USING btree ("daily_record_id","stock_item_id");
CREATE UNIQUE INDEX "daily_feed_records_record_item_unique" ON "daily_feed_records" USING btree ("daily_record_id","stock_item_id");
CREATE UNIQUE INDEX "daily_vaccine_records_record_item_unique" ON "daily_vaccine_records" USING btree ("daily_record_id","stock_item_id");
CREATE UNIQUE INDEX "flocks_one_active_per_coop" ON "flocks" ("coop_id") WHERE "retired_at" IS NULL;
````

## File: lib/db/queries/user.queries.ts
````typescript
import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq } from 'drizzle-orm'
⋮----
export type UserWithRoleSlug = {
  id: string
  email: string
  fullName: string
  roleId: string
  roleSlug: string
  roleName: string
  isActive: boolean
  createdAt: Date
  createdBy: string | null
  updatedAt: Date | null
}
⋮----
export async function findAllUsers(farmSchema: string): Promise<UserWithRoleSlug[]>
⋮----
export async function findUserById(farmSchema: string, id: string)
⋮----
// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function insertUser(farmSchema: string, data: any)
⋮----
// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateUser(farmSchema: string, id: string, data: any)
````

## File: lib/db/schema/users.ts
````typescript
import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'
import { roles } from './roles'
⋮----
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
````

## File: lib/services/cash.service.ts
````typescript
import { db } from '@/lib/db'
import type { TransactionFilter } from '@/lib/db/queries/cash-transaction.queries'
⋮----
export type CreateTransactionInput = {
  accountId: string
  type: 'in' | 'out'
  amount: number
  transactionDate: Date
  categoryId?: string
  referenceNumber?: string
  description?: string
}
⋮----
export type CreateTransferInput = {
  fromAccountId: string
  toAccountId: string
  amount: number
  transactionDate: Date
  referenceNumber?: string
  description?: string
}
⋮----
export async function createTransaction(
  farmSchema: string,
  input: CreateTransactionInput,
  userId: string
)
⋮----
export async function createTransfer(
  farmSchema: string,
  input: CreateTransferInput,
  userId: string
)
⋮----
export async function getAccountWithBalance(farmSchema: string, id: string)
⋮----
export async function listAccountsWithBalances(farmSchema: string)
⋮----
export async function updateAccountSettings(
  farmSchema: string,
  id: string,
  input: { name?: string; type?: 'cash' | 'bank' | 'ewallet'; beginningBalance?: string; isActive?: boolean }
)
⋮----
export async function createAccount(
  farmSchema: string,
  input: { name: string; type: 'cash' | 'bank' | 'ewallet'; beginningBalance?: number }
)
⋮----
export async function getTransactions(farmSchema: string, filter: TransactionFilter)
⋮----
export async function getDailyReport(
  farmSchema: string,
  accountId: string,
  dateFrom: Date,
  dateTo: Date
)
````

## File: lib/services/daily-record.service.ts
````typescript
import {
  findDailyRecord,
  upsertDailyRecordTx,
  getTotalDepletionByFlock,
  getCumulativeDepletionByFlockUpTo,
  getProductionReport,
  getFlockPerformanceReport,
  type FlockPerformanceRow,
} from '@/lib/db/queries/daily-record.queries'
import { getStockBalance } from '@/lib/db/queries/inventory.queries'
import { findAllActiveFlocks, findFlockById } from '@/lib/db/queries/flock.queries'
import { sumDeliveriesQuantityByFlockId } from '@/lib/db/queries/flock-delivery.queries'
import { findAssignedCoopIds } from '@/lib/db/queries/user-coop-assignment.queries'
import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq } from 'drizzle-orm'
import { assertCanEdit } from '@/lib/services/lock-period.service'
import type { DailyRecord } from '@/lib/db/schema'
⋮----
export type Role = 'operator' | 'supervisor' | 'admin'
⋮----
export function validateBackdate(recordDate: Date, now: Date, role: Role): void
⋮----
export function computeIsLateInput(recordDate: Date, submittedAt: Date): boolean
⋮----
export function computeActivePopulation(
  initialCount: number,
  records: { deaths: number; culled: number }[]
): number
⋮----
type EggEntry = { stockItemId: string; qtyButir: number; qtyKg: number }
type FeedEntry = { stockItemId: string; qtyUsed: number }
type VaccineEntry = { stockItemId: string; qtyUsed: number }
⋮----
type SaveDailyRecordInput = {
  flockId: string
  recordDate: string // YYYY-MM-DD
  deaths: number
  culled: number
  eggsCracked: number
  eggsAbnormal: number
  notes?: string
  eggEntries: EggEntry[]
  feedEntries: FeedEntry[]
  vaccineEntries: VaccineEntry[]
}
⋮----
recordDate: string // YYYY-MM-DD
⋮----
export async function saveDailyRecord(
  farmSchema: string,
  input: SaveDailyRecordInput,
  userId: string,
  role: Role,
  now: Date = new Date()
): Promise<DailyRecord>
⋮----
// Validate feed/vaccine stock
⋮----
// any: farm schema returns recordDate as Date; cast to public DailyRecord (string) expected by callers
⋮----
dailyRecordId: '', // will be set in tx
⋮----
// any: farm schema date fields (recordDate: Date) differ from public DailyRecord type (recordDate: string)
⋮----
export type FlockOption = {
  id: string
  name: string
  coopName: string
  totalCount: number
  currentPopulation: number
}
⋮----
export async function getFlockOptionsForInput(farmSchema: string, userId: string, role: Role): Promise<FlockOption[]>
⋮----
export type EnrichedProductionRow = {
  recordDate: string
  coopId: string
  coopName: string
  flockId: string
  flockName: string
  activePopulation: number
  deaths: number
  culled: number
  totalEggsButir: number
  hdp: number
}
⋮----
export type ProductionReportResult = {
  rows: EnrichedProductionRow[]
  kpi: {
    totalDeaths: number
    totalCulled: number
  }
}
⋮----
export async function getProductionReportData(
  farmSchema: string,
  from: string,
  to: string,
  role: Role,
  coopId?: string
): Promise<ProductionReportResult>
⋮----
export async function updateDailyRecordAyam(
  farmSchema: string,
  recordId: string,
  input: { deaths?: number; culled?: number; notes?: string },
  userId: string,
  role: Role,
  now: Date = new Date()
): Promise<DailyRecord>
⋮----
// any: farm schema date fields (recordDate: Date) differ from public DailyRecord type (recordDate: string)
⋮----
export async function getFlockPerformanceData(
  farmSchema: string,
  from: string,
  to: string,
  flockId?: string
): Promise<FlockPerformanceRow[]>
````

## File: lib/services/role.service.ts
````typescript
import { revalidateTag } from 'next/cache'
import {
  getRoles,
  getRoleById,
  getRolePermissions,
  getRoleUserCount,
  createRoleQuery,
  updateRoleQuery,
  deleteRoleQuery,
  upsertRolePermission,
  deleteRolePermission,
  deleteAllRolePermissions,
} from '@/lib/db/queries/roles.queries'
⋮----
export async function listRoles(farmSchema: string)
⋮----
export async function getRoleWithPermissions(
  farmSchema: string,
  roleId: string
): Promise<
⋮----
type CreateRoleInput = { name: string; displayName: string }
type ServiceResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string }
type ServiceVoidResult = { success: true } | { success: false; error: string }
⋮----
export async function createRole(
  farmSchema: string,
  data: CreateRoleInput,
  actorId: string
): Promise<ServiceResult<Awaited<ReturnType<typeof createRoleQuery>>>>
⋮----
export async function updateRole(
  farmSchema: string,
  roleId: string,
  data: { displayName: string },
  // actorId reserved for future audit trail
  _actorId: string
): Promise<ServiceResult<NonNullable<Awaited<ReturnType<typeof updateRoleQuery>>>>>
⋮----
// actorId reserved for future audit trail
⋮----
export async function deleteRole(
  farmSchema: string,
  roleId: string
): Promise<ServiceVoidResult>
⋮----
export async function updatePermission(
  farmSchema: string,
  roleId: string,
  permissionKey: string,
  granted: boolean,
  actorId: string
): Promise<ServiceVoidResult>
⋮----
export async function setAllPermissions(
  farmSchema: string,
  roleId: string,
  permissionKeys: string[],
  actorId: string
): Promise<ServiceVoidResult>
````

## File: lib/services/sales-order.service.ts
````typescript
import { generateOrderNumber } from '@/lib/utils/order-number'
import { assertCanEdit } from '@/lib/services/lock-period.service'
import type { NewSalesOrder, NewSalesOrderItem, NewInventoryMovement, NewInvoice } from '@/lib/db/schema'
⋮----
type CreateDraftInput = {
  customerId: string
  orderDate: Date
  paymentMethod: 'cash' | 'credit'
  items: Array<{
    itemType: 'egg_grade_a' | 'egg_grade_b' | 'flock' | 'other'
    itemRefId?: string
    description?: string
    quantity: number
    unit: 'butir' | 'ekor' | 'unit'
    pricePerUnit: number
    discountPct?: number
  }>
  taxPct?: number
  notes?: string
  overrideReason?: string
}
⋮----
export async function createDraftSO(farmSchema: string, input: CreateDraftInput, userId: string, role: string)
⋮----
// Calculate totals
⋮----
// Generate order number
⋮----
export async function confirmSO(farmSchema: string, orderId: string, userId: string, role: string)
⋮----
// Lock period check — use orderDate as the record date
⋮----
// Stock availability check before confirming
⋮----
export async function cancelSO(farmSchema: string, orderId: string, userId: string, role: string)
⋮----
// Lock period check — use orderDate as the record date
⋮----
export async function deleteDraftSO(farmSchema: string, orderId: string, userId: string, role: string)
⋮----
export async function fulfillSO(farmSchema: string, orderId: string, userId: string, role: string)
⋮----
// Check stock for egg items
⋮----
// Check credit limit for credit orders
⋮----
// Build inventory OUT movements for egg items
⋮----
// Assertion: movements filter uses same predicate — fires only if predicates diverge in future refactors
⋮----
// Build invoice
⋮----
// Guard: invoice number must be non-empty and total must be > 0
⋮----
// Build flock retirement updates for flock items
````

## File: lib/services/sales-return.service.ts
````typescript
import { generateOrderNumber } from '@/lib/utils/order-number'
import type { NewSalesReturn, NewSalesReturnItem, NewInventoryMovement, NewInvoice, NewCustomerCredit } from '@/lib/db/schema'
⋮----
type CreateReturnInput = {
  orderId: string
  returnDate: Date
  reasonType: 'wrong_grade' | 'damaged' | 'quantity_error' | 'other'
  items: Array<{
    itemType: 'egg_grade_a' | 'egg_grade_b' | 'flock' | 'other'
    itemRefId?: string
    quantity: number
    unit: 'butir' | 'ekor' | 'unit'
  }>
  notes?: string
}
⋮----
export async function createSalesReturn(farmSchema: string, input: CreateReturnInput, userId: string, role: string)
⋮----
// Validate return quantities don't exceed original SO quantities
⋮----
// Generate return number
⋮----
export async function approveSalesReturn(farmSchema: string, returnId: string, userId: string, role: string)
⋮----
// Calculate credit amount: sum returnQty * pricePerUnit * (1 - discount/100) per item
⋮----
// Build inventory movements (IN) for egg return items only
⋮----
// Generate credit note invoice number
⋮----
// Build customer credit entry
⋮----
sourceInvoiceId: '', // will be overwritten in tx with actual invoice id
⋮----
export async function rejectSalesReturn(farmSchema: string, returnId: string, userId: string, role: string)
````

## File: lib/services/user.service.ts
````typescript
import { supabaseAdmin } from '@/lib/auth/admin'
import { db } from '@/lib/db'
import { farmUsers } from '@/lib/db/schema'
import {
  findAllUsers,
  findUserById,
  insertUser,
  updateUser,
} from '@/lib/db/queries/user.queries'
import { getRoles } from '@/lib/db/queries/roles.queries'
import type { UserWithRoleSlug } from '@/lib/db/queries/user.queries'
import type { User } from '@/lib/db/schema'
⋮----
export async function getAllRoles(farmSchema: string)
⋮----
type CreateUserInput = {
  email: string
  password: string
  fullName: string
  roleId: string
  createdBy: string
}
⋮----
export async function createUser(farmSchema: string, input: CreateUserInput): Promise<User>
⋮----
export async function getAllUsers(farmSchema: string): Promise<UserWithRoleSlug[]>
⋮----
export async function getUserById(farmSchema: string, id: string): Promise<User | null>
⋮----
export async function updateUserRole(
  farmSchema: string,
  id: string,
  roleId: string
): Promise<User | null>
⋮----
export async function deactivateUser(farmSchema: string, id: string): Promise<void>
⋮----
export async function activateUser(farmSchema: string, id: string): Promise<void>
⋮----
export async function changeUserPassword(id: string, newPassword: string): Promise<void>
````

## File: app/(app)/admin/import/import-panel.tsx
````typescript
'use client' // client: file upload, multi-step state, CSV preview
⋮----
import { useState, useTransition } from 'react'
import { Upload, Download, AlertCircle, CheckCircle2, ChevronRight, Copy, Check } from 'lucide-react'
import { parseCsvAction, commitImportAction, getCsvTemplateAction } from '@/lib/actions/import.actions'
import type { ImportEntity } from '@/lib/services/import.service'
⋮----
type ActiveFlock = {
  id: string
  name: string
  coopName: string
  arrivalDate: Date | string
}
⋮----
type Step = 'select' | 'preview' | 'done'
⋮----
function handleCopy(id: string)
⋮----
onClick=
⋮----
function handleFileChange(e: React.ChangeEvent<HTMLInputElement>)
⋮----
function handleDownloadTemplate()
⋮----
function handleParse()
⋮----
function handleConfirmImport()
⋮----
function handleReset()
⋮----
{/* Entity selector */}
⋮----
{/* Flock reference table — only for daily_records */}
⋮----
{/* Step: select */}
⋮----
{/* Step: preview */}
⋮----
{/* Summary */}
⋮----
{/* Error rows */}
⋮----
{/* Sample valid rows */}
⋮----
{/* Step: done */}
````

## File: app/(app)/admin/roles/RoleManagementClient.tsx
````typescript
// client: interactive role management with permission matrix and real-time toggles
⋮----
import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Trash2, Plus, X, Pencil } from 'lucide-react'
import {
  getRoleWithPermissionsAction,
  createRoleAction,
  updateRoleAction,
  deleteRoleAction,
  updatePermissionAction,
} from '@/lib/actions/role.actions'
⋮----
type Role = {
  id: string
  name: string
  displayName: string
  isSystem: boolean
  isActive: boolean
  createdAt: Date
}
⋮----
interface Props {
  roles: Role[]
}
⋮----
function isProtectedRole(role: Role)
⋮----
// Derived: clear permissions when no role selected
⋮----
// eslint-disable-next-line react-hooks/set-state-in-effect
⋮----
async function handleTogglePermission(key: string, currentlyGranted: boolean)
⋮----
// Optimistic update
⋮----
// Revert
⋮----
async function handleDeleteRole(role: Role)
⋮----
{/* Left panel: roles list */}
⋮----
e.stopPropagation()
setEditingRole(role)
⋮----
handleDeleteRole(role)
⋮----
onClick=
⋮----
onClose=
⋮----
setShowCreate(false)
startTransition(()
⋮----
setEditingRole(null)
⋮----
// client: modal form for creating a role
⋮----
// client: modal form for editing role display name
⋮----
async function handleSubmit(e: React.FormEvent)
⋮----
onChange=
````

## File: app/(app)/flock/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getAllFlocks } from '@/lib/services/flock.service'
import { FlockListClient } from '@/components/forms/flock-list-client'
⋮----
canCreate=
````

## File: app/(app)/laporan/keuangan/piutang/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getAgingData } from '@/lib/services/invoice.service'
import { KpiCard } from '@/components/ui/kpi-card'
⋮----
function formatRupiah(n: number): string
⋮----
function formatDate(d: string): string
⋮----
function getDaysOverdueStyle(bucket: string): React.CSSProperties
⋮----
// DB error — render empty state
⋮----
{/* Page header */}
⋮----
{/* KPI Row */}
⋮----
{/* Aging Table */}
⋮----
<td className="px-4 py-3 text-sm text-right" style=
⋮----
<td className="px-4 py-3 text-sm" style=
````

## File: app/(app)/laporan/produksi/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getProductionReportData } from '@/lib/services/daily-record.service'
import type { Role } from '@/lib/services/daily-record.service'
import { KpiCard } from '@/components/ui/kpi-card'
import { LaporanFilter } from '@/components/forms/laporan-filter'
import { findAllCoops } from '@/lib/db/queries/coop.queries'
⋮----
function formatDate(dateStr: string): string
⋮----
function toISODate(d: Date): string
⋮----
function parseSafeISODate(str: string, fallback: Date): string
⋮----
// DB error — render empty state
⋮----
{/* Page header */}
⋮----
{/* KPI Row */}
⋮----
{/* Production Table */}
````

## File: app/(app)/layout.tsx
````typescript
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth/get-session'
import { AppShell, type ClientUser } from '@/components/layout/app-shell'
import {
  getNotificationsForRole,
  getReadNotificationIds,
} from '@/lib/services/notification.service'
import { CURRENT_VERSION } from '@/lib/changelog/data'
⋮----
export default async function AppLayout(
⋮----
type NotificationRole = typeof NOTIFICATION_ROLES[number]
````

## File: app/(app)/stok/page.tsx
````typescript
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'
import { getAllStockBalances } from '@/lib/db/queries/inventory.queries'
import { getCategories } from '@/lib/services/stock-catalog.service'
import Link from 'next/link'
import type { StockBalance } from '@/lib/db/queries/inventory.queries'
⋮----

⋮----
{/* Tab strip */}
⋮----
{/* Mobile card list */}
⋮----
{/* Desktop list */}
````

## File: components/forms/daily-input-form.tsx
````typescript
// client: tabs, dynamic state, sessionStorage persistence
⋮----
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveDailyRecordAction } from '@/lib/actions/daily-record.actions'
import type { FlockOption } from '@/lib/services/daily-record.service'
import type { StockItem } from '@/lib/db/schema'
import { StepperInput } from '@/components/ui/stepper-input'
⋮----
type StockItemWithBalance = StockItem & { balance: number }
⋮----
type Props = {
  flocks: FlockOption[]
  userRole: 'operator' | 'supervisor' | 'admin'
  eggItems: StockItem[]
  feedItems: StockItemWithBalance[]
  vaccineItems: StockItemWithBalance[]
}
⋮----
type EggEntry = { stockItemId: string; qtyButir: number; qtyKg: number }
type FeedEntry = { stockItemId: string; qtyUsed: number }
⋮----
function todayUTC(): string
⋮----
function minDate(role: 'operator' | 'supervisor' | 'admin'): string
⋮----
type TabKey = typeof TABS[number]['key']
⋮----
// deferred: telur retak & abnormal UI not yet built — hardcoded 0 for now
⋮----
function updateEggButir(idx: number, val: number)
function updateEggKg(idx: number, val: number)
function updateFeed(idx: number, val: number)
function updateVaccine(idx: number, val: number)
⋮----
async function submitForm()
⋮----
{/* Header: Flock + Date */}
⋮----
{/* Tab strip */}
⋮----
{/* Tab content */}
⋮----
{/* Sticky submit */}
````

## File: components/profil/password-form.tsx
````typescript
// client: form state, submit handler, eye toggle, client-side confirm check
⋮----
import { useState } from 'react'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { gantiPasswordAction } from '@/lib/actions/profil.actions'
⋮----
function inputClass(saved: boolean)
⋮----
className=
⋮----
async function onSubmit(e: React.FormEvent)
⋮----
// brief green state before clearing
````

## File: components/ui/stepper-input.tsx
````typescript
// client: interactive stepper with +/- buttons for mobile-friendly number input
⋮----
interface Props {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
}
⋮----
function decrement()
⋮----
function increment()
⋮----
function handleChange(e: React.ChangeEvent<HTMLInputElement>)
````

## File: lib/admin/provision-farm.ts
````typescript
import postgres from 'postgres'
import { readFileSync } from 'fs'
import { join } from 'path'
import { db } from '@/lib/db'
import { farms } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
⋮----
export async function provisionFarm(schemaName: string, farmName: string): Promise<void>
⋮----
// Use non-pooler connection for DDL — SET search_path is unsafe with connection pooler
⋮----
// 1. Create schema
⋮----
// 2. Execute DDL template in schema context
⋮----
// 3. Register in public.farms
⋮----
// 4. Seed default roles and permissions
⋮----
// CLI entrypoint
````

## File: lib/auth/permissions.ts
````typescript
type Leaf<T> = T extends string ? T : { [K in keyof T]: Leaf<T[K]> }[keyof T]
⋮----
export type PermissionKey = Leaf<typeof PERMISSIONS>
⋮----
function flattenPermissions(obj: Record<string, unknown>): string[]
````

## File: lib/db/queries/inventory.queries.ts
````typescript
import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, desc, sql, sum, and } from 'drizzle-orm'
⋮----
export type StockBalance = {
  stockItemId: string
  categoryId: string
  categoryName: string
  itemName: string
  unit: string
  totalIn: number
  totalOut: number
  balance: number
}
⋮----
export async function getStockBalance(farmSchema: string, stockItemId: string): Promise<number>
⋮----
export async function getAllStockBalances(farmSchema: string): Promise<StockBalance[]>
⋮----
// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function insertInventoryMovement(farmSchema: string, data: any): Promise<void>
⋮----
// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
export async function insertStockAdjustmentWithMovement(
  farmSchema: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adjustment: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  movement: any
)
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
export async function findPendingRegradeRequests(farmSchema: string)
⋮----
export async function findRegradeRequestById(farmSchema: string, id: string)
⋮----
// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function insertRegradeRequest(farmSchema: string, data: any)
⋮----
export async function updateRegradeRequestStatus(
  farmSchema: string,
  id: string,
  status: 'APPROVED' | 'REJECTED',
  reviewedBy: string
): Promise<void>
⋮----
export type StockMovementRow = {
  id: string
  movementDate: string
  itemName: string
  categoryName: string
  movementType: string
  quantity: number
  source: string
  sourceType: string | null
}
⋮----
export async function getStockMovementReport(
  farmSchema: string,
  from: string,
  to: string,
  stockItemId?: string
): Promise<StockMovementRow[]>
⋮----
export async function approveRegradeRequestTx(farmSchema: string, requestId: string, reviewedBy: string): Promise<void>
⋮----
// any: tx typed against public schema; farm schema tables need cast to use in transactions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
````

## File: lib/db/queries/kas.queries.ts
````typescript
import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { and, desc, gte, lte, sql } from 'drizzle-orm'
⋮----
export type CashFlowRow = {
  id: string
  transactionDate: string
  description: string
  type: string
  amount: number
  accountName: string
  categoryName: string | null
}
⋮----
export type CashFlowReport = {
  rows: CashFlowRow[]
  totalIn: number
  totalOut: number
  netFlow: number
}
⋮----
export async function getCashFlowReport(
  farmSchema: string,
  from: string,
  to: string
): Promise<CashFlowReport>
````

## File: lib/db/queries/sales-order.queries.ts
````typescript
import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, and, desc, sql, count, getTableColumns, gte, lte, sum, max } from 'drizzle-orm'
⋮----
export async function findSalesOrderById(farmSchema: string, id: string)
⋮----
export async function findSalesOrderItems(farmSchema: string, orderId: string)
⋮----
export async function countSalesOrdersThisMonth(farmSchema: string, prefix: string): Promise<number>
⋮----
// Use MAX on trailing seq to avoid collision when rows are deleted (COUNT would reuse numbers)
⋮----
// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
export async function insertSalesOrderWithItems(
  farmSchema: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[]
)
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
export async function updateSalesOrderStatus(
  farmSchema: string,
  id: string,
  status: 'draft' | 'confirmed' | 'fulfilled' | 'cancelled',
  updatedBy: string
): Promise<void>
⋮----
export async function deleteDraftSO(farmSchema: string, id: string): Promise<void>
⋮----
// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
export async function fulfillSOTx(
  farmSchema: string,
  orderId: string,
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  movements: any[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  invoice: any,
  flockUpdates: { flockId: string; retiredAt: Date }[]
): Promise<void>
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
// Check stock for each movement that has a stockItemId
⋮----
// Update SO status
⋮----
// Insert inventory movements
⋮----
// Insert invoice
⋮----
// Update flock status for flock items
⋮----
export async function getCustomerOutstandingCredit(farmSchema: string, customerId: string): Promise<number>
⋮----
export type SalesReportRow = {
  id: string
  orderNumber: string
  orderDate: string
  customerName: string
  itemCount: number
  totalAmount: number
  status: string
}
⋮----
export async function getSalesReport(
  farmSchema: string,
  from: string,
  to: string
): Promise<SalesReportRow[]>
⋮----
export type SalesPerCustomerRow = {
  customerId: string
  customerName: string
  totalOrders: number
  totalRevenue: number
  avgOrderValue: number
  lastOrderDate: string
}
⋮----
export async function getSalesPerCustomerReport(
  farmSchema: string,
  from: string,
  to: string,
  customerId?: string
): Promise<SalesPerCustomerRow[]>
⋮----
export async function listSalesOrders(
  farmSchema: string,
  page: number = 1,
  pageSize: number = 20,
  status?: string
)
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
````

## File: lib/db/schema-factory.ts
````typescript
import {
  pgSchema,
  uuid,
  text,
  boolean,
  integer,
  date,
  timestamp,
  numeric,
  uniqueIndex,
  primaryKey,
} from 'drizzle-orm/pg-core'
⋮----
export function getFarmSchema(schema: string)
⋮----
// --- Enums ---
⋮----
// --- Tables (dependency order) ---
⋮----
id: uuid('id').primaryKey(), // no defaultRandom — sync'd from Supabase Auth
⋮----
export type FarmTables = ReturnType<typeof getFarmSchema>
````

## File: lib/services/flock.service.ts
````typescript
import {
  findAllActiveFlocks,
  findAllFlocks,
  updateFlock,
  findActiveFlockByCoopId,
} from '@/lib/db/queries/flock.queries'
import { insertFlockDelivery, sumDeliveriesQuantityByFlockId } from '@/lib/db/queries/flock-delivery.queries'
import { getTotalDepletionByFlock } from '@/lib/db/queries/daily-record.queries'
import { getPhaseForWeeks } from '@/lib/services/flock-phase.service'
import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import type { Flock, FlockPhase } from '@/lib/db/schema'
⋮----
export type FlockWithMeta = Flock & {
  coopName: string
  ageWeeks: number
  phase: FlockPhase | null
  totalCount: number
  currentPopulation: number
}
⋮----
export function getFlockAgeDays(docDate: Date, today: Date = new Date()): number
⋮----
export function getFlockAgeWeeks(docDate: Date, today: Date = new Date()): number
⋮----
async function enrichFlocks(farmSchema: string, rawFlocks: Awaited<ReturnType<typeof findAllActiveFlocks>>): Promise<FlockWithMeta[]>
⋮----
export async function getAllActiveFlocks(farmSchema: string): Promise<FlockWithMeta[]>
⋮----
export async function getAllFlocks(farmSchema: string): Promise<FlockWithMeta[]>
⋮----
type CreateFlockInput = {
  coopId: string
  name: string
  arrivalDate: Date
  breed?: string
  notes?: string
  createdBy: string
  // First delivery
  firstDeliveryDate: Date
  firstDeliveryQuantity: number
  ageAtArrivalDays?: number
}
⋮----
// First delivery
⋮----
export async function createFlock(farmSchema: string, input: CreateFlockInput): Promise<Flock &
⋮----
// Check: 1 active flock per coop
⋮----
// Calculate DOC birth date from first delivery date minus age at arrival
⋮----
// any: tx typed against public schema; farm schema tables need cast
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
export async function updateFlockById(
  farmSchema: string,
  id: string,
  input: Partial<Pick<CreateFlockInput, 'name' | 'breed' | 'notes' | 'arrivalDate'>>,
  updatedBy: string
): Promise<Flock | null>
⋮----
export async function retireFlock(farmSchema: string, id: string, updatedBy: string): Promise<void>
⋮----
// Re-export for consumers that need it
````

## File: lib/services/profil.service.ts
````typescript
import { revalidateTag } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServiceClient } from '@/lib/auth/server'
import { updateUserProfil } from '@/lib/db/queries/profil.queries'
⋮----
export async function updateInfoAkunService(
  farmSchema: string,
  userId: string,
  data: { fullName: string; phone: string | null }
)
⋮----
export async function gantiPasswordService(
  email: string,
  currentPassword: string,
  newPassword: string,
  userId: string
)
````

## File: app/changelog/page.tsx
````typescript
// app/changelog/page.tsx
import { changelog, CURRENT_VERSION } from '@/lib/changelog/data'
import type { ChangeType } from '@/lib/changelog/types'
import { ChangelogSeenMarker } from './ChangelogSeenMarker'
import Image from 'next/image'
⋮----
{/* Header */}
⋮----
{/* Entries */}
⋮----
{/* Version header */}
⋮----
{/* Title */}
⋮----
{/* Changes */}
````

## File: components/layout/more-drawer.tsx
````typescript
// client: slide-up drawer for "Lainnya" bottom nav item
⋮----
import Link from 'next/link'
import { LayoutDashboard, Landmark, ShoppingCart, Settings, LogOut } from 'lucide-react'
import type { ClientUser } from './app-shell'
⋮----
interface Props {
  isOpen: boolean
  onClose: () => void
  user: ClientUser
}
⋮----
{/* Backdrop */}
⋮----
{/* Slide-up sheet */}
⋮----
{/* Handle bar */}
⋮----
{/* Menu grid */}
⋮----
{/* User info + logout */}
⋮----
{/* Logout via GET route that calls supabase.auth.signOut() and redirects to /login */}
````

## File: app/(app)/kas/[accountId]/page.tsx
````typescript
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { findAccountById, getAccountBalance } from '@/lib/db/queries/cash-account.queries'
import { listTransactions, getDailyReport } from '@/lib/db/queries/cash-transaction.queries'
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle, ArrowLeftRight, Plus } from 'lucide-react'
⋮----
function formatRupiah(amount: number)
⋮----
function formatDate(date: Date | string)
⋮----
type FilterType = 'in' | 'out' | 'transfer_in' | 'transfer_out' | undefined
⋮----
// Default daily report date range: current month
⋮----
// Compute running balance for ledger rows (rows ordered desc by date)
// balance = current total balance. Row[0] is newest — its ending balance = balance.
// Walk forward: after row[i], subtract credit or add debit to get balance before row[i].
⋮----
function buildUrl(overrides: Record<string, string | undefined>)
⋮----
{/* Header */}
⋮----
{/* Balance card */}
⋮----
{/* Tab selector */}
⋮----
{/* Filters */}
⋮----
<Link href=
⋮----
{/* Ledger */}
⋮----
{/* Desktop header — hidden on mobile */}
⋮----
{/* Mobile card — hidden on sm+ */}
⋮----

⋮----
{/* Desktop row — hidden on mobile */}
⋮----
{/* Pagination */}
⋮----
{/* Date range for daily report */}
⋮----
{/* Daily report table */}
⋮----
{/* Summary row */}
````

## File: components/forms/flock-list-client.tsx
````typescript
// client: flock list with retire action
⋮----
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { retireFlockAction } from '@/lib/actions/flock.actions'
import type { FlockWithMeta } from '@/lib/services/flock.service'
⋮----
interface Props {
  flocks: FlockWithMeta[]
  canCreate: boolean
  canDelete: boolean
}
⋮----
async function handleRetire(flockId: string)
⋮----
{/* Mobile card list */}
⋮----
onClick=
````

## File: components/layout/app-shell.tsx
````typescript
'use client' // client: needs usePathname for active nav state + drawer open state
⋮----
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { BottomNav } from './bottom-nav'
import { MoreDrawer } from './more-drawer'
import type { SessionUser } from '@/lib/auth/get-session'
import type { Notification } from '@/lib/services/notification.service'
import type { PermissionKey } from '@/lib/auth/permissions'
⋮----
/** Serializable version of SessionUser safe to pass across server→client boundary */
export type ClientUser = Omit<SessionUser, 'permissions'> & {
  permissionKeys: PermissionKey[]
}
⋮----
export function AppShell({
  user,
  children,
  notifications,
  readNotificationIds,
  hasNewVersion,
}: {
  user: ClientUser
  children: React.ReactNode
  notifications: Notification[]
  readNotificationIds: string[]
  hasNewVersion: boolean
})
````

## File: lib/auth/get-session.ts
````typescript
import { createSupabaseServerClient } from './server'
import { db } from '@/lib/db'
import { farmUsers, farms } from '@/lib/db/schema'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'
import { ALL_PERMISSIONS, type PermissionKey } from './permissions'
⋮----
export type SessionUser = {
  id: string
  email: string
  fullName: string
  phone: string | null
  roleId: string
  roleSlug: string
  roleName: string
  isAdmin: boolean
  isActive: boolean
  createdBy: string | null
  createdAt: Date
  updatedAt: Date | null
  farmSchema: string
  farmName: string
  permissions: Set<PermissionKey>
}
⋮----
// JSON-serializable version for unstable_cache (Set and Date are not serializable)
type CachedSessionData = Omit<SessionUser, 'permissions' | 'createdAt' | 'updatedAt'> & {
  permissions: PermissionKey[]
  createdAt: string
  updatedAt: string | null
}
⋮----
function getCachedSession(userId: string, email: string)
⋮----
// 1. Lookup farm schema from public.farm_users
⋮----
// 2. Fetch DB user from farm schema + farm name in parallel
⋮----
// 3. Fetch role and permissions
⋮----
export async function getSession(): Promise<SessionUser | null>
````

## File: lib/db/queries/daily-record.queries.ts
````typescript
import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, and, desc, sum, asc, inArray, sql } from 'drizzle-orm'
⋮----
export type DailySubRecords = {
  eggRecords: { stockItemId: string; qtyButir: number; qtyKg: number }[]
  feedRecords: { stockItemId: string; qtyUsed: number }[]
  vaccineRecords: { stockItemId: string; qtyUsed: number }[]
}
⋮----
export async function findDailyRecordById(farmSchema: string, id: string)
⋮----
export async function findDailySubRecordsByRecordId(farmSchema: string, recordId: string): Promise<DailySubRecords>
⋮----
export async function findDailyRecord(farmSchema: string, flockId: string, recordDate: string)
⋮----
export async function findRecentDailyRecords(farmSchema: string, flockId: string, limit: number)
⋮----
export type DailyRecordWithFlock = {
  id: string
  flockId: string
  recordDate: string | Date
  deaths: number
  culled: number
  eggsCracked: number
  eggsAbnormal: number
  notes: string | null
  isLateInput: boolean
  isImported: boolean
  importedBy: string | null
  createdBy: string | null
  createdAt: Date
  flockName: string
  coopName: string
  coopId: string
  totalEggsButir: number
  totalFeedKg: number
}
⋮----
export async function findRecentDailyRecordsMultiFlocks(
  farmSchema: string,
  flockIds: string[],
  limit: number,
): Promise<DailyRecordWithFlock[]>
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
export async function getTotalDepletionByFlock(
  farmSchema: string,
  flockId: string
): Promise<
⋮----
export async function getCumulativeDepletionByFlockUpTo(
  farmSchema: string,
  flockId: string,
  upToDate: string
): Promise<
⋮----
// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function upsertDailyRecordTx(farmSchema: string, input: any)
⋮----
// Delete old movements from this record (by sourceId reference)
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
export type ProductionReportRow = {
  recordDate: string | Date
  coopId: string
  coopName: string
  flockId: string
  flockName: string
  flockTotalCount: number
  deaths: number
  culled: number
  totalEggsButir: number
}
⋮----
export async function getProductionReport(
  farmSchema: string,
  from: string,
  to: string,
  coopId?: string
): Promise<ProductionReportRow[]>
⋮----
export type FlockPerformanceRow = {
  flockId: string
  flockName: string
  coopName: string
  initialCount: number
  arrivalDate: string
  totalDays: number
  ageWeeks: number
  totalEggsButir: number
  totalDeaths: number
  totalCulled: number
  totalFeedKg: number
  avgHdp: number
  mortalityPct: number
  fcr: number
}
⋮----
export async function getFlockPerformanceReport(
  farmSchema: string,
  from: string,
  to: string,
  flockId?: string
): Promise<FlockPerformanceRow[]>
````

## File: lib/services/import.service.test.ts
````typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
⋮----
// Module-level state to control mock return values per test
⋮----
// where() must return something awaitable AND support .limit()
// Reads from module-level vars at call-time (not at factory-time)
⋮----
// any: attaching .limit to Promise
⋮----
// Mock stock-catalog.service so parseDailyRecordsCsv tests don't need real DB
⋮----
// Mock inventory queries untuk stock balance check
⋮----
// Mock schema-factory: return minimal table stubs with the fields we query
⋮----
import {
  parseDailyRecordsCsv,
  parseCustomersCsv,
  getCsvTemplate,
  commitImport,
} from './import.service'
⋮----
// any: vitest mock type
⋮----
function setWhereMock(fn: () => Promise<unknown[]>)
⋮----
// Capture result once; both awaiting where() and calling .limit() return same result
⋮----
const getResult = () =>
⋮----
// Restore chain after clearAllMocks
⋮----
// Duplicate detection moved from parse to commitImport (unique constraint catch).
// Parse only validates flock existence and field formats.
⋮----
// Flock exists
⋮----
// row1: balance 100-50=50, row2: balance 50-40=10 → both valid
⋮----
// row1: 20 ok (bal→10), row2: 50 > 10 → stock error
⋮----
expect(msg).toContain('10')   // tersedia
expect(msg).toContain('99')   // dibutuhkan
⋮----
// INSERT daily_records returns the new record id
⋮----
// First insert (daily_records) returns row with id
⋮----
// Should have: dailyRecords + egg + feed + vax + movements = 5 inserts
⋮----
// Last values() call is the movements insert — verify movement types and source
⋮----
expect(lastValuesArg).toHaveLength(3) // egg + feed + vaccine movements
⋮----
// movements array is empty → insert(inventoryMovements) not called
// Only dailyRecords insert should have happened (no egg/feed/vax child inserts either)
⋮----
// Should only be 1 insert: dailyRecords
````

## File: app/(app)/produksi/page.tsx
````typescript
import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { findAllFlocks } from '@/lib/db/queries/flock.queries'
import { findRecentDailyRecordsMultiFlocks } from '@/lib/db/queries/daily-record.queries'
import Link from 'next/link'
import FlockFilter from './flock-filter'
⋮----
function isWithinLockWindow(recordDate: Date, now: Date, days: number): boolean
⋮----
{/* Mobile card list */}
⋮----
{/* Desktop table */}
````

## File: lib/services/import.service.ts
````typescript
/**
 * Import Service — Sprint 8 (updated)
 * CSV import for: daily_records, customers.
 *
 * Flow:
 *   1. parse(csvText, entity, farmSchema)  → { valid, errors }   (no DB write)
 *   2. commitImport(entity, rows, adminId, farmSchema)            (DB write in transaction)
 *
 * All imported records: is_imported = true, imported_by = adminId.
 * System errors → full rollback, no partial save.
 * Valid rows imported, error rows skipped after user confirmation.
 */
⋮----
import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { inArray } from 'drizzle-orm'
import type { NewCustomer } from '@/lib/db/schema'
import {
  getActiveEggItems,
  getActiveFeedItems,
  getActiveVaccineItems,
} from '@/lib/services/stock-catalog.service'
import { getStockBalance } from '@/lib/db/queries/inventory.queries'
⋮----
// ─── Domain error class ───────────────────────────────────────────────────────
⋮----
export class ImportDomainError extends Error {
⋮----
constructor(message: string)
⋮----
// ─── CSV parsing helpers ──────────────────────────────────────────────────────
⋮----
function parseISODate(val: string, field: string, rowNum: number):
⋮----
function parseInt2(val: string, field: string, rowNum: number, required = true):
⋮----
function parseFloat2(val: string, field: string, rowNum: number):
⋮----
export type ParsedRow<T> = {
  rowNum: number
  data: T
}
⋮----
export type ParseError = {
  rowNum: number
  errors: string[]
}
⋮----
export type ParseResult<T> = {
  valid: ParsedRow<T>[]
  errors: ParseError[]
}
⋮----
function parseCsv(text: string): string[][]
⋮----
/** Normalise a column header name for matching: lowercase + spaces→underscore */
function normalizeColName(name: string): string
⋮----
// ─── DailyRecord import ───────────────────────────────────────────────────────
⋮----
export type DailyRecordImportRow = {
  flockId: string
  recordDate: string
  deaths: number
  culled: number
  notes: string | null
  eggEntries: { stockItemId: string; qtyButir: number; qtyKg: number }[]
  feedEntries: { stockItemId: string; qtyUsed: number }[]
  vaccineEntries: { stockItemId: string; qtyUsed: number }[]
}
⋮----
type DynColMeta =
  | { type: 'egg'; stockItemId: string; field: 'butir' | 'kg' }
  | { type: 'feed'; stockItemId: string; field: 'qty' }
  | { type: 'vaccine'; stockItemId: string; field: 'qty' }
⋮----
/**
 * Parse CSV text for daily_records import.
 *
 * Fixed columns (index 0-4): flock_id, record_date, deaths, culled, notes
 * Dynamic columns (index ≥ 5): derived from active egg/feed/vaccine stock items.
 *   Egg:     egg_{normalizedName}_butir  /  egg_{normalizedName}_kg
 *   Feed:    feed_{normalizedName}_kg    (maps to qtyUsed)
 *   Vaccine: vaccine_{normalizedName}_qty (maps to qtyUsed)
 */
export async function parseDailyRecordsCsv(
  csvText: string,
  farmSchema: string
): Promise<ParseResult<DailyRecordImportRow>>
⋮----
// Fetch active items for dynamic column mapping
⋮----
// Build column map: colIndex → DynColMeta
⋮----
// Egg columns
⋮----
// Feed columns
⋮----
// Vaccine columns
⋮----
// Batch flock existence check — one query for all unique flock IDs in the CSV
// Filter to valid UUIDs first — passing non-UUID strings to inArray throws a Postgres cast error
⋮----
// Build item name lookup map for user-friendly error messages
⋮----
// Fetch starting balances for all feed + vaccine items (running balance for stock validation)
⋮----
// Validate flock_id using pre-fetched set
⋮----
// Build accumulators keyed by stockItemId
⋮----
// Initialise all known items to 0
⋮----
// Fill in values from dynamic columns
⋮----
// Running balance check — collect errors and deductions separately per-row,
// then only apply deductions if no stock errors occurred for this row.
⋮----
// ─── Customer import ──────────────────────────────────────────────────────────
⋮----
export type CustomerImportRow = Omit<NewCustomer, 'isImported' | 'importedBy'>
⋮----
/**
 * Expected CSV columns:
 * name, type (retail|wholesale|distributor), phone (opt), address (opt),
 * credit_limit (opt), payment_terms (opt)
 */
export function parseCustomersCsv(csvText: string): ParseResult<CustomerImportRow>
⋮----
// ─── DB write ─────────────────────────────────────────────────────────────────
⋮----
export type ImportEntity = 'daily_records' | 'customers'
⋮----
export type ImportResult = {
  inserted: number
  skipped: number
}
⋮----
/**
 * Writes valid parsed rows to DB inside a single transaction.
 * Any system error → full rollback.
 * admin-only: sets is_imported = true, imported_by = adminId.
 *
 * farmSchema is required to scope DB writes to the correct farm schema.
 */
export async function commitImport(
  entity: ImportEntity,
  // any: dynamic row types across entity types
  rows: ParsedRow<Record<string, unknown>>[],
  adminId: string,
  farmSchema: string
): Promise<ImportResult>
⋮----
// any: dynamic row types across entity types
⋮----
// ─── CSV templates ───────────────────────────────────────────────────────────
⋮----
/**
 * Generate a dynamic CSV template for daily_records based on active stock items.
 * Returns the header row followed by a newline (no data rows).
 */
export async function generateDailyRecordsCsvTemplate(farmSchema: string): Promise<string>
⋮----
/**
 * Returns a static CSV template header for customers.
 */
export function getCsvTemplate(_entity: 'customers'): string
````

## File: components/layout/sidebar.tsx
````typescript
// client: needs useState for accordion open/close state
⋮----
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LayoutDashboard, Egg, Package, DollarSign, Settings, LogOut, BarChart2, ChevronDown, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ClientUser } from './app-shell'
import type { PermissionKey } from '@/lib/auth/permissions'
import type { Notification } from '@/lib/services/notification.service'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { NotificationBell } from '@/components/ui/notification-bell'
import { VersionBadge } from '@/components/layout/version-badge'
⋮----
type NavSubItem = {
  href: string
  label: string
  /** permission required to see this sub-item. undefined = always visible */
  requiredPermission?: PermissionKey
}
⋮----
/** permission required to see this sub-item. undefined = always visible */
⋮----
type NavItem =
  | { kind: 'flat'; href: string; icon: LucideIcon; label: string; requiredPermission?: PermissionKey }
  | { kind: 'accordion'; id: string; icon: LucideIcon; label: string; requiredPermission?: PermissionKey; children: NavSubItem[] }
⋮----
// no permission required — always visible
⋮----
function getInitials(name: string)
⋮----
function canSee(requiredPermission: PermissionKey | undefined, permissionKeys: string[]): boolean
⋮----
// Prevents /admin matching /admin/kandang — requires trailing slash or exact match
function isActive(currentPath: string, href: string): boolean
⋮----
function getDefaultOpenId(
  sections: typeof NAV_SECTIONS,
  currentPath: string,
  permissionKeys: string[],
): string | null
⋮----
function toggleAccordion(id: string)
⋮----
{/* Brand */}
⋮----
{/* Farm info box */}
⋮----
// accordion item
⋮----
{/* User card */}
⋮----
{/* Logout via GET route that calls supabase.auth.signOut() and redirects to /login */}
````

## File: lib/changelog/data.ts
````typescript
import type { VersionEntry } from './types'
````
