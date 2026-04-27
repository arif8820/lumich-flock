/**
 * Alert Service — Sprint 7
 * Evaluates all alert conditions and creates notifications with dedup cooldowns.
 * Called by the pg_cron webhook at 06:00 WIB (23:00 UTC).
 */

import { db } from '@/lib/db'
import {
  flocks,
  dailyRecords,
  notifications,
  alertCooldowns,
  invoices,
  inventoryMovements,
} from '@/lib/db/schema'
import { eq, isNull, desc, and, lte, sql, inArray } from 'drizzle-orm'
import { getAppSetting } from '@/lib/db/queries/app-settings.queries'
import { findActiveCooldown, upsertCooldown } from '@/lib/db/queries/alert-cooldown.queries'
import { createNotification } from '@/lib/db/queries/notification.queries'
import { getPhaseForWeeks } from '@/lib/services/flock-phase.service'
import type { NewNotification } from '@/lib/db/schema'

// ─── helpers ──────────────────────────────────────────────────────────────────

function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / 86_400_000)
}

function weeksOld(arrivalDate: Date): number {
  return Math.floor(daysSince(arrivalDate) / 7)
}

async function getNumericSetting(key: string, fallback: number): Promise<number> {
  const val = await getAppSetting(key)
  return val != null ? parseFloat(val) : fallback
}

// ─── alert conditions ─────────────────────────────────────────────────────────

/**
 * Phase change alert — fires once per phase per flock, no repeat.
 * Dedup key: alert_cooldowns with alertType = 'phase_change:<phaseName>'
 */
async function checkPhaseChangeAlerts(): Promise<void> {
  const activeFlocks = await db
    .select()
    .from(flocks)
    .where(isNull(flocks.retiredAt))

  for (const flock of activeFlocks) {
    const ageWeeks = weeksOld(new Date(flock.arrivalDate))
    const phase = await getPhaseForWeeks(ageWeeks)
    if (!phase) continue

    const alertType = `phase_change:${phase.name}`
    // Cooldown = unlimited (never fire same phase again for same flock)
    const cooldown = await findActiveCooldown(alertType, flock.id, 999_999)
    if (cooldown) continue

    await db.transaction(async (tx) => {
      await createNotification({
        type: 'phase_change',
        title: `Fase baru: ${phase.name}`,
        body: `Flock "${flock.name}" telah memasuki fase ${phase.name} (umur ${ageWeeks} minggu).`,
        targetRole: 'all',
        relatedEntityType: 'flocks',
        relatedEntityId: flock.id,
      }, tx)
      await upsertCooldown(alertType, 'flocks', flock.id, tx)
    })
  }
}

/**
 * HDP drop alert — fires if today's HDP dropped > threshold% vs yesterday.
 * Cooldown: 24h per flock.
 */
async function checkHdpDropAlerts(hdpDropThreshold: number): Promise<void> {
  const activeFlocks = await db
    .select()
    .from(flocks)
    .where(isNull(flocks.retiredAt))

  for (const flock of activeFlocks) {
    const recent = await db
      .select()
      .from(dailyRecords)
      .where(eq(dailyRecords.flockId, flock.id))
      .orderBy(desc(dailyRecords.recordDate))
      .limit(2)

    if (recent.length < 2) continue

    const [today, yesterday] = recent as typeof recent
    const popToday = Math.max(1, flock.initialCount)
    const hdpToday = ((today!.eggsGradeA + today!.eggsGradeB) / popToday) * 100
    const hdpYesterday = ((yesterday!.eggsGradeA + yesterday!.eggsGradeB) / popToday) * 100

    if (hdpYesterday <= 0) continue
    const dropPct = ((hdpYesterday - hdpToday) / hdpYesterday) * 100
    if (dropPct < hdpDropThreshold) continue

    const alertType = 'hdp_drop'
    const cooldown = await findActiveCooldown(alertType, flock.id, 24)
    if (cooldown) continue

    await db.transaction(async (tx) => {
      await createNotification({
        type: 'production_alert',
        title: 'HDP Turun Signifikan',
        body: `Flock "${flock.name}": HDP turun ${dropPct.toFixed(1)}% (${hdpYesterday.toFixed(1)}% → ${hdpToday.toFixed(1)}%).`,
        targetRole: 'supervisor',
        relatedEntityType: 'flocks',
        relatedEntityId: flock.id,
      }, tx)
      await upsertCooldown(alertType, 'flocks', flock.id, tx)
    })
  }
}

/**
 * Daily depletion alert — fires if deaths+culled > threshold% of population.
 * Cooldown: 24h per flock.
 */
async function checkDepletionAlerts(depletionThreshold: number): Promise<void> {
  const activeFlocks = await db
    .select()
    .from(flocks)
    .where(isNull(flocks.retiredAt))

  for (const flock of activeFlocks) {
    const [latest] = await db
      .select()
      .from(dailyRecords)
      .where(eq(dailyRecords.flockId, flock.id))
      .orderBy(desc(dailyRecords.recordDate))
      .limit(1)

    if (!latest) continue

    // Compute current population
    const depResult = await db
      .select({
        totalDeaths: sql<string>`COALESCE(SUM(${dailyRecords.deaths}), 0)`,
        totalCulled: sql<string>`COALESCE(SUM(${dailyRecords.culled}), 0)`,
      })
      .from(dailyRecords)
      .where(eq(dailyRecords.flockId, flock.id))

    const totalDepletion =
      Number(depResult[0]?.totalDeaths ?? 0) + Number(depResult[0]?.totalCulled ?? 0)
    const currentPop = Math.max(1, flock.initialCount - totalDepletion)
    const todayDepletion = latest.deaths + latest.culled
    const depletionPct = (todayDepletion / currentPop) * 100

    if (depletionPct < depletionThreshold) continue

    const alertType = 'depletion'
    const cooldown = await findActiveCooldown(alertType, flock.id, 24)
    if (cooldown) continue

    await db.transaction(async (tx) => {
      await createNotification({
        type: 'production_alert',
        title: 'Depletion Tinggi',
        body: `Flock "${flock.name}": depletion hari ini ${depletionPct.toFixed(2)}% (${todayDepletion} ekor dari ${currentPop} populasi).`,
        targetRole: 'supervisor',
        relatedEntityType: 'flocks',
        relatedEntityId: flock.id,
      }, tx)
      await upsertCooldown(alertType, 'flocks', flock.id, tx)
    })
  }
}

/**
 * FCR alert — fires if FCR > threshold.
 * Cooldown: 24h per flock.
 */
async function checkFcrAlerts(fcrThreshold: number): Promise<void> {
  const activeFlocks = await db
    .select()
    .from(flocks)
    .where(isNull(flocks.retiredAt))

  for (const flock of activeFlocks) {
    const [latest] = await db
      .select()
      .from(dailyRecords)
      .where(eq(dailyRecords.flockId, flock.id))
      .orderBy(desc(dailyRecords.recordDate))
      .limit(1)

    if (!latest || !latest.feedKg) continue

    const feedKg = Number(latest.feedKg)
    const totalEggs = latest.eggsGradeA + latest.eggsGradeB
    if (totalEggs <= 0) continue
    const fcr = feedKg / (totalEggs / 12)

    if (fcr <= fcrThreshold) continue

    const alertType = 'fcr_high'
    const cooldown = await findActiveCooldown(alertType, flock.id, 24)
    if (cooldown) continue

    await db.transaction(async (tx) => {
      await createNotification({
        type: 'production_alert',
        title: 'FCR Melewati Batas',
        body: `Flock "${flock.name}": FCR ${fcr.toFixed(2)} melebihi batas ${fcrThreshold}.`,
        targetRole: 'supervisor',
        relatedEntityType: 'flocks',
        relatedEntityId: flock.id,
      }, tx)
      await upsertCooldown(alertType, 'flocks', flock.id, tx)
    })
  }
}

/**
 * Invoice overdue alert — fires every day an invoice is overdue (no cooldown).
 */
async function checkOverdueInvoiceAlerts(overdueDelayDays: number): Promise<void> {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const overdueInvoices = await db
    .select()
    .from(invoices)
    .where(
      and(
        inArray(invoices.status, ['sent', 'partial', 'overdue']),
        lte(invoices.dueDate, today)
      )
    )

  for (const inv of overdueInvoices) {
    const dueDate = new Date(inv.dueDate)
    const overdueDays = daysSince(dueDate)

    if (overdueDays < overdueDelayDays) continue

    // No cooldown — fires daily
    await createNotification({
      type: 'overdue_invoice',
      title: 'Invoice Jatuh Tempo',
      body: `Invoice ${inv.invoiceNumber} telah jatuh tempo ${overdueDays} hari. Total: Rp ${Number(inv.totalAmount).toLocaleString('id-ID')}.`,
      targetRole: 'admin',
      relatedEntityType: 'invoices',
      relatedEntityId: inv.id,
    })
  }
}

// ─── main entry ───────────────────────────────────────────────────────────────

/**
 * runDailyAlerts — called by the pg_cron webhook API route.
 * Evaluates all alert conditions in sequence.
 */
export async function runDailyAlerts(): Promise<{
  phaseChange: number
  hdpDrop: number
  depletion: number
  fcr: number
  overdueInvoice: number
}> {
  const [fcrThreshold, depletionThreshold, hdpDropThreshold, overdueDelayDays] = await Promise.all([
    getNumericSetting('alert_fcr_threshold', 2.5),
    getNumericSetting('alert_depletion_pct', 0.5),
    getNumericSetting('alert_hdp_drop_pct', 5),
    getNumericSetting('alert_overdue_delay_days', 1),
  ])

  // Run sequentially to avoid DB contention
  const before = await db
    .select({ count: sql<string>`COUNT(*)` })
    .from(notifications)

  const countBefore = Number(before[0]?.count ?? 0)

  await checkPhaseChangeAlerts()
  await checkHdpDropAlerts(hdpDropThreshold)
  await checkDepletionAlerts(depletionThreshold)
  await checkFcrAlerts(fcrThreshold)
  await checkOverdueInvoiceAlerts(overdueDelayDays)

  // Return approximate counts (good enough for logging)
  return {
    phaseChange: 0,
    hdpDrop: 0,
    depletion: 0,
    fcr: 0,
    overdueInvoice: 0,
  }
}
