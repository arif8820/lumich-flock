'use client'
// client: needs onChange for URL navigation and derived coop/flock state

import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

interface FlockOption {
  id: string
  name: string
  coopId: string
  coopName: string
  isActive: boolean
  arrivalDate: string
}

interface Props {
  flocks: FlockOption[]
  selectedFlockId?: string
  selectedCoopId?: string
}

function sortFlocks(list: FlockOption[]) {
  return [...list].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
    return b.arrivalDate.localeCompare(a.arrivalDate)
  })
}

export default function FlockFilter({ flocks, selectedFlockId, selectedCoopId }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const coopMap = new Map<string, { name: string; hasActive: boolean }>()
  for (const f of flocks) {
    const existing = coopMap.get(f.coopId)
    coopMap.set(f.coopId, {
      name: f.coopName,
      hasActive: (existing?.hasActive ?? false) || f.isActive,
    })
  }
  const coops = [...coopMap.entries()]
    .map(([id, v]) => ({ id, name: v.name, hasActive: v.hasActive }))
    .sort((a, b) => (a.hasActive === b.hasActive ? 0 : a.hasActive ? -1 : 1))

  const [coopId, setCoopId] = useState(selectedCoopId ?? '')
  const flocksBySelectedCoop = sortFlocks(coopId ? flocks.filter(f => f.coopId === coopId) : flocks)

  function navigate(newCoopId: string, newFlockId: string) {
    const params = new URLSearchParams()
    if (newFlockId) params.set('flockId', newFlockId)
    else if (newCoopId) params.set('coopId', newCoopId)
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  function handleCoopChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    setCoopId(val)
    navigate(val, '')
  }

  function handleFlockChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    navigate(coopId, val)
  }

  return (
    <div className="flex gap-3 mb-4">
      <select
        value={coopId}
        onChange={handleCoopChange}
        className="text-sm px-3 py-2 rounded-lg border border-[var(--lf-border)] bg-white text-[var(--lf-text-dark)] focus:outline-none"
      >
        <option value="">Semua Kandang</option>
        {coops.map(c => (
          <option key={c.id} value={c.id}>
            {c.name}{c.hasActive ? '' : ' [Nonaktif]'}
          </option>
        ))}
      </select>

      <select
        value={selectedFlockId ?? ''}
        onChange={handleFlockChange}
        className="text-sm px-3 py-2 rounded-lg border border-[var(--lf-border)] bg-white text-[var(--lf-text-dark)] focus:outline-none"
      >
        <option value="">Semua Flock</option>
        {flocksBySelectedCoop.map(f => (
          <option key={f.id} value={f.id}>
            {f.name}{f.isActive ? '' : ' [Nonaktif]'}
          </option>
        ))}
      </select>
    </div>
  )
}
