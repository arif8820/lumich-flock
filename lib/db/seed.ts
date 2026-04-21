import { db } from './index'
import { flockPhases } from './schema'

async function seed() {
  await db.insert(flockPhases).values([
    { name: 'Starter', minWeeks: 0, maxWeeks: 6, sortOrder: 1 },
    { name: 'Grower', minWeeks: 7, maxWeeks: 18, sortOrder: 2 },
    { name: 'Layer', minWeeks: 19, maxWeeks: 72, sortOrder: 3 },
    { name: 'Late-layer', minWeeks: 73, maxWeeks: null, sortOrder: 4 },
  ]).onConflictDoNothing()
  console.log('Seed selesai')
  process.exit(0)
}

seed().catch(console.error)
