import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession()
  if (!user || user.role !== 'admin') redirect('/dashboard')
  return <>{children}</>
}
