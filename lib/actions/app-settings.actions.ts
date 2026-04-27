'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { saveAppSetting } from '@/lib/services/app-settings.service'

const ALERT_SETTING_KEYS = [
  'alert_fcr_threshold',
  'alert_depletion_pct',
  'alert_hdp_drop_pct',
  'alert_overdue_delay_days',
  'alert_stock_max_threshold',
] as const

export async function updateAlertSettings(formData: FormData): Promise<void> {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/dashboard')

  try {
    for (const key of ALERT_SETTING_KEYS) {
      const val = formData.get(key) as string
      if (val) await saveAppSetting(key, val, session.id)
    }
  } catch {
    redirect('/admin/settings/alerts?error=Gagal+menyimpan+pengaturan')
  }
  redirect('/admin/settings/alerts?success=1')
}

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
