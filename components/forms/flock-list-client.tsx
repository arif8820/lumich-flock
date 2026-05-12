// client: flock list with retire action
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { retireFlockAction } from '@/lib/actions/flock.actions'
import type { FlockWithMeta } from '@/lib/services/flock.service'

interface Props {
  flocks: FlockWithMeta[]
  canCreate: boolean
  canDelete: boolean
}

export function FlockListClient({ flocks, canCreate, canDelete }: Props) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleRetire(flockId: string) {
    setError(null)
    setLoadingId(flockId)
    try {
      const result = await retireFlockAction(flockId)
      if (!result.success) setError(result.error)
      else router.refresh()
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--lf-text-mid)]">{flocks.length} flock aktif</span>
        {canCreate && (
          <Link
            href="/flock/new"
            className="px-4 py-1.5 text-sm rounded-lg text-white font-medium"
            style={{ background: 'var(--lf-blue)' }}
          >
            + Tambah Flock
          </Link>
        )}
      </div>

      {error && (
        <p className="text-xs px-3 py-2 rounded-lg bg-[var(--lf-danger-bg)] text-[var(--lf-danger-text)]">
          {error}
        </p>
      )}

      {/* Mobile card list */}
      <div className="md:hidden space-y-2">
        {flocks.length === 0 && (
          <p className="text-center py-8 text-sm" style={{ color: 'var(--lf-text-soft)' }}>Belum ada flock aktif</p>
        )}
        {flocks.map((flock) => (
          <div
            key={flock.id}
            className="bg-white rounded-xl p-4 shadow-lf-sm border border-[var(--lf-border)] cursor-pointer"
            onClick={() => router.push(`/flock/${flock.id}`)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-sm font-semibold" style={{ color: 'var(--lf-text-dark)' }}>{flock.name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--lf-text-soft)' }}>{flock.coopName}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {flock.phase && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--lf-amber-light)', color: 'var(--lf-amber)' }}
                  >
                    {flock.phase.name}
                  </span>
                )}
                <Link
                  href={`/flock/${flock.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs px-3 py-2 rounded-lg min-h-[36px] flex items-center"
                  style={{ background: 'var(--lf-blue-pale)', color: 'var(--lf-blue-active)' }}
                >
                  Detail
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[var(--lf-bg-warm)] rounded-lg p-2 text-center">
                <p className="text-lg font-bold" style={{ color: 'var(--lf-text-dark)' }}>{flock.ageWeeks}</p>
                <p className="text-[10px] uppercase font-medium" style={{ color: 'var(--lf-text-soft)' }}>Minggu</p>
              </div>
              <div className="bg-[var(--lf-bg-warm)] rounded-lg p-2 text-center">
                <p className="text-lg font-bold" style={{ color: 'var(--lf-text-dark)' }}>
                  {flock.totalCount.toLocaleString('id-ID')}
                </p>
                <p className="text-[10px] uppercase font-medium" style={{ color: 'var(--lf-text-soft)' }}>DOC Total</p>
              </div>
            </div>
            {canDelete && flock.retiredAt == null && (
              <button
                onClick={(e) => { e.stopPropagation(); handleRetire(flock.id) }}
                disabled={loadingId === flock.id}
                className="mt-3 w-full text-xs py-2.5 rounded-lg border min-h-[40px] disabled:opacity-50"
                style={{ borderColor: 'var(--lf-border)', color: 'var(--lf-danger-text)' }}
              >
                {loadingId === flock.id ? '...' : 'Pensiunkan'}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto rounded-xl border border-[var(--lf-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--lf-bg-warm)] text-left">
              <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Nama Flock</th>
              <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Kandang</th>
              <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Umur</th>
              <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Fase</th>
              <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Total DOC</th>
              {canDelete && (
                <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Aksi</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--lf-border)]">
            {flocks.length === 0 && (
              <tr>
                <td colSpan={canDelete ? 6 : 5} className="px-4 py-8 text-center text-[var(--lf-text-soft)]">
                  Belum ada flock aktif
                </td>
              </tr>
            )}
            {flocks.map((flock) => (
              <tr
                key={flock.id}
                className="bg-white hover:bg-[var(--lf-bg)] cursor-pointer"
                onClick={() => router.push(`/flock/${flock.id}`)}
              >
                <td className="px-4 py-3 text-[var(--lf-text-dark)] font-medium">{flock.name}</td>
                <td className="px-4 py-3 text-[var(--lf-text-mid)]">{flock.coopName}</td>
                <td className="px-4 py-3 text-[var(--lf-text-mid)]">{flock.ageWeeks} minggu</td>
                <td className="px-4 py-3 text-[var(--lf-text-mid)]">{flock.phase?.name ?? '—'}</td>
                <td className="px-4 py-3 text-[var(--lf-text-mid)]">
                  {flock.totalCount.toLocaleString('id-ID')} ekor
                </td>
                {canDelete && (
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    {flock.retiredAt == null && (
                      <button
                        onClick={() => handleRetire(flock.id)}
                        disabled={loadingId === flock.id}
                        className="text-xs px-3 py-1 rounded-lg border border-[var(--lf-border)] text-[var(--lf-danger-text)] hover:bg-[var(--lf-danger-bg)] disabled:opacity-50"
                      >
                        {loadingId === flock.id ? '...' : 'Pensiunkan'}
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
