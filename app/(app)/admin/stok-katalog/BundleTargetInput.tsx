'use client'
// client: needs onBlur handler for inline editing

import { useState } from 'react'
import { updateStockItemBundleTargetAction } from '@/lib/actions/stock-catalog.actions'

interface BundleTargetInputProps {
  itemId: string
  initialValue: string | null
}

export function BundleTargetInput({ itemId, initialValue }: BundleTargetInputProps) {
  const [value, setValue] = useState(initialValue ?? '')
  const [saving, setSaving] = useState(false)

  async function handleBlur() {
    const parsed = value.trim() === '' ? null : parseFloat(value)
    if (parsed !== null && (isNaN(parsed) || parsed <= 0)) return

    setSaving(true)
    await updateStockItemBundleTargetAction({
      farmSchema: '', // farmSchema resolved from session inside action
      itemId,
      targetKg: parsed,
    })
    setSaving(false)
  }

  return (
    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--lf-text-mid)' }}>
      <span>Target:</span>
      <input
        type="number"
        step="0.1"
        min="0.1"
        placeholder="kg"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        disabled={saving}
        className="w-16 border border-[var(--lf-border)] px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--lf-blue)] bg-[var(--lf-input-bg)] disabled:opacity-50"
        style={{ borderRadius: '10px' }}
      />
      <span>kg</span>
      {saving && <span style={{ color: 'var(--lf-text-soft)' }}>…</span>}
    </span>
  )
}
