import type { SalesReturnItem } from '@/lib/db/schema'

interface ReturnItemRowProps {
  item: SalesReturnItem
  index: number
  originalQuantity?: number
  onRemove?: (index: number) => void
  onQuantityChange?: (index: number, quantity: number) => void
}

const itemTypeLabels: Record<SalesReturnItem['itemType'], string> = {
  egg_grade_a: 'Telur Grade A',
  egg_grade_b: 'Telur Grade B',
  flock: 'Flock',
  other: 'Lainnya',
}

const unitLabels: Record<SalesReturnItem['unit'], string> = {
  butir: 'butir',
  ekor: 'ekor',
  unit: 'unit',
}

export function ReturnItemRow({
  item,
  index,
  originalQuantity,
  onRemove,
  onQuantityChange,
}: ReturnItemRowProps) {
  return (
    <tr className="border-b border-gray-200">
      <td className="px-4 py-3 text-sm">{index + 1}</td>
      <td className="px-4 py-3 text-sm">{itemTypeLabels[item.itemType]}</td>
      <td className="px-4 py-3 text-sm">
        <input
          type="number"
          value={item.quantity}
          min={1}
          max={originalQuantity}
          className="w-24 px-2 py-1 border rounded"
          onChange={(e) => onQuantityChange?.(index, parseInt(e.target.value) || 0)}
        />
        <span className="ml-1">{unitLabels[item.unit]}</span>
        {originalQuantity && (
          <span className="ml-2 text-gray-500">
            / max {originalQuantity}
          </span>
        )}
      </td>
      {onRemove && (
        <td className="px-4 py-3 text-sm">
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
