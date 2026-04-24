import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { findSalesOrderById, findSalesOrderItems } from '@/lib/db/queries/sales-order.queries'
import { CreateReturnClient } from '@/components/forms/create-return-client'

export default async function CreateReturnPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session || session.role === 'operator') redirect('/dashboard')

  const { id } = await params
  const so = await findSalesOrderById(id)
  if (!so || so.status !== 'fulfilled') redirect(`/penjualan/${id}`)

  const soItems = await findSalesOrderItems(id)

  return <CreateReturnClient orderId={id} soItems={soItems} />
}
