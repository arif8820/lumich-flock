'use server'

import { z } from 'zod'
import { getSession } from '@/lib/auth/get-session'
import { upsertAppSetting } from '@/lib/db/queries/app-settings.queries'

type ActionResult = { success: true } | { success: false; error: string }

const waTemplateSchema = z.object({
  template: z.string().min(10, 'Template terlalu pendek').max(1000, 'Template terlalu panjang'),
})

export async function saveWaTemplateAction(formData: FormData): Promise<ActionResult> {
  const session = await getSession()
  if (!session || session.role !== 'admin') return { success: false, error: 'Akses ditolak' }

  const parsed = waTemplateSchema.safeParse({ template: formData.get('template') })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }

  try {
    await upsertAppSetting('wa_invoice_template', parsed.data.template, session.id)
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: `Gagal menyimpan template: ${message}` }
  }
}
