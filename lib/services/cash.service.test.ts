import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/queries/cash-account.queries', () => ({
  findAccountById: vi.fn(),
  createAccount: vi.fn(),
  updateAccount: vi.fn(),
  listAccounts: vi.fn(),
  getAccountBalance: vi.fn(),
  countTransactionsByAccount: vi.fn(),
}))
vi.mock('@/lib/db/queries/cash-transaction.queries', () => ({
  insertTransaction: vi.fn(),
  updateTransferRefId: vi.fn(),
  listTransactions: vi.fn(),
  getDailyReport: vi.fn(),
}))
vi.mock('@/lib/db/queries/cash-category.queries', () => ({
  listCategories: vi.fn(),
  listActiveCategories: vi.fn(),
  findCategoryById: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
}))
vi.mock('@/lib/db', () => ({
  db: {
    transaction: vi.fn((fn: (tx: unknown) => unknown) => fn({})),
  },
}))

import * as accountQueries from '@/lib/db/queries/cash-account.queries'
import * as txQueries from '@/lib/db/queries/cash-transaction.queries'
import {
  createTransaction,
  createTransfer,
  getAccountWithBalance,
  updateAccountSettings,
} from './cash.service'

const FARM = 'farm1'
const USER_ID = 'user-uuid'

beforeEach(() => vi.clearAllMocks())

describe('createTransaction', () => {
  it('throws if amount <= 0', async () => {
    await expect(
      createTransaction(FARM, { accountId: 'acc-1', type: 'in', amount: 0, transactionDate: new Date() }, USER_ID)
    ).rejects.toThrow('Jumlah harus lebih dari 0')
  })

  it('throws if account not found', async () => {
    vi.mocked(accountQueries.findAccountById).mockResolvedValueOnce(null)
    await expect(
      createTransaction(FARM, { accountId: 'acc-1', type: 'in', amount: 100, transactionDate: new Date() }, USER_ID)
    ).rejects.toThrow('Akun tidak ditemukan')
  })

  it('inserts transaction and returns it', async () => {
    const fakeAccount = { id: 'acc-1', name: 'Kas Tunai', type: 'cash' as const, beginningBalance: '0', isActive: true, createdAt: new Date(), updatedAt: null }
    const fakeTx = { id: 'tx-1', accountId: 'acc-1', type: 'in' as const, amount: '100', transactionDate: new Date(), categoryId: null, referenceNumber: null, description: null, transferRefId: null, sourceType: null, sourceId: null, createdBy: USER_ID, createdAt: new Date() }
    vi.mocked(accountQueries.findAccountById).mockResolvedValueOnce(fakeAccount)
    vi.mocked(txQueries.insertTransaction).mockResolvedValueOnce(fakeTx)

    const result = await createTransaction(FARM, { accountId: 'acc-1', type: 'in', amount: 100, transactionDate: new Date() }, USER_ID)
    expect(result).toEqual(fakeTx)
    expect(txQueries.insertTransaction).toHaveBeenCalledWith(
      FARM,
      expect.objectContaining({ accountId: 'acc-1', type: 'in', amount: '100' }),
      undefined
    )
  })
})

describe('createTransfer', () => {
  it('throws if fromAccountId === toAccountId', async () => {
    await expect(
      createTransfer(FARM, { fromAccountId: 'acc-1', toAccountId: 'acc-1', amount: 100, transactionDate: new Date() }, USER_ID)
    ).rejects.toThrow('Akun asal dan tujuan tidak boleh sama')
  })

  it('throws if amount <= 0', async () => {
    await expect(
      createTransfer(FARM, { fromAccountId: 'acc-1', toAccountId: 'acc-2', amount: 0, transactionDate: new Date() }, USER_ID)
    ).rejects.toThrow('Jumlah harus lebih dari 0')
  })

  it('throws if from account not found', async () => {
    vi.mocked(accountQueries.findAccountById).mockResolvedValueOnce(null)
    await expect(
      createTransfer(FARM, { fromAccountId: 'acc-1', toAccountId: 'acc-2', amount: 100, transactionDate: new Date() }, USER_ID)
    ).rejects.toThrow('Akun asal tidak ditemukan')
  })

  it('throws if to account not found', async () => {
    const fakeAccount = { id: 'acc-1', name: 'Kas Tunai', type: 'cash' as const, beginningBalance: '0', isActive: true, createdAt: new Date(), updatedAt: null }
    vi.mocked(accountQueries.findAccountById)
      .mockResolvedValueOnce(fakeAccount)
      .mockResolvedValueOnce(null)
    await expect(
      createTransfer(FARM, { fromAccountId: 'acc-1', toAccountId: 'acc-2', amount: 100, transactionDate: new Date() }, USER_ID)
    ).rejects.toThrow('Akun tujuan tidak ditemukan')
  })
})

describe('updateAccountSettings', () => {
  it('throws if trying to edit beginningBalance when transactions exist', async () => {
    vi.mocked(accountQueries.countTransactionsByAccount).mockResolvedValueOnce(3)
    await expect(
      updateAccountSettings(FARM, 'acc-1', { beginningBalance: '999' })
    ).rejects.toThrow('Saldo awal tidak dapat diubah setelah ada transaksi')
  })

  it('allows editing name without transaction check', async () => {
    const fakeAccount = { id: 'acc-1', name: 'Updated', type: 'cash' as const, beginningBalance: '0', isActive: true, createdAt: new Date(), updatedAt: null }
    vi.mocked(accountQueries.updateAccount).mockResolvedValueOnce(fakeAccount)
    const result = await updateAccountSettings(FARM, 'acc-1', { name: 'Updated' })
    expect(result).toEqual(fakeAccount)
    expect(accountQueries.countTransactionsByAccount).not.toHaveBeenCalled()
  })
})
