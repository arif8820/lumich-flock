/**
 * POST /api/alerts/run
 * Called by pg_cron via supabase.net HTTP extension at 06:00 WIB daily.
 * Protected by ALERT_WEBHOOK_SECRET env var.
 */

import { runDailyAlerts } from '@/lib/services/alert.service'
import { db } from '@/lib/db'
import { farms } from '@/lib/db/schema'

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.ALERT_WEBHOOK_SECRET
  if (!secret) {
    // Secret not configured — fail closed (don't allow requests through)
    return Response.json({ error: 'Not configured' }, { status: 503 })
  }
  if (request.headers.get('x-alert-secret') !== secret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const allFarms = await db.select({ schemaName: farms.schemaName }).from(farms)
    await Promise.all(allFarms.map((farm) => runDailyAlerts(farm.schemaName)))
    return Response.json({ ok: true, farms: allFarms.length })
  } catch (e) {
    console.error('[alerts/run] error:', e)
    return Response.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
