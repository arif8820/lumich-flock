'use client'
// client: needs form state

import { useActionState } from 'react'
import { createCategoryAction } from '@/lib/actions/cash.actions'

type State = { success: boolean; error?: string } | null

export function CategoryForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev: State, fd: FormData) => {
      const result = await createCategoryAction(fd)
      return result
    },
    null
  )

  return (
    <form action={formAction} className="space-y-3">
      {state && !state.success && (
        <div className="rounded-lg px-3 py-2 text-[12px]" style={{ background: '#fdf0f0', color: '#c0504d' }}>
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-lg px-3 py-2 text-[12px]" style={{ background: '#e8f7f3', color: '#3da88a' }}>
          Kategori berhasil ditambahkan.
        </div>
      )}

      <input
        name="name"
        required
        placeholder="Nama kategori (contoh: Gaji)"
        className="w-full px-3 py-2 rounded-[10px] border text-[12px] outline-none focus:ring-2 focus:ring-[#7aadd4]"
        style={{ borderColor: '#e0e8df', color: '#2d3a2e' }}
      />

      <select
        name="type"
        required
        className="w-full px-3 py-2 rounded-[10px] border text-[12px] outline-none focus:ring-2 focus:ring-[#7aadd4]"
        style={{ borderColor: '#e0e8df', color: '#2d3a2e' }}
      >
        <option value="">Pilih tipe...</option>
        <option value="in">Pemasukan</option>
        <option value="out">Pengeluaran</option>
        <option value="both">Keduanya</option>
      </select>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2 rounded-[10px] text-[12px] font-semibold text-white"
        style={{ background: pending ? '#b0bab0' : 'linear-gradient(135deg, #7aadd4, #5090be)' }}
      >
        {pending ? 'Menyimpan...' : 'Tambah Kategori'}
      </button>
    </form>
  )
}
