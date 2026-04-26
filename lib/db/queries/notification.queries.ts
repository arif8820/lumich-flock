import { db, DrizzleTx } from '@/lib/db'
import { notifications } from '@/lib/db/schema'
import type { NewNotification } from '@/lib/db/schema'

export async function createNotification(
  notification: NewNotification,
  tx?: DrizzleTx
): Promise<void> {
  const executor = tx ?? db
  await executor.insert(notifications).values(notification)
}
