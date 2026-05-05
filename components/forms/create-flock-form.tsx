// client: form state, submit handler, router.push on success
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createFlockAction } from '@/lib/actions/flock.actions'

const inputClass = 'mt-1 w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]'
const labelClass = 'block text-xs font-medium text-[var(--lf-text-mid)]'

function todayISO() {
  return new Date().toISOString().split('T')[0]!
}

interface Props {
  activeCoops: { id: string; name: string }[]
}

export function CreateFlockForm({ activeCoops }: Props) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [coopId, setCoopId] = useState(activeCoops[0]?.id ?? '')
  const [firstDeliveryDate, setFirstDeliveryDate] = useState(todayISO())
  const [firstDeliveryQuantity, setFirstDeliveryQuantity] = useState('')
  const [ageAtArrivalDays, setAgeAtArrivalDays] = useState('0')
  const [breed, setBreed] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const fd = new FormData()
      fd.set('name', name)
      fd.set('coopId', coopId)
      // arrivalDate = firstDeliveryDate (derived, not shown to user)
      fd.set('arrivalDate', firstDeliveryDate)
      fd.set('firstDeliveryDate', firstDeliveryDate)
      fd.set('firstDeliveryQuantity', firstDeliveryQuantity)
      fd.set('ageAtArrivalDays', ageAtArrivalDays)
      if (breed) fd.set('breed', breed)
      if (notes) fd.set('notes', notes)
      const result = await createFlockAction(fd)
      if (!result.success) {
        setError(result.error)
      } else {
        router.push('/flock')
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Informasi Flock */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-[var(--lf-text-dark)]">Informasi Flock</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nama Flock</label>
            <input
              className={inputClass}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Contoh: Batch Q1-2025"
            />
          </div>
          <div>
            <label className={labelClass}>Kandang</label>
            <select
              className={inputClass}
              value={coopId}
              onChange={(e) => setCoopId(e.target.value)}
              required
            >
              {activeCoops.length === 0 && (
                <option value="">-- Tidak ada kandang tersedia --</option>
              )}
              {activeCoops.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Ras/Breed (opsional)</label>
            <input
              className={inputClass}
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="Contoh: Isa Brown"
            />
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
        </div>
      </div>

      {/* Kedatangan Pertama */}
      <div className="space-y-4 pt-2 border-t border-[var(--lf-border)]">
        <div>
          <h2 className="text-sm font-semibold text-[var(--lf-text-dark)]">Kedatangan Pertama</h2>
          <p className="text-xs text-[var(--lf-text-soft)] mt-0.5">
            Sistem akan menghitung tanggal lahir (DOC date) secara otomatis.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Tanggal Tiba</label>
            <input
              className={inputClass}
              type="date"
              value={firstDeliveryDate}
              onChange={(e) => setFirstDeliveryDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Jumlah DOC (ekor)</label>
            <input
              className={inputClass}
              type="number"
              value={firstDeliveryQuantity}
              onChange={(e) => setFirstDeliveryQuantity(e.target.value)}
              required
              min="1"
              placeholder="Jumlah ekor"
            />
          </div>
          <div>
            <label className={labelClass}>Umur saat tiba (hari)</label>
            <input
              className={inputClass}
              type="number"
              value={ageAtArrivalDays}
              onChange={(e) => setAgeAtArrivalDays(e.target.value)}
              min="0"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs px-3 py-2 rounded-lg bg-[var(--lf-danger-bg)] text-[var(--lf-danger-text)]">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || activeCoops.length === 0}
          className="px-6 py-2 text-sm rounded-lg text-white font-medium"
          style={{ background: (loading || activeCoops.length === 0) ? 'var(--lf-blue-light)' : 'var(--lf-blue)' }}
        >
          {loading ? 'Menyimpan...' : 'Simpan Flock'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/flock')}
          className="px-4 py-2 text-sm rounded-lg border border-[var(--lf-border)] text-[var(--lf-text-mid)] hover:bg-[var(--lf-bg-warm)]"
        >
          Batal
        </button>
      </div>
    </form>
  )
}
