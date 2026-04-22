import { getSession } from '@/lib/auth/get-session'
import { getAllActiveFlocks } from '@/lib/services/flock.service'

export default async function FlockPage() {
  await getSession()
  const flocks = await getAllActiveFlocks()

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
        Manajemen Flock
      </h1>
      <div className="bg-white rounded-2xl shadow-lf-sm overflow-hidden">
        <table className="w-full" style={{ fontSize: '13px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e0e8df' }}>
              {['Nama', 'Kandang', 'Tgl Masuk', 'Umur', 'Fase', 'Populasi Awal'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: '#8fa08f', fontSize: '12px' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {flocks.map((flock) => (
              <tr key={flock.id} className="transition-colors hover:bg-[#fafaf8]" style={{ borderBottom: '1px solid #f0ede8' }}>
                <td className="px-4 py-3 font-medium" style={{ color: '#2d3a2e' }}>{flock.name}</td>
                <td className="px-4 py-3" style={{ color: '#5a6b5b' }}>{flock.coopName}</td>
                <td className="px-4 py-3" style={{ color: '#5a6b5b' }}>
                  {new Date(flock.arrivalDate).toLocaleDateString('id-ID')}
                </td>
                <td className="px-4 py-3" style={{ color: '#5a6b5b' }}>{flock.ageWeeks} minggu</td>
                <td className="px-4 py-3">
                  {flock.phase ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ background: '#e3f0f9', color: '#3d7cb0' }}>
                      {flock.phase.name}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3" style={{ color: '#5a6b5b' }}>
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
