import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAllCustomers } from '@/lib/services/customer.service'

export default async function PelangganPage() {
  const session = await getSession()
  if (!session || session.role === 'operator') redirect('/dashboard')

  const customers = await getAllCustomers()

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Manajemen Pelanggan</h1>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Nama</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Tipe</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Telepon</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Limit Kredit</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{customer.name}</td>
                <td className="px-4 py-3 text-slate-600 capitalize">{customer.type ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{customer.phone ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">
                  {Number(customer.creditLimit).toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 0,
                  })}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    customer.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {customer.status === 'active' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
