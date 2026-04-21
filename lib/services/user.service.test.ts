import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/queries/user.queries', () => ({
  findAllUsers: vi.fn(),
  findUserById: vi.fn(),
  insertUser: vi.fn(),
  updateUser: vi.fn(),
}))

vi.mock('@/lib/auth/admin', () => ({
  supabaseAdmin: {
    auth: {
      admin: {
        createUser: vi.fn(),
        updateUserById: vi.fn(),
      },
    },
  },
}))

import * as userQueries from '@/lib/db/queries/user.queries'
import { supabaseAdmin } from '@/lib/auth/admin'
import { createUser, updateUserRole, deactivateUser, changeUserPassword } from './user.service'

describe('user.service', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('createUser', () => {
    it('creates auth user and inserts to DB', async () => {
      const mockAuthUser = { id: 'uuid-123', email: 'test@test.com' }
      vi.mocked(supabaseAdmin.auth.admin.createUser).mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      } as any) // any: Supabase return type is complex union
      vi.mocked(userQueries.insertUser).mockResolvedValue({
        id: 'uuid-123',
        email: 'test@test.com',
        fullName: 'Test User',
        role: 'operator',
        isActive: true,
        createdBy: 'admin-id',
        createdAt: new Date(),
        updatedAt: null,
      })

      const result = await createUser({
        email: 'test@test.com',
        password: 'Password1',
        fullName: 'Test User',
        role: 'operator',
        createdBy: 'admin-id',
      })

      expect(supabaseAdmin.auth.admin.createUser).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'Password1',
        email_confirm: true,
      })
      expect(userQueries.insertUser).toHaveBeenCalledWith(expect.objectContaining({
        id: 'uuid-123',
        email: 'test@test.com',
        fullName: 'Test User',
        role: 'operator',
      }))
      expect(result.email).toBe('test@test.com')
    })

    it('throws if Supabase auth fails', async () => {
      vi.mocked(supabaseAdmin.auth.admin.createUser).mockResolvedValue({
        data: { user: null },
        error: { message: 'Email already exists' },
      } as any) // any: Supabase return type is complex union

      await expect(createUser({
        email: 'dup@test.com',
        password: 'Password1',
        fullName: 'Dup',
        role: 'operator',
        createdBy: 'admin-id',
      })).rejects.toThrow('Email sudah digunakan')
    })
  })

  describe('deactivateUser', () => {
    it('sets is_active to false', async () => {
      vi.mocked(userQueries.updateUser).mockResolvedValue({
        id: 'uuid-123',
        isActive: false,
      } as any) // any: partial User for mock

      await deactivateUser('uuid-123')

      expect(userQueries.updateUser).toHaveBeenCalledWith('uuid-123', { isActive: false })
    })
  })

  describe('changeUserPassword', () => {
    it('calls supabase admin updateUserById', async () => {
      vi.mocked(supabaseAdmin.auth.admin.updateUserById).mockResolvedValue({
        data: { user: {} },
        error: null,
      } as any) // any: Supabase return type is complex union

      await changeUserPassword('uuid-123', 'NewPass1')

      expect(supabaseAdmin.auth.admin.updateUserById).toHaveBeenCalledWith('uuid-123', {
        password: 'NewPass1',
      })
    })
  })
})
