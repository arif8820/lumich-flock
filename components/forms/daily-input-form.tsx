'use client'
// client: tabs, dynamic state, sessionStorage persistence

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveDailyRecordAction } from '@/lib/actions/daily-record.actions'
import type { FlockOption } from '@/lib/services/daily-record.service'
import type { StockItem } from '@/lib/db/schema'
import { StepperInput } from '@/components/ui/stepper-input'

type StockItemWithBalance = StockItem & { balance: number }

type Props = {
  flocks: FlockOption[]
  userRole: 'operator' | 'supervisor' | 'admin'
  eggItems: StockItem[]
  feedItems: StockItemWithBalance[]
  vaccineItems: StockItemWithBalance[]
}

type BundleEntry = { trayCount: number; topTrayCount: number; qtyKg: number }
type SimpleEggEntry = { stockItemId: string; qtyButir: number; qtyKg: number }
type FeedEntry = { stockItemId: string; qtyUsed: number }

const SESSION_KEY = 'daily-input-form-v2'

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

function emptyBundle(): BundleEntry {
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
  // bundle entries per stockItemId for bundle-method egg items
  const [eggBundles, setEggBundles] = useState<Record<string, BundleEntry[]>>(
    Object.fromEntries(eggItems.filter((i) => i.useBundleMethod).map((i) => [i.id, [emptyBundle()]]))
  )

  const [feedEntries, setFeedEntries] = useState<FeedEntry[]>(
    feedItems.map((i) => ({ stockItemId: i.id, qtyUsed: 0 }))
  )
  const [vaccineEntries, setVaccineEntries] = useState<FeedEntry[]>(
    vaccineItems.map((i) => ({ stockItemId: i.id, qtyUsed: 0 }))
  )

  const [activeTab, setActiveTab] = useState<TabKey>('ayam')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

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

  // bundle helpers
  function addBundle(stockItemId: string) {
    setEggBundles((prev) => ({ ...prev, [stockItemId]: [...(prev[stockItemId] ?? []), emptyBundle()] }))
  }
  function removeBundle(stockItemId: string, bundleIdx: number) {
    setEggBundles((prev) => ({
      ...prev,
      [stockItemId]: (prev[stockItemId] ?? []).filter((_, i) => i !== bundleIdx),
    }))
  }
  function updateBundle(stockItemId: string, bundleIdx: number, field: keyof BundleEntry, val: number) {
    setEggBundles((prev) => ({
      ...prev,
      [stockItemId]: (prev[stockItemId] ?? []).map((b, i) =>
        i === bundleIdx ? { ...b, [field]: val } : b
      ),
    }))
  }
  function getBundleTotals(stockItemId: string): { totalButir: number; totalKg: number } {
    const bundles = eggBundles[stockItemId] ?? []
    return {
      totalButir: bundles.reduce((s, b) => s + computeButir(b.trayCount, b.topTrayCount), 0),
      totalKg: bundles.reduce((s, b) => s + b.qtyKg, 0),
    }
  }

  // totals across all egg items
  const allEggTotals = (() => {
    const simpleButir = simpleEggEntries.reduce((s, e) => s + e.qtyButir, 0)
    const simpleKg = simpleEggEntries.reduce((s, e) => s + e.qtyKg, 0)
    const bundleButir = eggItems.filter((i) => i.useBundleMethod).reduce((s, i) => s + getBundleTotals(i.id).totalButir, 0)
    const bundleKg = eggItems.filter((i) => i.useBundleMethod).reduce((s, i) => s + getBundleTotals(i.id).totalKg, 0)
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
      // build eggEntries discriminated union for server action
      const eggEntries = [
        ...eggItems.filter((i) => i.useBundleMethod).map((item) => ({
          stockItemId: item.id,
          useBundleMethod: true,
          bundles: (eggBundles[item.id] ?? []).map((b) => ({
            trayCount: b.trayCount,
            topTrayCount: b.topTrayCount,
            qtyKg: b.qtyKg,
          })),
        })),
        ...simpleEggEntries.map((e) => ({
          stockItemId: e.stockItemId,
          useBundleMethod: false,
          qtyButir: e.qtyButir,
          qtyKg: e.qtyKg,
        })),
      ]

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
        setError(result.error)
      } else {
        sessionStorage.removeItem(SESSION_KEY)
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
                // Bundle-method item
                const bundles = eggBundles[item.id] ?? []
                const { totalButir, totalKg } = getBundleTotals(item.id)
                return (
                  <div key={item.id} className="py-3 border-b border-[var(--lf-border)] last:border-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[var(--lf-text-dark)]">{item.name}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: 'var(--lf-blue-pale)', color: 'var(--lf-blue-active)' }}>
                        Tray
                      </span>
                    </div>

                    {/* Bundle rows */}
                    <div className="space-y-2">
                      {/* Header row */}
                      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--lf-text-mid)]">
                        <span>Nampan</span>
                        <span>Atas</span>
                        <span>Kg</span>
                        <span className="w-6" />
                      </div>

                      {bundles.map((bundle, bundleIdx) => (
                        <div key={bundleIdx} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                          <input
                            type="number"
                            value={bundle.trayCount}
                            min={1}
                            onChange={(e) => updateBundle(item.id, bundleIdx, 'trayCount', Math.max(1, parseInt(e.target.value) || 1))}
                            className={numInputClass}
                          />
                          <input
                            type="number"
                            value={bundle.topTrayCount}
                            min={0}
                            max={30}
                            onChange={(e) => updateBundle(item.id, bundleIdx, 'topTrayCount', Math.min(30, Math.max(0, parseInt(e.target.value) || 0)))}
                            className={numInputClass}
                          />
                          <input
                            type="number"
                            value={bundle.qtyKg}
                            min={0}
                            step={0.01}
                            onChange={(e) => updateBundle(item.id, bundleIdx, 'qtyKg', Math.max(0, parseFloat(e.target.value) || 0))}
                            className={numInputClass}
                          />
                          <button
                            type="button"
                            onClick={() => removeBundle(item.id, bundleIdx)}
                            disabled={bundles.length <= 1}
                            className="w-6 h-6 flex items-center justify-center rounded text-sm disabled:opacity-30"
                            style={{ color: 'var(--lf-danger-text)' }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Computed totals */}
                    <div className="grid grid-cols-3 gap-2 text-xs text-center">
                      <div className="bg-[var(--lf-blue-pale)] rounded-lg py-1.5">
                        <div className="font-semibold" style={{ color: 'var(--lf-blue-active)' }}>{totalButir.toLocaleString('id')}</div>
                        <div style={{ color: 'var(--lf-text-soft)' }}>butir</div>
                      </div>
                      <div className="bg-[var(--lf-blue-pale)] rounded-lg py-1.5">
                        <div className="font-semibold" style={{ color: 'var(--lf-blue-active)' }}>{totalKg.toFixed(2)}</div>
                        <div style={{ color: 'var(--lf-text-soft)' }}>kg</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => addBundle(item.id)}
                        className="rounded-lg py-1.5 text-xs font-semibold transition-opacity"
                        style={{ background: 'var(--lf-blue-active)', color: 'white' }}
                      >
                        + Ikatan
                      </button>
                    </div>
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
