import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/auth/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  // Use request origin so redirect works regardless of port (dev vs prod)
  return NextResponse.redirect(new URL('/login', request.url))
}
