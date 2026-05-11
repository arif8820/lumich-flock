// client: interactive role management with permission matrix and real-time toggles
'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Trash2, Plus, X, Pencil } from 'lucide-react'
import {
  getRoleWithPermissionsAction,
  createRoleAction,
  updateRoleAction,
  deleteRoleAction,
  updatePermissionAction,
} from '@/lib/actions/role.actions'

type Role = {
  id: string
  name: string
  displayName: string
  isSystem: boolean
  isActive: boolean
  createdAt: Date
}

interface Props {
  roles: Role[]
}

const PERMISSION_MATRIX = [
  {
    module: 'Flock',
    actions: [
      { key: 'flock.view', label: 'Lihat' },
      { key: 'flock.create', label: 'Buat' },
      { key: 'flock.update', label: 'Ubah' },
      { key: 'flock.delete', label: 'Hapus' },
    ],
  },
  {
    module: 'Produksi',
    actions: [
      { key: 'produksi.view', label: 'Lihat' },
      { key: 'produksi.create', label: 'Input' },
      { key: 'produksi.update', label: 'Ubah' },
    ],
  },
  {
    module: 'Stok',
    actions: [
      { key: 'stok.view', label: 'Lihat' },
      { key: 'stok.create', label: 'Beli' },
      { key: 'stok.update', label: 'Ubah' },
      { key: 'stok.adjust', label: 'Sesuaikan' },
    ],
  },
  {
    module: 'Kas',
    actions: [
      { key: 'kas.view', label: 'Lihat' },
      { key: 'kas.create', label: 'Buat' },
      { key: 'kas.update', label: 'Ubah' },
      { key: 'kas.delete', label: 'Hapus' },
    ],
  },
  {
    module: 'Penjualan',
    actions: [
      { key: 'sales.view', label: 'Lihat' },
      { key: 'sales.create', label: 'Buat' },
      { key: 'sales.approve', label: 'Setuju' },
    ],
  },
  {
    module: 'Laporan',
    actions: [
      { key: 'laporan.view', label: 'Lihat' },
      { key: 'laporan.export', label: 'Export' },
    ],
  },
  {
    module: 'User',
    actions: [
      { key: 'user.view', label: 'Lihat' },
      { key: 'user.manage', label: 'Kelola' },
    ],
  },
  {
    module: 'Role',
    actions: [{ key: 'role.manage', label: 'Kelola' }],
  },
  {
    module: 'Kandang',
    actions: [{ key: 'coop.manage', label: 'Kelola' }],
  },
]

export function RoleManagementClient({ roles }: Props) {
  const router = useRouter()
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(
    roles.find((r) => !r.isSystem)?.id ?? roles[0]?.id ?? null
  )
  const [rolePermissions, setRolePermissions] = useState<Set<string>>(new Set())
  const [loadingPerms, setLoadingPerms] = useState(false)
  const [pendingKey, setPendingKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [, startTransition] = useTransition()

  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? null

  useEffect(() => {
    if (!selectedRoleId) {
      setRolePermissions(new Set())
      return
    }
    let cancelled = false
    setLoadingPerms(true)
    setError(null)
    getRoleWithPermissionsAction(selectedRoleId).then((result) => {
      if (cancelled) return
      if (result.success && result.data) {
        setRolePermissions(new Set(result.data.permissions))
      } else if (!result.success) {
        setError(result.error)
      }
      setLoadingPerms(false)
    })
    return () => {
      cancelled = true
    }
  }, [selectedRoleId])

  async function handleTogglePermission(key: string, currentlyGranted: boolean) {
    if (!selectedRole || selectedRole.isSystem) return
    setError(null)
    setPendingKey(key)

    // Optimistic update
    const next = new Set(rolePermissions)
    if (currentlyGranted) next.delete(key)
    else next.add(key)
    setRolePermissions(next)

    const result = await updatePermissionAction(selectedRole.id, key, !currentlyGranted)
    if (!result.success) {
      // Revert
      const reverted = new Set(rolePermissions)
      setRolePermissions(reverted)
      setError(result.error)
    }
    setPendingKey(null)
  }

  async function handleDeleteRole(role: Role) {
    if (role.isSystem) return
    if (!confirm(`Hapus role "${role.displayName}"? Aksi ini tidak dapat dibatalkan.`)) return
    setError(null)
    const result = await deleteRoleAction(role.id)
    if (!result.success) {
      setError(result.error)
      return
    }
    if (selectedRoleId === role.id) setSelectedRoleId(null)
    startTransition(() => router.refresh())
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs px-3 py-2 rounded-lg bg-[var(--lf-danger-bg)] text-[var(--lf-danger-text)]">
          {error}
        </p>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        {/* Left panel: roles list */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-lf-sm border border-[var(--lf-border)] p-3 space-y-2">
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#8fa08f' }}>
                Role ({roles.length})
              </span>
            </div>

            <div className="space-y-1">
              {roles.map((role) => {
                const isSelected = role.id === selectedRoleId
                return (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    className="press-feedback flex items-center justify-between gap-2 px-3 py-2 rounded-xl cursor-pointer transition-colors"
                    style={{
                      background: isSelected ? '#e8f5e9' : 'transparent',
                      borderLeft: isSelected ? '3px solid #4a7c59' : '3px solid transparent',
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {role.isSystem && (
                        <Lock size={12} style={{ color: '#8fa08f' }} strokeWidth={2} />
                      )}
                      <span
                        className="text-sm font-medium truncate"
                        style={{ color: isSelected ? '#2d3a2e' : '#4a5a4a' }}
                      >
                        {role.displayName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {role.isSystem ? (
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          style={{ background: '#f0f0f0', color: '#8fa08f' }}
                        >
                          SISTEM
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingRole(role)
                            }}
                            className="p-1 rounded hover:bg-white"
                            title="Edit"
                          >
                            <Pencil size={12} style={{ color: '#8fa08f' }} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteRole(role)
                            }}
                            className="p-1 rounded hover:bg-white"
                            title="Hapus"
                          >
                            <Trash2 size={12} style={{ color: '#c04a4a' }} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => setShowCreate(true)}
              className="press-feedback w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white"
              style={{ background: '#4a7c59' }}
            >
              <Plus size={14} strokeWidth={2.5} />
              Tambah Role
            </button>
          </div>
        </div>

        {/* Right panel: permission matrix */}
        <div className="flex-1 min-w-0">
          {!selectedRole ? (
            <div className="bg-white rounded-2xl shadow-lf-sm border border-[var(--lf-border)] p-8 text-center">
              <p className="text-sm" style={{ color: '#8fa08f' }}>
                Pilih role untuk mengatur permission
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lf-sm border border-[var(--lf-border)] overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--lf-border)] flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide" style={{ color: '#8fa08f' }}>
                    Permission untuk
                  </p>
                  <h2 className="text-base font-bold mt-0.5" style={{ color: '#2d3a2e' }}>
                    {selectedRole.displayName}
                    {selectedRole.isSystem && (
                      <span
                        className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded align-middle"
                        style={{ background: '#f0f0f0', color: '#8fa08f' }}
                      >
                        SISTEM (READ-ONLY)
                      </span>
                    )}
                  </h2>
                </div>
                {loadingPerms && (
                  <span className="text-xs" style={{ color: '#8fa08f' }}>
                    Memuat...
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: '#f8faf8' }}>
                      <th
                        className="px-4 py-3 text-left font-medium"
                        style={{ color: '#4a5a4a' }}
                      >
                        Modul
                      </th>
                      <th
                        className="px-4 py-3 text-left font-medium"
                        style={{ color: '#4a5a4a' }}
                      >
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--lf-border)]">
                    {PERMISSION_MATRIX.map((mod) => (
                      <tr key={mod.module} className="bg-white">
                        <td
                          className="px-4 py-3 font-semibold align-top whitespace-nowrap"
                          style={{ color: '#2d3a2e' }}
                        >
                          {mod.module}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-x-5 gap-y-2">
                            {mod.actions.map((action) => {
                              const granted = selectedRole.isSystem
                                ? true
                                : rolePermissions.has(action.key)
                              const disabled =
                                selectedRole.isSystem ||
                                loadingPerms ||
                                pendingKey === action.key
                              return (
                                <label
                                  key={action.key}
                                  className="inline-flex items-center gap-2 cursor-pointer select-none"
                                  style={{
                                    opacity: disabled && !selectedRole.isSystem ? 0.6 : 1,
                                    cursor: disabled ? 'not-allowed' : 'pointer',
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={granted}
                                    disabled={disabled}
                                    onChange={() =>
                                      handleTogglePermission(action.key, granted)
                                    }
                                    className="w-4 h-4 rounded cursor-pointer"
                                    style={{ accentColor: '#4a7c59' }}
                                  />
                                  <span className="text-xs" style={{ color: '#4a5a4a' }}>
                                    {action.label}
                                  </span>
                                </label>
                              )
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateRoleModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false)
            startTransition(() => router.refresh())
          }}
        />
      )}

      {editingRole && (
        <EditRoleModal
          role={editingRole}
          onClose={() => setEditingRole(null)}
          onSuccess={() => {
            setEditingRole(null)
            startTransition(() => router.refresh())
          }}
        />
      )}
    </div>
  )
}

// client: modal form for creating a role
function CreateRoleModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [name, setName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const result = await createRoleAction({ name, displayName })
    setSubmitting(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    onSuccess()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-lf-md w-full max-w-md p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold" style={{ color: '#2d3a2e' }}>
            Tambah Role Baru
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X size={16} style={{ color: '#8fa08f' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#4a5a4a' }}>
              Slug (huruf kecil, underscore)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase())}
              placeholder="contoh: kasir"
              required
              className="w-full px-3 py-2 text-sm border border-[var(--lf-border)] bg-white"
              style={{ borderRadius: '10px', color: '#2d3a2e' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#4a5a4a' }}>
              Nama Display
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="contoh: Kasir Toko"
              required
              className="w-full px-3 py-2 text-sm border border-[var(--lf-border)] bg-white"
              style={{ borderRadius: '10px', color: '#2d3a2e' }}
            />
          </div>

          {error && (
            <p className="text-xs px-3 py-2 rounded-lg bg-[var(--lf-danger-bg)] text-[var(--lf-danger-text)]">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium"
              style={{ borderRadius: '10px', color: '#4a5a4a' }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              style={{ borderRadius: '10px', background: '#4a7c59' }}
            >
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// client: modal form for editing role display name
function EditRoleModal({
  role,
  onClose,
  onSuccess,
}: {
  role: Role
  onClose: () => void
  onSuccess: () => void
}) {
  const [displayName, setDisplayName] = useState(role.displayName)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const result = await updateRoleAction(role.id, { displayName })
    setSubmitting(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    onSuccess()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-lf-md w-full max-w-md p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold" style={{ color: '#2d3a2e' }}>
            Ubah Role
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X size={16} style={{ color: '#8fa08f' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#4a5a4a' }}>
              Slug
            </label>
            <input
              type="text"
              value={role.name}
              disabled
              className="w-full px-3 py-2 text-sm border border-[var(--lf-border)]"
              style={{ borderRadius: '10px', color: '#8fa08f', background: '#f8faf8' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#4a5a4a' }}>
              Nama Display
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-[var(--lf-border)] bg-white"
              style={{ borderRadius: '10px', color: '#2d3a2e' }}
            />
          </div>

          {error && (
            <p className="text-xs px-3 py-2 rounded-lg bg-[var(--lf-danger-bg)] text-[var(--lf-danger-text)]">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium"
              style={{ borderRadius: '10px', color: '#4a5a4a' }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              style={{ borderRadius: '10px', background: '#4a7c59' }}
            >
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
