'use client'
// client: live auto-calc with useMemo + sessionStorage persistence

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createDailyRecordAction } from '@/lib/actions/daily-record.actions'
import type { FlockOption } from '@/lib/services/daily-record.service'

// USED BY: [daily-record.service, daily-input-form] — count: 2
function calcHDP(a: number, b: number, pop: number) {
  return pop > 0 ? ((a + b) / pop) * 100 : 0
}
// USED BY: [daily-record.service, daily-input-form] — count: 2
function calcFeedPerBird(feedKg: number, pop: number) {
  return pop > 0 ? (feedKg / pop) * 1000 : 0
}
// USED BY: [daily-record.service, daily-input-form] — count: 2
function calcFCR(feedKg: number, a: number, b: number) {
  const total = a + b
  return total > 0 ? feedKg / (total / 12) : 0
}

type Props = {
  flocks: FlockOption[]
  userRole: 'operator' | 'supervisor' | 'admin'
}

type FormValues = {
  flockId: string
  recordDate: string
  deaths: string
  culled: string
  eggsGradeA: string
  eggsGradeB: string
  eggsCracked: string
  eggsAbnormal: string
  avgWeightKg: string
  feedKg: string
}

const SESSION_KEY = 'daily-input-form'

function todayUTC(): string {
  return new Date().toISOString().split('T')[0]!
}

function minDate(role: 'operator' | 'supervisor' | 'admin'): string {
  const days = role === 'operator' ? 1 : role === 'supervisor' ? 3 : 365
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]!
}

function empty(flockId: string): FormValues {
  return {
    flockId,
    recordDate: todayUTC(),
    deaths: '0',
    culled: '0',
    eggsGradeA: '0',
    eggsGradeB: '0',
    eggsCracked: '0',
    eggsAbnormal: '0',
    avgWeightKg: '',
    feedKg: '',
  }
}

const inputClass =
  'mt-1 w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]'

export function DailyInputForm({ flocks, userRole }: Props) {
  const router = useRouter()
  const defaultFlockId = flocks[0]?.id ?? ''
  const [values, setValues] = useState<FormValues>(empty(defaultFlockId))
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [restored, setRestored] = useState(false)
  const [networkError, setNetworkError] = useState(false)

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY)
    if (saved) {
      /* eslint-disable react-hooks/set-state-in-effect */
      try {
        setValues(JSON.parse(saved) as FormValues)
        setRestored(true)
      } catch { /* ignore */ }
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [])

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(values))
  }, [values])

  const flock = flocks.find((f) => f.id === values.flockId)

  const calc = useMemo(() => {
    const d = parseInt(values.deaths) || 0
    const c = parseInt(values.culled) || 0
    const a = parseInt(values.eggsGradeA) || 0
    const b = parseInt(values.eggsGradeB) || 0
    const feed = parseFloat(values.feedKg) || 0
    const currentPop = flock?.currentPopulation ?? 0
    const totalDepletion = d + c
    const depletionOverflow = totalDepletion > currentPop
    const pop = Math.max(0, currentPop - totalDepletion)
    return { totalDepletion, activePopulation: pop, hdp: calcHDP(a, b, pop), feedPerBird: calcFeedPerBird(feed, pop), fcr: calcFCR(feed, a, b), depletionOverflow }
  }, [values, flock])

  function field(k: keyof FormValues) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setValues((p) => ({ ...p, [k]: e.target.value }))
  }

  async function submitForm() {
    if (calc.depletionOverflow) return
    setError(null)
    setNetworkError(false)
    setPending(true)
    try {
      const fd = new FormData()
      Object.entries(values).forEach(([k, v]) => fd.append(k, v))
      const result = await createDailyRecordAction(fd)
      if (!result.success) {
        setError(result.error)
      } else {
        sessionStorage.removeItem(SESSION_KEY)
        router.push('/produksi')
        router.refresh()
      }
    } catch {
      setNetworkError(true)
    } finally {
      setPending(false)
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    void submitForm()
  }

  if (flocks.length === 0) {
    return <p className="text-[var(--lf-text-soft)]">Tidak ada flock aktif yang tersedia.</p>
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {restored && (
        <div className="flex items-center justify-between bg-[var(--lf-blue-pale)] rounded-lg px-4 py-2.5 text-sm border border-[var(--lf-blue-light)]">
          <span style={{ color: 'var(--lf-blue-active)' }}>Data form dipulihkan dari sesi sebelumnya.</span>
          <button type="button" onClick={() => { sessionStorage.removeItem(SESSION_KEY); setValues(empty(defaultFlockId)); setRestored(false) }}
            className="text-xs underline ml-3" style={{ color: 'var(--lf-blue-active)' }}>Reset</button>
        </div>
      )}
      {/* Flock + Date */}
      <div className="bg-white rounded-xl p-4 shadow-lf-sm border border-[var(--lf-border)] space-y-4">
        <div>
          <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Flock</label>
          <select name="flockId" value={values.flockId} onChange={field('flockId')} className={inputClass} required>
            {flocks.map((f) => (
              <option key={f.id} value={f.id}>{f.name} — {f.coopName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Tanggal Produksi</label>
          <input type="date" name="recordDate" value={values.recordDate} onChange={field('recordDate')}
            max={todayUTC()} min={minDate(userRole)} className={inputClass} required />
        </div>
      </div>

      {/* Depletion */}
      <div className="bg-white rounded-xl p-4 shadow-lf-sm border border-[var(--lf-border)]">
        <p className="text-xs font-medium text-[var(--lf-text-soft)] uppercase tracking-wide mb-3">Depletion</p>
        <div className="grid grid-cols-2 gap-3">
          {([['deaths', 'Kematian'], ['culled', 'Sortir']] as [keyof FormValues, string][]).map(([k, lbl]) => (
            <div key={k}>
              <label className="text-xs text-[var(--lf-text-mid)]">{lbl}</label>
              <input type="number" name={k} min="0" value={values[k]} onChange={field(k)} className={inputClass} />
            </div>
          ))}
        </div>
      </div>

      {/* Eggs */}
      <div className="bg-white rounded-xl p-4 shadow-lf-sm border border-[var(--lf-border)]">
        <p className="text-xs font-medium text-[var(--lf-text-soft)] uppercase tracking-wide mb-3">Telur</p>
        <div className="grid grid-cols-2 gap-3">
          {([
            ['eggsGradeA', 'Grade A'],
            ['eggsGradeB', 'Grade B'],
            ['eggsCracked', 'Retak'],
            ['eggsAbnormal', 'Abnormal'],
          ] as [keyof FormValues, string][]).map(([k, lbl]) => (
            <div key={k}>
              <label className="text-xs text-[var(--lf-text-mid)]">{lbl}</label>
              <input type="number" name={k} min="0" value={values[k]} onChange={field(k)} className={inputClass} />
            </div>
          ))}
        </div>
      </div>

      {/* Feed + Weight */}
      <div className="bg-white rounded-xl p-4 shadow-lf-sm border border-[var(--lf-border)]">
        <p className="text-xs font-medium text-[var(--lf-text-soft)] uppercase tracking-wide mb-3">Pakan & Bobot</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[var(--lf-text-mid)]">Pakan (kg)</label>
            <input type="number" name="feedKg" min="0" step="0.01" value={values.feedKg} onChange={field('feedKg')} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-[var(--lf-text-mid)]">Rata-rata bobot (kg)</label>
            <input type="number" name="avgWeightKg" min="0" step="0.001" value={values.avgWeightKg} onChange={field('avgWeightKg')} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Auto-calc */}
      <div className={`rounded-xl p-4 border ${calc.depletionOverflow ? 'bg-[var(--lf-danger-bg)] border-[var(--lf-danger-text)]' : 'bg-[var(--lf-blue-pale)] border-[var(--lf-blue-light)]'}`}>
        <p className={`text-xs font-medium uppercase tracking-wide mb-3 ${calc.depletionOverflow ? 'text-[var(--lf-danger-text)]' : 'text-[var(--lf-blue-active)]'}`}>Kalkulasi Otomatis</p>
        {calc.depletionOverflow && (
          <p className="text-sm mb-3 font-medium" style={{ color: 'var(--lf-danger-text)' }}>
            Peringatan: total depletion ({calc.totalDepletion}) melebihi populasi aktif ({flock?.currentPopulation ?? 0}). Tidak dapat menyimpan.
          </p>
        )}
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <span className="text-[var(--lf-text-mid)]">Depletion hari ini</span>
          <span className={`font-medium text-right ${calc.depletionOverflow ? 'text-[var(--lf-danger-text)]' : 'text-[var(--lf-text-dark)]'}`}>{calc.totalDepletion}</span>
          <span className="text-[var(--lf-text-mid)]">Populasi aktif</span>
          <span className="font-medium text-right text-[var(--lf-text-dark)]">{calc.activePopulation.toLocaleString('id')}</span>
          <span className="text-[var(--lf-text-mid)]">HDP%</span>
          <span className="font-medium text-right text-[var(--lf-text-dark)]">{calc.hdp.toFixed(1)}%</span>
          {values.feedKg && (
            <>
              <span className="text-[var(--lf-text-mid)]">Pakan/ekor</span>
              <span className="font-medium text-right text-[var(--lf-text-dark)]">{calc.feedPerBird.toFixed(0)} g</span>
              <span className="text-[var(--lf-text-mid)]">FCR</span>
              <span className="font-medium text-right text-[var(--lf-text-dark)]">{calc.fcr.toFixed(2)}</span>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-[var(--lf-danger-bg)] rounded-lg px-4 py-3 text-sm" style={{ color: 'var(--lf-danger-text)' }}>{error}</div>
      )}

      {networkError && (
        <div className="bg-[var(--lf-danger-bg)] rounded-lg px-4 py-3 text-sm flex items-center justify-between" style={{ color: 'var(--lf-danger-text)' }}>
          <span>Gagal terhubung ke server. Data tersimpan, coba lagi.</span>
          <button type="button" onClick={submitForm}
            className="ml-3 text-xs font-medium underline">Coba lagi</button>
        </div>
      )}

      <button
        type="submit"
        disabled={pending || calc.depletionOverflow}
        className="w-full bg-gradient-to-r from-[#7aadd4] to-[#5090be] text-white font-medium rounded-xl py-3 shadow-lf-btn disabled:opacity-60"
      >
        {pending ? 'Menyimpan...' : 'Simpan Data Produksi'}
      </button>
    </form>
  )
}
