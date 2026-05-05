'use client'
// client: tabs, dynamic state, sessionStorage persistence

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveDailyRecordAction } from '@/lib/actions/daily-record.actions'
import type { FlockOption } from '@/lib/services/daily-record.service'
import type { StockItem } from '@/lib/db/schema'

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

const inputClass = 'mt-1 w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]'
const numInputClass = 'w-full border border-[var(--lf-border)] rounded-lg px-2 py-1.5 text-sm text-right bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]'

export function DailyInputForm({ flocks, userRole, eggItems, feedItems, vaccineItems }: Props) {
  const router = useRouter()
  const defaultFlockId = flocks[0]?.id ?? ''

  const [flockId, setFlockId] = useState(defaultFlockId)
  const [recordDate, setRecordDate] = useState(todayUTC())
  const [deaths, setDeaths] = useState(0)
  const [culled, setCulled] = useState(0)
  const [eggsCracked, setEggsCracked] = useState(0)
  const [eggsAbnormal, setEggsAbnormal] = useState(0)
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
    <div className="space-y-4">
      {/* Header: Flock + Date */}
      <div className="bg-white rounded-xl p-4 shadow-lf-sm border border-[var(--lf-border)] grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Flock</label>
          <select value={flockId} onChange={(e) => setFlockId(e.target.value)} className={inputClass}>
            {flocks.map((f) => (
              <option key={f.id} value={f.id}>{f.name} — {f.coopName}</option>
            ))}
          </select>
        </div>
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
      </div>

      {/* Tab strip */}
      <div className="flex gap-0 border-b border-[var(--lf-border)] bg-white rounded-t-xl overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              t.key === activeTab
                ? 'border-[var(--lf-blue-active)] text-[var(--lf-blue-active)]'
                : 'border-transparent text-[var(--lf-text-soft)] hover:text-[var(--lf-text-mid)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-b-xl rounded-tr-xl p-5 shadow-lf-sm border border-[var(--lf-border)] border-t-0 space-y-4">

        {activeTab === 'ayam' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Kematian (ekor)</label>
                <input type="number" min="0" value={deaths} onChange={(e) => setDeaths(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Afkir (ekor)</label>
                <input type="number" min="0" value={culled} onChange={(e) => setCulled(Number(e.target.value))} className={inputClass} />
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
                className="mt-1 w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]"
              />
            </div>
          </>
        )}

        {activeTab === 'telur' && (
          <div>
            <div className="grid grid-cols-[1fr_80px_80px] gap-2 pb-2 border-b border-[var(--lf-border)] text-[10px] font-semibold uppercase tracking-wide text-[var(--lf-text-soft)]">
              <span>SKU</span>
              <span className="text-right">Butir</span>
              <span className="text-right">Kg</span>
            </div>
            {eggItems.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-[1fr_80px_80px] gap-2 py-2 border-b border-[var(--lf-border)] last:border-0 items-center">
                <span className="text-sm font-medium text-[var(--lf-text-dark)]">{item.name}</span>
                <input
                  type="number"
                  min="0"
                  value={eggEntries[idx]?.qtyButir ?? 0}
                  onChange={(e) => updateEggButir(idx, Number(e.target.value))}
                  className={numInputClass}
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={eggEntries[idx]?.qtyKg ?? 0}
                  onChange={(e) => updateEggKg(idx, Number(e.target.value))}
                  className={numInputClass}
                />
              </div>
            ))}
            {eggItems.length === 0 && <p className="text-sm text-[var(--lf-text-soft)] py-4">Tidak ada SKU telur aktif.</p>}
            {eggItems.length > 0 && (
              <div className="grid grid-cols-[1fr_80px_80px] gap-2 pt-2 text-sm font-semibold">
                <span className="text-[var(--lf-text-mid)]">Total</span>
                <span className="text-right text-[var(--lf-blue-active)]">
                  {eggEntries.reduce((s, e) => s + e.qtyButir, 0).toLocaleString('id')}
                </span>
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
            <div className="grid grid-cols-[1fr_100px] gap-2 pb-2 border-b border-[var(--lf-border)] text-[10px] font-semibold uppercase tracking-wide text-[var(--lf-text-soft)]">
              <span>Item</span>
              <span className="text-right">Dipakai (kg)</span>
            </div>
            {feedItems.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-[1fr_100px] gap-2 py-2 border-b border-[var(--lf-border)] last:border-0 items-center">
                <div>
                  <p className="text-sm font-medium text-[var(--lf-text-dark)]">{item.name}</p>
                  <p className="text-xs" style={{ color: 'var(--lf-teal)' }}>Stok: {item.balance.toLocaleString('id')} kg</p>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  max={item.balance}
                  value={feedEntries[idx]?.qtyUsed ?? 0}
                  onChange={(e) => updateFeed(idx, Number(e.target.value))}
                  className={numInputClass}
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'vaksin' && (
          <div>
            {vaccineItems.length === 0 && <p className="text-sm text-[var(--lf-text-soft)] py-4">Tidak ada item vaksin aktif.</p>}
            <div className="grid grid-cols-[1fr_100px] gap-2 pb-2 border-b border-[var(--lf-border)] text-[10px] font-semibold uppercase tracking-wide text-[var(--lf-text-soft)]">
              <span>Item</span>
              <span className="text-right">Dipakai (dosis)</span>
            </div>
            {vaccineItems.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-[1fr_100px] gap-2 py-2 border-b border-[var(--lf-border)] last:border-0 items-center">
                <div>
                  <p className="text-sm font-medium text-[var(--lf-text-dark)]">{item.name}</p>
                  <p className="text-xs" style={{ color: 'var(--lf-teal)' }}>Stok: {item.balance.toLocaleString('id')} dosis</p>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  max={item.balance}
                  value={vaccineEntries[idx]?.qtyUsed ?? 0}
                  onChange={(e) => updateVaccine(idx, Number(e.target.value))}
                  className={numInputClass}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Also track waste metrics (hidden from tabs but included in Ayam tab context) */}
      {activeTab === 'ayam' && (
        <div className="bg-white rounded-xl p-4 shadow-lf-sm border border-[var(--lf-border)] grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Telur Retak</label>
            <input type="number" min="0" value={eggsCracked} onChange={(e) => setEggsCracked(Number(e.target.value))} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Telur Abnormal</label>
            <input type="number" min="0" value={eggsAbnormal} onChange={(e) => setEggsAbnormal(Number(e.target.value))} className={inputClass} />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-[var(--lf-danger-bg)] rounded-lg px-4 py-3 text-sm" style={{ color: 'var(--lf-danger-text)' }}>{error}</div>
      )}

      <button
        type="button"
        onClick={() => void submitForm()}
        disabled={pending || depletionOverflow}
        className="w-full bg-gradient-to-r from-[#7aadd4] to-[#5090be] text-white font-medium rounded-xl py-3 shadow-lf-btn disabled:opacity-60"
      >
        {pending ? 'Menyimpan...' : 'Simpan'}
      </button>
    </div>
  )
}
