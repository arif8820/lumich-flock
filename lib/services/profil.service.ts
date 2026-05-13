import { revalidateTag } from 'next/cache'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/auth/server'
import { getUserProfil, updateUserProfil } from '@/lib/db/queries/profil.queries'

export async function updateInfoAkunService(
  farmSchema: string,
  userId: string,
  data: { fullName: string; phone: string | null }
) {
  const updated = await updateUserProfil(farmSchema, userId, data)
  if (!updated) throw new Error('Gagal memperbarui informasi akun')
  revalidateTag(`user-${userId}`)
  return updated
}

export async function gantiPasswordService(
  email: string,
  currentPassword: string,
  newPassword: string,
  userId: string
) {
  const supabase = await createSupabaseServerClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  })
  if (signInError) throw new Error('Password saat ini salah')

  const serviceClient = createSupabaseServiceClient()
  const { error: updateError } = await serviceClient.auth.admin.updateUserById(userId, {
    password: newPassword,
  })
  if (updateError) throw new Error('Gagal mengubah password')
}
