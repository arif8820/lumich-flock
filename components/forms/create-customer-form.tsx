// client: form state, submit handler
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCustomerAction } from '@/lib/actions/customer.actions'

const inputClass = 'mt-1 w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]'
const labelClass = 'block text-xs font-medium text-[var(--lf-text-mid)]'

interface Props {
  onSuccess: () => void
  onCancel: () => void
}

export function CreateCustomerForm({ onSuccess, onCancel }: Props) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [creditLimit, setCreditLimit] = useState('0')
  const [paymentTerms, setPaymentTerms] = useState('0')
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
      if (type) fd.set('type', type)
      if (phone) fd.set('phone', phone)
      if (address) fd.set('address', address)
      fd.set('creditLimit', creditLimit)
      fd.set('paymentTerms', paymentTerms)
      if (notes) fd.set('notes', notes)
      const result = await createCustomerAction(fd)
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
      <h3 className="text-sm font-semibold text-[var(--lf-text-dark)]">Tambah Pelanggan Baru</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Nama Pelanggan</label>
          <input
            className={inputClass}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Nama pelanggan"
          />
        </div>
        <div>
          <label className={labelClass}>Tipe</label>
          <select
            className={inputClass}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">-- Pilih tipe --</option>
            <option value="retail">Retail</option>
            <option value="wholesale">Grosir</option>
            <option value="distributor">Distributor</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Telepon (opsional)</label>
          <input
            className={inputClass}
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08xx-xxxx-xxxx"
          />
        </div>
        <div>
          <label className={labelClass}>Batas Kredit (Rp)</label>
          <input
            className={inputClass}
            type="number"
            value={creditLimit}
            onChange={(e) => setCreditLimit(e.target.value)}
            min="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Termin Pembayaran (hari)</label>
          <input
            className={inputClass}
            type="number"
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            min="0"
          />
        </div>
        <div>
          <label className={labelClass}>Alamat (opsional)</label>
          <input
            className={inputClass}
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Alamat pelanggan"
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
