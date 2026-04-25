import { getSession } from '@/lib/auth/get-session'
import { getAgingData } from '@/lib/services/invoice.service'

export async function GET(): Promise<Response> {
  const session = await getSession()

  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (session.role !== 'admin' && session.role !== 'supervisor') {
    return new Response('Forbidden', { status: 403 })
  }

  const rows = await getAgingData()

  const header = [
    'invoiceNumber',
    'customerName',
    'issueDate',
    'dueDate',
    'totalAmount',
    'paidAmount',
    'outstanding',
    'daysOverdue',
    'bucket',
  ].join(',')

  const dataRows = rows.map((row) => {
    const issueDate = new Date(row.issueDate).toLocaleDateString('id-ID')
    const dueDate = new Date(row.dueDate).toLocaleDateString('id-ID')
    return [
      `"${row.invoiceNumber}"`,
      `"${row.customerName.replace(/"/g, '""')}"`,
      `"${issueDate}"`,
      `"${dueDate}"`,
      row.totalAmount,
      row.paidAmount,
      row.outstanding,
      row.daysOverdue,
      `"${row.bucket}"`,
    ].join(',')
  })

  const csv = [header, ...dataRows].join('\r\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="aging-report.csv"',
    },
  })
}
