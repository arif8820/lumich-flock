// client: form state, submit handler, isDirty tracking
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateInfoAkunAction } from '@/lib/actions/profil.actions'

const inputClass = 'mt-1 w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]'
const labelClass = 'block text-xs font-medium text-[var(--lf-text-mid)]'

interface Props {
  defaultFullName: string
  defaultPhone: string | null
}

export function InfoAkunForm({ defaultFullName, defaultPhone }: Props) {
  const router = useRouter()
  const [fullName, setFullName] = useState(defaultFullName)
  const [phone, setPhone] = useState(defaultPhone ?? '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isDirty = fullName !== defaultFullName || phone !== (defaultPhone ?? '')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isDirty) return
    setError(null)
    setLoading(true)
    try {
      const fd = new FormData()
      fd.set('fullName', fullName)
      if (phone) fd.set('phone', phone)
      const result = await updateInfoAkunAction(fd)
      if (!result.success) {
        setError(result.error)
      } else {
        toast.success('Informasi akun berhasil diperbarui')
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Nama Lengkap</label>
        <input
          className={inputClass}
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          placeholder="Nama lengkap"
        />
      </div>
      <div>
        <label className={labelClass}>Nomor Telepon</label>
        <input
          className={inputClass}
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Contoh: 08123456789"
        />
      </div>

      {error && (
        <p className="text-xs px-3 py-2 rounded-lg bg-[var(--lf-danger-bg)] text-[var(--lf-danger-text)]">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !isDirty}
          className="px-5 py-2 text-sm rounded-lg text-white disabled:opacity-50"
          style={{ background: 'var(--lf-blue)' }}
        >
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  )
}
