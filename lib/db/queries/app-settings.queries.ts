import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq } from 'drizzle-orm'

// USED BY: [app-settings.service] — count: 1
export async function getAppSetting(farmSchema: string, key: string): Promise<string | null> {
  const { appSettings } = getFarmSchema(farmSchema)
  const [row] = await db
    .select({ value: appSettings.value })
    .from(appSettings)
    .where(eq(appSettings.key, key))
    .limit(1)
  return row?.value ?? null
}

export async function upsertAppSetting(farmSchema: string, key: string, value: string, updatedBy: string): Promise<void> {
  const { appSettings } = getFarmSchema(farmSchema)
  const now = new Date()
  await db
    .insert(appSettings)
    .values({ key, value, updatedBy, updatedAt: now })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value, updatedBy, updatedAt: now },
    })
}
