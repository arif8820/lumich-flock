import { getAppSetting as getSettingQuery, upsertAppSetting } from '@/lib/db/queries/app-settings.queries'

export async function getAppSetting(farmSchema: string, key: string): Promise<string | null> {
  return getSettingQuery(farmSchema, key)
}

export async function saveAppSetting(farmSchema: string, key: string, value: string, updatedBy: string): Promise<void> {
  await upsertAppSetting(farmSchema, key, value, updatedBy)
}
