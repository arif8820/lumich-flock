'use server'

import { cookies } from 'next/headers'
import { CURRENT_VERSION } from '@/lib/changelog/data'

export async function markChangelogSeen(): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies()
    cookieStore.set('lf_seen_version', CURRENT_VERSION, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      httpOnly: false,
    })
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: `Gagal menyimpan versi changelog: ${message}` }
  }
}
