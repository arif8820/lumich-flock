// client: interactive user table with create form, role change, activate/deactivate
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CreateUserForm } from './create-user-form'
import { updateUserRoleAction, activateUserAction, deactivateUserAction } from '@/lib/actions/user.actions'
import type { UserWithRoleSlug } from '@/lib/db/queries/user.queries'

type RoleOption = { id: string; name: string; displayName: string; isSystem: boolean }

interface Props {
  users: UserWithRoleSlug[]
  roles: RoleOption[]
}

export function UserManagementClient({ users, roles }: Props) {
  const router = useRouter()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleRoleChange(userId: string, newRoleId: string) {
    setError(null)
    setLoadingId(userId)
    try {
      const result = await updateUserRoleAction(userId, newRoleId)
      if (!result.success) setError(result.error)
      else router.refresh()
    } finally {
      setLoadingId(null)
    }
  }

  async function handleToggleActive(user: UserWithRoleSlug) {
    setError(null)
    setLoadingId(user.id)
    try {
      const result = user.isActive
        ? await deactivateUserAction(user.id)
        : await activateUserAction(user.id)
      if (!result.success) setError(result.error)
      else router.refresh()
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--lf-text-mid)]">{users.length} pengguna terdaftar</span>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-1.5 text-sm rounded-lg text-white font-medium"
          style={{ background: 'var(--lf-blue)' }}
        >
          {showCreateForm ? 'Tutup' : '+ Tambah Pengguna'}
        </button>
      </div>

      {showCreateForm && (
        <CreateUserForm
          roles={roles}
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
              <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Email</th>
              <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Role</th>
              <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Status</th>
              <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--lf-border)]">
            {users.map((user) => (
              <tr key={user.id} className="bg-white hover:bg-[var(--lf-bg)]">
                <td className="px-4 py-3 text-[var(--lf-text-dark)] font-medium">{user.fullName}</td>
                <td className="px-4 py-3 text-[var(--lf-text-mid)]">{user.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={user.roleId}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={loadingId === user.id}
                    className="border border-[var(--lf-border)] rounded-lg px-2 py-1 text-xs bg-[var(--lf-input-bg)] text-[var(--lf-text-dark)]"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.displayName}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={user.isActive
                      ? { background: 'var(--lf-success-bg)', color: 'var(--lf-success-text)' }
                      : { background: 'var(--lf-bg-warm)', color: 'var(--lf-text-soft)' }
                    }
                  >
                    {user.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(user)}
                      disabled={loadingId === user.id}
                      className="text-xs px-3 py-1 rounded-lg border border-[var(--lf-border)] text-[var(--lf-text-mid)] hover:bg-[var(--lf-bg-warm)] disabled:opacity-50"
                    >
                      {loadingId === user.id ? '...' : user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    {user.roleSlug === 'operator' && (
                      <Link
                        href={`/admin/users/${user.id}/kandang`}
                        className="text-xs px-3 py-1 rounded-lg border border-[var(--lf-border)] text-[var(--lf-text-mid)] hover:bg-[var(--lf-bg-warm)]"
                      >
                        Kelola Kandang
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
