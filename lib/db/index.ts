import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionUrl = process.env.DATABASE_URL
if (!connectionUrl) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const client = postgres(connectionUrl, {
  prepare: false, // required for Supabase Transaction pooler
  max: 1,         // cap connections; free-tier pooler hits limit quickly in dev
})

export const db = drizzle(client, { schema })

export type DrizzleTx = Parameters<Parameters<(typeof db)['transaction']>[0]>[0]
