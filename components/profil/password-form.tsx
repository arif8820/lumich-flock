// client: form state, submit handler, eye toggle, client-side confirm check
'use client'

import { useState } from 'react'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { gantiPasswordAction } from '@/lib/actions/profil.actions'

const labelClass = 'block text-xs font-medium text-[var(--lf-text-mid)]'

function inputClass(saved: boolean) {
  const base = 'mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2'
  return saved
    ? `${base} border-[#22c55e] focus:ring-[#22c55e]`
    : `${base} border-[var(--lf-border)] focus:ring-[var(--lf-blue)]`
}

function PasswordInput({
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
  saved,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggle: () => void
  placeholder?: string
  saved: boolean
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="relative">
        <input
          className={inputClass(saved)}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          placeholder={placeholder}
          style={{ paddingRight: '2.5rem' }}
        />
        {saved ? (
          <CheckCircle2
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: '#22c55e' }}
          />
        ) : (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--lf-text-soft)]"
            tabIndex={-1}
          >
            {show ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
          </button>
        )}
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
  const [saved, setSaved] = useState(false)

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
        setSaved(true)
        // brief green state before clearing
        setTimeout(() => {
          setCurrentPassword('')
          setNewPassword('')
          setConfirmPassword('')
          setShowCurrent(false)
          setShowNew(false)
          setShowConfirm(false)
          setSaved(false)
        }, 1500)
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
        saved={saved}
      />
      <PasswordInput
        label="Password Baru"
        value={newPassword}
        onChange={setNewPassword}
        show={showNew}
        onToggle={() => setShowNew(!showNew)}
        placeholder="Minimal 8 karakter"
        saved={saved}
      />
      <PasswordInput
        label="Konfirmasi Password Baru"
        value={confirmPassword}
        onChange={setConfirmPassword}
        show={showConfirm}
        onToggle={() => setShowConfirm(!showConfirm)}
        placeholder="Ulangi password baru"
        saved={saved}
      />

      {error && (
        <p className="text-xs px-3 py-2 rounded-lg bg-[var(--lf-danger-bg)] text-[var(--lf-danger-text)]">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || saved}
          className="px-5 py-2 text-sm rounded-lg text-white disabled:opacity-50"
          style={{ background: 'var(--lf-blue)' }}
        >
          {loading ? 'Mengubah...' : 'Ubah Password'}
        </button>
      </div>
    </form>
  )
}
