import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { getCategoriesWithActiveItems } from '@/lib/services/stock-catalog.service'
import { createStockPurchaseAction } from '@/lib/actions/stock.actions'
import StockItemCascadeForm from '@/components/forms/stock-item-cascade-form'

export default async function BeliPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await getSession()
  if (!session || session.role === 'operator') redirect('/stok')

  // Exclude Telur — eggs enter via production input, not purchase
  const allCategories = await getCategoriesWithActiveItems()
  const categories = allCategories.filter((c) => c.name !== 'Telur')
  const { error } = await searchParams

  async function handleSubmit(formData: FormData) {
    'use server'
    const result = await createStockPurchaseAction(formData)
    if (result.success) redirect('/stok')
    else redirect(`/stok/beli?error=${encodeURIComponent(result.error ?? 'Terjadi kesalahan')}`)
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold text-[var(--lf-text-dark)] mb-6">Pembelian Stok</h1>
      {error && (
        <div className="mb-4 bg-[var(--lf-danger-bg)] rounded-lg px-4 py-3 text-sm" style={{ color: 'var(--lf-danger-text)' }}>{error}</div>
      )}
      <StockItemCascadeForm
        categories={categories}
        action={handleSubmit}
        extraFields={
          <>
            <div>
              <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Jumlah</label>
              <input
                type="number"
                name="quantity"
                min="1"
                className="mt-1 w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Tanggal</label>
              <input
                type="date"
                name="purchaseDate"
                defaultValue={new Date().toISOString().split('T')[0]}
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
        submitLabel="Simpan Pembelian"
      />
    </div>
  )
}
