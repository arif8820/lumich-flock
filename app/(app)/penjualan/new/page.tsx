'use client' // client: needs useState, useEffect for sessionStorage

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAllCustomers } from '@/lib/services/customer.service'
import { createDraftSOAction } from '@/lib/actions/sales-order.actions'
import { Button } from '@/components/ui/button'
import { SOItemRow } from '@/components/ui/so-item-row'
import { SOSummaryFooter } from '@/components/ui/so-summary-footer'

type SalesOrderItem = {
  itemType: 'egg_grade_a' | 'egg_grade_b' | 'flock' | 'other'
  itemRefId?: string
  description?: string
  quantity: number
  unit: 'butir' | 'ekor' | 'unit'
  pricePerUnit: number
  discountPct: number
}

type DraftSO = {
  customerId?: string
  orderDate: string
  paymentMethod: 'cash' | 'credit'
  taxPct: number
  notes?: string
  overrideReason?: string
  items: SalesOrderItem[]
}

export default function CreateSOPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<any[]>([])
  const [draft, setDraft] = useState<DraftSO>({
    orderDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    taxPct: 0,
    items: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [restored, setRestored] = useState(false)

  useEffect(() => {
    // Load customers
    getAllCustomers().then(setCustomers)

    // Restore from sessionStorage
    const saved = sessionStorage.getItem('so_draft')
    if (saved) {
      try {
        const restoredDraft = JSON.parse(saved)
        setDraft(restoredDraft)
        setRestored(true)
      } catch {
        // Ignore invalid storage
      }
    }
  }, [])

  const addItem = () => {
    setDraft({
      ...draft,
      items: [
        ...draft.items,
        {
          itemType: 'egg_grade_a',
          quantity: 0,
          unit: 'butir',
          pricePerUnit: 0,
          discountPct: 0,
        },
      ],
    })
  }

  const updateItem = (index: number, field: keyof SalesOrderItem, value: any) => {
    const newItems = [...draft.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setDraft({ ...draft, items: newItems })
  }

  const removeItem = (index: number) => {
    setDraft({
      ...draft,
      items: draft.items.filter((_, i) => i !== index),
    })
  }

  const subtotal = draft.items.reduce(
    (sum, item) =>
      sum + item.quantity * item.pricePerUnit * (1 - item.discountPct / 100),
    0
  )
  const taxAmount = subtotal * (draft.taxPct / 100)
  const totalAmount = subtotal + taxAmount

  // Save draft to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('so_draft', JSON.stringify(draft))
  }, [draft])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('customerId', draft.customerId || '')
    formData.append('orderDate', draft.orderDate)
    formData.append('paymentMethod', draft.paymentMethod)
    formData.append('taxPct', draft.taxPct.toString())
    formData.append('notes', draft.notes || '')
    if (draft.overrideReason) {
      formData.append('overrideReason', draft.overrideReason)
    }
    formData.append('items', JSON.stringify(draft.items))

    const result = await createDraftSOAction(formData)

    if (result.success) {
      sessionStorage.removeItem('so_draft')
      router.push(`/penjualan/${result.data.id}`)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const customer = customers.find((c) => c.id === draft.customerId)

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
        Buat Sales Order Baru
      </h1>

      {restored && (
        <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg" role="alert">
          Draft SO telah dipulih dari sesi sebelumnya.
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg" role="alert">
          {error}
        </div>
      )}

      {customer?.status === 'blocked' && (
        <div className="bg-yellow-50 text-yellow-700 px-4 py-3 rounded-lg" role="alert">
          Pelanggan ini diblokir. {draft.overrideReason && 'Override reason diberikan.'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Pelanggan</label>
            <select
              value={draft.customerId || ''}
              onChange={(e) => setDraft({ ...draft, customerId: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">Pilih pelanggan</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tanggal</label>
            <input
              type="date"
              value={draft.orderDate}
              onChange={(e) => setDraft({ ...draft, orderDate: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Metode Pembayaran</label>
            <select
              value={draft.paymentMethod}
              onChange={(e) => setDraft({ ...draft, paymentMethod: e.target.value as 'cash' | 'credit' })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="cash">Tunai</option>
              <option value="credit">Kredit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">PPN (%)</label>
            <input
              type="number"
              value={draft.taxPct}
              min={0}
              max={100}
              onChange={(e) => setDraft({ ...draft, taxPct: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>

        {/* Items */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-[16px] font-semibold">Item</h2>
            <Button type="button" onClick={addItem} size="sm">
              + Tambah Item
            </Button>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diskon</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {draft.items.map((item, index) => (
                  <SOItemRow
                    key={index}
                    item={item}
                    index={index}
                    onRemove={removeItem}
                    onQuantityChange={(idx, qty) => updateItem(idx, 'quantity', qty)}
                    onPriceChange={(idx, price) => updateItem(idx, 'pricePerUnit', price)}
                    onDiscountChange={(idx, disc) => updateItem(idx, 'discountPct', disc)}
                  />
                ))}
              </tbody>
              <SOSummaryFooter
                subtotal={subtotal}
                taxPct={draft.taxPct}
                taxAmount={taxAmount}
                totalAmount={totalAmount}
              />
            </table>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">Catatan</label>
          <textarea
            value={draft.notes || ''}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            rows={3}
          />
        </div>

        {/* Override Reason (admin only, shown when customer blocked) */}
        {customer?.status === 'blocked' && (
          <div>
            <label className="block text-sm font-medium mb-1">Alasan Override (Admin Only)</label>
            <textarea
              value={draft.overrideReason || ''}
              onChange={(e) => setDraft({ ...draft, overrideReason: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={2}
            />
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-2">
          <Button type="button" variant="outline" href="/penjualan">
            Batal
          </Button>
          <Button type="submit" disabled={loading || draft.items.length === 0} loading={loading}>
            Simpan Draft
          </Button>
        </div>
      </form>
    </div>
  )
}
