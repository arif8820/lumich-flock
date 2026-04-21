import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAllCoops } from '@/lib/services/coop.service'

export default async function KandangPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/dashboard')

  const coops = await getAllCoops()

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Manajemen Kandang</h1>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Nama</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Kapasitas</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {coops.map((coop) => (
              <tr key={coop.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-900">{coop.name}</td>
                <td className="px-4 py-3 text-slate-600">
                  {coop.capacity ? coop.capacity.toLocaleString('id-ID') : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    coop.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {coop.status === 'active' ? 'Aktif' : 'Nonaktif'}
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
