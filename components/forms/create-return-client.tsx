// client: needs useState for form state
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSalesReturnAction } from '@/lib/actions/sales-return.actions'
import { Button } from '@/components/ui/button'
import { ReturnItemRow } from '@/components/ui/return-item-row'
import type { SalesOrderItem } from '@/lib/db/schema'

type ReturnItem = {
  itemType: 'egg_grade_a' | 'egg_grade_b' | 'flock' | 'other'
  itemRefId?: string
  quantity: number
  unit: 'butir' | 'ekor' | 'unit'
}

type ReturnInput = {
  returnDate: string
  reasonType: 'wrong_grade' | 'damaged' | 'quantity_error' | 'other'
  notes?: string
  items: ReturnItem[]
}

const itemTypeLabels: Record<string, string> = {
  egg_grade_a: 'Telur Grade A',
  egg_grade_b: 'Telur Grade B',
  flock: 'Ayam',
  other: 'Lainnya',
}

interface Props {
  orderId: string
  soItems: SalesOrderItem[]
}

export function CreateReturnClient({ orderId, soItems }: Props) {
  const router = useRouter()
  const [returnInput, setReturnInput] = useState<ReturnInput>({
    returnDate: new Date().toISOString().split('T')[0]!,
    reasonType: 'damaged',
    items: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addItem = (originalItem: SalesOrderItem) => {
    setReturnInput({
      ...returnInput,
      items: [
        ...returnInput.items,
        {
          itemType: originalItem.itemType,
          itemRefId: originalItem.itemRefId ?? undefined,
          quantity: 0,
          unit: originalItem.unit,
        },
      ],
    })
  }

  const updateItem = (index: number, field: keyof ReturnItem, value: unknown) => {
    const newItems = [...returnInput.items]
    newItems[index] = { ...newItems[index]!, [field]: value } as ReturnItem
    setReturnInput({ ...returnInput, items: newItems })
  }

  const removeItem = (index: number) => {
    setReturnInput({
      ...returnInput,
      items: returnInput.items.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('orderId', orderId)
    formData.append('returnDate', returnInput.returnDate)
    formData.append('reasonType', returnInput.reasonType)
    formData.append('notes', returnInput.notes || '')
    formData.append('items', JSON.stringify(returnInput.items))

    const result = await createSalesReturnAction(formData)

    if (result.success) {
      router.push(`/penjualan/return/${result.data.id}`)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
        Buat Sales Return
      </h1>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Return</label>
            <input
              type="date"
              value={returnInput.returnDate}
              onChange={(e) => setReturnInput({ ...returnInput, returnDate: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Alasan</label>
            <select
              value={returnInput.reasonType}
              onChange={(e) =>
                setReturnInput({
                  ...returnInput,
                  reasonType: e.target.value as ReturnInput['reasonType'],
                })
              }
              className="w-full px-3 py-2 border rounded"
            >
              <option value="wrong_grade">Salah Grade</option>
              <option value="damaged">Rusak</option>
              <option value="quantity_error">Salah Jumlah</option>
              <option value="other">Lainnya</option>
            </select>
          </div>
        </div>

        {/* Available SO items to add to return */}
        <div>
          <h2 className="text-[16px] font-semibold mb-2">Item dari SO Asli</h2>
          <div className="flex flex-wrap gap-2">
            {soItems.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => addItem(item)}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
              >
                + {itemTypeLabels[item.itemType] ?? item.itemType} ({item.quantity} {item.unit})
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-[16px] font-semibold mb-2">Item Return</h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah Return</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {returnInput.items.map((item, index) => (
                  <ReturnItemRow
                    key={index}
                    item={{ id: '', returnId: '', ...item, itemRefId: item.itemRefId ?? null }}
                    index={index}
                    onRemove={removeItem}
                    onQuantityChange={(idx, qty) => updateItem(idx, 'quantity', qty)}
                  />
                ))}
                {returnInput.items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      Belum ada item. Pilih item dari SO asli di atas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Catatan{returnInput.reasonType === 'other' ? ' (Wajib)' : ''}
          </label>
          <textarea
            value={returnInput.notes || ''}
            onChange={(e) => setReturnInput({ ...returnInput, notes: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            rows={3}
            required={returnInput.reasonType === 'other'}
          />
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" href="/penjualan">
            Batal
          </Button>
          <Button type="submit" disabled={loading || returnInput.items.length === 0} loading={loading}>
            Simpan Return
          </Button>
        </div>
      </form>
    </div>
  )
}
