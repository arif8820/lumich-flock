'use client'
// client: needs form state and submission feedback

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { createTransferAction } from '@/lib/actions/cash.actions'
import type { CashAccount } from '@/lib/db/schema/cash-account'

type Props = {
  accounts: CashAccount[]
  defaultFromId?: string
}

type State = { success: boolean; error?: string } | null

const INITIAL: State = null

export function TransferForm({ accounts, defaultFromId }: Props) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev: State, fd: FormData) => {
      const result = await createTransferAction(fd)
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

  const todayStr = new Date().toISOString().split('T')[0]!
  const tomorrowStr = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]! })()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget
    const amountEl = form.elements.namedItem('amount') as HTMLInputElement | null
    const dateEl = form.elements.namedItem('transactionDate') as HTMLInputElement | null

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

      {/* From account */}
      <div>
        <label htmlFor="tr-from" className="block text-[12px] font-medium mb-1.5" style={{ color: '#5a6b5b' }}>Dari Akun</label>
        <select
          id="tr-from"
          name="fromAccountId"
          defaultValue={defaultFromId ?? ''}
          required
          className="w-full px-3 py-2 rounded-[10px] border text-[13px] outline-none focus:ring-2 focus:ring-[#7aadd4]"
          style={{ borderColor: '#e0e8df', color: '#2d3a2e' }}
        >
          <option value="">Pilih akun asal...</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>{acc.name}</option>
          ))}
        </select>
      </div>

      {/* To account */}
      <div>
        <label htmlFor="tr-to" className="block text-[12px] font-medium mb-1.5" style={{ color: '#5a6b5b' }}>Ke Akun</label>
        <select
          id="tr-to"
          name="toAccountId"
          required
          className="w-full px-3 py-2 rounded-[10px] border text-[13px] outline-none focus:ring-2 focus:ring-[#7aadd4]"
          style={{ borderColor: '#e0e8df', color: '#2d3a2e' }}
        >
          <option value="">Pilih akun tujuan...</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>{acc.name}</option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="tr-amount" className="block text-[12px] font-medium mb-1.5" style={{ color: '#5a6b5b' }}>Jumlah (Rp)</label>
        <input
          id="tr-amount"
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
        <label htmlFor="tr-date" className="block text-[12px] font-medium mb-1.5" style={{ color: '#5a6b5b' }}>Tanggal</label>
        <input
          id="tr-date"
          name="transactionDate"
          type="date"
          defaultValue={todayStr}
          max={tomorrowStr}
          required
          className="w-full px-3 py-2 rounded-[10px] border text-[13px] outline-none focus:ring-2 focus:ring-[#7aadd4]"
          style={{ borderColor: '#e0e8df', color: '#2d3a2e' }}
        />
      </div>

      {/* Reference */}
      <div>
        <label htmlFor="tr-ref" className="block text-[12px] font-medium mb-1.5" style={{ color: '#5a6b5b' }}>
          No. Referensi <span style={{ color: '#b0bab0' }}>(opsional)</span>
        </label>
        <input
          id="tr-ref"
          name="referenceNumber"
          type="text"
          maxLength={200}
          placeholder="Contoh: TRF-001"
          className="w-full px-3 py-2 rounded-[10px] border text-[13px] outline-none focus:ring-2 focus:ring-[#7aadd4]"
          style={{ borderColor: '#e0e8df', color: '#2d3a2e' }}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="tr-desc" className="block text-[12px] font-medium mb-1.5" style={{ color: '#5a6b5b' }}>
          Keterangan <span style={{ color: '#b0bab0' }}>(opsional)</span>
        </label>
        <textarea
          id="tr-desc"
          name="description"
          maxLength={500}
          rows={2}
          placeholder="Catatan transfer..."
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
          {pending ? 'Memproses...' : 'Transfer'}
        </button>
      </div>
    </form>
  )
}
