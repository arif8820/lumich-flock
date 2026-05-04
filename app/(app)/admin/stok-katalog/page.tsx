import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { getCategoriesWithActiveItems, getCategories } from '@/lib/services/stock-catalog.service'
import { findItemsByCategory } from '@/lib/db/queries/stock-catalog.queries'
import { createCategoryAction, createStockItemAction, toggleStockItemActiveAction } from '@/lib/actions/stock-catalog.actions'

export default async function StokKatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/dashboard')

  const categories = await getCategories()
  const categoriesWithAllItems = await Promise.all(
    categories.map(async (cat) => ({
      ...cat,
      items: await findItemsByCategory(cat.id),
    }))
  )

  const { error, success } = await searchParams

  const inputClass = 'mt-1 w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]'

  async function handleCreateCategory(formData: FormData) {
    'use server'
    const result = await createCategoryAction(formData)
    if (result.success) redirect('/admin/stok-katalog?success=Kategori+berhasil+dibuat')
    else redirect(`/admin/stok-katalog?error=${encodeURIComponent(result.error ?? 'Gagal')}`)
  }

  async function handleCreateItem(formData: FormData) {
    'use server'
    const result = await createStockItemAction(formData)
    if (result.success) redirect('/admin/stok-katalog?success=Item+berhasil+dibuat')
    else redirect(`/admin/stok-katalog?error=${encodeURIComponent(result.error ?? 'Gagal')}`)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <h1 className="text-xl font-semibold text-[var(--lf-text-dark)]">Katalog Stok</h1>

      {error && <div className="bg-[var(--lf-danger-bg)] rounded-lg px-4 py-3 text-sm" style={{ color: 'var(--lf-danger-text)' }}>{error}</div>}
      {success && <div className="bg-[var(--lf-teal-pale,#e6f7f5)] rounded-lg px-4 py-3 text-sm" style={{ color: 'var(--lf-teal)' }}>{success}</div>}

      {/* Category list */}
      <div className="space-y-4">
        {categoriesWithAllItems.map((cat) => (
          <div key={cat.id} className="bg-white rounded-xl shadow-lf-sm border border-[var(--lf-border)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--lf-border)] flex items-center justify-between bg-[var(--lf-surface)]">
              <div>
                <span className="font-medium text-[var(--lf-text-dark)]">{cat.name}</span>
                <span className="ml-2 text-xs text-[var(--lf-text-soft)]">({cat.unit})</span>
                {cat.isSystem && <span className="ml-2 text-xs bg-[var(--lf-badge-bg,#e8f0fe)] text-[var(--lf-blue)] px-1.5 py-0.5 rounded">sistem</span>}
              </div>
              <form action={handleCreateItem}>
                <input type="hidden" name="categoryId" value={cat.id} />
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    name="name"
                    placeholder="Nama item baru"
                    className="text-sm border border-[var(--lf-border)] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--lf-blue)]"
                    required
                  />
                  <button type="submit" className="text-xs px-3 py-1.5 bg-gradient-to-r from-[#7aadd4] to-[#5090be] text-white rounded-lg shadow-lf-btn">
                    + Tambah
                  </button>
                </div>
              </form>
            </div>
            <div className="divide-y divide-[var(--lf-border)]">
              {cat.items.length === 0 && (
                <p className="px-4 py-3 text-sm text-[var(--lf-text-soft)]">Belum ada item.</p>
              )}
              {cat.items.map((item) => {
                async function handleToggle() {
                  'use server'
                  await toggleStockItemActiveAction(item.id)
                  redirect('/admin/stok-katalog')
                }
                return (
                  <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${item.isActive ? 'text-[var(--lf-text-dark)]' : 'text-[var(--lf-text-soft)] line-through'}`}>
                        {item.name}
                      </span>
                      {!item.isActive && (
                        <span className="text-xs text-[var(--lf-text-soft)]">(nonaktif)</span>
                      )}
                    </div>
                    <form action={handleToggle}>
                      <button
                        type="submit"
                        className="text-xs px-2 py-1 border border-[var(--lf-border)] rounded-lg text-[var(--lf-text-mid)] hover:bg-[var(--lf-surface)]"
                      >
                        {item.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </form>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Add category */}
      <div>
        <p className="text-sm font-medium text-[var(--lf-text-dark)] mb-3">Tambah Kategori Baru</p>
        <form action={handleCreateCategory} className="bg-white rounded-xl p-4 shadow-lf-sm border border-[var(--lf-border)] flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Nama</label>
            <input type="text" name="name" className={inputClass} required />
          </div>
          <div className="w-32">
            <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Satuan</label>
            <input type="text" name="unit" placeholder="kg, pcs…" className={inputClass} required />
          </div>
          <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#7aadd4] to-[#5090be] text-white text-sm font-medium rounded-xl shadow-lf-btn">
            Buat
          </button>
        </form>
      </div>
    </div>
  )
}
