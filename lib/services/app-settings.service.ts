import { getAppSetting as getSettingQuery, upsertAppSetting } from '@/lib/db/queries/app-settings.queries'

export async function getAppSetting(key: string): Promise<string | null> {
  return getSettingQuery(key)
}

export async function saveAppSetting(key: string, value: string, updatedBy: string): Promise<void> {
  await upsertAppSetting(key, value, updatedBy)
}
