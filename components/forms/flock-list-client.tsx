// client: flock list with retire action
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { retireFlockAction } from '@/lib/actions/flock.actions'
import type { FlockWithMeta } from '@/lib/services/flock.service'

interface Props {
  flocks: FlockWithMeta[]
  userRole: 'operator' | 'supervisor' | 'admin'
}

export function FlockListClient({ flocks, userRole }: Props) {
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
        {(userRole === 'supervisor' || userRole === 'admin') && (
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

      <div className="overflow-x-auto rounded-xl border border-[var(--lf-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--lf-bg-warm)] text-left">
              <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Nama Flock</th>
              <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Kandang</th>
              <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Umur</th>
              <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Fase</th>
              <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Total DOC</th>
              {userRole === 'admin' && (
                <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Aksi</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--lf-border)]">
            {flocks.length === 0 && (
              <tr>
                <td colSpan={userRole === 'admin' ? 6 : 5} className="px-4 py-8 text-center text-[var(--lf-text-soft)]">
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
                {userRole === 'admin' && (
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
