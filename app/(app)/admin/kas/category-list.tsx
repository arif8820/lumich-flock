'use client'
// client: needs toggle state for inline edit

import { useState } from 'react'
import { updateCategoryAction } from '@/lib/actions/cash.actions'
import type { CashCategory } from '@/lib/db/schema/cash-category'

const TYPE_LABEL: Record<string, string> = { in: 'Pemasukan', out: 'Pengeluaran', both: 'Keduanya' }

export function CategoryList({ categories }: { categories: CashCategory[] }) {
  if (categories.length === 0) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-[12px]" style={{ color: '#8fa08f' }}>Belum ada kategori.</p>
      </div>
    )
  }

  return (
    <div className="divide-y" style={{ borderColor: '#f0f4f0' }}>
      {categories.map((cat) => (
        <CategoryRow key={cat.id} category={cat} />
      ))}
    </div>
  )
}

function CategoryRow({ category }: { category: CashCategory }) {
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(fd: FormData) {
    setPending(true)
    setError(null)
    fd.set('id', category.id)
    // checkbox unchecked = no value in FormData; normalize explicitly
    if (!fd.get('isActive')) fd.set('isActive', 'false')
    const result = await updateCategoryAction(fd)
    setPending(false)
    if (!result.success) {
      setError(result.error ?? 'Gagal menyimpan')
    } else {
      setEditing(false)
    }
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between px-4 py-2.5">
        <div>
          <p className="text-[13px] font-medium" style={{ color: '#2d3a2e' }}>{category.name}</p>
          <p className="text-[11px]" style={{ color: '#8fa08f' }}>{TYPE_LABEL[category.type] ?? category.type}</p>
        </div>
        <div className="flex items-center gap-2">
          {!category.isActive && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: '#f5f5f5', color: '#b0bab0' }}>Nonaktif</span>
          )}
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-[11px] px-2 py-1 rounded-lg border"
            style={{ borderColor: '#e0e8df', color: '#5a6b5b' }}
          >
            Ubah
          </button>
        </div>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="px-4 py-3 space-y-2">
      {error && (
        <p className="text-[11px]" style={{ color: '#c0504d' }}>{error}</p>
      )}
      <input
        name="name"
        defaultValue={category.name}
        required
        className="w-full px-2 py-1.5 rounded-lg border text-[12px] outline-none focus:ring-1 focus:ring-[#7aadd4]"
        style={{ borderColor: '#e0e8df' }}
      />
      <div className="flex gap-2">
        <select
          name="type"
          defaultValue={category.type}
          className="flex-1 px-2 py-1.5 rounded-lg border text-[12px] outline-none"
          style={{ borderColor: '#e0e8df' }}
        >
          <option value="in">Pemasukan</option>
          <option value="out">Pengeluaran</option>
          <option value="both">Keduanya</option>
        </select>
        <label className="flex items-center gap-1.5 text-[12px]" style={{ color: '#5a6b5b' }}>
          <input type="checkbox" name="isActive" value="true" defaultChecked={category.isActive} />
          Aktif
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="flex-1 py-1.5 rounded-lg border text-[12px]"
          style={{ borderColor: '#e0e8df', color: '#5a6b5b' }}
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 py-1.5 rounded-lg text-[12px] font-medium text-white"
          style={{ background: pending ? '#b0bab0' : '#5090be' }}
        >
          {pending ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  )
}
