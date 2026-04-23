import type { SalesOrderItem } from '@/lib/db/schema'

interface SOItemRowProps {
  item: SalesOrderItem
  index: number
  onRemove?: (index: number) => void
  onQuantityChange?: (index: number, quantity: number) => void
  onPriceChange?: (index: number, price: number) => void
  onDiscountChange?: (index: number, discount: number) => void
}

const itemTypeLabels: Record<SalesOrderItem['itemType'], string> = {
  egg_grade_a: 'Telur Grade A',
  egg_grade_b: 'Telur Grade B',
  flock: 'Flock',
  other: 'Lainnya',
}

const unitLabels: Record<SalesOrderItem['unit'], string> = {
  butir: 'butir',
  ekor: 'ekor',
  unit: 'unit',
}

export function SOItemRow({
  item,
  index,
  onRemove,
  onQuantityChange,
  onPriceChange,
  onDiscountChange,
}: SOItemRowProps) {
  const subtotal = Number(item.quantity) * Number(item.pricePerUnit) * (1 - Number(item.discountPct) / 100)

  return (
    <tr className="border-b border-gray-200">
      <td className="px-4 py-3 text-sm">{index + 1}</td>
      <td className="px-4 py-3 text-sm">{itemTypeLabels[item.itemType]}</td>
      {item.description && (
        <td className="px-4 py-3 text-sm">{item.description}</td>
      )}
      <td className="px-4 py-3 text-sm">
        <input
          type="number"
          value={item.quantity}
          min={1}
          className="w-24 px-2 py-1 border rounded"
          onChange={(e) => onQuantityChange?.(index, parseInt(e.target.value) || 0)}
        />
        <span className="ml-1">{unitLabels[item.unit]}</span>
      </td>
      <td className="px-4 py-3 text-sm">
        <input
          type="number"
          value={item.pricePerUnit}
          min={0}
          step={100}
          className="w-28 px-2 py-1 border rounded"
          onChange={(e) => onPriceChange?.(index, parseInt(e.target.value) || 0)}
        />
      </td>
      <td className="px-4 py-3 text-sm">
        <input
          type="number"
          value={item.discountPct}
          min={0}
          max={100}
          className="w-16 px-2 py-1 border rounded"
          onChange={(e) => onDiscountChange?.(index, parseInt(e.target.value) || 0)}
        />
        <span className="ml-1">%</span>
      </td>
      <td className="px-4 py-3 text-sm text-right">Rp {subtotal.toLocaleString('id-ID')}</td>
      {onRemove && (
        <tdtd className="px-4py-3 text-sm">
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700"
          >
            Hapus
          </button>
        </td>
      )}
    </tr>
  )
}
