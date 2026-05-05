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
app/(app)/admin/layout.tsx
app/(app)/admin/page.tsx
app/(app)/admin/pelanggan/page.tsx
app/(app)/admin/settings/alerts/page.tsx
app/(app)/admin/settings/wa-template/page.tsx
app/(app)/admin/users/[id]/kandang/page.tsx
app/(app)/admin/users/page.tsx
app/(app)/dashboard/page.tsx
app/(app)/flock/new/page.tsx
app/(app)/flock/page.tsx
app/(app)/laporan/page.tsx
app/(app)/laporan/produksi/page.tsx
app/(app)/layout.tsx
app/(app)/penjualan/[id]/page.tsx
app/(app)/penjualan/[id]/return/new/page.tsx
app/(app)/penjualan/invoices/[id]/page.tsx
app/(app)/penjualan/invoices/page.tsx
app/(app)/penjualan/new/page.tsx
app/(app)/penjualan/page.tsx
app/(app)/penjualan/return/[id]/page.tsx
app/(app)/produksi/[id]/edit/edit-form.tsx
app/(app)/produksi/[id]/edit/page.tsx
app/(app)/produksi/flock-filter.tsx
app/(app)/produksi/input/page.tsx
app/(app)/produksi/page.tsx
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
app/api/laporan/produksi-csv/route.ts
app/favicon.ico
app/globals.css
app/layout.tsx
app/page.tsx
components.json
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
components/forms/flock-list-client.tsx
components/forms/login-form.tsx
components/forms/production-report-filter.tsx
components/forms/user-management-client.tsx
components/layout/app-shell.tsx
components/layout/bottom-nav.tsx
components/layout/sidebar.tsx
components/pdf/invoice-pdf-document.tsx
components/providers/progress-bar.tsx
components/ui/badge.tsx
components/ui/button.tsx
components/ui/charts/dashboard-charts.tsx
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
components/ui/table.tsx
drizzle.config.ts
eslint.config.mjs
lib/actions/app-settings.actions.ts
lib/actions/coop.actions.ts
lib/actions/customer.actions.ts
lib/actions/daily-record.actions.ts
lib/actions/flock-phase.actions.ts
lib/actions/flock.actions.ts
lib/actions/import.actions.ts
lib/actions/invoice.actions.ts
lib/actions/lock-period.actions.ts
lib/actions/notification.actions.ts
lib/actions/sales-order.actions.ts
lib/actions/sales-return.actions.ts
lib/actions/stock.actions.ts
lib/actions/user-coop-assignment.actions.ts
lib/actions/user.actions.ts
lib/auth/admin.ts
lib/auth/get-session.ts
lib/auth/guards.ts
lib/auth/server.ts
lib/db/index.ts
lib/db/queries/alert-cooldown.queries.ts
lib/db/queries/app-settings.queries.ts
lib/db/queries/coop.queries.ts
lib/db/queries/correction-record.queries.ts
lib/db/queries/customer-credit.queries.ts
lib/db/queries/customer.queries.ts
lib/db/queries/daily-record.queries.ts
lib/db/queries/dashboard.queries.ts
lib/db/queries/flock-phase.queries.ts
lib/db/queries/flock.queries.ts
lib/db/queries/inventory.queries.ts
lib/db/queries/invoice.queries.ts
lib/db/queries/notification.queries.ts
lib/db/queries/payment.queries.ts
lib/db/queries/sales-order.queries.ts
lib/db/queries/sales-return.queries.ts
lib/db/queries/user-coop-assignment.queries.ts
lib/db/queries/user.queries.ts
lib/db/schema/alert-cooldowns.ts
lib/db/schema/app-settings.ts
lib/db/schema/coops.ts
lib/db/schema/correction-records.ts
lib/db/schema/customer-credits.ts
lib/db/schema/customers.ts
lib/db/schema/daily-records.ts
lib/db/schema/flock-phases.ts
lib/db/schema/flocks.ts
lib/db/schema/index.ts
lib/db/schema/inventory-movements.ts
lib/db/schema/inventory-snapshots.ts
lib/db/schema/invoices.ts
lib/db/schema/notification-reads.ts
lib/db/schema/notifications.ts
lib/db/schema/payments.ts
lib/db/schema/regrade-requests.ts
lib/db/schema/sales-order-items.ts
lib/db/schema/sales-orders.ts
lib/db/schema/sales-return-items.ts
lib/db/schema/sales-returns.ts
lib/db/schema/stock-adjustments.ts
lib/db/schema/user-coop-assignments.ts
lib/db/schema/users.ts
lib/db/seed-sales.ts
lib/db/seed.ts
lib/mock/dashboard.mock.ts
lib/services/alert.service.ts
lib/services/app-settings.service.ts
lib/services/coop.service.test.ts
lib/services/coop.service.ts
lib/services/customer.service.test.ts
lib/services/customer.service.ts
lib/services/daily-record.service.test.ts
lib/services/daily-record.service.ts
lib/services/dashboard.service.ts
lib/services/email.service.ts
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
lib/services/sales-order.service.test.ts
lib/services/sales-order.service.ts
lib/services/sales-return.service.test.ts
lib/services/sales-return.service.ts
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
public/file.svg
public/globe.svg
public/next.svg
public/vercel.svg
public/window.svg
README.md
repomix.config.json
scripts/benchmark.ts
tsconfig.json
vitest.config.ts
```

# Files

## File: app/(app)/admin/flock-phases/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAllFlockPhases } from '@/lib/services/flock-phase.service'
````

## File: app/(app)/admin/kandang/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAllCoops } from '@/lib/services/coop.service'
import { CoopManagementClient } from '@/components/forms/coop-management-client'
⋮----
export default async function KandangPage()
````

## File: app/(app)/admin/layout.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
⋮----
export default async function AdminLayout(
````

## File: app/(app)/admin/pelanggan/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAllCustomers } from '@/lib/services/customer.service'
import { CustomerManagementClient } from '@/components/forms/customer-management-client'
⋮----
export default async function PelangganPage()
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

## File: app/(app)/admin/users/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAllUsers } from '@/lib/services/user.service'
import { UserManagementClient } from '@/components/forms/user-management-client'
⋮----
export default async function UsersPage()
````

## File: app/(app)/flock/new/page.tsx
````typescript
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth/get-session'
import { getAllCoops } from '@/lib/services/coop.service'
import { CreateFlockForm } from '@/components/forms/create-flock-form'
⋮----
export default async function NewFlockPage()
````

## File: app/(app)/flock/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAllActiveFlocks } from '@/lib/services/flock.service'
import { FlockListClient } from '@/components/forms/flock-list-client'
⋮----
export default async function FlockPage()
````

## File: app/(app)/penjualan/[id]/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
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
import { findSalesOrderById, findSalesOrderItems } from '@/lib/db/queries/sales-order.queries'
import { CreateReturnClient } from '@/components/forms/create-return-client'
⋮----
export default async function CreateReturnPage({
  params,
}: {
  params: Promise<{ id: string }>
})
````

## File: app/(app)/penjualan/new/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
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

## File: app/(app)/produksi/input/page.tsx
````typescript
import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { getFlockOptionsForInput } from '@/lib/services/daily-record.service'
import { DailyInputForm } from '@/components/forms/daily-input-form'
⋮----
export default async function ProduksiInputPage()
````

## File: app/(app)/stok/regrade/[id]/page.tsx
````typescript
import { getSession } from '@/lib/auth/get-session'
import { redirect, notFound } from 'next/navigation'
import { findRegradeRequestById } from '@/lib/db/queries/inventory.queries'
import { approveRegradeRequestAction, rejectRegradeRequestAction } from '@/lib/actions/stock.actions'
⋮----
async function approve()
⋮----
async function reject()
````

## File: app/(app)/stok/regrade/page.tsx
````typescript
import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { findAllActiveFlocks } from '@/lib/db/queries/flock.queries'
import { findPendingRegradeRequests } from '@/lib/db/queries/inventory.queries'
import { submitRegradeRequestAction } from '@/lib/actions/stock.actions'
import Link from 'next/link'
⋮----
async function handleSubmit(formData: FormData)
````

## File: app/(app)/stok/sesuaikan/page.tsx
````typescript
import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { findAllActiveFlocks } from '@/lib/db/queries/flock.queries'
import { createStockAdjustmentAction } from '@/lib/actions/stock.actions'
⋮----
async function handleSubmit(formData: FormData)
````

## File: app/(auth)/layout.tsx
````typescript
export default function AuthLayout(
````

## File: app/(auth)/login/page.tsx
````typescript
import { LoginForm } from '@/components/forms/login-form'
import { Bird } from 'lucide-react'
⋮----
{/* Logo block */}
⋮----
{/* Login card */}
⋮----
{/* Footer */}
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

## File: components/forms/coop-management-client.tsx
````typescript
// client: interactive coop table with create form, inline edit, activate/deactivate
⋮----
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreateCoopForm } from './create-coop-form'
import { EditCoopForm } from './edit-coop-form'
import { activateCoopAction, deactivateCoopAction } from '@/lib/actions/coop.actions'
import type { Coop } from '@/lib/db/schema'
⋮----
interface Props {
  coops: Coop[]
}
⋮----
async function handleToggleActive(coop: Coop)
⋮----
onSuccess=
⋮----
onClick=
⋮----
onCancel=
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
function todayISO()
⋮----
interface Props {
  activeCoops: { id: string; name: string }[]
}
⋮----
async function onSubmit(e: React.FormEvent)
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
  role: string
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
interface Props {
  onSuccess: () => void
  onCancel: () => void
}
⋮----
async function onSubmit(e: React.FormEvent)
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

## File: components/forms/daily-input-form.tsx
````typescript
// client: live auto-calc with useMemo + sessionStorage persistence
⋮----
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createDailyRecordAction } from '@/lib/actions/daily-record.actions'
import type { FlockOption } from '@/lib/services/daily-record.service'
⋮----
// USED BY: [daily-record.service, daily-input-form] — count: 2
function calcHDP(a: number, b: number, pop: number)
// USED BY: [daily-record.service, daily-input-form] — count: 2
function calcFeedPerBird(feedKg: number, pop: number)
// USED BY: [daily-record.service, daily-input-form] — count: 2
function calcFCR(feedKg: number, a: number, b: number)
⋮----
type Props = {
  flocks: FlockOption[]
  userRole: 'operator' | 'supervisor' | 'admin'
}
⋮----
type FormValues = {
  flockId: string
  recordDate: string
  deaths: string
  culled: string
  eggsGradeA: string
  eggsGradeB: string
  eggsCracked: string
  eggsAbnormal: string
  avgWeightKg: string
  feedKg: string
}
⋮----
function todayUTC(): string
⋮----
function minDate(role: 'operator' | 'supervisor' | 'admin'): string
⋮----
function empty(flockId: string): FormValues
⋮----
/* eslint-disable react-hooks/set-state-in-effect */
⋮----
} catch { /* ignore */ }
/* eslint-enable react-hooks/set-state-in-effect */
⋮----
function field(k: keyof FormValues)
⋮----
async function submitForm()
⋮----
function onSubmit(e: React.FormEvent<HTMLFormElement>)
⋮----
{/* Flock + Date */}
⋮----
max=
⋮----
{/* Depletion */}
⋮----
{/* Eggs */}
⋮----
{/* Feed + Weight */}
⋮----
{/* Auto-calc */}
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
  userRole: 'operator' | 'supervisor' | 'admin'
}
⋮----
async function handleRetire(flockId: string)
⋮----
onClick=
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
import type { User } from '@/lib/db/schema'
⋮----
interface Props {
  users: User[]
}
⋮----
async function handleRoleChange(userId: string, newRole: 'operator' | 'supervisor' | 'admin')
⋮----
async function handleToggleActive(user: User)
⋮----
onSuccess=
⋮----
onClick=
````

## File: components/layout/bottom-nav.tsx
````typescript
// client: needs usePathname for active state
⋮----
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Bird, Egg, Package, FileText } from 'lucide-react'
⋮----
export function BottomNav()
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

## File: components/ui/charts/depletion-area-chart.tsx
````typescript
// client: Recharts requires DOM APIs
⋮----
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
⋮----
type DataPoint = { date: string; cumulativeDepletion: number }
````

## File: components/ui/charts/fcr-line-chart.tsx
````typescript
// client: Recharts requires DOM APIs
⋮----
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
⋮----
type DataPoint = { date: string; fcr: number }
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
type DataPoint = { date: string; gradeA: number; gradeB: number }
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

## File: components/ui/kpi-card.tsx
````typescript
import { cn } from '@/lib/utils'
⋮----
type KpiCardProps = {
  label: string
  value: string | number
  unit?: string
  className?: string
}
⋮----
export function KpiCard(
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

## File: lib/actions/customer.actions.ts
````typescript
import { z } from 'zod'
import { getSession } from '@/lib/auth/get-session'
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
async function requireAdmin(): Promise<
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

## File: lib/actions/flock-phase.actions.ts
````typescript
import { z } from 'zod'
import { getSession } from '@/lib/auth/get-session'
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
async function requireAdmin(): Promise<
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
import { getSession } from '@/lib/auth/get-session'
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
async function requireSupervisorOrAdmin(): Promise<
⋮----
export async function createFlockAction(formData: FormData): Promise<ActionResult<
⋮----
export async function retireFlockAction(flockId: string): Promise<ActionResult>
⋮----
export async function getActiveFlocksAction(): Promise<ActionResult<Awaited<ReturnType<typeof getAllActiveFlocks>>>>
````

## File: lib/actions/user-coop-assignment.actions.ts
````typescript
import { getSession } from '@/lib/auth/get-session'
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
async function requireAdmin(): Promise<
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

## File: lib/auth/admin.ts
````typescript
import { createClient } from '@supabase/supabase-js'
⋮----
// Service role client — server only, never expose to client
````

## File: lib/auth/get-session.ts
````typescript
import { createSupabaseServerClient } from './server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'
import type { User } from '@/lib/db/schema'
⋮----
export type SessionUser = User
⋮----
function getCachedDbUser(userId: string)
⋮----
export async function getSession(): Promise<SessionUser | null>
````

## File: lib/db/queries/coop.queries.ts
````typescript
import { db } from '@/lib/db'
import { coops } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { Coop, NewCoop } from '@/lib/db/schema'
⋮----
export async function findAllCoops(): Promise<Coop[]>
⋮----
export async function findCoopById(id: string): Promise<Coop | null>
⋮----
export async function insertCoop(data: NewCoop): Promise<Coop>
⋮----
export async function updateCoop(id: string, data: Partial<NewCoop>): Promise<Coop | null>
⋮----
export async function deleteCoop(id: string): Promise<void>
````

## File: lib/db/queries/customer.queries.ts
````typescript
import { db } from '@/lib/db'
import { customers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { Customer, NewCustomer } from '@/lib/db/schema'
⋮----
export async function findCustomerById(id: string): Promise<Customer | null>
⋮----
export async function listCustomers(): Promise<Customer[]>
⋮----
export async function insertCustomer(data: NewCustomer): Promise<Customer>
⋮----
export async function updateCustomer(id: string, data: Partial<NewCustomer>): Promise<Customer | null>
````

## File: lib/db/queries/flock-phase.queries.ts
````typescript
import { db } from '@/lib/db'
import { flockPhases } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import type { FlockPhase, NewFlockPhase } from '@/lib/db/schema'
⋮----
export async function findAllFlockPhases(): Promise<FlockPhase[]>
⋮----
export async function insertFlockPhase(data: NewFlockPhase): Promise<FlockPhase>
⋮----
export async function updateFlockPhase(id: string, data: Partial<NewFlockPhase>): Promise<FlockPhase | null>
⋮----
export async function deleteFlockPhase(id: string): Promise<void>
````

## File: lib/db/queries/flock.queries.ts
````typescript
import { db } from '@/lib/db'
import { flocks, coops } from '@/lib/db/schema'
import { eq, isNull } from 'drizzle-orm'
import type { Flock, NewFlock } from '@/lib/db/schema'
⋮----
export async function findAllActiveFlocks(): Promise<(Flock &
⋮----
export async function findFlockById(id: string): Promise<Flock | null>
⋮----
export async function insertFlock(data: NewFlock): Promise<Flock>
⋮----
export async function updateFlock(id: string, data: Partial<NewFlock>): Promise<Flock | null>
````

## File: lib/db/queries/inventory.queries.ts
````typescript
import { db } from '@/lib/db'
import { inventoryMovements, stockAdjustments, regradeRequests } from '@/lib/db/schema'
import { eq, and, desc, sql, sum } from 'drizzle-orm'
import type {
  NewInventoryMovement,
  StockAdjustment, NewStockAdjustment,
  RegradeRequest, NewRegradeRequest,
} from '@/lib/db/schema'
⋮----
export async function getStockBalance(flockId: string, grade: 'A' | 'B'): Promise<number>
⋮----
export async function getStockBalanceByGrade(grade: 'A' | 'B'): Promise<number>
⋮----
export async function getAllStockBalances(): Promise<
⋮----
export async function insertStockAdjustmentWithMovement(
  adjustment: NewStockAdjustment,
  movement: NewInventoryMovement
): Promise<StockAdjustment>
⋮----
export async function findPendingRegradeRequests(): Promise<RegradeRequest[]>
⋮----
export async function findRegradeRequestById(id: string): Promise<RegradeRequest | null>
⋮----
export async function insertRegradeRequest(data: NewRegradeRequest): Promise<RegradeRequest>
⋮----
export async function updateRegradeRequestStatus(
  id: string,
  status: 'APPROVED' | 'REJECTED',
  reviewedBy: string
): Promise<void>
⋮----
export async function approveRegradeRequestTx(requestId: string, reviewedBy: string): Promise<void>
````

## File: lib/db/queries/sales-order.queries.ts
````typescript
import { db } from '@/lib/db'
import { salesOrders, salesOrderItems, inventoryMovements, invoices, flocks, customers } from '@/lib/db/schema'
import { eq, and, desc, sql, count, getTableColumns } from 'drizzle-orm'
import type { SalesOrder, SalesOrderItem, NewSalesOrder, NewSalesOrderItem, NewInventoryMovement, NewInvoice } from '@/lib/db/schema'
⋮----
export type SalesOrderWithCustomer = SalesOrder & { customerName: string | null }
⋮----
export async function findSalesOrderById(id: string): Promise<SalesOrderWithCustomer | null>
⋮----
export async function findSalesOrderItems(orderId: string): Promise<SalesOrderItem[]>
⋮----
export async function countSalesOrdersThisMonth(prefix: string): Promise<number>
⋮----
// Use MAX on trailing seq to avoid collision when rows are deleted (COUNT would reuse numbers)
⋮----
export async function insertSalesOrderWithItems(
  order: NewSalesOrder,
  items: Omit<NewSalesOrderItem, 'orderId'>[]
): Promise<SalesOrder>
⋮----
export async function updateSalesOrderStatus(
  id: string,
  status: 'draft' | 'confirmed' | 'fulfilled' | 'cancelled',
  updatedBy: string
): Promise<void>
⋮----
export async function deleteDraftSO(id: string): Promise<void>
⋮----
export async function fulfillSOTx(
  orderId: string,
  userId: string,
  movements: NewInventoryMovement[],
  invoice: NewInvoice,
  flockUpdates: { flockId: string; retiredAt: Date }[]
): Promise<void>
⋮----
// Check stock for each egg item movement
⋮----
// Update SO status
⋮----
// Insert inventory movements
⋮----
// Insert invoice
⋮----
// Update flock status for flock items
⋮----
export async function getCustomerOutstandingCredit(customerId: string): Promise<number>
⋮----
export async function listSalesOrders(
  page: number = 1,
  pageSize: number = 20,
  status?: string
): Promise<
````

## File: lib/db/queries/sales-return.queries.ts
````typescript
import { db } from '@/lib/db'
import { salesReturns, salesReturnItems, salesOrders, inventoryMovements, invoices, customerCredits } from '@/lib/db/schema'
import { eq, desc, sql, count, getTableColumns } from 'drizzle-orm'
import type { SalesReturn, SalesReturnItem, NewSalesReturn, NewSalesReturnItem, NewInventoryMovement, NewInvoice, NewCustomerCredit } from '@/lib/db/schema'
⋮----
export async function findSalesReturnById(id: string): Promise<SalesReturn | null>
⋮----
export async function findSalesReturnItems(returnId: string): Promise<SalesReturnItem[]>
⋮----
export async function countSalesReturnsThisMonth(prefix: string): Promise<number>
⋮----
export async function insertSalesReturnWithItems(
  ret: NewSalesReturn,
  items: Omit<NewSalesReturnItem, 'returnId'>[]
): Promise<SalesReturn>
⋮----
export async function approveSalesReturnTx(
  returnId: string,
  userId: string,
  movements: NewInventoryMovement[],
  creditNoteInvoice: NewInvoice,
  customerCredit: NewCustomerCredit
): Promise<void>
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
  returnId: string,
  userId: string
): Promise<void>
⋮----
export async function findSalesReturnsByOrderId(orderId: string): Promise<SalesReturn[]>
⋮----
export type SalesReturnWithOrder = SalesReturn & { orderNumber: string | null }
⋮----
export async function listSalesReturnsWithOrder(
  page: number = 1,
  pageSize: number = 20,
  status?: string
): Promise<
⋮----
export async function listSalesReturns(
  page: number = 1,
  pageSize: number = 20,
  status?: string
): Promise<
````

## File: lib/db/queries/user-coop-assignment.queries.ts
````typescript
import { db } from '@/lib/db'
import { userCoopAssignments, coops } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import type { UserCoopAssignment } from '@/lib/db/schema'
⋮----
export async function findAssignmentsByUser(userId: string): Promise<(UserCoopAssignment &
⋮----
export async function findAssignedCoopIds(userId: string): Promise<string[]>
⋮----
export async function insertAssignment(userId: string, coopId: string): Promise<UserCoopAssignment>
⋮----
export async function deleteAssignment(userId: string, coopId: string): Promise<void>
````

## File: lib/db/queries/user.queries.ts
````typescript
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { NewUser, User } from '@/lib/db/schema'
⋮----
export async function findAllUsers(): Promise<User[]>
⋮----
export async function findUserById(id: string): Promise<User | null>
⋮----
export async function insertUser(data: NewUser): Promise<User>
⋮----
export async function updateUser(id: string, data: Partial<NewUser>): Promise<User | null>
````

## File: lib/db/schema/alert-cooldowns.ts
````typescript
import { pgTable, uuid, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
⋮----
export type AlertCooldown = typeof alertCooldowns.$inferSelect
export type NewAlertCooldown = typeof alertCooldowns.$inferInsert
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

## File: lib/db/schema/flock-phases.ts
````typescript
import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core'
⋮----
export type FlockPhase = typeof flockPhases.$inferSelect
export type NewFlockPhase = typeof flockPhases.$inferInsert
````

## File: lib/db/schema/inventory-snapshots.ts
````typescript
import { pgTable, uuid, integer, date, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { flocks } from './flocks'
⋮----
export type InventorySnapshot = typeof inventorySnapshots.$inferSelect
export type NewInventorySnapshot = typeof inventorySnapshots.$inferInsert
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

## File: lib/db/schema/payments.ts
````typescript
import { pgTable, uuid, text, numeric, date, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { invoices } from './invoices'
import { users } from './users'
⋮----
export type Payment = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert
````

## File: lib/db/schema/regrade-requests.ts
````typescript
import { pgTable, uuid, integer, date, timestamp, text } from 'drizzle-orm/pg-core'
import { flocks } from './flocks'
import { users } from './users'
⋮----
quantity: integer('quantity').notNull(), // always positive
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

## File: lib/db/schema/sales-orders.ts
````typescript
import { pgTable, uuid, text, numeric, date, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { customers } from './customers'
import { users } from './users'
⋮----
export type SalesOrder = typeof salesOrders.$inferSelect
export type NewSalesOrder = typeof salesOrders.$inferInsert
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

## File: lib/db/schema/stock-adjustments.ts
````typescript
import { pgTable, uuid, integer, date, timestamp, text } from 'drizzle-orm/pg-core'
import { flocks } from './flocks'
import { users } from './users'
⋮----
quantity: integer('quantity').notNull(), // signed: positive = add, negative = remove
⋮----
export type StockAdjustment = typeof stockAdjustments.$inferSelect
export type NewStockAdjustment = typeof stockAdjustments.$inferInsert
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

## File: lib/db/schema/users.ts
````typescript
import { pgTable, uuid, text, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core'
⋮----
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
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
import { flockPhases } from './schema'
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

## File: lib/services/coop.service.test.ts
````typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
⋮----
import { createCoop, getAllCoops, deactivateCoop } from './coop.service'
⋮----
vi.mocked(coopQueries.updateCoop).mockResolvedValue({ id: 'coop-1', status: 'inactive' } as any) // any: partial Coop for mock
````

## File: lib/services/coop.service.ts
````typescript
import {
  findAllCoops,
  findCoopById,
  insertCoop,
  updateCoop as dbUpdateCoop,
} from '@/lib/db/queries/coop.queries'
import type { Coop } from '@/lib/db/schema'
⋮----
type CreateCoopInput = {
  name: string
  capacity?: number
  notes?: string
}
⋮----
export async function createCoop(input: CreateCoopInput): Promise<Coop>
⋮----
export async function getAllCoops(): Promise<Coop[]>
⋮----
export async function getCoopById(id: string): Promise<Coop | null>
⋮----
export async function updateCoop(id: string, input: Partial<CreateCoopInput>): Promise<Coop | null>
⋮----
export async function deactivateCoop(id: string): Promise<void>
⋮----
export async function activateCoop(id: string): Promise<void>
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
export async function createCustomer(input: CreateCustomerInput): Promise<Customer>
⋮----
export async function getAllCustomers(): Promise<Customer[]>
⋮----
export async function getCustomerById(id: string): Promise<Customer | null>
⋮----
export async function updateCustomerById(
  id: string,
  input: Partial<Omit<CreateCustomerInput, 'createdBy'>>
): Promise<Customer | null>
⋮----
export async function deactivateCustomer(id: string): Promise<void>
⋮----
export async function activateCustomer(id: string): Promise<void>
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
export async function getPhaseForWeeks(ageWeeks: number): Promise<FlockPhase | null>
⋮----
export async function createFlockPhase(input: {
  name: string
  minWeeks: number
  maxWeeks?: number
  sortOrder: number
}): Promise<FlockPhase>
⋮----
export async function updateFlockPhaseById(
  id: string,
  input: Partial<{ name: string; minWeeks: number; maxWeeks: number | null; sortOrder: number }>
): Promise<FlockPhase | null>
⋮----
export async function deleteFlockPhaseById(id: string): Promise<void>
````

## File: lib/services/flock.service.test.ts
````typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
⋮----
import { getFlockAgeWeeks, retireFlock, createFlock } from './flock.service'
⋮----
const today = new Date('2025-03-12') // 70 days = 10 weeks
⋮----
vi.mocked(flockQueries.updateFlock).mockResolvedValue({ id: 'flock-1', retiredAt: new Date() } as any) // any: partial Flock for mock
````

## File: lib/services/flock.service.ts
````typescript
import {
  findAllActiveFlocks,
  insertFlock,
  updateFlock,
} from '@/lib/db/queries/flock.queries'
import { getPhaseForWeeks } from '@/lib/services/flock-phase.service'
import type { Flock, FlockPhase } from '@/lib/db/schema'
⋮----
export type FlockWithMeta = Flock & {
  coopName: string
  ageWeeks: number
  phase: FlockPhase | null
}
⋮----
export function getFlockAgeWeeks(arrivalDate: Date, today: Date = new Date()): number
⋮----
export async function getAllActiveFlocks(): Promise<FlockWithMeta[]>
⋮----
type CreateFlockInput = {
  coopId: string
  name: string
  arrivalDate: Date
  initialCount: number
  breed?: string
  notes?: string
  createdBy: string
}
⋮----
export async function createFlock(input: CreateFlockInput): Promise<Flock>
⋮----
export async function updateFlockById(
  id: string,
  input: Partial<Omit<CreateFlockInput, 'createdBy'>>,
  updatedBy: string
): Promise<Flock | null>
⋮----
export async function retireFlock(id: string, updatedBy: string): Promise<void>
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
export async function createSalesReturn(input: CreateReturnInput, userId: string, role: string)
⋮----
// Validate return quantities don't exceed original SO quantities
⋮----
// Generate return number
⋮----
export async function approveSalesReturn(returnId: string, userId: string, role: string)
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
export async function rejectSalesReturn(returnId: string, userId: string, role: string)
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

## File: lib/services/user.service.ts
````typescript
import { supabaseAdmin } from '@/lib/auth/admin'
import {
  findAllUsers,
  findUserById,
  insertUser,
  updateUser,
} from '@/lib/db/queries/user.queries'
import type { User } from '@/lib/db/schema'
⋮----
type CreateUserInput = {
  email: string
  password: string
  fullName: string
  role: 'operator' | 'supervisor' | 'admin'
  createdBy: string
}
⋮----
export async function createUser(input: CreateUserInput): Promise<User>
⋮----
export async function getAllUsers(): Promise<User[]>
⋮----
export async function getUserById(id: string): Promise<User | null>
⋮----
export async function updateUserRole(
  id: string,
  role: 'operator' | 'supervisor' | 'admin'
): Promise<User | null>
⋮----
export async function deactivateUser(id: string): Promise<void>
⋮----
export async function activateUser(id: string): Promise<void>
⋮----
export async function changeUserPassword(id: string, newPassword: string): Promise<void>
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

## File: playwright.config.ts
````typescript
import { defineConfig } from '@playwright/test';
````

## File: postcss.config.mjs
````javascript

````

## File: public/file.svg
````xml
<svg fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 13.5V5.41a1 1 0 0 0-.3-.7L9.8.29A1 1 0 0 0 9.08 0H1.5v13.5A2.5 2.5 0 0 0 4 16h8a2.5 2.5 0 0 0 2.5-2.5m-1.5 0v-7H8v-5H3v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1M9.5 5V2.12L12.38 5zM5.13 5h-.62v1.25h2.12V5zm-.62 3h7.12v1.25H4.5zm.62 3h-.62v1.25h7.12V11z" clip-rule="evenodd" fill="#666" fill-rule="evenodd"/></svg>
````

## File: public/globe.svg
````xml
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><g clip-path="url(#a)"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.27 14.1a6.5 6.5 0 0 0 3.67-3.45q-1.24.21-2.7.34-.31 1.83-.97 3.1M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.48-1.52a7 7 0 0 1-.96 0H7.5a4 4 0 0 1-.84-1.32q-.38-.89-.63-2.08a40 40 0 0 0 3.92 0q-.25 1.2-.63 2.08a4 4 0 0 1-.84 1.31zm2.94-4.76q1.66-.15 2.95-.43a7 7 0 0 0 0-2.58q-1.3-.27-2.95-.43a18 18 0 0 1 0 3.44m-1.27-3.54a17 17 0 0 1 0 3.64 39 39 0 0 1-4.3 0 17 17 0 0 1 0-3.64 39 39 0 0 1 4.3 0m1.1-1.17q1.45.13 2.69.34a6.5 6.5 0 0 0-3.67-3.44q.65 1.26.98 3.1M8.48 1.5l.01.02q.41.37.84 1.31.38.89.63 2.08a40 40 0 0 0-3.92 0q.25-1.2.63-2.08a4 4 0 0 1 .85-1.32 7 7 0 0 1 .96 0m-2.75.4a6.5 6.5 0 0 0-3.67 3.44 29 29 0 0 1 2.7-.34q.31-1.83.97-3.1M4.58 6.28q-1.66.16-2.95.43a7 7 0 0 0 0 2.58q1.3.27 2.95.43a18 18 0 0 1 0-3.44m.17 4.71q-1.45-.12-2.69-.34a6.5 6.5 0 0 0 3.67 3.44q-.65-1.27-.98-3.1" fill="#666"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs></svg>
````

## File: public/next.svg
````xml
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 394 80"><path fill="#000" d="M262 0h68.5v12.7h-27.2v66.6h-13.6V12.7H262V0ZM149 0v12.7H94v20.4h44.3v12.6H94v21h55v12.6H80.5V0h68.7zm34.3 0h-17.8l63.8 79.4h17.9l-32-39.7 32-39.6h-17.9l-23 28.6-23-28.6zm18.3 56.7-9-11-27.1 33.7h17.8l18.3-22.7z"/><path fill="#000" d="M81 79.3 17 0H0v79.3h13.6V17l50.2 62.3H81Zm252.6-.4c-1 0-1.8-.4-2.5-1s-1.1-1.6-1.1-2.6.3-1.8 1-2.5 1.6-1 2.6-1 1.8.3 2.5 1a3.4 3.4 0 0 1 .6 4.3 3.7 3.7 0 0 1-3 1.8zm23.2-33.5h6v23.3c0 2.1-.4 4-1.3 5.5a9.1 9.1 0 0 1-3.8 3.5c-1.6.8-3.5 1.3-5.7 1.3-2 0-3.7-.4-5.3-1s-2.8-1.8-3.7-3.2c-.9-1.3-1.4-3-1.4-5h6c.1.8.3 1.6.7 2.2s1 1.2 1.6 1.5c.7.4 1.5.5 2.4.5 1 0 1.8-.2 2.4-.6a4 4 0 0 0 1.6-1.8c.3-.8.5-1.8.5-3V45.5zm30.9 9.1a4.4 4.4 0 0 0-2-3.3 7.5 7.5 0 0 0-4.3-1.1c-1.3 0-2.4.2-3.3.5-.9.4-1.6 1-2 1.6a3.5 3.5 0 0 0-.3 4c.3.5.7.9 1.3 1.2l1.8 1 2 .5 3.2.8c1.3.3 2.5.7 3.7 1.2a13 13 0 0 1 3.2 1.8 8.1 8.1 0 0 1 3 6.5c0 2-.5 3.7-1.5 5.1a10 10 0 0 1-4.4 3.5c-1.8.8-4.1 1.2-6.8 1.2-2.6 0-4.9-.4-6.8-1.2-2-.8-3.4-2-4.5-3.5a10 10 0 0 1-1.7-5.6h6a5 5 0 0 0 3.5 4.6c1 .4 2.2.6 3.4.6 1.3 0 2.5-.2 3.5-.6 1-.4 1.8-1 2.4-1.7a4 4 0 0 0 .8-2.4c0-.9-.2-1.6-.7-2.2a11 11 0 0 0-2.1-1.4l-3.2-1-3.8-1c-2.8-.7-5-1.7-6.6-3.2a7.2 7.2 0 0 1-2.4-5.7 8 8 0 0 1 1.7-5 10 10 0 0 1 4.3-3.5c2-.8 4-1.2 6.4-1.2 2.3 0 4.4.4 6.2 1.2 1.8.8 3.2 2 4.3 3.4 1 1.4 1.5 3 1.5 5h-5.8z"/></svg>
````

## File: public/vercel.svg
````xml
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1155 1000"><path d="m577.3 0 577.4 1000H0z" fill="#fff"/></svg>
````

## File: public/window.svg
````xml
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 2.5h13v10a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1zM0 1h16v11.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 12.5zm3.75 4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5M7 4.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0m1.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5" fill="#666"/></svg>
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

## File: app/(app)/admin/import/import-panel.tsx
````typescript
'use client' // client: file upload, multi-step state, CSV preview
⋮----
import { useState, useTransition } from 'react'
import { Upload, Download, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react'
import { parseCsvAction, commitImportAction, getCsvTemplateAction } from '@/lib/actions/import.actions'
import type { ImportEntity } from '@/lib/services/import.service'
⋮----
type Step = 'select' | 'preview' | 'done'
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
onClick=
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

## File: app/(app)/admin/import/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { ImportPanel } from './import-panel'
⋮----
export default async function ImportPage()
````

## File: app/(app)/produksi/[id]/edit/edit-form.tsx
````typescript
'use client' // client: needs useState for error/success state and form submission
⋮----
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { DailyRecord } from '@/lib/db/schema'
import { updateDailyRecordAction } from '@/lib/actions/daily-record.actions'
import { correctDailyRecordAction } from '@/lib/actions/lock-period.actions'
⋮----
type Props = {
  record: DailyRecord
  requireReason: boolean
}
⋮----
function handleSubmit(e: React.FormEvent<HTMLFormElement>)
````

## File: app/(app)/produksi/[id]/edit/page.tsx
````typescript
import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { findDailyRecordById } from '@/lib/db/queries/daily-record.queries'
import { canEdit } from '@/lib/services/lock-period.service'
import { DailyRecordEditForm } from './edit-form'
⋮----
type Props = { params: Promise<{ id: string }> }
⋮----
// Check if record is within H+7 window (supervisor window) for admin correction UI
⋮----
// Non-admin, locked record → redirect away
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
}
⋮----
interface Props {
  flocks: FlockOption[]
  selectedFlockId?: string
  selectedCoopId?: string
}
⋮----
export default function FlockFilter(
⋮----
function navigate(newCoopId: string, newFlockId: string)
⋮----
function handleCoopChange(e: React.ChangeEvent<HTMLSelectElement>)
⋮----
function handleFlockChange(e: React.ChangeEvent<HTMLSelectElement>)
````

## File: app/(app)/stok/page.tsx
````typescript
import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { findAllActiveFlocks } from '@/lib/db/queries/flock.queries'
import { getAllStockBalances } from '@/lib/db/queries/inventory.queries'
import Link from 'next/link'
````

## File: app/(auth)/logout/route.ts
````typescript
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/auth/server'
import type { NextRequest } from 'next/server'
⋮----
export async function GET(request: NextRequest)
⋮----
// Use request origin so redirect works regardless of port (dev vs prod)
````

## File: app/globals.css
````css
@theme inline {
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
````

## File: components/providers/progress-bar.tsx
````typescript
// client: needs usePathname + useState to detect navigation and show overlay
⋮----
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
⋮----
export function ProgressBar()
⋮----
// track pending hide timeout so fast navigations don't flicker
⋮----
// pathname changed = navigation complete
⋮----
// intercept link clicks to show overlay immediately
⋮----
function handleClick(e: MouseEvent)
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
import dynamic from 'next/dynamic'
import type { DashboardChartPoint } from '@/lib/services/dashboard.service'
⋮----
export function DashboardCharts(
````

## File: components/ui/invoice-status-badge.tsx
````typescript
import type { Invoice } from '@/lib/db/schema'
⋮----
export function InvoiceStatusBadge(
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

## File: lib/actions/coop.actions.ts
````typescript
import { z } from 'zod'
import { getSession } from '@/lib/auth/get-session'
import { requireAdmin } from '@/lib/auth/guards'
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

## File: lib/actions/lock-period.actions.ts
````typescript
import { z } from 'zod'
import { getSession } from '@/lib/auth/get-session'
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
import { getSession } from '@/lib/auth/get-session'
import {
  getNotificationsForRole,
  getUnreadCount,
  readNotification,
  readAllNotifications,
} from '@/lib/services/notification.service'
import type { Notification } from '@/lib/services/notification.service'
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

## File: lib/actions/sales-order.actions.ts
````typescript
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth/get-session'
import { requireSupervisorOrAdmin } from '@/lib/auth/guards'
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
import { getSession } from '@/lib/auth/get-session'
import { requireSupervisorOrAdmin, requireAdmin } from '@/lib/auth/guards'
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

## File: lib/actions/user.actions.ts
````typescript
import { z } from 'zod'
import { getSession } from '@/lib/auth/get-session'
import { requireAdmin } from '@/lib/auth/guards'
import {
  createUser,
  getAllUsers,
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
  role: 'operator' | 'supervisor' | 'admin'
): Promise<ActionResult>
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

## File: lib/auth/guards.ts
````typescript
import { getSession } from './get-session'
⋮----
type GuardFailure = { success: false; error: string }
⋮----
export async function requireAuth(): Promise<GuardFailure | null>
⋮----
export async function requireSupervisorOrAdmin(): Promise<GuardFailure | null>
⋮----
export async function requireAdmin(): Promise<GuardFailure | null>
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

## File: lib/db/queries/alert-cooldown.queries.ts
````typescript
import { db, DrizzleTx } from '@/lib/db'
import { alertCooldowns } from '@/lib/db/schema'
import type { AlertCooldown } from '@/lib/db/schema'
import { eq, and, gt } from 'drizzle-orm'
⋮----
// USED BY: [alert.service] — count: 1
⋮----
export async function findActiveCooldown(
  alertType: string,
  entityId: string,
  cooldownHours: number,
  tx?: DrizzleTx
): Promise<AlertCooldown | null>
⋮----
export async function upsertCooldown(
  alertType: string,
  entityType: string,
  entityId: string,
  tx?: DrizzleTx
): Promise<void>
````

## File: lib/db/schema/daily-records.ts
````typescript
import { pgTable, uuid, integer, date, timestamp, boolean, numeric, uniqueIndex } from 'drizzle-orm/pg-core'
import { flocks } from './flocks'
import { users } from './users'
⋮----
export type DailyRecord = typeof dailyRecords.$inferSelect
export type NewDailyRecord = typeof dailyRecords.$inferInsert
````

## File: lib/db/schema/flocks.ts
````typescript
import { pgTable, uuid, text, integer, date, timestamp, boolean } from 'drizzle-orm/pg-core'
import { coops } from './coops'
import { users } from './users'
⋮----
export type Flock = typeof flocks.$inferSelect
export type NewFlock = typeof flocks.$inferInsert
````

## File: lib/db/schema/index.ts
````typescript

````

## File: lib/db/schema/inventory-movements.ts
````typescript
import { pgTable, uuid, integer, date, timestamp, text, pgEnum, boolean } from 'drizzle-orm/pg-core'
import { flocks } from './flocks'
import { users } from './users'
⋮----
export type InventoryMovement = typeof inventoryMovements.$inferSelect
export type NewInventoryMovement = typeof inventoryMovements.$inferInsert
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

## File: lib/services/app-settings.service.ts
````typescript
import { getAppSetting as getSettingQuery, upsertAppSetting } from '@/lib/db/queries/app-settings.queries'
⋮----
export async function getAppSetting(key: string): Promise<string | null>
⋮----
export async function saveAppSetting(key: string, value: string, updatedBy: string): Promise<void>
````

## File: lib/services/customer.service.test.ts
````typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
⋮----
import { createCustomer, deactivateCustomer } from './customer.service'
⋮----
vi.mocked(customerQueries.updateCustomer).mockResolvedValue({ id: 'cust-1', status: 'inactive' } as any) // any: partial Customer for mock
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
import { dailyRecords, inventoryMovements } from '@/lib/db/schema'
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
  eggsGradeA?: number
  eggsGradeB?: number
  eggsCracked?: number
  eggsAbnormal?: number
  avgWeightKg?: number | null
  feedKg?: number | null
}
⋮----
/**
 * Admin-only: apply corrections to a daily_record past lock window.
 * Creates one correction_record per changed field.
 * If eggsGradeA or eggsGradeB changes, creates compensating inventory_movements.
 */
export async function correctDailyRecord(
  recordId: string,
  patch: DailyRecordPatch,
  reason: string,
  adminId: string
): Promise<CorrectionRecord[]>
⋮----
// Build update set
⋮----
// Compensating inventory movements for egg grade changes
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

## File: lib/services/stock.service.ts
````typescript
import {
  getStockBalance as _getStockBalance,
  insertStockAdjustmentWithMovement,
  findPendingRegradeRequests,
  findRegradeRequestById,
  insertRegradeRequest,
  updateRegradeRequestStatus,
  approveRegradeRequestTx,
} from '@/lib/db/queries/inventory.queries'
import { assertCanEdit } from '@/lib/services/lock-period.service'
import type { StockAdjustment, RegradeRequest } from '@/lib/db/schema'
⋮----
type Role = 'operator' | 'supervisor' | 'admin'
⋮----
export async function getStockBalance(flockId: string, grade: 'A' | 'B'): Promise<number>
⋮----
export function validateStockNotBelowZero(currentBalance: number, quantity: number): void
⋮----
type AdjustmentInput = {
  flockId: string
  adjustmentDate: Date
  grade: 'A' | 'B'
  quantity: number // signed
  reason: string
  notes?: string
}
⋮----
quantity: number // signed
⋮----
export async function createStockAdjustment(
  input: AdjustmentInput,
  userId: string,
  role: Role = 'admin',
  now: Date = new Date()
): Promise<StockAdjustment>
⋮----
// Lock period check — adjustmentDate is treated as the record date
⋮----
sourceId: null, // Will be set by insertStockAdjustmentWithMovement
⋮----
type RegradeInput = {
  flockId: string
  gradeFrom: 'A' | 'B'
  gradeTo: 'A' | 'B'
  quantity: number
  requestDate: Date
  notes?: string
}
⋮----
export async function submitRegradeRequest(
  input: RegradeInput,
  userId: string
): Promise<RegradeRequest>
⋮----
export async function approveRegradeRequest(requestId: string, adminId: string): Promise<void>
⋮----
export async function rejectRegradeRequest(requestId: string, adminId: string): Promise<void>
⋮----
export async function getPendingRegradeRequests(): Promise<RegradeRequest[]>
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
docs/superpowers/*PORT=5555
nohup.out
PORT=5555
nohup.out
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

## File: app/(app)/laporan/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAgingData } from '@/lib/services/invoice.service'
import { KpiCard } from '@/components/ui/kpi-card'
⋮----
function formatRupiah(n: number): string
⋮----
function formatDate(d: Date): string
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

## File: app/(app)/produksi/page.tsx
````typescript
import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { findAllActiveFlocks } from '@/lib/db/queries/flock.queries'
import { findRecentDailyRecordsMultiFlocks } from '@/lib/db/queries/daily-record.queries'
import Link from 'next/link'
import FlockFilter from './flock-filter'
⋮----
function isWithinLockWindow(recordDate: Date, now: Date, days: number): boolean
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
⋮----
export async function POST(request: Request): Promise<Response>
⋮----
// Secret not configured — fail closed (don't allow requests through)
````

## File: app/api/laporan/aging-csv/route.ts
````typescript
import { getSession } from '@/lib/auth/get-session'
import { getAgingData } from '@/lib/services/invoice.service'
⋮----
export async function GET(): Promise<Response>
````

## File: app/api/laporan/produksi-csv/route.ts
````typescript
import { getSession } from '@/lib/auth/get-session'
import { getProductionReportData } from '@/lib/services/daily-record.service'
import type { Role, ProductionReportResult } from '@/lib/services/daily-record.service'
⋮----
function parseSafeDate(str: string | null, fallback: Date): Date
⋮----
function escapeField(value: string): string
⋮----
export async function GET(request: Request): Promise<Response>
````

## File: app/layout.tsx
````typescript
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
⋮----
import { ProgressBar } from '@/components/providers/progress-bar'
⋮----
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>)
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

## File: components/layout/app-shell.tsx
````typescript
'use client' // client: needs usePathname for active nav state
⋮----
import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { BottomNav } from './bottom-nav'
import type { SessionUser } from '@/lib/auth/get-session'
import type { Notification } from '@/lib/services/notification.service'
⋮----
export function AppShell({
  user,
  children,
  notifications,
  readNotificationIds,
}: {
  user: SessionUser
  children: React.ReactNode
  notifications: Notification[]
  readNotificationIds: string[]
})
````

## File: lib/actions/daily-record.actions.ts
````typescript
import { z } from 'zod'
import { getSession } from '@/lib/auth/get-session'
import { requireAuth } from '@/lib/auth/guards'
import { createDailyRecord, getFlockOptionsForInput, updateDailyRecord } from '@/lib/services/daily-record.service'
import { findAssignedCoopIds } from '@/lib/db/queries/user-coop-assignment.queries'
import { findFlockById } from '@/lib/db/queries/flock.queries'
⋮----
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
⋮----
async function assertCoopAccess(userId: string, role: string, flockId: string): Promise<
⋮----
if (role !== 'operator') return null // supervisor + admin can access all coops
⋮----
export async function createDailyRecordAction(
  formData: FormData
): Promise<ActionResult<
⋮----
flockId: z.string().uuid().optional(), // needed for coop scope check
⋮----
export async function updateDailyRecordAction(
  formData: FormData
): Promise<ActionResult<
⋮----
export async function getFlockOptionsForInputAction(): Promise<ActionResult<import('@/lib/services/daily-record.service').FlockOption[]>>
````

## File: lib/actions/stock.actions.ts
````typescript
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
⋮----
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
⋮----
export async function getStockBalanceAction(
  flockId: string,
  grade: 'A' | 'B'
): Promise<ActionResult<number>>
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
````

## File: lib/db/queries/correction-record.queries.ts
````typescript
import { db, DrizzleTx } from '@/lib/db'
import { correctionRecords, users } from '@/lib/db/schema'
import type { CorrectionRecord, NewCorrectionRecord } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
⋮----
// USED BY: [lock-period.service] — count: 1
⋮----
export async function insertCorrectionRecord(
  data: NewCorrectionRecord,
  tx?: DrizzleTx
): Promise<CorrectionRecord>
⋮----
export type CorrectionRecordWithUser = CorrectionRecord & { correctedByName: string | null }
⋮----
export async function findCorrectionsByEntity(
  entityType: CorrectionRecord['entityType'],
  entityId: string
): Promise<CorrectionRecordWithUser[]>
````

## File: lib/db/queries/dashboard.queries.ts
````typescript
import { db } from '@/lib/db'
import { dailyRecords, flocks, inventoryMovements } from '@/lib/db/schema'
import { desc, isNull, gte, and, sum, eq, inArray, SQL } from 'drizzle-orm'
import type { DailyRecord } from '@/lib/db/schema'
⋮----
export type DashboardRecord = Pick<
  DailyRecord,
  'id' | 'flockId' | 'recordDate' | 'deaths' | 'culled' | 'eggsGradeA' | 'eggsGradeB' | 'feedKg' | 'isLateInput'
>
⋮----
export async function getRecentDailyRecordsAcrossFlocks(limit: number, flockIds?: string[]): Promise<DashboardRecord[]>
⋮----
export type DailyAggRow = {
  date: Date
  totalEggsA: number
  totalEggsB: number
  totalDeaths: number
  totalFeedKg: number
}
⋮----
export async function getDailyProductionAgg(days: number, flockIds?: string[]): Promise<DailyAggRow[]>
⋮----
export type FlockPopulationRow = {
  flockId: string
  initialCount: number
  totalDeaths: number
  totalCulled: number
}
⋮----
export async function getActiveFlockPopulations(flockIds?: string[]): Promise<FlockPopulationRow[]>
⋮----
export type StockSummaryRow = {
  totalGradeA: number
  totalGradeB: number
}
⋮----
export async function getStockSummary(): Promise<StockSummaryRow>
````

## File: lib/db/queries/payment.queries.ts
````typescript
import { db, DrizzleTx } from '@/lib/db'
import { payments } from '@/lib/db/schema'
import { eq, sql, asc } from 'drizzle-orm'
import type { Payment, NewPayment } from '@/lib/db/schema'
⋮----
export async function createPayment(payment: NewPayment, tx?: DrizzleTx): Promise<Payment>
⋮----
export async function listPaymentsByInvoice(invoiceId: string): Promise<Payment[]>
⋮----
export async function sumPaymentsByInvoice(invoiceId: string, tx?: DrizzleTx): Promise<number>
````

## File: lib/db/schema/app-settings.ts
````typescript
import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'
⋮----
export type AppSetting = typeof appSettings.$inferSelect
export type NewAppSetting = typeof appSettings.$inferInsert
````

## File: lib/db/schema/customers.ts
````typescript
import { pgTable, uuid, text, integer, numeric, timestamp, pgEnum, boolean } from 'drizzle-orm/pg-core'
import { users } from './users'
⋮----
export type Customer = typeof customers.$inferSelect
export type NewCustomer = typeof customers.$inferInsert
````

## File: lib/services/dashboard.service.ts
````typescript
import {
  getRecentDailyRecordsAcrossFlocks,
  getDailyProductionAgg,
  getActiveFlockPopulations,
  getStockSummary,
  type DashboardRecord,
  type DailyAggRow,
} from '@/lib/db/queries/dashboard.queries'
import { computeHDP, computeFCR, computeFeedPerBird } from './daily-record.service'
⋮----
export type DashboardKpis = {
  hdpPercent: number
  fcr7Day: number
  productionToday: number
  stockReadyToSell: number
  activePopulation: number
  feedPerBirdGrams: number
}
⋮----
export type DashboardChartPoint = {
  date: string
  hdp: number
  fcr: number
  gradeA: number
  gradeB: number
  cumulativeDepletion: number
}
⋮----
export type DashboardRecentRecord = {
  date: string
  gradeA: number
  gradeB: number
  deaths: number
  feedKg: number
  fcr: number
  isLate: boolean
}
⋮----
export async function getDashboardKpis(flockIds?: string[]): Promise<DashboardKpis>
⋮----
export async function getProductionChartData(days: number = 30, flockIds?: string[]): Promise<DashboardChartPoint[]>
⋮----
export async function getRecentDashboardRecords(limit: number = 7, flockIds?: string[]): Promise<DashboardRecentRecord[]>
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
import {
  parseFlockscsv,
  parseDailyRecordsCsv,
  parseCustomersCsv,
  parseOpeningStockCsv,
  getCsvTemplate,
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
  role: 'operator' | 'supervisor' | 'admin',
  limit = 50
): Promise<Notification[]>
⋮----
export async function getUnreadCount(
  userId: string,
  role: 'operator' | 'supervisor' | 'admin'
): Promise<number>
⋮----
export async function readNotification(
  notificationId: string,
  userId: string
): Promise<void>
⋮----
export async function readAllNotifications(
  userId: string,
  role: 'operator' | 'supervisor' | 'admin'
): Promise<void>
⋮----
export async function pushNotification(
  data: NewNotification
): Promise<Notification>
⋮----
export async function getReadNotificationIds(userId: string): Promise<string[]>
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

## File: app/(app)/admin/page.tsx
````typescript
import Link from 'next/link'
import { Users, Home, ShoppingBag, Settings, MessageSquare, Bell, Upload } from 'lucide-react'
````

## File: app/(app)/admin/settings/alerts/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAppSetting } from '@/lib/services/app-settings.service'
import { updateAlertSettings } from '@/lib/actions/app-settings.actions'
````

## File: app/(app)/laporan/produksi/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getSession } from '@/lib/auth/get-session'
import { getProductionReportData } from '@/lib/services/daily-record.service'
import type { Role } from '@/lib/services/daily-record.service'
import { KpiCard } from '@/components/ui/kpi-card'
import { ProductionReportFilter } from '@/components/forms/production-report-filter'
⋮----
function formatDate(d: Date): string
⋮----
function toISODate(d: Date): string
⋮----
function parseSafeDate(str: string, fallback: Date): Date
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
import { getSession } from '@/lib/auth/get-session'
import { AppShell } from '@/components/layout/app-shell'
import {
  getNotificationsForRole,
  getReadNotificationIds,
} from '@/lib/services/notification.service'
⋮----
export default async function AppLayout(
````

## File: app/(app)/penjualan/invoices/page.tsx
````typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
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

## File: lib/actions/import.actions.ts
````typescript
import { getSession } from '@/lib/auth/get-session'
import { requireAdmin } from '@/lib/auth/guards'
import {
  parseFlockscsv,
  parseDailyRecordsCsv,
  parseCustomersCsv,
  parseOpeningStockCsv,
  commitImport,
  getCsvTemplate,
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
export async function getCsvTemplateAction(
  entity: ImportEntity
): Promise<ActionResult<string>>
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

## File: lib/db/queries/customer-credit.queries.ts
````typescript
import { db, DrizzleTx } from '@/lib/db'
import { customerCredits } from '@/lib/db/schema'
import { eq, sql, desc, and } from 'drizzle-orm'
import type { CustomerCredit, NewCustomerCredit } from '@/lib/db/schema'
⋮----
export async function listCreditsByCustomer(customerId: string): Promise<CustomerCredit[]>
⋮----
export async function getAvailableCredit(customerId: string): Promise<number>
⋮----
export async function findCreditById(id: string, tx?: DrizzleTx): Promise<CustomerCredit | null>
⋮----
export async function createCustomerCredit(
  credit: NewCustomerCredit,
  tx?: DrizzleTx
): Promise<void>
⋮----
export async function updateCreditUsedAmount(
  creditId: string,
  additionalUsed: number,
  tx?: DrizzleTx
): Promise<void>
````

## File: lib/db/queries/notification.queries.ts
````typescript
import { db, DrizzleTx } from '@/lib/db'
import { notifications, notificationReads } from '@/lib/db/schema'
import type { NewNotification, Notification } from '@/lib/db/schema'
import { eq, and, not, inArray, sql, desc } from 'drizzle-orm'
⋮----
// USED BY: [notification.service, alert.service] — count: 2
export async function createNotification(
  notification: NewNotification,
  tx?: DrizzleTx
): Promise<Notification>
⋮----
export async function listNotificationsForRole(
  role: 'operator' | 'supervisor' | 'admin',
  limit = 50
): Promise<Notification[]>
⋮----
export async function countUnreadForUser(
  userId: string,
  role: 'operator' | 'supervisor' | 'admin'
): Promise<number>
⋮----
// Get all notification IDs already read by the user
⋮----
export async function markNotificationRead(
  notificationId: string,
  userId: string
): Promise<void>
⋮----
export async function markAllReadForUser(
  userId: string,
  role: 'operator' | 'supervisor' | 'admin'
): Promise<void>
⋮----
export async function getReadNotificationIdsForUser(
  userId: string
): Promise<
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
  computeHDP,
  computeFeedPerBird,
  computeFCR,
  createDailyRecord,
  getProductionReportData,
} from './daily-record.service'
⋮----
// 12 kg feed, 120 eggs = 10 dozen → 1.2
⋮----
// Cumulative depletion up to recordDate: 5 deaths, 2 culled (same as the single row)
⋮----
// activePopulation = 1000 - (5 + 2) = 993
⋮----
// totalEggs = 850 + 50 = 900
⋮----
// hdp = (900 / 993) * 100 ≈ 90.63
⋮----
// fcr = 120 / (900 / 12) = 120 / 75 = 1.6
⋮----
// KPI aggregates
⋮----
// Default: flock exists, no depletion
vi.mocked(flockQueries.findFlockById).mockResolvedValue({ id: 'f1', initialCount: 5000 } as any) // any: partial mock
⋮----
vi.mocked(queries.findDailyRecord).mockResolvedValue({ id: 'existing' } as any) // any: partial mock
⋮----
vi.mocked(queries.insertDailyRecordWithMovements).mockResolvedValue({ id: 'r1' } as any) // any: partial mock
⋮----
vi.mocked(queries.insertDailyRecordWithMovements).mockResolvedValue({ id: 'r1' } as any) // any: partial mock
````

## File: lib/services/daily-record.service.ts
````typescript
import {
  findDailyRecord,
  insertDailyRecordWithMovements,
  getTotalDepletionByFlock,
  getCumulativeDepletionByFlockUpTo,
  getProductionReport,
} from '@/lib/db/queries/daily-record.queries'
import { findAllActiveFlocks, findFlockById } from '@/lib/db/queries/flock.queries'
import { findAssignedCoopIds } from '@/lib/db/queries/user-coop-assignment.queries'
import { db } from '@/lib/db'
import { dailyRecords } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { assertCanEdit } from '@/lib/services/lock-period.service'
import type { DailyRecord, NewDailyRecord, NewInventoryMovement } from '@/lib/db/schema'
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
export function computeHDP(eggsA: number, eggsB: number, population: number): number
⋮----
export function computeFeedPerBird(feedKg: number, population: number): number
⋮----
return (feedKg / population) * 1000 // grams per bird
⋮----
export function computeFCR(feedKg: number, eggsA: number, eggsB: number): number
⋮----
return feedKg / (total / 12) // kg feed per dozen eggs; threshold >2.1 = inefficient
⋮----
type CreateDailyRecordInput = {
  flockId: string
  recordDate: Date
  deaths: number
  culled: number
  eggsGradeA: number
  eggsGradeB: number
  eggsCracked: number
  eggsAbnormal: number
  avgWeightKg?: number
  feedKg?: number
}
⋮----
export async function createDailyRecord(
  input: CreateDailyRecordInput,
  userId: string,
  role: Role,
  now: Date = new Date()
): Promise<DailyRecord>
⋮----
export type FlockOption = {
  id: string
  name: string
  coopName: string
  initialCount: number
  currentPopulation: number
}
⋮----
export async function getFlockOptionsForInput(userId: string, role: Role): Promise<FlockOption[]>
⋮----
type UpdateDailyRecordInput = Partial<Omit<CreateDailyRecordInput, 'flockId' | 'recordDate'>>
⋮----
export async function updateDailyRecord(
  recordId: string,
  input: UpdateDailyRecordInput,
  userId: string,
  role: Role,
  now: Date = new Date()
): Promise<DailyRecord>
⋮----
// Lock period check — throws if role cannot edit this record date
⋮----
export type EnrichedProductionRow = {
  recordDate: Date
  coopId: string
  coopName: string
  flockId: string
  flockName: string
  activePopulation: number
  deaths: number
  culled: number
  eggsGradeA: number
  eggsGradeB: number
  totalEggs: number
  feedKg: number
  hdp: number
  fcr: number
}
⋮----
export type ProductionReportResult = {
  rows: EnrichedProductionRow[]
  kpi: {
    avgHdp: number
    totalEggs: number
    totalFeedKg: number
    totalDeaths: number
  }
}
⋮----
export async function getProductionReportData(
  from: Date,
  to: Date,
  role: Role
): Promise<ProductionReportResult>
⋮----
// PERF: N+1 per flock-date row; batch if > 10 flocks per report
⋮----
// Unweighted mean across all flock-day rows; does not account for different flock sizes
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

## File: lib/services/import.service.ts
````typescript
/**
 * Import Service — Sprint 8
 * CSV import for: flocks, daily_records, customers, opening stock.
 *
 * Flow:
 *   1. parse(csvText, entity)  → { valid, errors }   (no DB write)
 *   2. importRows(valid, entity, adminId)             (DB write in transaction)
 *
 * All imported records: is_imported = true, imported_by = adminId.
 * System errors → full rollback, no partial save.
 * Valid rows imported, error rows skipped after user confirmation.
 */
⋮----
import { db } from '@/lib/db'
import {
  flocks,
  dailyRecords,
  customers,
  inventoryMovements,
  coops,
} from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import type { NewFlock, NewDailyRecord, NewCustomer, NewInventoryMovement } from '@/lib/db/schema'
⋮----
// ─── CSV parsing helpers ──────────────────────────────────────────────────────
⋮----
function parseDate(val: string, field: string, rowNum: number):
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
// ─── Flock import ─────────────────────────────────────────────────────────────
⋮----
export type FlockImportRow = Omit<NewFlock, 'isImported' | 'importedBy'>
⋮----
/**
 * Expected CSV columns: coop_id, name, arrival_date, initial_count, breed (opt), notes (opt)
 */
export async function parseFlockscsv(csvText: string): Promise<ParseResult<FlockImportRow>>
⋮----
const [, ...dataRows] = rows // skip header
⋮----
// FK validation: coopId must exist in coops table
⋮----
// ─── DailyRecord import ───────────────────────────────────────────────────────
⋮----
export type DailyRecordImportRow = Omit<NewDailyRecord, 'isImported' | 'importedBy'>
⋮----
/**
 * Expected CSV columns:
 * flock_id, record_date, deaths, culled, eggs_grade_a, eggs_grade_b,
 * eggs_cracked, eggs_abnormal, avg_weight_kg (opt), feed_kg (opt)
 */
export async function parseDailyRecordsCsv(csvText: string): Promise<ParseResult<DailyRecordImportRow>>
⋮----
// FK validation: flockId must exist in flocks table
⋮----
// Duplicate check: (flockId, recordDate) must not already exist
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
// ─── Opening stock import ─────────────────────────────────────────────────────
⋮----
export type OpeningStockImportRow = Omit<NewInventoryMovement, 'isImported' | 'importedBy'>
⋮----
/**
 * Expected CSV columns: flock_id, grade (A|B), quantity, movement_date
 */
export async function parseOpeningStockCsv(csvText: string): Promise<ParseResult<OpeningStockImportRow>>
⋮----
// Check once if any import entries already exist for each cutover date encountered
⋮----
// Check for existing import entries on the same cutover_date
⋮----
// ─── DB write ─────────────────────────────────────────────────────────────────
⋮----
export type ImportEntity = 'flocks' | 'daily_records' | 'customers' | 'opening_stock'
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
 */
export async function commitImport(
  entity: ImportEntity,
  // any: dynamic row types across 4 entity types
  // any: row data varies by entity
  rows: ParsedRow<Record<string, unknown>>[],
  adminId: string
): Promise<ImportResult>
⋮----
// any: dynamic row types across 4 entity types
// any: row data varies by entity
⋮----
// ─── CSV templates ───────────────────────────────────────────────────────────
⋮----
export function getCsvTemplate(entity: ImportEntity): string
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

## File: lib/actions/app-settings.actions.ts
````typescript
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { saveAppSetting } from '@/lib/services/app-settings.service'
⋮----
export async function updateAlertSettings(formData: FormData): Promise<void>
⋮----
type ActionResult = { success: true } | { success: false; error: string }
⋮----
export async function saveWaTemplateAction(formData: FormData): Promise<ActionResult>
````

## File: lib/db/queries/app-settings.queries.ts
````typescript
import { db } from '@/lib/db'
import { appSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
⋮----
// USED BY: [app-settings.service] — count: 1
export async function getAppSetting(key: string): Promise<string | null>
⋮----
export async function upsertAppSetting(key: string, value: string, updatedBy: string): Promise<void>
````

## File: lib/db/queries/daily-record.queries.ts
````typescript
import { db } from '@/lib/db'
import { dailyRecords, inventoryMovements, flocks, coops } from '@/lib/db/schema'
import { eq, and, desc, sum, gte, lte, asc, inArray } from 'drizzle-orm'
import type { DailyRecord, NewDailyRecord, NewInventoryMovement } from '@/lib/db/schema'
⋮----
export async function findDailyRecordById(id: string): Promise<DailyRecord | null>
⋮----
export async function findDailyRecord(flockId: string, recordDate: Date): Promise<DailyRecord | null>
⋮----
export async function findRecentDailyRecords(flockId: string, limit: number): Promise<DailyRecord[]>
⋮----
export type DailyRecordWithFlock = DailyRecord & { flockName: string; coopName: string }
⋮----
export async function findRecentDailyRecordsMultiFlocks(
  flockIds: string[],
  limit: number,
): Promise<DailyRecordWithFlock[]>
⋮----
export async function getTotalDepletionByFlock(
  flockId: string
): Promise<
⋮----
export async function insertDailyRecordWithMovements(
  record: NewDailyRecord,
  movements: NewInventoryMovement[]
): Promise<DailyRecord>
⋮----
export async function getCumulativeDepletionByFlockUpTo(
  flockId: string,
  upToDate: Date
): Promise<
⋮----
export type ProductionReportRow = {
  recordDate: Date
  coopId: string
  coopName: string
  flockId: string
  flockName: string
  flockInitialCount: number
  deaths: number
  culled: number
  eggsGradeA: number
  eggsGradeB: number
  feedKg: string | null
}
⋮----
export async function getProductionReport(
  from: Date,
  to: Date
): Promise<ProductionReportRow[]>
````

## File: lib/db/queries/invoice.queries.ts
````typescript
import { db, DrizzleTx } from '@/lib/db'
import { invoices, customers, salesOrders, payments, customerCredits } from '@/lib/db/schema'
import { eq, and, asc, desc, count, getTableColumns, sql, inArray } from 'drizzle-orm'
import type { Invoice, Customer, Payment, CustomerCredit } from '@/lib/db/schema'
⋮----
export async function countInvoicesThisMonth(prefix: string): Promise<number>
⋮----
export async function findInvoiceByOrderId(orderId: string): Promise<Invoice | null>
⋮----
export type InvoiceWithCustomer = Invoice & { customerName: string | null; orderNumber: string | null }
⋮----
export type InvoiceDetails = Invoice & {
  customer: Customer
  orderNumber: string | null
  payments: Payment[]
  availableCredits: CustomerCredit[]
}
⋮----
export type AgingBucket = '0-7' | '8-14' | '15-30' | '>30'
⋮----
export type AgingRow = {
  invoiceId: string
  invoiceNumber: string
  customerId: string
  customerName: string
  issueDate: Date
  dueDate: Date
  totalAmount: number
  paidAmount: number
  outstanding: number
  daysOverdue: number
  bucket: AgingBucket
}
⋮----
export async function listInvoices(
  page: number = 1,
  pageSize: number = 20,
  status?: Invoice['status'],
  customerId?: string
): Promise<
⋮----
export async function getInvoiceWithDetails(id: string): Promise<InvoiceDetails | null>
⋮----
// Query 1: invoice + customer join + SO join
⋮----
// Query 2: all payments for this invoice
⋮----
// Query 3: available customer credits (amount > usedAmount)
⋮----
export async function updateInvoiceStatus(
  id: string,
  status: Invoice['status'],
  tx?: DrizzleTx
): Promise<void>
⋮----
export async function updateInvoicePaidAmount(
  id: string,
  paidAmount: number,
  tx?: DrizzleTx
): Promise<void>
⋮----
export async function getOverdueInvoices(): Promise<InvoiceWithCustomer[]>
⋮----
export async function updateInvoicePdfInfo(id: string, pdfUrl: string, pdfGeneratedAt: Date): Promise<void>
⋮----
export async function getAgingReport(): Promise<AgingRow[]>
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
import {
  flocks,
  dailyRecords,
  invoices,
} from '@/lib/db/schema'
import { eq, isNull, desc, and, lte, sql, inArray } from 'drizzle-orm'
// sql is used in checkDepletionAlerts aggregation
import { getAppSetting } from '@/lib/services/app-settings.service'
import { findActiveCooldown, upsertCooldown } from '@/lib/db/queries/alert-cooldown.queries'
import { createNotification } from '@/lib/db/queries/notification.queries'
import { getPhaseForWeeks } from '@/lib/services/flock-phase.service'
import { getStockBalanceByGrade } from '@/lib/db/queries/inventory.queries'
⋮----
// ─── helpers ──────────────────────────────────────────────────────────────────
⋮----
function daysSince(date: Date): number
⋮----
function weeksOld(arrivalDate: Date): number
⋮----
async function getNumericSetting(key: string, fallback: number): Promise<number>
⋮----
// ─── alert conditions ─────────────────────────────────────────────────────────
⋮----
/**
 * Phase change alert — fires once per phase per flock, no repeat.
 * Dedup key: alert_cooldowns with alertType = 'phase_change:<phaseName>'
 */
async function checkPhaseChangeAlerts(): Promise<void>
⋮----
// Cooldown = unlimited (never fire same phase again for same flock)
⋮----
/**
 * HDP drop alert — fires if today's HDP dropped > threshold% vs yesterday.
 * Cooldown: 24h per flock.
 */
async function checkHdpDropAlerts(hdpDropThreshold: number): Promise<void>
⋮----
// Use live population (initialCount - cumulative deaths - culls) as denominator
⋮----
/**
 * Daily depletion alert — fires if deaths+culled > threshold% of population.
 * Cooldown: 24h per flock.
 */
async function checkDepletionAlerts(depletionThreshold: number): Promise<void>
⋮----
// Compute current population
⋮----
/**
 * FCR alert — fires if FCR > threshold.
 * Cooldown: 24h per flock.
 */
async function checkFcrAlerts(fcrThreshold: number): Promise<void>
⋮----
/**
 * Invoice overdue alert — fires every day an invoice is overdue (no cooldown).
 */
async function checkOverdueInvoiceAlerts(overdueDelayDays: number): Promise<void>
⋮----
// No cooldown — fires daily
⋮----
/**
 * Stock overstock alert — fires if total stock (grade A + B) > threshold.
 * Cooldown: 24h (fixed entity id '00000000-0000-0000-0000-000000000001').
 */
async function checkStockAlerts(threshold: number): Promise<void>
⋮----
// ─── main entry ───────────────────────────────────────────────────────────────
⋮----
/**
 * runDailyAlerts — called by the pg_cron webhook API route.
 * Evaluates all alert conditions in sequence.
 */
export async function runDailyAlerts(): Promise<void>
⋮----
// Run sequentially to avoid DB contention
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

## File: app/(app)/dashboard/page.tsx
````typescript
import Link from 'next/link'
import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { KpiCard } from '@/components/ui/kpi-card'
import { DashboardCharts } from '@/components/ui/charts/dashboard-charts'
import { getDashboardKpis, getProductionChartData, getRecentDashboardRecords } from '@/lib/services/dashboard.service'
import { getAgingData } from '@/lib/services/invoice.service'
import { findAllActiveFlocks } from '@/lib/db/queries/flock.queries'
import FlockFilter from '../produksi/flock-filter'
import type { AgingRow } from '@/lib/db/queries/invoice.queries'
⋮----
{/* Header */}
⋮----
{/* KPI Grid */}
⋮----
{/* Charts 2x2 */}
⋮----
{/* Recent records table */}
⋮----
{/* Aging widget — admin + supervisor only */}
````

## File: lib/services/invoice.service.ts
````typescript
import { findSalesOrderItems } from '@/lib/db/queries/sales-order.queries'
import { db } from '@/lib/db'
import type { InvoiceDetails, AgingRow } from '@/lib/db/queries/invoice.queries'
import type { Invoice, SalesOrderItem } from '@/lib/db/schema'
⋮----
export async function getInvoiceDetails(id: string): Promise<InvoiceDetails>
⋮----
type RecordPaymentInput = {
  amount: number
  method: 'cash' | 'transfer' | 'cheque' | 'credit'
  referenceNumber?: string
  paymentDate: Date
}
⋮----
export async function recordPayment(
  invoiceId: string,
  input: RecordPaymentInput,
  userId: string
): Promise<
⋮----
export async function applyCredit(
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
export async function getAgingData(): Promise<AgingRow[]>
⋮----
export async function savePdfMetadata(id: string, pdfUrl: string, pdfGeneratedAt: Date): Promise<void>
⋮----
export async function getInvoiceForPdf(
  id: string
): Promise<InvoiceDetails &
⋮----
export async function markInvoiceSent(id: string): Promise<void>
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
export async function createDraftSO(input: CreateDraftInput, userId: string, role: string)
⋮----
// Calculate totals
⋮----
// Generate order number
⋮----
export async function confirmSO(orderId: string, userId: string, role: string)
⋮----
// Lock period check — use orderDate as the record date
⋮----
// Stock availability check before confirming
⋮----
export async function cancelSO(orderId: string, userId: string, role: string)
⋮----
// Lock period check — use orderDate as the record date
⋮----
export async function deleteDraftSO(orderId: string, userId: string, role: string)
⋮----
export async function fulfillSO(orderId: string, userId: string, role: string)
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

## File: lib/actions/invoice.actions.ts
````typescript
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth/get-session'
import { recordPayment, applyCredit, getInvoiceForPdf, markInvoiceSent } from '@/lib/services/invoice.service'
import { sendInvoiceEmail } from '@/lib/services/email.service'
import { InvoicePdfDocument } from '@/components/pdf/invoice-pdf-document'
⋮----
type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string }
⋮----
async function requireAdmin(): Promise<
  { success: false; error: string; session?: never } | { success: true; session: NonNullable<Awaited<ReturnType<typeof getSession>>> }
> {
  const session = await getSession()
if (!session || session.role !== 'admin')
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

## File: app/(app)/penjualan/invoices/[id]/page.tsx
````typescript
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth/get-session'
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

## File: components/layout/sidebar.tsx
````typescript
// client: needs useState for accordion open/close state
⋮----
import { useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Egg, Package, DollarSign, Bird, Settings, LogOut, BarChart2, ChevronDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { SessionUser } from '@/lib/auth/get-session'
import type { Notification } from '@/lib/services/notification.service'
import { NotificationBell } from '@/components/ui/notification-bell'
⋮----
type NavSubItem = {
  href: string
  label: string
  /** roles that can see this sub-item. undefined = all roles */
  roles?: Array<'admin' | 'supervisor' | 'operator'>
}
⋮----
/** roles that can see this sub-item. undefined = all roles */
⋮----
type NavItem =
  | { kind: 'flat'; href: string; icon: LucideIcon; label: string; roles?: Array<'admin' | 'supervisor' | 'operator'> }
  | { kind: 'accordion'; id: string; icon: LucideIcon; label: string; roles?: Array<'admin' | 'supervisor' | 'operator'>; children: NavSubItem[] }
⋮----
function getInitials(name: string)
⋮----
function getRoleLabel(role: string)
⋮----
function canSee(roles: Array<'admin' | 'supervisor' | 'operator'> | undefined, userRole: string): boolean
⋮----
// Prevents /admin matching /admin/kandang — requires trailing slash or exact match
function isActive(currentPath: string, href: string): boolean
⋮----
function getDefaultOpenId(
  sections: typeof NAV_SECTIONS,
  currentPath: string,
  userRole: string,
): string | null
⋮----
function toggleAccordion(id: string)
⋮----
{/* Brand */}
⋮----
{/* Farm info box */}
⋮----
{/* Nav */}
⋮----
// accordion item
⋮----
{/* User card */}
⋮----
{/* Logout via GET route that calls supabase.auth.signOut() and redirects to /login */}
````
