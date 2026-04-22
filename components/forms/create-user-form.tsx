// client: form state, submit handler, eye toggle
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { createUserAction } from '@/lib/actions/user.actions'

const inputClass = 'mt-1 w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]'
const labelClass = 'block text-xs font-medium text-[var(--lf-text-mid)]'

interface Props {
  onSuccess: () => void
  onCancel: () => void
}

export function CreateUserForm({ onSuccess, onCancel }: Props) {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<'operator' | 'supervisor' | 'admin'>('operator')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const fd = new FormData()
      fd.set('fullName', fullName)
      fd.set('email', email)
      fd.set('password', password)
      fd.set('role', role)
      const result = await createUserAction(fd)
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
      <h3 className="text-sm font-semibold text-[var(--lf-text-dark)]">Tambah Pengguna Baru</h3>

      <div className="grid grid-cols-2 gap-3">
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
          <label className={labelClass}>Email</label>
          <input
            className={inputClass}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="email@contoh.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Password</label>
          <div className="relative">
            <input
              className={inputClass}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Min 8 karakter, ada kapital & angka"
              style={{ paddingRight: '2.5rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--lf-text-soft)]"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
            </button>
          </div>
        </div>
        <div>
          <label className={labelClass}>Role</label>
          <select
            className={inputClass}
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
            required
          >
            <option value="operator">Operator</option>
            <option value="supervisor">Supervisor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
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
