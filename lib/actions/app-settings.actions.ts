'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth/get-session'
import { saveAppSetting } from '@/lib/services/app-settings.service'

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
    await saveAppSetting('wa_invoice_template', parsed.data.template, session.id)
    revalidatePath('/admin/settings/wa-template')
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: `Gagal menyimpan template: ${message}` }
  }
}
