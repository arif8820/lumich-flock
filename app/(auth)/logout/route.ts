import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/auth/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  // Use NEXT_PUBLIC_APP_URL in prod to avoid redirecting to internal reverse-proxy origin
  const base = process.env.NEXT_PUBLIC_APP_URL ?? request.url
  return NextResponse.redirect(new URL('/login', base))
}
