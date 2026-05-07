'use server'

import { z } from 'zod'
import { getRequiredSession } from '@/lib/auth/guards'
import {
  createCustomer,
  getAllCustomers,
  updateCustomerById,
  deactivateCustomer,
  activateCustomer,
} from '@/lib/services/customer.service'

const customerSchema = z.object({
  name: z.string().min(1, 'Nama pelanggan wajib diisi'),
  type: z.enum(['retail', 'wholesale', 'distributor']).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  creditLimit: z.coerce.number().min(0).optional(),
  paymentTerms: z.coerce.number().int().min(0).optional(),
  notes: z.string().optional(),
})

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createCustomerAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  if (session.role !== 'admin') return { success: false, error: 'Akses ditolak' }

  const parsed = customerSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type') || undefined,
    phone: formData.get('phone') || undefined,
    address: formData.get('address') || undefined,
    creditLimit: formData.get('creditLimit') || undefined,
    paymentTerms: formData.get('paymentTerms') || undefined,
    notes: formData.get('notes') || undefined,
  })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }

  try {
    const customer = await createCustomer(session.farmSchema, { ...parsed.data, createdBy: session.id })
    return { success: true, data: { id: customer.id } }
  } catch {
    return { success: false, error: 'Gagal membuat pelanggan' }
  }
}

export async function updateCustomerAction(id: string, formData: FormData): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  if (session.role !== 'admin') return { success: false, error: 'Akses ditolak' }

  const parsed = customerSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type') || undefined,
    phone: formData.get('phone') || undefined,
    address: formData.get('address') || undefined,
    creditLimit: formData.get('creditLimit') || undefined,
    paymentTerms: formData.get('paymentTerms') || undefined,
    notes: formData.get('notes') || undefined,
  })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }

  try {
    await updateCustomerById(session.farmSchema, id, parsed.data)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal mengubah pelanggan' }
  }
}

export async function deactivateCustomerAction(id: string): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  if (session.role !== 'admin') return { success: false, error: 'Akses ditolak' }
  try {
    await deactivateCustomer(session.farmSchema, id)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal menonaktifkan pelanggan' }
  }
}

export async function activateCustomerAction(id: string): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  if (session.role !== 'admin') return { success: false, error: 'Akses ditolak' }
  try {
    await activateCustomer(session.farmSchema, id)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal mengaktifkan pelanggan' }
  }
}

export async function getCustomersAction(): Promise<ActionResult<Awaited<ReturnType<typeof getAllCustomers>>>> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  if (session.role === 'operator') return { success: false, error: 'Akses ditolak' }
  try {
    const customers = await getAllCustomers(session.farmSchema)
    return { success: true, data: customers }
  } catch {
    return { success: false, error: 'Gagal memuat daftar pelanggan' }
  }
}
