import { db } from '@/lib/db'
import { appSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// USED BY: [wa-template/page, invoices/[id]/page] — count: 2
export async function getAppSetting(key: string): Promise<string | null> {
  const [row] = await db
    .select({ value: appSettings.value })
    .from(appSettings)
    .where(eq(appSettings.key, key))
    .limit(1)
  return row?.value ?? null
}

export async function upsertAppSetting(key: string, value: string, updatedBy: string): Promise<void> {
  const now = new Date()
  await db
    .insert(appSettings)
    .values({ key, value, updatedBy, updatedAt: now })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value, updatedBy, updatedAt: now },
    })
}
