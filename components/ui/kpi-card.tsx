import { cn } from '@/lib/utils'

type KpiCardProps = {
  label: string
  value: string | number
  unit?: string
  className?: string
}

export function KpiCard({ label, value, unit, className }: KpiCardProps) {
  return (
    <div className={cn('bg-white rounded-2xl p-4 shadow-lf-sm border border-[var(--lf-border)]', className)}>
      <p className="text-[10px] font-medium text-[var(--lf-text-soft)] uppercase tracking-[0.8px]">{label}</p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-[var(--lf-text-dark)]">{value}</span>
        {unit && <span className="text-xs text-[var(--lf-text-mid)]">{unit}</span>}
      </div>
    </div>
  )
}
