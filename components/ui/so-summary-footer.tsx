interface SOSummaryFooterProps {
  subtotal: number
  taxPct: number
  taxAmount: number
  totalAmount: number
}

export function SOSummaryFooter({
  subtotal,
  taxPct,
  taxAmount,
  totalAmount,
}: SOSummaryFooterProps) {
  return (
    <tfoot>
      <tr className="bg-gray-50">
        <td colSpan={7} className="px-4 py-3 text-right font-medium">
          Subtotal:
        </td>
        <td className="px-4 py-3 text-right font-medium">
          Rp {subtotal.toLocaleString('id-ID')}
        </td>
        <td />
      </tr>
      <tr className="bg-gray-50">
        <td colSpan={7} className="px-4 py-3 text-right font-medium">
          PPN ({taxPct}%):
        </td>
        <td className="px-4 py-3 text-right font-medium">
          Rp {taxAmount.toLocaleString('id-ID')}
        </td>
        <td />
      </tr>
      <tr className="bg-gray-100 font-bold">
        <td colSpan={7} className="px-4 py-3 text-right" style={{ color: 'var(--lf-teal)' }}>
          Total:
        </td>
        <td className="px-4 py-3 text-right" style={{ color: 'var(--lf-teal)' }}>
          Rp {totalAmount.toLocaleString('id-ID')}
        </td>
        <td />
      </tr>
    </tfoot>
  )
}
