'use client' // client: tabs, dynamic state, form submission

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { DailyRecord } from '@/lib/db/schema'
import type { StockItem } from '@/lib/db/schema'
import type { DailySubRecords } from '@/lib/db/queries/daily-record.queries'
import { saveDailyRecordAction } from '@/lib/actions/daily-record.actions'
import { correctDailyRecordAction } from '@/lib/actions/lock-period.actions'

type StockItemWithBalance = StockItem & { balance: number }

type Props = {
  record: DailyRecord
  subRecords: DailySubRecords
  eggItems: StockItem[]
  feedItems: StockItemWithBalance[]
  vaccineItems: StockItemWithBalance[]
  requireReason: boolean
}

type EggEntry = { stockItemId: string; qtyButir: number; qtyKg: number }
type FeedEntry = { stockItemId: string; qtyUsed: number }

const TABS = [
  { key: 'ayam', label: '🐓 Ayam' },
  { key: 'telur', label: '🥚 Telur' },
  { key: 'pakan', label: '🌾 Pakan' },
  { key: 'vaksin', label: '💉 Vaksin' },
] as const

type TabKey = typeof TABS[number]['key']

const inputClass = 'mt-1 w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]'
const numInputClass = 'w-full border border-[var(--lf-border)] rounded-lg px-2 py-1.5 text-sm text-right bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]'

export function DailyRecordEditForm({ record, subRecords, eggItems, feedItems, vaccineItems, requireReason }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('ayam')

  const [deaths, setDeaths] = useState(record.deaths)
  const [culled, setCulled] = useState(record.culled)
  const [notes, setNotes] = useState(record.notes ?? '')
  const [reason, setReason] = useState('')

  const [eggEntries, setEggEntries] = useState<EggEntry[]>(
    eggItems.map((item) => {
      const existing = subRecords.eggRecords.find((r) => r.stockItemId === item.id)
      return { stockItemId: item.id, qtyButir: existing?.qtyButir ?? 0, qtyKg: existing?.qtyKg ?? 0 }
    })
  )
  const [feedEntries, setFeedEntries] = useState<FeedEntry[]>(
    feedItems.map((item) => {
      const existing = subRecords.feedRecords.find((r) => r.stockItemId === item.id)
      return { stockItemId: item.id, qtyUsed: existing?.qtyUsed ?? 0 }
    })
  )
  const [vaccineEntries, setVaccineEntries] = useState<FeedEntry[]>(
    vaccineItems.map((item) => {
      const existing = subRecords.vaccineRecords.find((r) => r.stockItemId === item.id)
      return { stockItemId: item.id, qtyUsed: existing?.qtyUsed ?? 0 }
    })
  )

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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    startTransition(async () => {
      setError(null)

      if (requireReason) {
        const formData = new FormData()
        formData.set('recordId', record.id)
        formData.set('reason', reason)
        formData.set('deaths', String(deaths))
        formData.set('culled', String(culled))
        const result = await correctDailyRecordAction(formData)
        if (result.success) {
          router.push('/produksi')
          router.refresh()
        } else {
          setError(result.error)
        }
      } else {
        const result = await saveDailyRecordAction({
          flockId: record.flockId,
          recordDate: record.recordDate,
          deaths,
          culled,
          eggsCracked: record.eggsCracked,
          eggsAbnormal: record.eggsAbnormal,
          notes: notes || undefined,
          eggEntries,
          feedEntries,
          vaccineEntries,
        })
        if (result.success) {
          router.push('/produksi')
          router.refresh()
        } else {
          setError(result.error)
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
                <input type="number" min={0} value={deaths} onChange={(e) => setDeaths(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Afkir (ekor)</label>
                <input type="number" min={0} value={culled} onChange={(e) => setCulled(Number(e.target.value))} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Catatan</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]"
              />
            </div>
            {requireReason && (
              <div>
                <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">
                  Alasan Koreksi <span style={{ color: '#c0392b' }}>*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  minLength={3}
                  rows={3}
                  className="mt-1 w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)] resize-none"
                  placeholder="Jelaskan alasan koreksi data ini..."
                />
              </div>
            )}
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
                  value={vaccineEntries[idx]?.qtyUsed ?? 0}
                  onChange={(e) => updateVaccine(idx, Number(e.target.value))}
                  className={numInputClass}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-[var(--lf-danger-bg)] rounded-lg px-4 py-3 text-sm" style={{ color: 'var(--lf-danger-text)' }}>
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push('/produksi')}
          className="flex-1 text-sm px-4 py-2 rounded-lg border border-[var(--lf-border)] text-[var(--lf-text-mid)] hover:bg-[var(--lf-bg-warm)]"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 text-sm px-4 py-2 rounded-lg text-white font-medium"
          style={{ background: isPending ? 'var(--lf-blue-light)' : 'var(--lf-blue)' }}
        >
          {isPending ? 'Menyimpan...' : requireReason ? 'Simpan Koreksi' : 'Simpan'}
        </button>
      </div>
    </form>
  )
}
