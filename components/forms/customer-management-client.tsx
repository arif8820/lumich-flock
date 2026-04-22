// client: interactive customer table with create form, inline edit, activate/deactivate
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreateCustomerForm } from './create-customer-form'
import { EditCustomerForm } from './edit-customer-form'
import { activateCustomerAction, deactivateCustomerAction } from '@/lib/actions/customer.actions'
import type { Customer } from '@/lib/db/schema'

interface Props {
  customers: Customer[]
}

const TYPE_LABELS: Record<string, string> = {
  retail: 'Retail',
  wholesale: 'Grosir',
  distributor: 'Distributor',
}

export function CustomerManagementClient({ customers }: Props) {
  const router = useRouter()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleToggleActive(customer: Customer) {
    setError(null)
    setLoadingId(customer.id)
    try {
      const result = customer.status === 'active'
        ? await deactivateCustomerAction(customer.id)
        : await activateCustomerAction(customer.id)
      if (!result.success) setError(result.error)
      else router.refresh()
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--lf-text-mid)]">{customers.length} pelanggan terdaftar</span>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-1.5 text-sm rounded-lg text-white font-medium"
          style={{ background: 'var(--lf-blue)' }}
        >
          {showCreateForm ? 'Tutup' : '+ Tambah Pelanggan'}
        </button>
      </div>

      {showCreateForm && (
        <CreateCustomerForm
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
              <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Tipe</th>
              <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Telepon</th>
              <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Batas Kredit</th>
              <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Status</th>
              <th className="px-4 py-3 font-medium text-[var(--lf-text-mid)]">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--lf-border)]">
            {customers.map((customer) => (
              <React.Fragment key={customer.id}>
                <tr className="bg-white hover:bg-[var(--lf-bg)]">
                  <td className="px-4 py-3 text-[var(--lf-text-dark)] font-medium">{customer.name}</td>
                  <td className="px-4 py-3 text-[var(--lf-text-mid)]">
                    {customer.type ? TYPE_LABELS[customer.type] ?? customer.type : '—'}
                  </td>
                  <td className="px-4 py-3 text-[var(--lf-text-mid)]">{customer.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-[var(--lf-text-mid)]">
                    {Number(customer.creditLimit) > 0
                      ? `Rp ${Number(customer.creditLimit).toLocaleString('id-ID')}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={customer.status === 'active'
                        ? { background: 'var(--lf-success-bg)', color: 'var(--lf-success-text)' }
                        : { background: 'var(--lf-bg-warm)', color: 'var(--lf-text-soft)' }
                      }
                    >
                      {customer.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingCustomerId(editingCustomerId === customer.id ? null : customer.id)}
                        className="text-xs px-3 py-1 rounded-lg border border-[var(--lf-border)] text-[var(--lf-text-mid)] hover:bg-[var(--lf-bg-warm)]"
                      >
                        {editingCustomerId === customer.id ? 'Tutup' : 'Edit'}
                      </button>
                      <button
                        onClick={() => handleToggleActive(customer)}
                        disabled={loadingId === customer.id}
                        className="text-xs px-3 py-1 rounded-lg border border-[var(--lf-border)] text-[var(--lf-text-mid)] hover:bg-[var(--lf-bg-warm)] disabled:opacity-50"
                      >
                        {loadingId === customer.id ? '...' : customer.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </div>
                  </td>
                </tr>
                {editingCustomerId === customer.id && (
                  <tr>
                    <td colSpan={6} className="px-4 py-3 bg-[var(--lf-bg)]">
                      <EditCustomerForm
                        customer={customer}
                        onSuccess={() => setEditingCustomerId(null)}
                        onCancel={() => setEditingCustomerId(null)}
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
