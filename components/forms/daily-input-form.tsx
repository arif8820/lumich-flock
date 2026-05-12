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

type EggEntry = { stockItemId: string; qtyButir: number; qtyKg: number }
type FeedEntry = { stockItemId: string; qtyUsed: number }

const SESSION_KEY = 'daily-input-form-v2'

function todayUTC(): string {
  return new Date().toISOString().split('T')[0]!
}

function minDate(role: 'operator' | 'supervisor' | 'admin'): string {
  const days = role === 'operator' ? 1 : role === 'supervisor' ? 3 : 365
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]!
}

const TABS = [
  { key: 'ayam', label: '🐓 Ayam' },
  { key: 'telur', label: '🥚 Telur' },
  { key: 'pakan', label: '🌾 Pakan' },
  { key: 'vaksin', label: '💉 Vaksin' },
] as const

type TabKey = typeof TABS[number]['key']

const inputClass = 'mt-1 w-full border border-[var(--lf-border)] rounded-xl px-3 py-3 text-base bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]'

export function DailyInputForm({ flocks, userRole, eggItems, feedItems, vaccineItems }: Props) {
  const router = useRouter()
  const defaultFlockId = flocks[0]?.id ?? ''

  const [flockId, setFlockId] = useState(defaultFlockId)
  const [recordDate, setRecordDate] = useState(todayUTC())
  const [deaths, setDeaths] = useState(0)
  const [culled, setCulled] = useState(0)
  const [eggsCracked] = useState(0)
  const [eggsAbnormal] = useState(0)
  const [notes, setNotes] = useState('')
  const [eggEntries, setEggEntries] = useState<EggEntry[]>(
    eggItems.map((i) => ({ stockItemId: i.id, qtyButir: 0, qtyKg: 0 }))
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

  function updateEggButir(idx: number, val: number) {
    setEggEntries((prev) => prev.map((e, i) => i === idx ? { ...e, qtyButir: val } : e))
  }
  function updateEggKg(idx: number, val: number) {
    setEggEntries((prev) => prev.map((e, i) => i === idx ? { ...e, qtyKg: val } : e))
  }
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
                <StepperInput
                  value={deaths}
                  onChange={setDeaths}
                  min={0}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide block mb-2">Afkir (ekor)</label>
                <StepperInput
                  value={culled}
                  onChange={setCulled}
                  min={0}
                />
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
            {eggItems.map((item, idx) => (
              <div key={item.id} className="py-3 border-b border-[var(--lf-border)] last:border-0 space-y-2">
                <span className="text-sm font-medium text-[var(--lf-text-dark)]">{item.name}</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide block mb-2">Butir</label>
                    <StepperInput
                      value={eggEntries[idx]?.qtyButir ?? 0}
                      onChange={(val) => updateEggButir(idx, val)}
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide block mb-2">Kg</label>
                    <StepperInput
                      value={eggEntries[idx]?.qtyKg ?? 0}
                      onChange={(val) => updateEggKg(idx, val)}
                      min={0}
                      step={0.1}
                    />
                  </div>
                </div>
              </div>
            ))}
            {eggItems.length === 0 && <p className="text-sm text-[var(--lf-text-soft)] py-4">Tidak ada SKU telur aktif.</p>}
            {eggItems.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-3 text-sm font-semibold">
                <span className="text-[var(--lf-text-mid)]">Total Butir</span>
                <span className="text-right text-[var(--lf-blue-active)]">
                  {eggEntries.reduce((s, e) => s + e.qtyButir, 0).toLocaleString('id')}
                </span>
                <span className="text-[var(--lf-text-mid)]">Total Kg</span>
                <span className="text-right text-[var(--lf-blue-active)]">
                  {eggEntries.reduce((s, e) => s + e.qtyKg, 0).toFixed(2)}
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
