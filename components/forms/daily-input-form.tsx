'use client'
// client: tabs, dynamic state, sessionStorage persistence

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  saveDailyRecordAction,
  saveBundleAction,
  deleteBundleAction,
  getExistingBundlesForInputAction,
  getOpenBundlesForCarryOverAction,
  addBundleContributionAction,
} from '@/lib/actions/daily-record.actions'
import type { FlockOption } from '@/lib/services/daily-record.service'
import type { BundleWithStockItem } from '@/lib/services/daily-record.service'
import type { StockItem } from '@/lib/db/schema'
import { StepperInput } from '@/components/ui/stepper-input'

type StockItemWithBalance = StockItem & { balance: number }

type CarryOverBundle = {
  bundleId: string
  bundleCode: string | null
  bundleIndex: number
  qtyKg: number
  qtyButir: number
  recordDate: string
  stockItemId: string
  stockItemName: string
}

type Props = {
  flocks: FlockOption[]
  userRole: 'operator' | 'supervisor' | 'admin'
  eggItems: StockItem[]
  feedItems: StockItemWithBalance[]
  vaccineItems: StockItemWithBalance[]
}

type DraftBundle = { trayCount: number; topTrayCount: number; qtyKg: number }
type SimpleEggEntry = { stockItemId: string; qtyButir: number; qtyKg: number }
type FeedEntry = { stockItemId: string; qtyUsed: number }


function todayUTC(): string {
  return new Date().toISOString().split('T')[0]!
}

function minDate(role: 'operator' | 'supervisor' | 'admin'): string {
  const days = role === 'operator' ? 1 : role === 'supervisor' ? 7 : 365
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]!
}

function computeButir(trayCount: number, topTrayCount: number): number {
  if (trayCount < 1) return 0
  return (trayCount - 1) * 30 + topTrayCount
}

function emptyDraft(): DraftBundle {
  return { trayCount: 1, topTrayCount: 0, qtyKg: 0 }
}

const TABS = [
  { key: 'ayam', label: '🐓 Ayam' },
  { key: 'telur', label: '🥚 Telur' },
  { key: 'pakan', label: '🌾 Pakan' },
  { key: 'vaksin', label: '💉 Vaksin' },
] as const

type TabKey = typeof TABS[number]['key']

const inputClass = 'mt-1 w-full border border-[var(--lf-border)] rounded-xl px-3 py-3 text-base bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]'
const numInputClass = 'w-full border border-[var(--lf-border)] rounded-lg px-2 py-2 text-sm bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)] text-center'

export function DailyInputForm({ flocks, userRole, eggItems, feedItems, vaccineItems }: Props) {
  const router = useRouter()
  const defaultFlockId = flocks[0]?.id ?? ''

  const [flockId, setFlockId] = useState(defaultFlockId)
  const [recordDate, setRecordDate] = useState(todayUTC())
  const [deaths, setDeaths] = useState(0)
  const [culled, setCulled] = useState(0)
  // deferred: telur retak & abnormal UI not yet built — hardcoded 0 for now
  const [eggsCracked] = useState(0)
  const [eggsAbnormal] = useState(0)
  const [notes, setNotes] = useState('')

  // simple entries for non-bundle egg items
  const [simpleEggEntries, setSimpleEggEntries] = useState<SimpleEggEntry[]>(
    eggItems.filter((i) => !i.useBundleMethod).map((i) => ({ stockItemId: i.id, qtyButir: 0, qtyKg: 0 }))
  )

  // draft bundle: one draft per stockItemId (not yet saved)
  const [draftBundle, setDraftBundle] = useState<Record<string, DraftBundle>>(
    Object.fromEntries(eggItems.filter((i) => i.useBundleMethod).map((i) => [i.id, emptyDraft()]))
  )

  // saved bundles: server-persisted bundles per stockItemId
  const [savedBundles, setSavedBundles] = useState<Record<string, BundleWithStockItem[]>>({})

  // per-item loading state for save bundle
  const [bundlePending, setBundlePending] = useState<Record<string, boolean>>({})

  // success toast message
  const [bundleToast, setBundleToast] = useState<string | null>(null)

  // carry-over bundles from previous day(s)
  const [carryOverBundles, setCarryOverBundles] = useState<Record<string, CarryOverBundle[]>>({})
  const [expandedCarryOver, setExpandedCarryOver] = useState<string | null>(null)
  const [contributionPending, setContributionPending] = useState<Record<string, boolean>>({})

  // carry-over contribution draft state
  const [carryDraft, setCarryDraft] = useState<Record<string, { trayCount: number; topTrayCount: number; qtyKg: number }>>({})
  const [carryError, setCarryError] = useState<Record<string, string>>({})

  const [feedEntries, setFeedEntries] = useState<FeedEntry[]>(
    feedItems.map((i) => ({ stockItemId: i.id, qtyUsed: 0 }))
  )
  const [vaccineEntries, setVaccineEntries] = useState<FeedEntry[]>(
    vaccineItems.map((i) => ({ stockItemId: i.id, qtyUsed: 0 }))
  )

  const [activeTab, setActiveTab] = useState<TabKey>('ayam')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  // Fetch existing saved bundles when flockId or recordDate changes
  useEffect(() => {
    if (!flockId || !recordDate) return
    let cancelled = false
    void getExistingBundlesForInputAction(flockId, recordDate).then((r) => {
      if (cancelled) return
      setSavedBundles(r.success ? r.data : {})
    })
    return () => { cancelled = true }
  }, [flockId, recordDate])

  // Fetch open carry-over bundles when flockId changes
  useEffect(() => {
    if (!flockId || !recordDate) return
    let cancelled = false
    void getOpenBundlesForCarryOverAction(flockId, recordDate).then((result) => {
      if (!cancelled && result.success && result.data) {
        const grouped = result.data as Record<string, CarryOverBundle>
        const asArrays: Record<string, CarryOverBundle[]> = {}
        for (const [k, v] of Object.entries(grouped)) asArrays[k] = [v]
        setCarryOverBundles(asArrays)
      } else if (!cancelled) {
        setCarryOverBundles({})
      }
    })
    return () => { cancelled = true }
  }, [flockId, recordDate])

  const flock = flocks.find((f) => f.id === flockId)
  const totalDepletion = deaths + culled
  const depletionOverflow = totalDepletion > (flock?.currentPopulation ?? 0)

  // simple egg helpers
  function updateSimpleButir(idx: number, val: number) {
    setSimpleEggEntries((prev) => prev.map((e, i) => i === idx ? { ...e, qtyButir: val } : e))
  }
  function updateSimpleKg(idx: number, val: number) {
    setSimpleEggEntries((prev) => prev.map((e, i) => i === idx ? { ...e, qtyKg: val } : e))
  }

  // bundle save handler — per stockItemId
  async function handleSaveBundle(stockItemId: string) {
    const currentFlockId = flockId
    const currentRecordDate = recordDate
    if (!currentFlockId || !currentRecordDate) return
    setBundlePending((prev) => ({ ...prev, [stockItemId]: true }))
    try {
      const draft = draftBundle[stockItemId] ?? emptyDraft()
      const result = await saveBundleAction({
        flockId: currentFlockId,
        recordDate: currentRecordDate,
        stockItemId,
        trayCount: draft.trayCount,
        topTrayCount: draft.topTrayCount,
        qtyKg: draft.qtyKg,
      })
      if (!result.success) { setError(result.error ?? null); return }
      setError(null)
      setDraftBundle((prev) => ({ ...prev, [stockItemId]: emptyDraft() }))
      setBundleToast(`Ikatan tersimpan: ${result.data.bundleCode}`)
      setTimeout(() => setBundleToast(null), 4000)
      const bundlesResult = await getExistingBundlesForInputAction(currentFlockId, currentRecordDate)
      if (bundlesResult.success) setSavedBundles(bundlesResult.data)
    } catch {
      setError('Gagal menyimpan ikatan')
    } finally {
      setBundlePending((prev) => ({ ...prev, [stockItemId]: false }))
    }
  }

  // bundle delete handler
  async function handleDeleteBundle(bundleId: string, bundleCode: string | null, bundleIndex?: number) {
    const label = bundleCode ?? (bundleIndex !== undefined ? `#${bundleIndex}` : bundleId.slice(0, 8))
    if (!confirm(`Hapus ikatan ${label}? Kode ini sudah tidak bisa dipakai lagi.`)) return
    const currentFlockId = flockId
    const currentRecordDate = recordDate
    try {
      const result = await deleteBundleAction(bundleId)
      if (!result.success) { setError(result.error ?? null); return }
      if (currentFlockId && currentRecordDate) {
        const bundlesResult = await getExistingBundlesForInputAction(currentFlockId, currentRecordDate)
        if (bundlesResult.success) setSavedBundles(bundlesResult.data)
      }
    } catch {
      setError('Gagal menghapus ikatan')
    }
  }

  // totals across all egg items — bundle totals come from savedBundles
  const allEggTotals = (() => {
    const simpleButir = simpleEggEntries.reduce((s, e) => s + e.qtyButir, 0)
    const simpleKg = simpleEggEntries.reduce((s, e) => s + e.qtyKg, 0)
    const bundleButir = eggItems
      .filter((i) => i.useBundleMethod)
      .flatMap((i) => savedBundles[i.id] ?? [])
      .reduce((s, b) => s + b.qtyButir, 0)
    const bundleKg = eggItems
      .filter((i) => i.useBundleMethod)
      .flatMap((i) => savedBundles[i.id] ?? [])
      .reduce((s, b) => s + parseFloat(b.qtyKg), 0)
    return { totalButir: simpleButir + bundleButir, totalKg: simpleKg + bundleKg }
  })()

  function updateFeed(idx: number, val: number) {
    setFeedEntries((prev) => prev.map((e, i) => i === idx ? { ...e, qtyUsed: val } : e))
  }
  function updateVaccine(idx: number, val: number) {
    setVaccineEntries((prev) => prev.map((e, i) => i === idx ? { ...e, qtyUsed: val } : e))
  }

  async function submitForm() {
    if (depletionOverflow) { setError('Total depletion melebihi populasi aktif'); return }
    setError(null)
    setPending(true)
    try {
      // build eggEntries — bundle items are saved separately, only simple items go here
      const eggEntries = simpleEggEntries.map((e) => ({
        stockItemId: e.stockItemId,
        useBundleMethod: false as const,
        qtyButir: e.qtyButir,
        qtyKg: e.qtyKg,
      }))

      const result = await saveDailyRecordAction({
        flockId,
        recordDate,
        deaths,
        culled,
        eggsCracked,
        eggsAbnormal,
        notes: notes || undefined,
        eggEntries,
        feedEntries,
        vaccineEntries,
      })
      if (!result.success) {
        setError(result.error ?? null)
      } else {
        router.push('/produksi')
        router.refresh()
      }
    } catch {
      setError('Gagal terhubung ke server. Coba lagi.')
    } finally {
      setPending(false)
    }
  }

  if (flocks.length === 0) {
    return <p className="text-[var(--lf-text-soft)]">Tidak ada flock aktif yang tersedia.</p>
  }

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      {/* Header: Flock + Date */}
      <div className="bg-white rounded-xl p-4 shadow-lf-sm border border-[var(--lf-border)] space-y-3">
        <div>
          <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Flock</label>
          <select value={flockId} onChange={(e) => setFlockId(e.target.value)} className={inputClass}>
            {flocks.map((f) => (
              <option key={f.id} value={f.id}>{f.name} — {f.coopName}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Tanggal</label>
            <input
              type="date"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              max={todayUTC()}
              min={minDate(userRole)}
              className={inputClass}
            />
          </div>
          <div className="bg-[var(--lf-blue-pale)] rounded-xl p-3 flex flex-col justify-center">
            <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--lf-blue-active)' }}>Populasi</span>
            <span className="text-2xl font-bold" style={{ color: 'var(--lf-text-dark)' }}>
              {flock ? flock.currentPopulation.toLocaleString('id-ID') : '—'}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--lf-text-soft)' }}>ekor aktif</span>
          </div>
        </div>
      </div>

      {/* Bundle success toast */}
      {bundleToast && (
        <div className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{ background: 'var(--lf-teal)', color: 'white' }}>
          {bundleToast}
        </div>
      )}

      {/* Tab strip */}
      <div className="grid grid-cols-4 gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-xs font-medium transition-colors min-h-[56px]"
            style={{
              background: t.key === activeTab ? 'var(--lf-blue-active)' : 'white',
              color: t.key === activeTab ? 'white' : 'var(--lf-text-soft)',
              boxShadow: t.key === activeTab ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            <span className="text-base leading-none">{t.label.split(' ')[0]}</span>
            <span>{t.label.split(' ').slice(1).join(' ')}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl p-4 shadow-lf-sm border border-[var(--lf-border)] space-y-4">

        {activeTab === 'ayam' && (
          <>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide block mb-2">Kematian (ekor)</label>
                <StepperInput value={deaths} onChange={setDeaths} min={0} />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide block mb-2">Afkir (ekor)</label>
                <StepperInput value={culled} onChange={setCulled} min={0} />
              </div>
            </div>
            {depletionOverflow && (
              <p className="text-sm font-medium" style={{ color: 'var(--lf-danger-text)' }}>
                Total depletion ({totalDepletion}) melebihi populasi aktif ({flock?.currentPopulation ?? 0})
              </p>
            )}
            <div>
              <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Catatan</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-2 w-full border border-[var(--lf-border)] rounded-xl px-3 py-3 text-base bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]"
              />
            </div>
          </>
        )}

        {activeTab === 'telur' && (
          <div>
            {eggItems.length === 0 && <p className="text-sm text-[var(--lf-text-soft)] py-4">Tidak ada SKU telur aktif.</p>}

            {eggItems.map((item) => {
              if (item.useBundleMethod) {
                const draft = draftBundle[item.id] ?? emptyDraft()
                const isPending = bundlePending[item.id] ?? false
                const saved = savedBundles[item.id] ?? []

                return (
                  <div key={item.id} className="py-3 border-b border-[var(--lf-border)] last:border-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[var(--lf-text-dark)]">{item.name}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: 'var(--lf-blue-pale)', color: 'var(--lf-blue-active)' }}>
                        Tray
                      </span>
                    </div>

                    {/* Zona A: Draft ikatan baru */}
                    <div className="mt-3 space-y-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--lf-text-mid)' }}>Ikatan Baru</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] font-medium uppercase block mb-1" style={{ color: 'var(--lf-text-mid)' }}>Nampan</label>
                          <input
                            type="number"
                            value={draft.trayCount}
                            min={1}
                            onChange={(e) => setDraftBundle((prev) => ({
                              ...prev,
                              [item.id]: { ...(prev[item.id] ?? emptyDraft()), trayCount: Math.max(1, parseInt(e.target.value) || 1) },
                            }))}
                            className={numInputClass}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-medium uppercase block mb-1" style={{ color: 'var(--lf-text-mid)' }}>Atas</label>
                          <input
                            type="number"
                            value={draft.topTrayCount}
                            min={0}
                            max={30}
                            onChange={(e) => setDraftBundle((prev) => ({
                              ...prev,
                              [item.id]: { ...(prev[item.id] ?? emptyDraft()), topTrayCount: Math.min(30, Math.max(0, parseInt(e.target.value) || 0)) },
                            }))}
                            className={numInputClass}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-medium uppercase block mb-1" style={{ color: 'var(--lf-text-mid)' }}>Kg</label>
                          <input
                            type="number"
                            value={draft.qtyKg}
                            min={0}
                            step={0.01}
                            onChange={(e) => setDraftBundle((prev) => ({
                              ...prev,
                              [item.id]: { ...(prev[item.id] ?? emptyDraft()), qtyKg: Math.max(0, parseFloat(e.target.value) || 0) },
                            }))}
                            className={numInputClass}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: 'var(--lf-text-soft)' }}>
                          {computeButir(draft.trayCount, draft.topTrayCount)} butir
                        </span>
                        <button
                          type="button"
                          onClick={() => void handleSaveBundle(item.id)}
                          disabled={isPending || !flockId || !recordDate}
                          className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                          style={{ background: 'var(--lf-blue-active)', color: 'white' }}
                        >
                          {isPending ? 'Menyimpan...' : '+ Simpan Ikatan'}
                        </button>
                      </div>
                    </div>

                    {/* Zona B: List tersimpan */}
                    {saved.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--lf-text-mid)' }}>Tersimpan hari ini</p>
                        {saved.map((b) => (
                          <div
                            key={b.id}
                            className="flex items-center justify-between py-1.5 px-2 rounded-lg"
                            style={{ background: 'var(--lf-blue-pale)' }}
                          >
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-mono font-semibold" style={{ color: 'var(--lf-blue-active)' }}>
                                  {b.bundleCode ?? `#${b.bundleIndex}`}
                                </span>
                                {b.isOpen === true ? (
                                  <span style={{ background: '#fff3cd', color: '#856404', borderRadius: '6px', padding: '1px 8px', fontSize: '11px' }}>Partial</span>
                                ) : (
                                  <span style={{ background: '#d4edda', color: '#155724', borderRadius: '6px', padding: '1px 8px', fontSize: '11px' }}>Selesai</span>
                                )}
                              </div>
                              <span className="text-[10px]" style={{ color: 'var(--lf-text-soft)' }}>
                                {b.qtyButir} butir · {parseFloat(b.qtyKg).toFixed(2)} kg
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => void handleDeleteBundle(b.id, b.bundleCode ?? null, b.bundleIndex)}
                              disabled={b.isOpen === false}
                              className="w-6 h-6 flex items-center justify-center rounded text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                              style={{ color: 'var(--lf-danger-text)' }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <div className="flex justify-between pt-1 text-xs font-semibold">
                          <span style={{ color: 'var(--lf-text-mid)' }}>Total</span>
                          <span style={{ color: 'var(--lf-blue-active)' }}>
                            {saved.reduce((s, b) => s + b.qtyButir, 0).toLocaleString('id')} butir · {saved.reduce((s, b) => s + parseFloat(b.qtyKg), 0).toFixed(2)} kg
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Zona C: Carry-over bundles from previous day */}
                    {Object.values(carryOverBundles).flat().some((b) => b.stockItemId === item.id) && (
                      <div className="mt-3 space-y-2 rounded-xl p-3" style={{ background: '#f8f4ff', border: '1px solid #e0d4f5' }}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#6b4fa0' }}>Ikatan Belum Selesai dari Hari Sebelumnya</p>
                        {(carryOverBundles[item.id] ?? []).map((bundle) => {
                          const isExpanded = expandedCarryOver === bundle.bundleId
                          const isPendingContrib = contributionPending[bundle.bundleId] ?? false
                          const draft = carryDraft[bundle.bundleId] ?? { trayCount: 1, topTrayCount: 0, qtyKg: 0 }
                          const errMsg = carryError[bundle.bundleId] ?? null

                          // Format recordDate DD/MM/YYYY
                          const [cy, cm, cd] = bundle.recordDate.split('-')
                          const formattedDate = `${cd}/${cm}/${cy}`

                          return (
                            <div key={bundle.bundleId} className="rounded-lg p-2 space-y-2" style={{ background: 'white', border: '1px solid #e0d4f5' }}>
                              <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                  <span className="text-xs font-mono font-semibold" style={{ color: '#6b4fa0' }}>
                                    {bundle.bundleCode ?? `Ikatan #${bundle.bundleIndex}`}
                                  </span>
                                  <span className="text-[10px]" style={{ color: 'var(--lf-text-soft)' }}>
                                    {formattedDate} · {bundle.qtyKg.toFixed(2)} kg
                                  </span>
                                </div>
                                {!isExpanded && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setExpandedCarryOver(bundle.bundleId)
                                      setCarryDraft((prev) => ({ ...prev, [bundle.bundleId]: { trayCount: 1, topTrayCount: 0, qtyKg: 0 } }))
                                      setCarryError((prev) => ({ ...prev, [bundle.bundleId]: '' }))
                                    }}
                                    className="px-3 py-1 rounded-lg text-xs font-semibold"
                                    style={{ background: '#6b4fa0', color: 'white' }}
                                  >
                                    Lengkapi
                                  </button>
                                )}
                              </div>

                              {isExpanded && (
                                <div className="space-y-2 pt-1">
                                  <div className="grid grid-cols-3 gap-2">
                                    <div>
                                      <label className="text-[10px] font-medium uppercase block mb-1" style={{ color: 'var(--lf-text-mid)' }}>Nampan</label>
                                      <input
                                        type="number"
                                        value={draft.trayCount}
                                        min={1}
                                        onChange={(e) => setCarryDraft((prev) => ({
                                          ...prev,
                                          [bundle.bundleId]: { ...(prev[bundle.bundleId] ?? { trayCount: 1, topTrayCount: 0, qtyKg: 0 }), trayCount: Math.max(1, parseInt(e.target.value) || 1) },
                                        }))}
                                        style={{ borderRadius: '10px', border: '1px solid var(--lf-border)' }}
                                        className={numInputClass}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-medium uppercase block mb-1" style={{ color: 'var(--lf-text-mid)' }}>Atas</label>
                                      <input
                                        type="number"
                                        value={draft.topTrayCount}
                                        min={0}
                                        max={30}
                                        onChange={(e) => setCarryDraft((prev) => ({
                                          ...prev,
                                          [bundle.bundleId]: { ...(prev[bundle.bundleId] ?? { trayCount: 1, topTrayCount: 0, qtyKg: 0 }), topTrayCount: Math.min(30, Math.max(0, parseInt(e.target.value) || 0)) },
                                        }))}
                                        style={{ borderRadius: '10px', border: '1px solid var(--lf-border)' }}
                                        className={numInputClass}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-medium uppercase block mb-1" style={{ color: 'var(--lf-text-mid)' }}>Kg</label>
                                      <input
                                        type="number"
                                        value={draft.qtyKg}
                                        min={0}
                                        step={0.01}
                                        onChange={(e) => setCarryDraft((prev) => ({
                                          ...prev,
                                          [bundle.bundleId]: { ...(prev[bundle.bundleId] ?? { trayCount: 1, topTrayCount: 0, qtyKg: 0 }), qtyKg: Math.max(0, parseFloat(e.target.value) || 0) },
                                        }))}
                                        style={{ borderRadius: '10px', border: '1px solid var(--lf-border)' }}
                                        className={numInputClass}
                                      />
                                    </div>
                                  </div>
                                  {errMsg && (
                                    <p className="text-xs px-2 py-1 rounded-lg" style={{ color: 'var(--lf-danger-text)', background: 'var(--lf-danger-bg)' }}>
                                      {errMsg}
                                    </p>
                                  )}
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setExpandedCarryOver(null)
                                        setCarryError((prev) => ({ ...prev, [bundle.bundleId]: '' }))
                                      }}
                                      className="px-3 py-1 rounded-lg text-xs font-medium"
                                      style={{ background: 'var(--lf-border)', color: 'var(--lf-text-mid)' }}
                                    >
                                      Batal
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isPendingContrib}
                                      onClick={async () => {
                                        setContributionPending((prev) => ({ ...prev, [bundle.bundleId]: true }))
                                        setCarryError((prev) => ({ ...prev, [bundle.bundleId]: '' }))
                                        try {
                                          const result = await addBundleContributionAction({
                                            bundleId: bundle.bundleId,
                                            recordDate,
                                            originalRecordDate: bundle.recordDate,
                                            stockItemId: bundle.stockItemId,
                                            flockId,
                                            trayCount: draft.trayCount,
                                            topTrayCount: draft.topTrayCount,
                                            qtyKg: draft.qtyKg,
                                          })
                                          if (!result.success) {
                                            setCarryError((prev) => ({ ...prev, [bundle.bundleId]: result.error ?? 'Gagal menyimpan kontribusi' }))
                                          } else {
                                            // Remove from carry-over list
                                            setCarryOverBundles((prev) => {
                                              const updated = { ...prev }
                                              if (updated[bundle.stockItemId]) {
                                                updated[bundle.stockItemId] = updated[bundle.stockItemId]!.filter((b) => b.bundleId !== bundle.bundleId)
                                              }
                                              return updated
                                            })
                                            setExpandedCarryOver(null)
                                            // Reload saved bundles to show closed bundle in Zona B
                                            if (flockId && recordDate) {
                                              const bundlesResult = await getExistingBundlesForInputAction(flockId, recordDate)
                                              if (bundlesResult.success) setSavedBundles(bundlesResult.data)
                                            }
                                          }
                                        } catch {
                                          setCarryError((prev) => ({ ...prev, [bundle.bundleId]: 'Gagal terhubung ke server' }))
                                        } finally {
                                          setContributionPending((prev) => ({ ...prev, [bundle.bundleId]: false }))
                                        }
                                      }}
                                      className="px-3 py-1 rounded-lg text-xs font-semibold disabled:opacity-50"
                                      style={{ background: '#6b4fa0', color: 'white' }}
                                    >
                                      {isPendingContrib ? 'Menyimpan...' : 'Simpan Kontribusi'}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              }

              // Simple (butir + kg) item
              const simpleIdx = simpleEggEntries.findIndex((e) => e.stockItemId === item.id)
              return (
                <div key={item.id} className="py-3 border-b border-[var(--lf-border)] last:border-0 space-y-2">
                  <span className="text-sm font-medium text-[var(--lf-text-dark)]">{item.name}</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide block mb-2">Butir</label>
                      <StepperInput
                        value={simpleEggEntries[simpleIdx]?.qtyButir ?? 0}
                        onChange={(val) => updateSimpleButir(simpleIdx, val)}
                        min={0}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide block mb-2">Kg</label>
                      <StepperInput
                        value={simpleEggEntries[simpleIdx]?.qtyKg ?? 0}
                        onChange={(val) => updateSimpleKg(simpleIdx, val)}
                        min={0}
                        step={0.1}
                      />
                    </div>
                  </div>
                </div>
              )
            })}

            {eggItems.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-3 text-sm font-semibold">
                <span className="text-[var(--lf-text-mid)]">Total Butir</span>
                <span className="text-right text-[var(--lf-blue-active)]">
                  {allEggTotals.totalButir.toLocaleString('id')}
                </span>
                <span className="text-[var(--lf-text-mid)]">Total Kg</span>
                <span className="text-right text-[var(--lf-blue-active)]">
                  {allEggTotals.totalKg.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pakan' && (
          <div>
            {feedItems.length === 0 && <p className="text-sm text-[var(--lf-text-soft)] py-4">Tidak ada item pakan aktif.</p>}
            {feedItems.map((item, idx) => (
              <div key={item.id} className="py-3 border-b border-[var(--lf-border)] last:border-0 space-y-2">
                <div>
                  <p className="text-sm font-medium text-[var(--lf-text-dark)]">{item.name}</p>
                  <p className="text-xs" style={{ color: 'var(--lf-teal)' }}>Stok: {item.balance.toLocaleString('id')} kg</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide block mb-2">Dipakai (kg)</label>
                  <StepperInput
                    value={feedEntries[idx]?.qtyUsed ?? 0}
                    onChange={(val) => updateFeed(idx, val)}
                    min={0}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'vaksin' && (
          <div>
            {vaccineItems.length === 0 && <p className="text-sm text-[var(--lf-text-soft)] py-4">Tidak ada item vaksin aktif.</p>}
            {vaccineItems.map((item, idx) => (
              <div key={item.id} className="py-3 border-b border-[var(--lf-border)] last:border-0 space-y-2">
                <div>
                  <p className="text-sm font-medium text-[var(--lf-text-dark)]">{item.name}</p>
                  <p className="text-xs" style={{ color: 'var(--lf-teal)' }}>Stok: {item.balance.toLocaleString('id')} dosis</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide block mb-2">Dipakai (dosis)</label>
                  <StepperInput
                    value={vaccineEntries[idx]?.qtyUsed ?? 0}
                    onChange={(val) => updateVaccine(idx, val)}
                    min={0}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky submit */}
      <div className="fixed bottom-4 left-4 right-4 z-10 md:static md:z-auto md:left-auto md:right-auto md:bottom-auto md:mt-2">
        {error && (
          <p className="text-sm text-center mb-2 px-3 py-2 rounded-lg bg-[var(--lf-danger-bg)]" style={{ color: 'var(--lf-danger-text)' }}>
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={() => void submitForm()}
          disabled={pending || depletionOverflow}
          className="w-full font-semibold rounded-xl transition-opacity disabled:opacity-50"
          style={{
            minHeight: '52px',
            background: 'linear-gradient(to right, var(--lf-blue), var(--lf-blue-dark))',
            color: 'white',
            fontSize: '15px',
          }}
        >
          {pending ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </div>
  )
}
