// client: needs form state, submit handler, and eye toggle
'use client'

import { useMemo, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Eye, EyeOff } from 'lucide-react'

const inputStyle: React.CSSProperties = {
  border: '1.5px solid #e0e8df',
  borderRadius: '10px',
  background: '#fafaf9',
  fontSize: '14px',
  padding: '12px 14px',
  width: '100%',
  outline: 'none',
  color: '#2d3a2e',
  transition: 'border-color 0.2s',
}

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = useMemo(
    () => createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ),
    []
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('Email atau password salah')
        return
      }
      window.location.href = '/dashboard'
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div className="space-y-1.5">
        <label className="block text-[13px] font-medium" style={{ color: '#5a6b5b' }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="nama@contoh.com"
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#7aadd4' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#e0e8df' }}
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="block text-[13px] font-medium" style={{ color: '#5a6b5b' }}>
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{ ...inputStyle, paddingRight: '42px' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#7aadd4' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e0e8df' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: '#8fa08f' }}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
          </button>
        </div>
      </div>

      {/* Forgot password */}
      <div className="text-right">
        <span className="text-[12px] font-medium" style={{ color: '#7aadd4', cursor: 'pointer' }}>
          Lupa password?
        </span>
      </div>

      {/* Error */}
      {error && (
        <div
          className="text-[12px] rounded-lg px-3 py-2"
          style={{ background: '#fdeeed', color: '#e07a6a' }}
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-[13px] rounded-[10px] text-[14px] font-semibold text-white transition-all"
        style={loading
          ? { background: '#bbd5ee', cursor: 'default' }
          : { background: 'linear-gradient(135deg, #7aadd4, #5090be)', boxShadow: '0 4px 12px rgba(122,173,212,0.35)' }
        }
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white inline-block"
              style={{ animation: 'spin 0.8s linear infinite' }}
            />
            Masuk...
          </span>
        ) : 'Masuk'}
      </button>
    </form>
  )
}
