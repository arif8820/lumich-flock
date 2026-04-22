// client: coop assignment add/remove for operator user
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { assignCoopToUserAction, removeCoopFromUserAction } from '@/lib/actions/user-coop-assignment.actions'

interface Assignment {
  id: string
  coopId: string
  coopName: string
}

interface Props {
  userId: string
  assignments: Assignment[]
  availableCoops: { id: string; name: string }[]
}

export function CoopAssignmentPanel({ userId, assignments, availableCoops }: Props) {
  const router = useRouter()
  const unassignedCoops = availableCoops.filter(
    (c) => !assignments.some((a) => a.coopId === c.id)
  )
  const [selectedCoopId, setSelectedCoopId] = useState(unassignedCoops[0]?.id ?? '')
  const [loadingRemoveId, setLoadingRemoveId] = useState<string | null>(null)
  const [loadingAdd, setLoadingAdd] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd() {
    if (!selectedCoopId) return
    setError(null)
    setLoadingAdd(true)
    try {
      const result = await assignCoopToUserAction(userId, selectedCoopId)
      if (!result.success) setError(result.error)
      else router.refresh()
    } finally {
      setLoadingAdd(false)
    }
  }

  async function handleRemove(coopId: string) {
    setError(null)
    setLoadingRemoveId(coopId)
    try {
      const result = await removeCoopFromUserAction(userId, coopId)
      if (!result.success) setError(result.error)
      else router.refresh()
    } finally {
      setLoadingRemoveId(null)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-xs px-3 py-2 rounded-lg bg-[var(--lf-danger-bg)] text-[var(--lf-danger-text)]">
          {error}
        </p>
      )}

      {/* Add assignment */}
      {unassignedCoops.length > 0 && (
        <div className="flex items-center gap-3">
          <select
            value={selectedCoopId}
            onChange={(e) => setSelectedCoopId(e.target.value)}
            className="border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm bg-[var(--lf-input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]"
          >
            {unassignedCoops.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={loadingAdd}
            className="px-4 py-2 text-sm rounded-lg text-white font-medium disabled:opacity-50"
            style={{ background: 'var(--lf-blue)' }}
          >
            {loadingAdd ? 'Menambah...' : 'Tambah'}
          </button>
        </div>
      )}

      {unassignedCoops.length === 0 && (
        <p className="text-sm text-[var(--lf-text-soft)]">Semua kandang aktif sudah di-assign.</p>
      )}

      {/* Current assignments */}
      {assignments.length === 0 ? (
        <p className="text-sm text-[var(--lf-text-soft)]">Belum ada kandang yang di-assign.</p>
      ) : (
        <div className="rounded-xl border border-[var(--lf-border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--lf-bg-warm)] text-left">
                <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Kandang</th>
                <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lf-border)]">
              {assignments.map((a) => (
                <tr key={a.id} className="bg-white hover:bg-[var(--lf-bg)]">
                  <td className="px-4 py-3 text-[var(--lf-text-dark)]">{a.coopName}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleRemove(a.coopId)}
                      disabled={loadingRemoveId === a.coopId}
                      className="text-xs px-3 py-1 rounded-lg border border-[var(--lf-border)] text-[var(--lf-danger-text)] hover:bg-[var(--lf-danger-bg)] disabled:opacity-50"
                    >
                      {loadingRemoveId === a.coopId ? '...' : 'Hapus'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
