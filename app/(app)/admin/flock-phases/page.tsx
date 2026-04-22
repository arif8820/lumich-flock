import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAllFlockPhases } from '@/lib/services/flock-phase.service'

export default async function FlockPhasesPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/dashboard')

  const phases = await getAllFlockPhases()

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
        Fase Flock
      </h1>
      <div className="bg-white rounded-2xl shadow-lf-sm overflow-hidden">
        <table className="w-full" style={{ fontSize: '13px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e0e8df' }}>
              {['Nama Fase', 'Min Minggu', 'Maks Minggu', 'Urutan'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: '#8fa08f', fontSize: '12px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {phases.map((phase) => (
              <tr key={phase.id} className="transition-colors hover:bg-[#fafaf8]" style={{ borderBottom: '1px solid #f0ede8' }}>
                <td className="px-4 py-3 font-medium" style={{ color: '#2d3a2e' }}>{phase.name}</td>
                <td className="px-4 py-3" style={{ color: '#5a6b5b' }}>{phase.minWeeks}</td>
                <td className="px-4 py-3" style={{ color: '#5a6b5b' }}>{phase.maxWeeks ?? '∞'}</td>
                <td className="px-4 py-3" style={{ color: '#5a6b5b' }}>{phase.sortOrder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
