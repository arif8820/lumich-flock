'use client'
// client: needs onClick and onChange for URL navigation

import { useRouter, usePathname } from 'next/navigation'

interface Props {
  flocks: { id: string; name: string }[]
  selectedFlockId?: string
  selectedDays?: number
}

const PERIOD_OPTIONS = [
  { label: 'H-1', days: 1 },
  { label: '7H', days: 7 },
  { label: '14H', days: 14 },
  { label: '21H', days: 21 },
]

export default function FlockOnlyFilter({ flocks, selectedFlockId, selectedDays }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  function navigate(flockId: string, days: number) {
    const params = new URLSearchParams()
    if (flockId) params.set('flockId', flockId)
    params.set('days', String(days))
    router.push(`${pathname}?${params.toString()}`)
  }

  function handleFlockChange(e: React.ChangeEvent<HTMLSelectElement>) {
    navigate(e.target.value, selectedDays ?? 7)
  }

  function handleDaysClick(days: number) {
    navigate(selectedFlockId ?? '', days)
  }

  const activeDays = selectedDays ?? 7

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <select
        value={selectedFlockId ?? ''}
        onChange={handleFlockChange}
        className="text-sm px-3 py-2 rounded-lg border border-[var(--lf-border)] bg-white text-[var(--lf-text-dark)] focus:outline-none"
      >
        <option value="">Semua Batch</option>
        {flocks.map(f => (
          <option key={f.id} value={f.id}>{f.name}</option>
        ))}
      </select>

      <div className="flex gap-1">
        {PERIOD_OPTIONS.map(({ label, days }) => {
          const isActive = activeDays === days
          return (
            <button
              key={days}
              onClick={() => handleDaysClick(days)}
              className="text-sm px-3 py-2 rounded-lg border"
              style={
                isActive
                  ? { backgroundColor: 'var(--lf-blue)', color: '#fff', borderColor: 'var(--lf-blue)' }
                  : { backgroundColor: '#fff', color: 'var(--lf-text-mid)', borderColor: 'var(--lf-border)' }
              }
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
