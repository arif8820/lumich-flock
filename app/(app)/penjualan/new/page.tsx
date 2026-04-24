import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAllCustomers } from '@/lib/services/customer.service'
import { CreateSOClient } from '@/components/forms/create-so-client'

export default async function CreateSOPage() {
  const session = await getSession()
  if (!session || session.role === 'operator') redirect('/dashboard')

  const customers = await getAllCustomers()

  return <CreateSOClient customers={customers} role={session.role} />
}
