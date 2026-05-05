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

export function DailyRecordEditForm({ record, requireReason }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [deaths, setDeaths] = useState(record.deaths)
  const [culled, setCulled] = useState(record.culled)
  const [eggsCracked, setEggsCracked] = useState(record.eggsCracked)
  const [eggsAbnormal, setEggsAbnormal] = useState(record.eggsAbnormal)
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
        formData.set('eggsCracked', String(eggsCracked))
        formData.set('eggsAbnormal', String(eggsAbnormal))
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
          eggsCracked,
          eggsAbnormal,
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

  const inputClass = 'w-full text-sm rounded-lg border px-3 py-2 bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: '#5a6b5b' }}>Kematian (ekor)</label>
          <input type="number" min={0} value={deaths} onChange={(e) => setDeaths(Number(e.target.value))} className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: '#5a6b5b' }}>Afkir (ekor)</label>
          <input type="number" min={0} value={culled} onChange={(e) => setCulled(Number(e.target.value))} className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: '#5a6b5b' }}>Telur Retak</label>
          <input type="number" min={0} value={eggsCracked} onChange={(e) => setEggsCracked(Number(e.target.value))} className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: '#5a6b5b' }}>Telur Abnormal</label>
          <input type="number" min={0} value={eggsAbnormal} onChange={(e) => setEggsAbnormal(Number(e.target.value))} className={inputClass} />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium mb-1 block" style={{ color: '#5a6b5b' }}>Catatan</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full text-sm rounded-lg border px-3 py-2 resize-none bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]"
        />
      </div>

      {requireReason && (
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: '#5a6b5b' }}>
            Alasan Koreksi <span style={{ color: '#c0392b' }}>*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            minLength={3}
            rows={3}
            className="w-full text-sm rounded-lg border px-3 py-2 resize-none bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]"
            placeholder="Jelaskan alasan koreksi data ini..."
          />
        </div>
      )}

      {error && (
        <p className="text-sm rounded-lg px-3 py-2" style={{ background: '#fde8e8', color: '#c0392b' }}>
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push('/produksi')}
          className="flex-1 text-sm px-4 py-2 rounded-lg border"
          style={{ borderColor: '#d0d8d0', color: '#5a6b5b' }}
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 text-sm px-4 py-2 rounded-lg text-white"
          style={{ background: isPending ? '#a0c0d8' : '#5090be' }}
        >
          {isPending ? 'Menyimpan...' : requireReason ? 'Simpan Koreksi' : 'Simpan'}
        </button>
      </div>
    </form>
  )
}
