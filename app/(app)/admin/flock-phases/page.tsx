import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAllFlockPhases } from '@/lib/services/flock-phase.service'

export default async function FlockPhasesPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/dashboard')

  const phases = await getAllFlockPhases()

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Fase Flock</h1>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Nama Fase</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Min Minggu</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Maks Minggu</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Urutan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {phases.map((phase) => (
              <tr key={phase.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{phase.name}</td>
                <td className="px-4 py-3 text-slate-600">{phase.minWeeks}</td>
                <td className="px-4 py-3 text-slate-600">{phase.maxWeeks ?? '∞'}</td>
                <td className="px-4 py-3 text-slate-600">{phase.sortOrder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
