// USED BY: [sales-order.service, sales-return.service, invoice creation] — count: 3+
export function generateOrderNumber(
  prefix: 'SO' | 'RTN' | 'INV' | 'RCP' | 'CN',
  lastSeq: number
): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const seq = String(lastSeq + 1).padStart(4, '0')
  return `${prefix}-${year}${month}-${seq}`
}
