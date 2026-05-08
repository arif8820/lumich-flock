import * as accountQueries from '@/lib/db/queries/cash-account.queries'
import * as txQueries from '@/lib/db/queries/cash-transaction.queries'
import * as categoryQueries from '@/lib/db/queries/cash-category.queries'
import { db } from '@/lib/db'
import type { TransactionFilter } from '@/lib/db/queries/cash-transaction.queries'

export type CreateTransactionInput = {
  accountId: string
  type: 'in' | 'out'
  amount: number
  transactionDate: Date
  categoryId?: string
  referenceNumber?: string
  description?: string
}

export type CreateTransferInput = {
  fromAccountId: string
  toAccountId: string
  amount: number
  transactionDate: Date
  referenceNumber?: string
  description?: string
}

export async function createTransaction(
  farmSchema: string,
  input: CreateTransactionInput,
  userId: string
) {
  if (input.amount <= 0) throw new Error('Jumlah harus lebih dari 0')

  const account = await accountQueries.findAccountById(farmSchema, input.accountId)
  if (!account) throw new Error('Akun tidak ditemukan')

  return txQueries.insertTransaction(farmSchema, {
    accountId: input.accountId,
    type: input.type,
    amount: String(input.amount),
    transactionDate: input.transactionDate,
    categoryId: input.categoryId ?? null,
    referenceNumber: input.referenceNumber ?? null,
    description: input.description ?? null,
    transferRefId: null,
    sourceType: null,
    sourceId: null,
    createdBy: userId,
  }, undefined)
}

export async function createTransfer(
  farmSchema: string,
  input: CreateTransferInput,
  userId: string
) {
  if (input.fromAccountId === input.toAccountId) {
    throw new Error('Akun asal dan tujuan tidak boleh sama')
  }
  if (input.amount <= 0) throw new Error('Jumlah harus lebih dari 0')

  const fromAccount = await accountQueries.findAccountById(farmSchema, input.fromAccountId)
  if (!fromAccount) throw new Error('Akun asal tidak ditemukan')

  const toAccount = await accountQueries.findAccountById(farmSchema, input.toAccountId)
  if (!toAccount) throw new Error('Akun tujuan tidak ditemukan')

  return db.transaction(async (tx) => {
    const outRow = await txQueries.insertTransaction(
      farmSchema,
      {
        accountId: input.fromAccountId,
        type: 'transfer_out',
        amount: input.amount.toFixed(2),
        transactionDate: input.transactionDate,
        categoryId: null,
        referenceNumber: input.referenceNumber ?? null,
        description: input.description ?? null,
        transferRefId: null,
        sourceType: null,
        sourceId: null,
        createdBy: userId,
      },
      tx
    )

    const inRow = await txQueries.insertTransaction(
      farmSchema,
      {
        accountId: input.toAccountId,
        type: 'transfer_in',
        amount: input.amount.toFixed(2),
        transactionDate: input.transactionDate,
        categoryId: null,
        referenceNumber: input.referenceNumber ?? null,
        description: input.description ?? null,
        transferRefId: outRow.id,
        sourceType: null,
        sourceId: null,
        createdBy: userId,
      },
      tx
    )

    await txQueries.updateTransferRefId(farmSchema, outRow.id, inRow.id, tx)

    return { outRow, inRow }
  })
}

export async function getAccountWithBalance(farmSchema: string, id: string) {
  const account = await accountQueries.findAccountById(farmSchema, id)
  if (!account) throw new Error('Akun tidak ditemukan')
  const balance = await accountQueries.getAccountBalance(farmSchema, id)
  return { ...account, currentBalance: balance }
}

export async function listAccountsWithBalances(farmSchema: string) {
  const accounts = await accountQueries.listAccounts(farmSchema)
  return Promise.all(
    accounts.map(async (acc) => ({
      ...acc,
      currentBalance: await accountQueries.getAccountBalance(farmSchema, acc.id),
    }))
  )
}

export async function updateAccountSettings(
  farmSchema: string,
  id: string,
  input: { name?: string; type?: 'cash' | 'bank' | 'ewallet'; beginningBalance?: string; isActive?: boolean }
) {
  if (input.beginningBalance !== undefined) {
    const txCount = await accountQueries.countTransactionsByAccount(farmSchema, id)
    if (txCount > 0) {
      throw new Error('Saldo awal tidak dapat diubah setelah ada transaksi')
    }
  }
  const updated = await accountQueries.updateAccount(farmSchema, id, input)
  if (!updated) throw new Error('Akun tidak ditemukan')
  return updated
}

export async function createAccount(
  farmSchema: string,
  input: { name: string; type: 'cash' | 'bank' | 'ewallet'; beginningBalance?: number }
) {
  return accountQueries.createAccount(farmSchema, {
    name: input.name,
    type: input.type,
    beginningBalance: (input.beginningBalance ?? 0).toFixed(2),
  })
}

export async function getTransactions(farmSchema: string, filter: TransactionFilter) {
  return txQueries.listTransactions(farmSchema, filter)
}

export async function getDailyReport(
  farmSchema: string,
  accountId: string,
  dateFrom: Date,
  dateTo: Date
) {
  return txQueries.getDailyReport(farmSchema, accountId, dateFrom, dateTo)
}

export { categoryQueries }
