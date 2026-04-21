import { LoginForm } from '@/components/forms/login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">Lumich Flock</h1>
        <p className="text-slate-500 text-sm">Masuk ke akun Anda</p>
      </div>
      {params.error === 'akun-nonaktif' && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
          Akun Anda telah dinonaktifkan. Hubungi administrator.
        </div>
      )}
      <LoginForm />
    </div>
  )
}
