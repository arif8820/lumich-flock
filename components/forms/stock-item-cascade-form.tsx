'use client'
// client: needs onChange to cascade category→item dropdown

import { useState } from 'react'
import type { StockCategory, StockItem } from '@/lib/db/schema'

type Props = {
  categories: (StockCategory & { items?: StockItem[] })[]
  action: (formData: FormData) => Promise<void>
  extraFields?: React.ReactNode
  submitLabel: string
}

const inputClass = 'mt-1 w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]'

export default function StockItemCascadeForm({ categories, action, extraFields, submitLabel }: Props) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id ?? '')

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)
  const items = selectedCategory?.items ?? []

  return (
    <form action={action} className="bg-white rounded-xl p-5 shadow-lf-sm border border-[var(--lf-border)] space-y-4">
      <div>
        <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Kategori</label>
        <select
          className={inputClass}
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Item</label>
        <select name="stockItemId" className={inputClass} required>
          {items.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
          {items.length === 0 && <option value="">— tidak ada item aktif —</option>}
        </select>
      </div>
      {extraFields}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-[#7aadd4] to-[#5090be] text-white font-medium rounded-xl py-3 shadow-lf-btn"
      >
        {submitLabel}
      </button>
    </form>
  )
}
