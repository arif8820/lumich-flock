import { LoginForm } from '@/components/forms/login-form'
import { Bird } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="w-full max-w-[400px] space-y-6">
      {/* Logo block */}
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-16 h-16 rounded-[18px] flex items-center justify-center shadow-lf-logo"
          style={{ background: 'linear-gradient(135deg, #7aadd4, #5090be)' }}
        >
          <Bird size={32} color="white" strokeWidth={1.8} />
        </div>
        <div className="text-center">
          <h1
            className="text-[22px] font-bold"
            style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}
          >
            LumichFlock
          </h1>
          <p className="text-[13px] mt-1" style={{ color: '#8fa08f' }}>
            ERP Peternakan Ayam Petelur
          </p>
        </div>
      </div>

      {/* Login card */}
      <div
        className="bg-white rounded-[20px] px-7 pt-7 pb-8"
        style={{ boxShadow: '0 4px 24px rgba(45,58,46,0.10), 0 1px 4px rgba(45,58,46,0.06)' }}
      >
        <div className="mb-6">
          <h2 className="text-[18px] font-semibold" style={{ color: '#2d3a2e' }}>
            Selamat datang 👋
          </h2>
          <p className="text-[13px] mt-1" style={{ color: '#8fa08f' }}>
            Masuk ke akun Anda untuk melanjutkan
          </p>
        </div>

        {params.error === 'akun-nonaktif' && (
          <div
            className="mb-4 text-[12px] rounded-lg px-3 py-2"
            style={{ background: '#fdeeed', color: '#e07a6a' }}
          >
            Akun Anda telah dinonaktifkan. Hubungi administrator.
          </div>
        )}

        <LoginForm />
      </div>

      {/* Footer */}
      <p className="text-center text-[12px]" style={{ color: '#8fa08f' }}>
        © 2026 LumichFlock · v2.1.0
      </p>
    </div>
  )
}
