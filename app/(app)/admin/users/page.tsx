import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAllUsers } from '@/lib/services/user.service'

export default async function UsersPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/dashboard')

  const users = await getAllUsers()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Manajemen User</h1>
      </div>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Nama</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Email</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Role</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-900">{user.fullName}</td>
                <td className="px-4 py-3 text-slate-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="capitalize text-slate-700">{user.role}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
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
