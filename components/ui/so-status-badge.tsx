import type { SalesOrder } from '@/lib/db/schema'

const statusColors: Record<SalesOrder['status'], string> = {
  draft: 'var(--lf-text-soft)',
  confirmed: 'var(--lf-blue)',
  fulfilled: 'var(--lf-teal)',
  cancelled: 'var(--lf-danger-text)',
}

const statusLabels: Record<SalesOrder['status'], string> = {
  draft: 'Draft',
  confirmed: 'Dikonfirmasi',
  fulfilled: 'Dipenuhi',
  cancelled: 'Dibatalkan',
}

interface SOStatusBadgeProps {
  status: SalesOrder['status']
}

export function SOStatusBadge({ status }: SOStatusBadgeProps) {
  return (
    <span
      className="inline-flex items-center-center px-3 py-1 rounded-full text-sm font-medium"
      style={{ color: statusColors[status], backgroundColor: `${statusColors[status]}20` }}
    >
      {statusLabels[status]}
    </span>
  )
}
