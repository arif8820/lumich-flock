'use client'
// client: needs onChange handlers for date inputs and entity selector

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

type Entity = { id: string; label: string }

type Props = {
  defaultFrom: string
  defaultTo: string
  entityType?: 'coop' | 'flock' | 'customer' | 'stockItem'
  entities?: Entity[]
  entityParamName?: string // URL param name, default = entityType
}

export function LaporanFilter({
  defaultFrom,
  defaultTo,
  entityType,
  entities = [],
  entityParamName,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const from = searchParams.get('from') ?? defaultFrom
  const to = searchParams.get('to') ?? defaultTo
  const paramName = entityParamName ?? entityType ?? 'entity'
  const entityValue = searchParams.get(paramName) ?? ''

  function buildUrl(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v)
      else params.delete(k)
    }
    return `${pathname}?${params.toString()}`
  }

  const entityLabel: Record<string, string> = {
    coop: 'Kandang',
    flock: 'Flock',
    customer: 'Pelanggan',
    stockItem: 'Item Stok',
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium" style={{ color: 'var(--lf-text-mid)' }}>
          Dari
        </label>
        <input
          type="date"
          value={from}
          onChange={(e) => router.push(buildUrl({ from: e.target.value }))}
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
          onChange={(e) => router.push(buildUrl({ to: e.target.value }))}
          className="border rounded-[10px] px-3 py-1.5 text-sm"
          style={{ borderColor: 'var(--lf-border)', color: 'var(--lf-text-dark)' }}
        />
      </div>
      {entityType && entities.length > 0 && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium" style={{ color: 'var(--lf-text-mid)' }}>
            {entityLabel[entityType] ?? 'Filter'}
          </label>
          <select
            value={entityValue}
            onChange={(e) => router.push(buildUrl({ [paramName]: e.target.value }))}
            className="border rounded-[10px] px-3 py-1.5 text-sm"
            style={{ borderColor: 'var(--lf-border)', color: 'var(--lf-text-dark)' }}
          >
            <option value="">Semua</option>
            {entities.map((e) => (
              <option key={e.id} value={e.id}>{e.label}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
