import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/queries/profil.queries', () => ({
  updateUserProfil: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn(),
    },
  })),
}))

vi.mock('@/lib/auth/server', () => ({
  createSupabaseServiceClient: vi.fn(() => ({
    auth: {
      admin: {
        updateUserById: vi.fn(),
      },
    },
  })),
}))

import * as profilQueries from '@/lib/db/queries/profil.queries'
import * as nextCache from 'next/cache'
import * as supabaseJs from '@supabase/supabase-js'
import * as authServer from '@/lib/auth/server'
import { updateInfoAkunService, gantiPasswordService } from './profil.service'

const FARM = 'test-farm'
const USER_ID = 'user-123'
const EMAIL = 'test@example.com'

describe('profil.service', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('updateInfoAkunService', () => {
    it('updates user profil and calls revalidateTag', async () => {
      const mockUpdated = { id: USER_ID, fullName: 'Budi', phone: '08123456789' }
      vi.mocked(profilQueries.updateUserProfil).mockResolvedValue(mockUpdated as any) // any: partial user row for mock

      const data = { fullName: 'Budi', phone: '08123456789' }
      const result = await updateInfoAkunService(FARM, USER_ID, data)

      expect(profilQueries.updateUserProfil).toHaveBeenCalledWith(FARM, USER_ID, data)
      expect(nextCache.revalidateTag).toHaveBeenCalledWith(`user-${USER_ID}`)
      expect(result).toEqual(mockUpdated)
    })

    it('throws Gagal memperbarui informasi akun when updateUserProfil returns null', async () => {
      vi.mocked(profilQueries.updateUserProfil).mockResolvedValue(null as any) // any: simulating null return

      await expect(
        updateInfoAkunService(FARM, USER_ID, { fullName: 'Budi', phone: null })
      ).rejects.toThrow('Gagal memperbarui informasi akun')

      expect(nextCache.revalidateTag).not.toHaveBeenCalled()
    })
  })

  describe('gantiPasswordService', () => {
    it('throws Password saat ini salah when signInWithPassword returns an error', async () => {
      const mockSignIn = vi.fn().mockResolvedValue({ error: { message: 'Invalid credentials' } })
      vi.mocked(supabaseJs.createClient).mockReturnValue({
        auth: { signInWithPassword: mockSignIn },
      } as any) // any: partial SupabaseClient for mock

      await expect(
        gantiPasswordService(EMAIL, 'wrong-password', 'new-password', USER_ID)
      ).rejects.toThrow('Password saat ini salah')

      expect(mockSignIn).toHaveBeenCalledWith({ email: EMAIL, password: 'wrong-password' })
    })

    it('throws Gagal mengubah password when updateUserById returns an error', async () => {
      const mockSignIn = vi.fn().mockResolvedValue({ error: null })
      vi.mocked(supabaseJs.createClient).mockReturnValue({
        auth: { signInWithPassword: mockSignIn },
      } as any) // any: partial SupabaseClient for mock

      const mockUpdateUserById = vi.fn().mockResolvedValue({ error: { message: 'Update failed' } })
      vi.mocked(authServer.createSupabaseServiceClient).mockReturnValue({
        auth: { admin: { updateUserById: mockUpdateUserById } },
      } as any) // any: partial ServiceClient for mock

      await expect(
        gantiPasswordService(EMAIL, 'current-password', 'new-password', USER_ID)
      ).rejects.toThrow('Gagal mengubah password')

      expect(mockUpdateUserById).toHaveBeenCalledWith(USER_ID, { password: 'new-password' })
    })

    it('completes without throwing on happy path', async () => {
      const mockSignIn = vi.fn().mockResolvedValue({ error: null })
      vi.mocked(supabaseJs.createClient).mockReturnValue({
        auth: { signInWithPassword: mockSignIn },
      } as any) // any: partial SupabaseClient for mock

      const mockUpdateUserById = vi.fn().mockResolvedValue({ error: null })
      vi.mocked(authServer.createSupabaseServiceClient).mockReturnValue({
        auth: { admin: { updateUserById: mockUpdateUserById } },
      } as any) // any: partial ServiceClient for mock

      await expect(
        gantiPasswordService(EMAIL, 'current-password', 'new-password', USER_ID)
      ).resolves.toBeUndefined()

      expect(mockSignIn).toHaveBeenCalledWith({ email: EMAIL, password: 'current-password' })
      expect(mockUpdateUserById).toHaveBeenCalledWith(USER_ID, { password: 'new-password' })
    })
  })
})
