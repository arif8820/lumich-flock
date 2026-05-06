import { cn } from '@/lib/utils'

type KpiTrend = {
  direction: 'up' | 'down' | 'neutral'
  label: string
}

type KpiCardProps = {
  label: string
  value: string | number
  unit?: string
  subText?: string
  trend?: KpiTrend
  icon?: React.ReactNode
  iconBg?: string
  className?: string
}

export function KpiCard({ label, value, unit, subText, trend, icon, iconBg, className }: KpiCardProps) {
  return (
    <div className={cn('bg-white rounded-2xl p-4 shadow-lf-sm border border-[var(--lf-border)]', className)}>
      {icon && (
        <div
          className="mb-2 inline-flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ backgroundColor: iconBg ?? 'var(--lf-blue-light)' }}
        >
          {icon}
        </div>
      )}
      <p className="text-[10px] font-medium text-[var(--lf-text-soft)] uppercase tracking-[0.8px]">{label}</p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-[var(--lf-text-dark)]">{value}</span>
        {unit && <span className="text-xs text-[var(--lf-text-mid)]">{unit}</span>}
      </div>
      {subText && (
        <p className="text-[10px] text-[var(--lf-text-soft)] mt-1">{subText}</p>
      )}
      {trend && (
        <p
          className="text-[10px] font-semibold mt-1"
          style={{
            color:
              trend.direction === 'up'
                ? '#5a8a5a'
                : trend.direction === 'down'
                ? '#b05050'
                : 'var(--lf-text-soft)',
          }}
        >
          {trend.direction === 'up' ? '▲' : trend.direction === 'down' ? '▼' : '—'}{' '}
          {trend.label}
        </p>
      )}
    </div>
  )
}
