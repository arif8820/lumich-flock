import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { listRoles } from '@/lib/services/role.service'
import { RoleManagementClient } from './RoleManagementClient'

export default async function RolesPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!hasPermission(session, PERMISSIONS.ROLE.MANAGE)) redirect('/forbidden')

  const roles = await listRoles(session.farmSchema)

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
          Manajemen Role & Permission
        </h1>
        <p className="text-sm mt-1" style={{ color: '#8fa08f' }}>
          Atur role dan permission akses pengguna sistem
        </p>
      </div>
      <RoleManagementClient roles={roles} />
    </div>
  )
}
