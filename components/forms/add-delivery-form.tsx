// client: needs form state and submit handler
'use client'

import { useState } from 'react'
import { createFlockDeliveryAction } from '@/lib/actions/flock-delivery.actions'

const inputClass = 'mt-1 w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]'
const labelClass = 'block text-xs font-medium text-[var(--lf-text-mid)]'

function todayISO() {
  return new Date().toISOString().split('T')[0]!
}

interface Props {
  flockId: string
  onSuccess: () => void
  onCancel: () => void
}

export function AddDeliveryForm({ flockId, onSuccess, onCancel }: Props) {
  const [deliveryDate, setDeliveryDate] = useState(todayISO())
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const fd = new FormData()
      fd.set('flockId', flockId)
      fd.set('deliveryDate', deliveryDate)
      fd.set('quantity', quantity)
      if (notes) fd.set('notes', notes)
      const result = await createFlockDeliveryAction(fd)
      if (!result.success) {
        setError(result.error)
      } else {
        onSuccess()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 p-4 rounded-xl border border-[var(--lf-border)] bg-[var(--lf-bg-warm)]">
      <h3 className="text-sm font-semibold text-[var(--lf-text-dark)]">Tambah Kedatangan</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Tanggal Tiba</label>
          <input
            className={inputClass}
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Jumlah DOC (ekor)</label>
          <input
            className={inputClass}
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            min="1"
            placeholder="Jumlah ekor"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Catatan (opsional)</label>
        <input
          className={inputClass}
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-xs px-3 py-2 rounded-lg bg-[var(--lf-danger-bg)] text-[var(--lf-danger-text)]">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 text-sm rounded-lg text-white font-medium"
          style={{ background: loading ? 'var(--lf-blue-light)' : 'var(--lf-blue)' }}
        >
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded-lg border border-[var(--lf-border)] text-[var(--lf-text-mid)] hover:bg-[var(--lf-bg-warm)]"
        >
          Batal
        </button>
      </div>
    </form>
  )
}
