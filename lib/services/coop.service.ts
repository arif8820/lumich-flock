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

export async function createCoop(farmSchema: string, input: CreateCoopInput): Promise<Coop> {
  return insertCoop(farmSchema, { ...input, status: 'active' })
}

export async function getAllCoops(farmSchema: string): Promise<Coop[]> {
  return findAllCoops(farmSchema)
}

export async function getCoopById(farmSchema: string, id: string): Promise<Coop | null> {
  return findCoopById(farmSchema, id)
}

export async function updateCoop(farmSchema: string, id: string, input: Partial<CreateCoopInput>): Promise<Coop | null> {
  return dbUpdateCoop(farmSchema, id, input)
}

export async function deactivateCoop(farmSchema: string, id: string): Promise<void> {
  await dbUpdateCoop(farmSchema, id, { status: 'inactive' })
}

export async function activateCoop(farmSchema: string, id: string): Promise<void> {
  await dbUpdateCoop(farmSchema, id, { status: 'active' })
}
