'use client' // client: needs useState for error/success state and form submission

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { DailyRecord } from '@/lib/db/schema'
import { saveDailyRecordAction } from '@/lib/actions/daily-record.actions'
import { correctDailyRecordAction } from '@/lib/actions/lock-period.actions'

type Props = {
  record: DailyRecord
  requireReason: boolean
}

const inputClass = 'w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]'

export function DailyRecordEditForm({ record, requireReason }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [deaths, setDeaths] = useState(record.deaths)
  const [culled, setCulled] = useState(record.culled)
  const [notes, setNotes] = useState(record.notes ?? '')
  const [reason, setReason] = useState('')

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
          eggEntries: [],
          feedEntries: [],
          vaccineEntries: [],
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
      {/* Tab strip — Ayam only, consistent with input form style */}
      <div className="flex gap-0 border-b border-[var(--lf-border)] bg-white rounded-t-xl overflow-x-auto">
        <div className="px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px border-[var(--lf-blue-active)] text-[var(--lf-blue-active)]">
          🐓 Ayam
        </div>
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-b-xl rounded-tr-xl p-5 shadow-lf-sm border border-[var(--lf-border)] border-t-0 space-y-4">
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
