import type { Invoice } from '@/lib/db/schema'

const statusColors: Record<Invoice['status'], string> = {
  draft: 'var(--lf-text-soft)',
  sent: 'var(--lf-blue)',
  partial: '#e67e22',
  paid: 'var(--lf-teal)',
  overdue: 'var(--lf-danger-text)',
  cancelled: 'var(--lf-text-soft)',
}

const statusLabels: Record<Invoice['status'], string> = {
  draft: 'Draft',
  sent: 'Terkirim',
  partial: 'Sebagian',
  paid: 'Lunas',
  overdue: 'Jatuh Tempo',
  cancelled: 'Dibatalkan',
}

export function InvoiceStatusBadge({ status }: { status: Invoice['status'] }) {
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
      style={{ color: statusColors[status], backgroundColor: `${statusColors[status]}20` }}
    >
      {statusLabels[status]}
    </span>
  )
}
