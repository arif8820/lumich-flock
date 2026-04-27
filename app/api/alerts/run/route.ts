/**
 * POST /api/alerts/run
 * Called by pg_cron via supabase.net HTTP extension at 06:00 WIB daily.
 * Protected by ALERT_WEBHOOK_SECRET env var.
 */

import { runDailyAlerts } from '@/lib/services/alert.service'

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.ALERT_WEBHOOK_SECRET
  if (secret) {
    const authHeader = request.headers.get('Authorization') ?? ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    if (token !== secret) {
      return new Response('Unauthorized', { status: 401 })
    }
  }

  try {
    const result = await runDailyAlerts()
    return Response.json({ ok: true, result })
  } catch (e) {
    console.error('[alerts/run] error:', e)
    return Response.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
