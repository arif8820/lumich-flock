import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAllCoops } from '@/lib/services/coop.service'
import { CoopManagementClient } from '@/components/forms/coop-management-client'

export default async function KandangPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/dashboard')
  const coops = await getAllCoops()

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
        Manajemen Kandang
      </h1>
      <CoopManagementClient coops={coops} />
    </div>
  )
}
