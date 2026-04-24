import { db } from './index'
import { customers, flocks, inventoryMovements } from './schema'
import { eq, and } from 'drizzle-orm'

async function seedSalesTestData() {
  console.log('Seeding sales test data...')

  // Check if customers exist
  const existingCustomers = await db.select({ id: customers.id }).from(customers).limit(1)

  if (existingCustomers.length === 0) {
    await db.execute(`
      INSERT INTO customers (id, name, type, credit_limit, status, created_by)
      VALUES
        (gen_random_uuid(), 'Toko Maju', 'retail', '10000000', 'active', gen_random_uuid()),
        (gen_random_uuid(), 'Toko Diblokir', 'retail', '5000000', 'blocked', gen_random_uuid())
    `)
    console.log('Inserted test customers')
  } else {
    console.log('Test customers already exist')
  }

  // Check if flock exists
  const existingFlock = await db.select({ id: flocks.id }).from(flocks).where(eq(flocks.id, 'flock-test-1')).limit(1)

  if (existingFlock.length === 0) {
    await db.execute(`
      INSERT INTO flocks (id, coop_id, name, arrival_date, initial_count, status, created_by)
      VALUES (gen_random_uuid(), 'coop-test-1', 'Flock Test 1', '2026-01-01', 10000, 'active', gen_random_uuid())
    `)
    console.log('Inserted test flock')
  } else {
    console.log('Test flock already exists')
  }

  // Check if stock exists
  const existingStock = await db.select().from(inventoryMovements).where(and(eq(inventoryMovements.source, 'import'), eq(inventoryMovements.flockId, 'flock-test-1'))).limit(1)

  if (existingStock.length === 0) {
    await db.execute(`
      INSERT INTO inventory_movements (flock_id, movement_type, source, source_type, grade, quantity, movement_date, created_by)
      VALUES
        ('flock-test-1', 'in', 'sales-seeded', 'import', 'A', 5000, NOW(), gen_random_uuid()),
        ('flock-test-1', 'in', 'sales-seeded', 'import', 'B', 3000, NOW(), gen_random_uuid())
    `)
    console.log('Inserted test inventory')
  } else {
    console.log('Test inventory already exists')
  }

  console.log('Sales test data seeded successfully!')
}

seedSalesTestData().catch(console.error)
