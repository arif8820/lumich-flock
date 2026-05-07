import postgres from 'postgres'
import { readFileSync } from 'fs'
import { join } from 'path'
import { db } from '@/lib/db'
import { farms } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const SCHEMA_NAME_REGEX = /^[a-z][a-z0-9_]{0,62}$/

export async function provisionFarm(schemaName: string, farmName: string): Promise<void> {
  if (!SCHEMA_NAME_REGEX.test(schemaName)) {
    throw new Error(`Invalid schema name: "${schemaName}". Must match /^[a-z][a-z0-9_]{0,62}$/`)
  }

  const directUrl = process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL
  if (!directUrl) throw new Error('DATABASE_URL_DIRECT (or DATABASE_URL) env var not set')

  // Use non-pooler connection for DDL — SET search_path is unsafe with connection pooler
  const directClient = postgres(directUrl, { prepare: false, max: 1 })

  try {
    // 1. Create schema
    await directClient.unsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`)

    // 2. Execute DDL template in schema context
    const templatePath = join(process.cwd(), 'lib/db/farm-template.sql')
    const ddl = readFileSync(templatePath, 'utf-8')
    await directClient.unsafe(`SET search_path = "${schemaName}"; ${ddl}`)

    // 3. Register in public.farms
    const existing = await db.select().from(farms).where(eq(farms.schemaName, schemaName)).limit(1)
    if (existing.length === 0) {
      await db.insert(farms).values({ name: farmName, schemaName })
    }

    console.log(`✓ Farm schema "${schemaName}" provisioned successfully`)
  } finally {
    await directClient.end()
  }
}

// CLI entrypoint
const args = process.argv.slice(2)
if (args.length >= 2) {
  const [schemaName, ...nameParts] = args as [string, ...string[]]
  const farmName = nameParts.join(' ')
  provisionFarm(schemaName, farmName)
    .then(() => process.exit(0))
    .catch((err) => { console.error(err.message); process.exit(1) })
}
