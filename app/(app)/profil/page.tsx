import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { ProfilTabs } from '@/components/profil/profil-tabs'

export default async function ProfilPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--lf-text-dark)' }}>
          Profil Saya
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--lf-text-soft)' }}>
          Kelola informasi akun dan keamanan
        </p>
      </div>
      <ProfilTabs
        defaultFullName={session.fullName}
        defaultPhone={session.phone}
      />
    </div>
  )
}
