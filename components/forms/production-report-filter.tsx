'use client'
// client: needs onChange handlers for date inputs

import { useRouter } from 'next/navigation'

type Props = {
  defaultFrom: string
  defaultTo: string
}

export function ProductionReportFilter({ defaultFrom, defaultTo }: Props) {
  const router = useRouter()

  function handleChange(from: string, to: string) {
    router.push(`/laporan/produksi?from=${from}&to=${to}`)
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium" style={{ color: 'var(--lf-text-mid)' }}>
          Dari
        </label>
        <input
          type="date"
          defaultValue={defaultFrom}
          onChange={(e) => handleChange(e.target.value, defaultTo)}
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
          defaultValue={defaultTo}
          onChange={(e) => handleChange(defaultFrom, e.target.value)}
          className="border rounded-[10px] px-3 py-1.5 text-sm"
          style={{ borderColor: 'var(--lf-border)', color: 'var(--lf-text-dark)' }}
        />
      </div>
    </div>
  )
}
