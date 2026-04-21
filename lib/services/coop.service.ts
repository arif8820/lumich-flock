import {
  findAllCoops,
  findCoopById,
  insertCoop,
  updateCoop as dbUpdateCoop,
} from '@/lib/db/queries/coop.queries'
import type { Coop } from '@/lib/db/schema'

type CreateCoopInput = {
  name: string
  capacity?: number
  notes?: string
}

export async function createCoop(input: CreateCoopInput): Promise<Coop> {
  return insertCoop({ ...input, status: 'active' })
}

export async function getAllCoops(): Promise<Coop[]> {
  return findAllCoops()
}

export async function getCoopById(id: string): Promise<Coop | null> {
  return findCoopById(id)
}

export async function updateCoop(id: string, input: Partial<CreateCoopInput>): Promise<Coop | null> {
  return dbUpdateCoop(id, input)
}

export async function deactivateCoop(id: string): Promise<void> {
  await dbUpdateCoop(id, { status: 'inactive' })
}

export async function activateCoop(id: string): Promise<void> {
  await dbUpdateCoop(id, { status: 'active' })
}
