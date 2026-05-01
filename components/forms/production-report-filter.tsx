'use client'
// client: needs onChange handlers for date inputs

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = {
  defaultFrom: string
  defaultTo: string
}

export function ProductionReportFilter({ defaultFrom, defaultTo }: Props) {
  const router = useRouter()
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(defaultTo)

  function handleFromChange(value: string) {
    setFrom(value)
    router.push(`/laporan/produksi?from=${value}&to=${to}`)
  }

  function handleToChange(value: string) {
    setTo(value)
    router.push(`/laporan/produksi?from=${from}&to=${value}`)
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium" style={{ color: 'var(--lf-text-mid)' }}>
          Dari
        </label>
        <input
          type="date"
          value={from}
          onChange={(e) => handleFromChange(e.target.value)}
          className="border rounded-[10px] px-3 py-1.5 text-sm"
          style={{ borderColor: 'var(--lf-border)', color: 'var(--lf-text-dark)' }}
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium" style={{ color: 'var(--lf-text-mid)' }}>
          Sampai
        </label>
        <input
          type="date"
          value={to}
          onChange={(e) => handleToChange(e.target.value)}
          className="border rounded-[10px] px-3 py-1.5 text-sm"
          style={{ borderColor: 'var(--lf-border)', color: 'var(--lf-text-dark)' }}
        />
      </div>
    </div>
  )
}
