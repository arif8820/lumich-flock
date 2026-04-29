'use client' // client: needs useState for error/success state and form submission

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { DailyRecord } from '@/lib/db/schema'
import { updateDailyRecordAction } from '@/lib/actions/daily-record.actions'
import { correctDailyRecordAction } from '@/lib/actions/lock-period.actions'

type Props = {
  record: DailyRecord
  requireReason: boolean
}

export function DailyRecordEditForm({ record, requireReason }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!e.currentTarget.reportValidity()) return
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      setError(null)
      const result = requireReason
        ? await correctDailyRecordAction(formData)
        : await updateDailyRecordAction(formData)

      if (result.success) {
        router.push('/produksi')
        router.refresh()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="recordId" value={record.id} />

      <div className="grid grid-cols-2 gap-3">
        {[
          { name: 'eggsGradeA', label: 'Telur Grade A', defaultValue: record.eggsGradeA },
          { name: 'eggsGradeB', label: 'Telur Grade B', defaultValue: record.eggsGradeB },
          { name: 'eggsCracked', label: 'Telur Retak', defaultValue: record.eggsCracked },
          { name: 'eggsAbnormal', label: 'Telur Abnormal', defaultValue: record.eggsAbnormal },
          { name: 'deaths', label: 'Kematian', defaultValue: record.deaths },
          { name: 'culled', label: 'Afkir', defaultValue: record.culled },
          { name: 'feedKg', label: 'Pakan (kg)', defaultValue: record.feedKg ?? '' },
          { name: 'avgWeightKg', label: 'BB Rata-rata (kg)', defaultValue: record.avgWeightKg ?? '' },
        ].map(({ name, label, defaultValue }) => (
          <div key={name}>
            <label className="text-xs font-medium mb-1 block" style={{ color: '#5a6b5b' }}>{label}</label>
            <input
              type="number"
              name={name}
              defaultValue={String(defaultValue)}
              min={0}
              step={name.includes('Kg') ? '0.01' : '1'}
              className="w-full text-sm rounded-lg border px-3 py-2"
              style={{ borderColor: '#d0d8d0', color: '#2d3a2e' }}
            />
          </div>
        ))}
      </div>

      {requireReason && (
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: '#5a6b5b' }}>
            Alasan Koreksi <span style={{ color: '#c0392b' }}>*</span>
          </label>
          <textarea
            name="reason"
            required
            minLength={3}
            rows={3}
            className="w-full text-sm rounded-lg border px-3 py-2 resize-none"
            style={{ borderColor: '#d0d8d0', color: '#2d3a2e' }}
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
