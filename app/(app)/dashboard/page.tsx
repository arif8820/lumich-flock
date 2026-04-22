import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'

export default async function DashboardPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  return (
    <div className="p-6 space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
            Dashboard Produksi
          </h1>
          <p className="text-[12px] mt-0.5" style={{ color: '#8fa08f' }}>
            Selamat datang, {user?.fullName}
          </p>
        </div>
        {/* Period selector — client state wired in Phase 2 Sprint 4 */}
        <div className="flex items-center gap-1 p-1 rounded-[9px]" style={{ background: '#f0ede8' }}>
          {(['H-1', '7 hari', '14 hari', '30 hari'] as const).map((label, i) => (
            <span
              key={label}
              className="px-3 py-1.5 rounded-[7px] text-[11px] font-semibold select-none"
              style={i === 1
                ? { background: '#ffffff', color: '#2d3a2e', boxShadow: '0 1px 4px rgba(45,58,46,0.08)' }
                : { color: '#8fa08f', cursor: 'pointer' }
              }
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* KPI skeleton — replaced with real KpiCard components in Phase 2 Sprint 4 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-lf-sm animate-pulse" style={{ minHeight: '110px' }}>
            <div className="h-2.5 rounded mb-3" style={{ background: '#e0e8df', width: '55%' }} />
            <div className="h-7 rounded mb-2" style={{ background: '#e0e8df', width: '75%' }} />
            <div className="h-2 rounded" style={{ background: '#f0ede8', width: '45%' }} />
          </div>
        ))}
      </div>

      {/* Chart skeleton — replaced with real chart components in Phase 2 Sprint 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-lf-sm" style={{ minHeight: '200px' }}>
            <div className="h-4 rounded animate-pulse mb-4" style={{ background: '#e0e8df', width: '40%' }} />
            <div className="h-36 rounded animate-pulse" style={{ background: '#f0ede8' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
