'use client'
// client: needs onChange for URL navigation and derived coop/flock state

import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

interface FlockOption {
  id: string
  name: string
  coopId: string
  coopName: string
}

interface Props {
  flocks: FlockOption[]
  selectedFlockId?: string
  selectedCoopId?: string
}

export default function FlockFilter({ flocks, selectedFlockId, selectedCoopId }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const coops = Array.from(
    new Map(flocks.map(f => [f.coopId, f.coopName])).entries()
  ).map(([id, name]) => ({ id, name }))

  const [coopId, setCoopId] = useState(selectedCoopId ?? '')
  const flocksBySelectedCoop = coopId ? flocks.filter(f => f.coopId === coopId) : flocks

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
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <select
        value={selectedFlockId ?? ''}
        onChange={handleFlockChange}
        className="text-sm px-3 py-2 rounded-lg border border-[var(--lf-border)] bg-white text-[var(--lf-text-dark)] focus:outline-none"
      >
        <option value="">Semua Flock</option>
        {flocksBySelectedCoop.map(f => (
          <option key={f.id} value={f.id}>{f.name}</option>
        ))}
      </select>
    </div>
  )
}
