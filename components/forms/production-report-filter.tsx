'use client'
// client: needs onChange handlers for date inputs

import { useRouter, useSearchParams } from 'next/navigation'

type Props = {
  defaultFrom: string
  defaultTo: string
}

export function ProductionReportFilter({ defaultFrom, defaultTo }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const from = searchParams.get('from') ?? defaultFrom
  const to = searchParams.get('to') ?? defaultTo

  function handleFromChange(value: string) {
    router.push(`/laporan/produksi?from=${value}&to=${to}`)
  }

  function handleToChange(value: string) {
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
