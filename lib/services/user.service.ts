import { supabaseAdmin } from '@/lib/auth/admin'
import {
  findAllUsers,
  findUserById,
  insertUser,
  updateUser,
} from '@/lib/db/queries/user.queries'
import type { UserWithRoleSlug } from '@/lib/db/queries/user.queries'
import type { User } from '@/lib/db/schema'

type CreateUserInput = {
  email: string
  password: string
  fullName: string
  role: 'operator' | 'supervisor' | 'admin'
  createdBy: string
}

export async function createUser(farmSchema: string, input: CreateUserInput): Promise<User> {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  })

  if (error || !data.user) {
    if (error?.message.includes('already')) throw new Error('Email sudah digunakan')
    throw new Error('Gagal membuat user')
  }

  return insertUser(farmSchema, {
    id: data.user.id,
    email: input.email,
    fullName: input.fullName,
    role: input.role,
    isActive: true,
    createdBy: input.createdBy,
  })
}

export async function getAllUsers(farmSchema: string): Promise<UserWithRoleSlug[]> {
  return findAllUsers(farmSchema)
}

export async function getUserById(farmSchema: string, id: string): Promise<User | null> {
  return findUserById(farmSchema, id)
}

export async function updateUserRole(
  farmSchema: string,
  id: string,
  role: 'operator' | 'supervisor' | 'admin'
): Promise<User | null> {
  return updateUser(farmSchema, id, { role })
}

export async function deactivateUser(farmSchema: string, id: string): Promise<void> {
  await updateUser(farmSchema, id, { isActive: false })
}

export async function activateUser(farmSchema: string, id: string): Promise<void> {
  await updateUser(farmSchema, id, { isActive: true })
}

export async function changeUserPassword(id: string, newPassword: string): Promise<void> {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
    password: newPassword,
  })
  if (error) throw new Error('Gagal mengubah password')
}
