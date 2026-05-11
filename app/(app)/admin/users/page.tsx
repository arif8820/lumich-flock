import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAllUsers, getAllRoles } from '@/lib/services/user.service'
import { UserManagementClient } from '@/components/forms/user-management-client'

export default async function UsersPage() {
  const session = await getSession()
  if (!session || !session.isAdmin) redirect('/dashboard')
  const [users, roles] = await Promise.all([
    getAllUsers(session.farmSchema),
    getAllRoles(session.farmSchema),
  ])

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
        Manajemen User
      </h1>
      <UserManagementClient users={users} roles={roles} />
    </div>
  )
}
