// client: needs add-delivery form state and retire action
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { retireFlockAction } from '@/lib/actions/flock.actions'
import { AddDeliveryForm } from '@/components/forms/add-delivery-form'
import type { Flock, FlockDelivery } from '@/lib/db/schema'

interface Props {
  flock: Flock
  deliveries: FlockDelivery[]
  coopName: string
  userRole: 'operator' | 'supervisor' | 'admin'
}

function formatDate(date: Date | string | null): string {
  if (!date) return '—'
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function FlockDetailClient({ flock, deliveries, coopName, userRole }: Props) {
  const router = useRouter()
  const [showAddForm, setShowAddForm] = useState(false)
  const [retireLoading, setRetireLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isRetired = flock.retiredAt !== null
  const totalCount = deliveries.reduce((sum, d) => sum + d.quantity, 0)

  async function handleRetire() {
    setError(null)
    setRetireLoading(true)
    try {
      const result = await retireFlockAction(flock.id)
      if (!result.success) {
        setError(result.error)
      } else {
        router.refresh()
      }
    } finally {
      setRetireLoading(false)
    }
  }

  function handleDeliverySuccess() {
    setShowAddForm(false)
    router.refresh()
  }

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="bg-white rounded-2xl shadow-lf-sm p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h2
              className="text-[16px] font-bold"
              style={{ color: '#2d3a2e' }}
            >
              {flock.name}
            </h2>
            <p className="text-sm text-[var(--lf-text-mid)] mt-0.5">{coopName}</p>
          </div>
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={
              isRetired
                ? { background: 'var(--lf-bg-warm)', color: 'var(--lf-text-soft)' }
                : { background: '#e6f4ea', color: '#2e7d32' }
            }
          >
            {isRetired ? 'Pensiun' : 'Aktif'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-[var(--lf-border)]">
          <div>
            <p className="text-xs text-[var(--lf-text-soft)]">DOC Date</p>
            <p className="text-sm font-medium text-[var(--lf-text-dark)] mt-0.5">
              {formatDate(flock.docDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--lf-text-soft)]">Total DOC</p>
            <p className="text-sm font-medium text-[var(--lf-text-dark)] mt-0.5">
              {totalCount.toLocaleString('id-ID')} ekor
            </p>
          </div>
          {flock.breed && (
            <div>
              <p className="text-xs text-[var(--lf-text-soft)]">Breed</p>
              <p className="text-sm font-medium text-[var(--lf-text-dark)] mt-0.5">{flock.breed}</p>
            </div>
          )}
        </div>
      </div>

      {/* Deliveries section */}
      <div className="bg-white rounded-2xl shadow-lf-sm p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--lf-text-dark)]">Kedatangan DOC</h3>

        <div className="overflow-x-auto rounded-xl border border-[var(--lf-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--lf-bg-warm)] text-left">
                <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Tgl Tiba</th>
                <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Jumlah</th>
                <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lf-border)]">
              {deliveries.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-[var(--lf-text-soft)]">
                    Belum ada data kedatangan
                  </td>
                </tr>
              )}
              {deliveries.map((d) => (
                <tr key={d.id} className="bg-white">
                  <td className="px-4 py-3 text-[var(--lf-text-dark)]">{formatDate(d.deliveryDate)}</td>
                  <td className="px-4 py-3 text-[var(--lf-text-mid)]">
                    {d.quantity.toLocaleString('id-ID')} ekor
                  </td>
                  <td className="px-4 py-3 text-[var(--lf-text-mid)]">{d.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
            {deliveries.length > 0 && (
              <tfoot>
                <tr className="bg-[var(--lf-bg-warm)] border-t border-[var(--lf-border)]">
                  <td className="px-4 py-3 font-medium text-[var(--lf-text-dark)]">Total</td>
                  <td className="px-4 py-3 font-semibold text-[var(--lf-text-dark)]">
                    {totalCount.toLocaleString('id-ID')} ekor
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Inline add delivery form */}
        {showAddForm && (
          <AddDeliveryForm
            flockId={flock.id}
            onSuccess={handleDeliverySuccess}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* Action buttons */}
        {error && (
          <p className="text-xs px-3 py-2 rounded-lg bg-[var(--lf-danger-bg)] text-[var(--lf-danger-text)]">
            {error}
          </p>
        )}

        <div className="flex gap-2 flex-wrap">
          {(userRole === 'supervisor' || userRole === 'admin') && !showAddForm && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              disabled={isRetired}
              className="px-4 py-2 text-sm rounded-lg text-white font-medium disabled:opacity-50"
              style={{ background: isRetired ? 'var(--lf-blue-light)' : 'var(--lf-blue)' }}
            >
              + Tambah Kedatangan
            </button>
          )}

          {userRole === 'admin' && (
            <button
              type="button"
              onClick={handleRetire}
              disabled={isRetired || retireLoading}
              className="px-4 py-2 text-sm rounded-lg border border-[var(--lf-border)] disabled:opacity-50"
              style={{ color: isRetired ? 'var(--lf-text-soft)' : 'var(--lf-danger-text)' }}
            >
              {retireLoading ? 'Memproses...' : isRetired ? 'Sudah Pensiun' : 'Pensiunkan Flock'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
