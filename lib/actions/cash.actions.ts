'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getRequiredSession } from '@/lib/auth/guards'
import {
  createTransaction,
  createTransfer,
  createAccount,
  updateAccountSettings,
} from '@/lib/services/cash.service'
import * as categoryQueries from '@/lib/db/queries/cash-category.queries'

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string }

// ── Schemas ──────────────────────────────────────────────────

const createTransactionSchema = z.object({
  accountId: z.string().uuid('ID akun tidak valid'),
  type: z.enum(['in', 'out']),
  amount: z.coerce.number().positive('Jumlah harus lebih dari 0'),
  transactionDate: z.coerce.date(),
  categoryId: z.string().uuid().optional(),
  referenceNumber: z.string().max(200).trim().optional(),
  description: z.string().max(500).trim().optional(),
})

const createTransferSchema = z.object({
  fromAccountId: z.string().uuid('ID akun asal tidak valid'),
  toAccountId: z.string().uuid('ID akun tujuan tidak valid'),
  amount: z.coerce.number().positive('Jumlah harus lebih dari 0'),
  transactionDate: z.coerce.date(),
  referenceNumber: z.string().max(200).trim().optional(),
  description: z.string().max(500).trim().optional(),
})

const createAccountSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(100).trim(),
  type: z.enum(['cash', 'bank', 'ewallet']),
  beginningBalance: z.coerce.number().min(0).optional(),
})

const updateAccountSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).trim().optional(),
  type: z.enum(['cash', 'bank', 'ewallet']).optional(),
  beginningBalance: z.coerce.number().min(0).optional(),
  isActive: z.coerce.boolean().optional(),
})

const createCategorySchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(100).trim(),
  type: z.enum(['in', 'out', 'both']),
})

const updateCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).trim().optional(),
  type: z.enum(['in', 'out', 'both']).optional(),
  isActive: z.coerce.boolean().optional(),
})

// ── Actions ───────────────────────────────────────────────────

export async function createTransactionAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  if (session.role !== 'admin') return { success: false, error: 'Akses ditolak' }

  const parsed = createTransactionSchema.safeParse({
    accountId: formData.get('accountId'),
    type: formData.get('type'),
    amount: formData.get('amount'),
    transactionDate: formData.get('transactionDate'),
    categoryId: formData.get('categoryId') || undefined,
    referenceNumber: formData.get('referenceNumber') || undefined,
    description: formData.get('description') || undefined,
  })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }

  try {
    const tx = await createTransaction(session.farmSchema, parsed.data, session.id)
    revalidatePath('/kas')
    revalidatePath(`/kas/${parsed.data.accountId}`)
    return { success: true, data: { id: tx.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Gagal menyimpan transaksi' }
  }
}

export async function createTransferAction(
  formData: FormData
): Promise<ActionResult<{ outId: string; inId: string }>> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  if (session.role !== 'admin') return { success: false, error: 'Akses ditolak' }

  const parsed = createTransferSchema.safeParse({
    fromAccountId: formData.get('fromAccountId'),
    toAccountId: formData.get('toAccountId'),
    amount: formData.get('amount'),
    transactionDate: formData.get('transactionDate'),
    referenceNumber: formData.get('referenceNumber') || undefined,
    description: formData.get('description') || undefined,
  })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }

  try {
    const { outRow, inRow } = await createTransfer(session.farmSchema, parsed.data, session.id)
    revalidatePath('/kas')
    revalidatePath(`/kas/${parsed.data.fromAccountId}`)
    revalidatePath(`/kas/${parsed.data.toAccountId}`)
    return { success: true, data: { outId: outRow.id, inId: inRow.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Gagal menyimpan transfer' }
  }
}

export async function createAccountAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  if (session.role !== 'admin') return { success: false, error: 'Akses ditolak' }

  const parsed = createAccountSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    beginningBalance: formData.get('beginningBalance') || undefined,
  })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }

  try {
    const account = await createAccount(session.farmSchema, parsed.data)
    revalidatePath('/kas')
    revalidatePath('/admin/kas')
    return { success: true, data: { id: account.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Gagal menyimpan akun' }
  }
}

export async function updateAccountAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  if (session.role !== 'admin') return { success: false, error: 'Akses ditolak' }

  const parsed = updateAccountSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name') || undefined,
    type: formData.get('type') || undefined,
    beginningBalance: formData.get('beginningBalance') || undefined,
    isActive: formData.get('isActive') || undefined,
  })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }

  const { id, ...rest } = parsed.data
  const input = {
    ...rest,
    beginningBalance: rest.beginningBalance !== undefined ? rest.beginningBalance.toFixed(2) : undefined,
  }

  try {
    await updateAccountSettings(session.farmSchema, id, input)
    revalidatePath('/kas')
    revalidatePath('/admin/kas')
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Gagal mengubah akun' }
  }
}

export async function createCategoryAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  if (session.role !== 'admin') return { success: false, error: 'Akses ditolak' }

  const parsed = createCategorySchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
  })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }

  try {
    const cat = await categoryQueries.createCategory(session.farmSchema, parsed.data)
    revalidatePath('/admin/kas')
    return { success: true, data: { id: cat.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Gagal menyimpan kategori' }
  }
}

export async function updateCategoryAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  if (session.role !== 'admin') return { success: false, error: 'Akses ditolak' }

  const parsed = updateCategorySchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name') || undefined,
    type: formData.get('type') || undefined,
    isActive: formData.get('isActive') || undefined,
  })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }

  const { id, ...rest } = parsed.data

  try {
    await categoryQueries.updateCategory(session.farmSchema, id, rest)
    revalidatePath('/admin/kas')
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Gagal mengubah kategori' }
  }
}
