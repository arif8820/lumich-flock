const postgres = require('postgres')

// Use session mode pooler port 5432 with options.connection to set search_path
// Alternatively try the direct host
const sql = postgres({
  host: 'db.uwgylqnfujyhnoxqiash.supabase.co',
  port: 5432,
  database: 'postgres',
  username: 'postgres',
  password: 'IT3mBBw5lsZ86ho4',
  prepare: false,
  max: 1,
  ssl: { rejectUnauthorized: false },
  connection: { options: '-c search_path=farm3,public' }
})

async function run() {
  try {
    const check = await sql`SELECT count(*) FROM role_permissions WHERE 1=0`
    console.log('connection OK, table accessible')
  } catch(e) { console.log('check error:', e.message); await sql.end(); return }

  const r1 = await sql`
    INSERT INTO role_permissions (role_id, permission_key)
    SELECT r.id, p.key FROM roles r
    CROSS JOIN (VALUES
      ('laporan.view'),('laporan.export'),
      ('laporan.produksi.view'),('laporan.flock.view'),
      ('laporan.stok.view'),('laporan.stok.mutasi.view'),
      ('laporan.penjualan.view'),('laporan.keuangan.view')
    ) AS p(key)
    WHERE r.name = 'supervisor'
    ON CONFLICT DO NOTHING
  `
  console.log('supervisor: inserted', r1.count, 'rows')

  const r2 = await sql`
    INSERT INTO role_permissions (role_id, permission_key)
    SELECT r.id, p.key FROM roles r
    CROSS JOIN (VALUES
      ('laporan.view'),('laporan.export'),
      ('laporan.produksi.view'),('laporan.flock.view'),
      ('laporan.stok.view'),('laporan.penjualan.view')
    ) AS p(key)
    WHERE r.name = 'operator'
    ON CONFLICT DO NOTHING
  `
  console.log('operator: inserted', r2.count, 'rows')

  await sql.end()
}

run().catch(e => { console.log('ERROR:', e.message); process.exit(1) })
