import { getSession } from '@/lib/auth/get-session'
import { getAllActiveFlocks } from '@/lib/services/flock.service'

export default async function FlockPage() {
  await getSession() // auth check handled by layout

  const flocks = await getAllActiveFlocks()

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Manajemen Flock</h1>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Nama</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Kandang</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Tgl Masuk</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Umur</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Fase</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Populasi Awal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {flocks.map((flock) => (
              <tr key={flock.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{flock.name}</td>
                <td className="px-4 py-3 text-slate-600">{flock.coopName}</td>
                <td className="px-4 py-3 text-slate-600">
                  {new Date(flock.arrivalDate).toLocaleDateString('id-ID')}
                </td>
                <td className="px-4 py-3 text-slate-600">{flock.ageWeeks} minggu</td>
                <td className="px-4 py-3">
                  {flock.phase ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
                      {flock.phase.name}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {flock.initialCount.toLocaleString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
