import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionUrl = process.env.DATABASE_URL
if (!connectionUrl) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const client = postgres(connectionUrl, {
  prepare: false,      // safer with Supabase pooler (both session + transaction mode)
  max: 3,              // allow a few concurrent connections on free-tier pool
  idle_timeout: 20,    // release idle connections after 20s (avoids stale conn on hot reload)
  connect_timeout: 10, // fail fast instead of hanging indefinitely
})

export const db = drizzle(client, { schema })

export type DrizzleTx = Parameters<Parameters<(typeof db)['transaction']>[0]>[0]
