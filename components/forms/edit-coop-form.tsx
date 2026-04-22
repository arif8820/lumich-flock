// client: form state, submit handler
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateCoopAction } from '@/lib/actions/coop.actions'

const inputClass = 'mt-1 w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]'
const labelClass = 'block text-xs font-medium text-[var(--lf-text-mid)]'

interface CoopData {
  id: string
  name: string
  capacity: number | null
  notes: string | null
}

interface Props {
  coop: CoopData
  onSuccess: () => void
  onCancel: () => void
}

export function EditCoopForm({ coop, onSuccess, onCancel }: Props) {
  const router = useRouter()
  const [name, setName] = useState(coop.name)
  const [capacity, setCapacity] = useState(coop.capacity != null ? String(coop.capacity) : '')
  const [notes, setNotes] = useState(coop.notes ?? '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const fd = new FormData()
      fd.set('name', name)
      if (capacity) fd.set('capacity', capacity)
      if (notes) fd.set('notes', notes)
      const result = await updateCoopAction(coop.id, fd)
      if (!result.success) {
        setError(result.error)
      } else {
        router.refresh()
        onSuccess()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="p-4 border border-[var(--lf-border)] rounded-xl bg-[var(--lf-bg)] space-y-3">
      <h3 className="text-sm font-semibold text-[var(--lf-text-dark)]">Edit Kandang</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Nama Kandang</label>
          <input
            className={inputClass}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Kapasitas (ekor, opsional)</label>
          <input
            className={inputClass}
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            min="1"
            placeholder="Kosongkan jika tidak ada"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Catatan (opsional)</label>
        <textarea
          className={inputClass}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </div>

      {error && (
        <p className="text-xs px-3 py-2 rounded-lg bg-[var(--lf-danger-bg)] text-[var(--lf-danger-text)]">
          {error}
        </p>
      )}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-1.5 text-sm rounded-lg border border-[var(--lf-border)] text-[var(--lf-text-mid)] hover:bg-[var(--lf-bg-warm)]"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-1.5 text-sm rounded-lg text-white"
          style={{ background: loading ? 'var(--lf-blue-light)' : 'var(--lf-blue)' }}
        >
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  )
}
