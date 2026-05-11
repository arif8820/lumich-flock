import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { hasPermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { findSalesOrderById, findSalesOrderItems } from '@/lib/db/queries/sales-order.queries'
import { CreateReturnClient } from '@/components/forms/create-return-client'

export default async function CreateReturnPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session || !hasPermission(session, PERMISSIONS.SALES.APPROVE)) redirect('/dashboard')

  const { id } = await params
  const so = await findSalesOrderById(session.farmSchema, id)
  if (!so || so.status !== 'fulfilled') redirect(`/penjualan/${id}`)

  const soItems = await findSalesOrderItems(session.farmSchema, id)

  return <CreateReturnClient orderId={id} soItems={soItems} />
}
