export const PERMISSIONS = {
  FLOCK: { VIEW: 'flock.view', CREATE: 'flock.create', UPDATE: 'flock.update', DELETE: 'flock.delete' },
  PRODUKSI: { VIEW: 'produksi.view', CREATE: 'produksi.create', UPDATE: 'produksi.update' },
  STOK: { VIEW: 'stok.view', CREATE: 'stok.create', UPDATE: 'stok.update', ADJUST: 'stok.adjust' },
  KAS: { VIEW: 'kas.view', CREATE: 'kas.create', UPDATE: 'kas.update', DELETE: 'kas.delete' },
  SALES: { VIEW: 'sales.view', CREATE: 'sales.create', APPROVE: 'sales.approve' },
  LAPORAN: { VIEW: 'laporan.view', EXPORT: 'laporan.export' },
  USER: { VIEW: 'user.view', MANAGE: 'user.manage' },
  ROLE: { MANAGE: 'role.manage' },
  COOP: { MANAGE: 'coop.manage' },
} as const

export type PermissionKey = {
  [K in keyof typeof PERMISSIONS]: typeof PERMISSIONS[K][keyof typeof PERMISSIONS[K]]
}[keyof typeof PERMISSIONS]

export const ALL_PERMISSIONS: PermissionKey[] = Object.values(PERMISSIONS)
  .flatMap((module) => Object.values(module)) as PermissionKey[]
