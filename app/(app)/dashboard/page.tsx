import { getSession } from '@/lib/auth/get-session'

export default async function DashboardPage() {
  const user = await getSession()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="text-slate-500 mt-1">Selamat datang, {user?.fullName}</p>
    </div>
  )
}
