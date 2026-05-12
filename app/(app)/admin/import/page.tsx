import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { findAllActiveFlocks } from '@/lib/db/queries/flock.queries'
import { ImportPanel } from './import-panel'

export default async function ImportPage() {
  const session = await getSession()
  if (!session || !session.isAdmin) redirect('/dashboard')

  const activeFlocks = await findAllActiveFlocks(session.farmSchema)

  return (
    <div className="p-6 space-y-6" style={{ maxWidth: 800 }}>
      <div>
        <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
          Import Data CSV
        </h1>
        <p className="text-sm mt-1" style={{ color: '#8fa08f' }}>
          Import massal data produksi harian atau pelanggan.
          Pratinjau ditampilkan sebelum data disimpan.
        </p>
      </div>
      <ImportPanel activeFlocks={activeFlocks} />
    </div>
  )
}
