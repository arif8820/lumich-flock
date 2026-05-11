import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getAllCustomers } from '@/lib/services/customer.service'
import { CreateSOClient } from '@/components/forms/create-so-client'

export default async function CreateSOPage() {
  const session = await getSession()
  if (!session || !hasPermission(session, PERMISSIONS.SALES.CREATE)) redirect('/dashboard')

  const customers = await getAllCustomers(session.farmSchema)

  return <CreateSOClient customers={customers} isAdmin={session.isAdmin} />
}
