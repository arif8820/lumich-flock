// client: form state, submit handler, isDirty tracking
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle2 } from 'lucide-react'
import { updateInfoAkunAction } from '@/lib/actions/profil.actions'

const labelClass = 'block text-xs font-medium text-[var(--lf-text-mid)]'

function inputClass(saved: boolean) {
  const base = 'mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2'
  return saved
    ? `${base} border-[#22c55e] focus:ring-[#22c55e] pr-9`
    : `${base} border-[var(--lf-border)] focus:ring-[var(--lf-blue)]`
}

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
  const [saved, setSaved] = useState(false)

  const isDirty = fullName !== defaultFullName || phone !== (defaultPhone ?? '')

  function handleChange(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setSaved(false)
      setter(e.target.value)
    }
  }

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
        setSaved(true)
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
        <div className="relative">
          <input
            className={inputClass(saved)}
            type="text"
            value={fullName}
            onChange={handleChange(setFullName)}
            required
            placeholder="Nama lengkap"
          />
          {saved && (
            <CheckCircle2
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: '#22c55e' }}
            />
          )}
        </div>
      </div>
      <div>
        <label className={labelClass}>Nomor Telepon</label>
        <div className="relative">
          <input
            className={inputClass(saved)}
            type="tel"
            value={phone}
            onChange={handleChange(setPhone)}
            placeholder="Contoh: 08123456789"
          />
          {saved && (
            <CheckCircle2
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: '#22c55e' }}
            />
          )}
        </div>
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
