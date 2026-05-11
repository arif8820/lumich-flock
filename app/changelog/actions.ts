'use server'

import { cookies } from 'next/headers'
import { CURRENT_VERSION } from '@/lib/changelog/data'

export async function markChangelogSeen(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('lf_seen_version', CURRENT_VERSION, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 365 days
    sameSite: 'lax',
    httpOnly: false,
  })
}
