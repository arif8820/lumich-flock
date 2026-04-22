import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAllUsers } from '@/lib/services/user.service'

export default async function UsersPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/dashboard')
  const users = await getAllUsers()

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
        Manajemen User
      </h1>
      <div className="bg-white rounded-2xl shadow-lf-sm overflow-hidden">
        <table className="w-full" style={{ fontSize: '13px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e0e8df' }}>
              {['Nama', 'Email', 'Role', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: '#8fa08f', fontSize: '12px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-[#fafaf8]" style={{ borderBottom: '1px solid #f0ede8' }}>
                <td className="px-4 py-3 font-medium" style={{ color: '#2d3a2e' }}>{user.fullName}</td>
                <td className="px-4 py-3" style={{ color: '#5a6b5b' }}>{user.email}</td>
                <td className="px-4 py-3 capitalize" style={{ color: '#5a6b5b' }}>{user.role}</td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold"
                    style={user.isActive ? { background: '#e3f0f9', color: '#3d7cb0' } : { background: '#fdeeed', color: '#e07a6a' }}
                  >
                    {user.isActive ? 'Aktif' : 'Nonaktif'}
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
