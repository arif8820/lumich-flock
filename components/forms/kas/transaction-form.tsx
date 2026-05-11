'use client'
// client: needs form state and submission feedback

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { createTransactionAction } from '@/lib/actions/cash.actions'
import type { CashAccount } from '@/lib/db/schema/cash-account'
import type { CashCategory } from '@/lib/db/schema/cash-category'

type Props = {
  accounts: CashAccount[]
  categories: CashCategory[]
  defaultAccountId?: string
  defaultType?: 'in' | 'out'
}

type State = { success: boolean; error?: string } | null

const INITIAL: State = null

export function TransactionForm({ accounts, categories, defaultAccountId, defaultType = 'in' }: Props) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev: State, fd: FormData) => {
      const result = await createTransactionAction(fd)
      return result
    },
    INITIAL
  )

  useEffect(() => {
    if (state?.success) {
      router.back()
    }
  }, [state, router])

  const [clientError, setClientError] = useState<string | null>(null)
  const [txType, setTxType] = useState<'in' | 'out'>(defaultType)

  const todayStr = new Date().toISOString().split('T')[0]!
  const tomorrowStr = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]! })()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget
    const amountEl = form.elements.namedItem('amount') as HTMLInputElement | null
    const dateEl = form.elements.namedItem('transactionDate') as HTMLInputElement | null
    const accountEl = form.elements.namedItem('accountId') as HTMLSelectElement | null

    if (accountEl && !accountEl.value) {
      e.preventDefault()
      setClientError('Akun wajib dipilih')
      return
    }
    if (amountEl) {
      const val = Number(amountEl.value)
      if (!amountEl.value || val <= 0) {
        e.preventDefault()
        setClientError('Jumlah harus lebih dari 0')
        return
      }
    }
    if (dateEl && dateEl.value > tomorrowStr) {
      e.preventDefault()
      setClientError('Tanggal tidak boleh lebih dari H+1')
      return
    }
    setClientError(null)
  }

  const displayError = clientError ?? (state && !state.success ? state.error : null)

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className="space-y-4">
      {displayError && (
        <div className="rounded-lg px-3 py-2 text-[13px]" style={{ background: '#fdf0f0', color: '#c0504d' }}>
          {displayError}
        </div>
      )}

      {/* Type */}
      <div>
        <label className="block text-[12px] font-medium mb-1.5" style={{ color: '#5a6b5b' }}>Jenis Transaksi</label>
        <input type="hidden" name="type" value={txType} />
        <div className="flex gap-2">
          {(['in', 'out'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTxType(t)}
              className="flex-1 text-center text-[13px] py-2 rounded-lg border transition-colors"
              style={
                txType === t
                  ? { borderColor: '#5090be', background: '#eaf2fb', color: '#5090be', fontWeight: 600 }
                  : { borderColor: '#e0e8df', background: 'white', color: '#5a6b5b' }
              }
            >
              {t === 'in' ? '⬆ Pemasukan' : '⬇ Pengeluaran'}
            </button>
          ))}
        </div>
      </div>

      {/* Account */}
      <div>
        <label htmlFor="tx-accountId" className="block text-[12px] font-medium mb-1.5" style={{ color: '#5a6b5b' }}>Akun</label>
        <select
          id="tx-accountId"
          name="accountId"
          defaultValue={defaultAccountId ?? ''}
          required
          className="w-full px-3 py-2 rounded-[10px] border text-[13px] outline-none focus:ring-2 focus:ring-[#7aadd4]"
          style={{ borderColor: '#e0e8df', color: '#2d3a2e' }}
        >
          <option value="">Pilih akun...</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>{acc.name}</option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="tx-amount" className="block text-[12px] font-medium mb-1.5" style={{ color: '#5a6b5b' }}>Jumlah (Rp)</label>
        <input
          id="tx-amount"
          name="amount"
          type="number"
          min="1"
          step="1"
          required
          placeholder="0"
          className="w-full px-3 py-2 rounded-[10px] border text-[13px] outline-none focus:ring-2 focus:ring-[#7aadd4]"
          style={{ borderColor: '#e0e8df', color: '#2d3a2e' }}
        />
      </div>

      {/* Date */}
      <div>
        <label htmlFor="tx-date" className="block text-[12px] font-medium mb-1.5" style={{ color: '#5a6b5b' }}>Tanggal</label>
        <input
          id="tx-date"
          name="transactionDate"
          type="date"
          defaultValue={todayStr}
          max={tomorrowStr}
          required
          className="w-full px-3 py-2 rounded-[10px] border text-[13px] outline-none focus:ring-2 focus:ring-[#7aadd4]"
          style={{ borderColor: '#e0e8df', color: '#2d3a2e' }}
        />
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <div>
          <label htmlFor="tx-category" className="block text-[12px] font-medium mb-1.5" style={{ color: '#5a6b5b' }}>
            Kategori <span style={{ color: '#b0bab0' }}>(opsional)</span>
          </label>
          <select
            id="tx-category"
            name="categoryId"
            className="w-full px-3 py-2 rounded-[10px] border text-[13px] outline-none focus:ring-2 focus:ring-[#7aadd4]"
            style={{ borderColor: '#e0e8df', color: '#2d3a2e' }}
          >
            <option value="">Tanpa kategori</option>
            {categories
              .filter((cat) => cat.type === txType || cat.type === 'both')
              .map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
          </select>
        </div>
      )}

      {/* Reference */}
      <div>
        <label htmlFor="tx-ref" className="block text-[12px] font-medium mb-1.5" style={{ color: '#5a6b5b' }}>
          No. Referensi <span style={{ color: '#b0bab0' }}>(opsional)</span>
        </label>
        <input
          id="tx-ref"
          name="referenceNumber"
          type="text"
          maxLength={200}
          placeholder="Contoh: INV-001"
          className="w-full px-3 py-2 rounded-[10px] border text-[13px] outline-none focus:ring-2 focus:ring-[#7aadd4]"
          style={{ borderColor: '#e0e8df', color: '#2d3a2e' }}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="tx-desc" className="block text-[12px] font-medium mb-1.5" style={{ color: '#5a6b5b' }}>
          Keterangan <span style={{ color: '#b0bab0' }}>(opsional)</span>
        </label>
        <textarea
          id="tx-desc"
          name="description"
          maxLength={500}
          rows={2}
          placeholder="Catatan transaksi..."
          className="w-full px-3 py-2 rounded-[10px] border text-[13px] outline-none focus:ring-2 focus:ring-[#7aadd4] resize-none"
          style={{ borderColor: '#e0e8df', color: '#2d3a2e' }}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-2.5 rounded-[10px] border text-[13px] font-medium"
          style={{ borderColor: '#e0e8df', color: '#5a6b5b' }}
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold text-white"
          style={{ background: pending ? '#b0bab0' : 'linear-gradient(135deg, #7aadd4, #5090be)' }}
        >
          {pending ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  )
}
