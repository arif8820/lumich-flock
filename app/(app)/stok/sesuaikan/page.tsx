import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { getCategoriesWithActiveItems } from '@/lib/services/stock-catalog.service'
import { createStockAdjustmentAction } from '@/lib/actions/stock.actions'
import StockItemCascadeForm from '@/components/forms/stock-item-cascade-form'

export default async function SesuaikanPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await getSession()
  if (!session || session.role === 'operator') redirect('/stok')

  const categories = await getCategoriesWithActiveItems(session.farmSchema)
  const { error } = await searchParams

  async function handleSubmit(formData: FormData) {
    'use server'
    const result = await createStockAdjustmentAction(formData)
    if (result.success) redirect('/stok')
    else redirect(`/stok/sesuaikan?error=${encodeURIComponent(result.error ?? 'Terjadi kesalahan')}`)
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold text-[var(--lf-text-dark)] mb-6">Penyesuaian Stok</h1>
      {error && (
        <div className="mb-4 bg-[var(--lf-danger-bg)] rounded-lg px-4 py-3 text-sm" style={{ color: 'var(--lf-danger-text)' }}>{error}</div>
      )}
      <StockItemCascadeForm
        categories={categories}
        action={handleSubmit}
        extraFields={
          <>
            <div>
              <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Tanggal</label>
              <input
                type="date"
                name="adjustmentDate"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="mt-1 w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Kuantitas (+/-)</label>
              <input
                type="number"
                name="quantity"
                placeholder="-50 atau 100"
                className="mt-1 w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Alasan</label>
              <input
                type="text"
                name="reason"
                className="mt-1 w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Catatan</label>
              <input
                type="text"
                name="notes"
                className="mt-1 w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]"
              />
            </div>
          </>
        }
        submitLabel="Simpan Penyesuaian"
      />
    </div>
  )
}
