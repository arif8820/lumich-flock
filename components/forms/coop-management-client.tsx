// client: interactive coop table with create form, inline edit, activate/deactivate
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreateCoopForm } from './create-coop-form'
import { EditCoopForm } from './edit-coop-form'
import { activateCoopAction, deactivateCoopAction } from '@/lib/actions/coop.actions'
import type { CoopWithPopulation } from '@/lib/services/coop.service'

interface Props {
  coops: CoopWithPopulation[]
}

function flockAge(docDate: Date): string {
  const totalDays = Math.floor((Date.now() - new Date(docDate).getTime()) / 86_400_000)
  const weeks = Math.floor(totalDays / 7)
  const days = totalDays % 7
  if (weeks === 0) return `${days} hari`
  if (days === 0) return `${weeks} minggu`
  return `${weeks} minggu ${days} hari`
}

export function CoopManagementClient({ coops }: Props) {
  const router = useRouter()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCoopId, setEditingCoopId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleToggleActive(coop: CoopWithPopulation) {
    setError(null)
    setLoadingId(coop.id)
    try {
      const result = coop.status === 'active'
        ? await deactivateCoopAction(coop.id)
        : await activateCoopAction(coop.id)
      if (!result.success) setError(result.error)
      else router.refresh()
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--lf-text-mid)]">{coops.length} kandang terdaftar</span>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-1.5 text-sm rounded-lg text-white font-medium"
          style={{ background: 'var(--lf-blue)' }}
        >
          {showCreateForm ? 'Tutup' : '+ Tambah Kandang'}
        </button>
      </div>

      {showCreateForm && (
        <CreateCoopForm
          onSuccess={() => setShowCreateForm(false)}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {error && (
        <p className="text-xs px-3 py-2 rounded-lg bg-[var(--lf-danger-bg)] text-[var(--lf-danger-text)]">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-[var(--lf-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--lf-bg-warm)] text-left">
              <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Nama</th>
              <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Kapasitas / Populasi</th>
              <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Flock Aktif</th>
              <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Status</th>
              <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--lf-border)]">
            {coops.map((coop) => (
              <React.Fragment key={coop.id}>
                <tr className="bg-white hover:bg-[var(--lf-bg)]">
                  <td className="px-4 py-3 text-[var(--lf-text-dark)] font-medium">{coop.name}</td>
                  <td className="px-4 py-3 text-[var(--lf-text-mid)]">
                    {coop.capacity != null ? (
                      <span>
                        <span>{coop.capacity.toLocaleString('id-ID')}</span>
                        <span className="mx-0.5 opacity-40">/</span>
                        <span style={{ color: coop.livePopulation > 0 ? '#3da88a' : 'var(--lf-text-soft)' }}>
                          {coop.livePopulation.toLocaleString('id-ID')}
                        </span>
                        <span className="ml-1 text-xs opacity-60">ekor</span>
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {coop.activeFlock ? (
                      <div>
                        <p className="text-xs font-medium text-[var(--lf-text-dark)]">{coop.activeFlock.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--lf-text-soft)' }}>
                          {flockAge(coop.activeFlock.docDate)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--lf-text-soft)' }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={coop.status === 'active'
                        ? { background: 'var(--lf-success-bg)', color: 'var(--lf-success-text)' }
                        : { background: 'var(--lf-bg-warm)', color: 'var(--lf-text-soft)' }
                      }
                    >
                      {coop.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingCoopId(editingCoopId === coop.id ? null : coop.id)}
                        className="text-xs px-3 py-1 rounded-lg border border-[var(--lf-border)] text-[var(--lf-text-mid)] hover:bg-[var(--lf-bg-warm)]"
                      >
                        {editingCoopId === coop.id ? 'Tutup' : 'Edit'}
                      </button>
                      <button
                        onClick={() => handleToggleActive(coop)}
                        disabled={loadingId === coop.id}
                        className="text-xs px-3 py-1 rounded-lg border border-[var(--lf-border)] text-[var(--lf-text-mid)] hover:bg-[var(--lf-bg-warm)] disabled:opacity-50"
                      >
                        {loadingId === coop.id ? '...' : coop.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </div>
                  </td>
                </tr>
                {editingCoopId === coop.id && (
                  <tr>
                    <td colSpan={5} className="px-4 py-3 bg-[var(--lf-bg)]">
                      <EditCoopForm
                        coop={coop}
                        onSuccess={() => setEditingCoopId(null)}
                        onCancel={() => setEditingCoopId(null)}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
