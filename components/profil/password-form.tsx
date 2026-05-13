// client: form state, submit handler, eye toggle, client-side confirm check
'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { gantiPasswordAction } from '@/lib/actions/profil.actions'

const inputClass = 'mt-1 w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]'
const labelClass = 'block text-xs font-medium text-[var(--lf-text-mid)]'

function PasswordInput({
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggle: () => void
  placeholder?: string
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="relative">
        <input
          className={inputClass}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          placeholder={placeholder}
          style={{ paddingRight: '2.5rem' }}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--lf-text-soft)]"
          tabIndex={-1}
        >
          {show ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
        </button>
      </div>
    </div>
  )
}

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok')
      return
    }

    setLoading(true)
    try {
      const fd = new FormData()
      fd.set('currentPassword', currentPassword)
      fd.set('newPassword', newPassword)
      fd.set('confirmPassword', confirmPassword)
      const result = await gantiPasswordAction(fd)
      if (!result.success) {
        setError(result.error)
      } else {
        toast.success('Password berhasil diubah')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setShowCurrent(false)
        setShowNew(false)
        setShowConfirm(false)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <PasswordInput
        label="Password Saat Ini"
        value={currentPassword}
        onChange={setCurrentPassword}
        show={showCurrent}
        onToggle={() => setShowCurrent(!showCurrent)}
        placeholder="Masukkan password saat ini"
      />
      <PasswordInput
        label="Password Baru"
        value={newPassword}
        onChange={setNewPassword}
        show={showNew}
        onToggle={() => setShowNew(!showNew)}
        placeholder="Minimal 8 karakter"
      />
      <PasswordInput
        label="Konfirmasi Password Baru"
        value={confirmPassword}
        onChange={setConfirmPassword}
        show={showConfirm}
        onToggle={() => setShowConfirm(!showConfirm)}
        placeholder="Ulangi password baru"
      />

      {error && (
        <p className="text-xs px-3 py-2 rounded-lg bg-[var(--lf-danger-bg)] text-[var(--lf-danger-text)]">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 text-sm rounded-lg text-white disabled:opacity-50"
          style={{ background: 'var(--lf-blue)' }}
        >
          {loading ? 'Mengubah...' : 'Ubah Password'}
        </button>
      </div>
    </form>
  )
}
