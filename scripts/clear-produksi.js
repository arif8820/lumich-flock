const postgres = require('postgres')

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// Set FARM_SCHEMA to the target schema, e.g.: FARM_SCHEMA=farm_uat_test node scripts/clear-produksi.js
const FARM_SCHEMA = process.env.FARM_SCHEMA
if (!FARM_SCHEMA) {
  console.error('ERROR: FARM_SCHEMA env var required. Example:')
  console.error('  FARM_SCHEMA=farm_uat_test node scripts/clear-produksi.js')
  process.exit(1)
}

const sql = postgres({
  host: 'db.uwgylqnfujyhnoxqiash.supabase.co',
  port: 5432,
  database: 'postgres',
  username: 'postgres',
  password: 'IT3mBBw5lsZ86ho4',
  prepare: false,
  max: 1,
  ssl: { rejectUnauthorized: false },
})

// Tables in dependency order (children first, parents last)
// Scope B: produksi harian + stok movements. Master data (flocks, stock_items, coops) untouched.
const TABLES = [
  'bundle_contributions',    // FK → daily_egg_bundles
  'daily_egg_bundles',       // FK → daily_egg_records
  'daily_egg_records',       // FK → daily_records
  'daily_feed_records',      // FK → daily_records
  'daily_vaccine_records',   // FK → daily_records
  'correction_records',      // audit trail for past-lock edits
  'inventory_movements',     // ledger
  'inventory_snapshots',     // nightly cache (may not exist)
  'stock_adjustments',       // FK → inventory_movements
  'regrade_requests',        // FK → inventory_movements
  'daily_records',           // parent of all daily_* tables
]

async function run() {
  console.log(`\nTarget schema: ${FARM_SCHEMA}`)
  console.log('─'.repeat(50))

  // Verify schema exists
  const schemas = await sql`
    SELECT schema_name FROM information_schema.schemata
    WHERE schema_name = ${FARM_SCHEMA}
  `
  if (schemas.length === 0) {
    console.error(`ERROR: Schema "${FARM_SCHEMA}" does not exist.`)
    await sql.end()
    process.exit(1)
  }

  // Verify connection to schema
  await sql`SET search_path TO ${sql(FARM_SCHEMA)}, public`

  for (const table of TABLES) {
    // Check if table exists in schema
    const exists = await sql`
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = ${FARM_SCHEMA} AND table_name = ${table}
    `
    if (exists.length === 0) {
      console.log(`  SKIP  ${table} (table not found)`)
      continue
    }

    const before = await sql`SELECT count(*) AS n FROM ${sql(FARM_SCHEMA)}.${sql(table)}`
    const n = parseInt(before[0].n)

    if (n === 0) {
      console.log(`  OK    ${table} (already empty)`)
      continue
    }

    await sql`DELETE FROM ${sql(FARM_SCHEMA)}.${sql(table)}`
    console.log(`  CLEAR ${table} — deleted ${n} rows`)
  }

  console.log('─'.repeat(50))
  console.log('Done.')
  await sql.end()
}

run().catch(async (err) => {
  console.error('FATAL:', err.message)
  await sql.end()
  process.exit(1)
})
