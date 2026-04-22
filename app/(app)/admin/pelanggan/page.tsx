import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAllCustomers } from '@/lib/services/customer.service'
import { CustomerManagementClient } from '@/components/forms/customer-management-client'

export default async function PelangganPage() {
  const session = await getSession()
  if (!session || session.role === 'operator') redirect('/dashboard')
  const customers = await getAllCustomers()

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
        Manajemen Pelanggan
      </h1>
      <CustomerManagementClient customers={customers} />
    </div>
  )
}
