import { pgTable, uuid, text, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { roles } from './roles'

export const rolePermissions = pgTable('role_permissions', {
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionKey: text('permission_key').notNull(),
  grantedAt: timestamp('granted_at', { withTimezone: true }).defaultNow().notNull(),
  grantedBy: uuid('granted_by'),
}, (t) => [
  primaryKey({ columns: [t.roleId, t.permissionKey] }),
])

export type RolePermission = typeof rolePermissions.$inferSelect
export type NewRolePermission = typeof rolePermissions.$inferInsert
