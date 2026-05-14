export const PERMISSIONS = {
  FLOCK: { VIEW: 'flock.view', CREATE: 'flock.create', UPDATE: 'flock.update', DELETE: 'flock.delete' },
  PRODUKSI: { VIEW: 'produksi.view', CREATE: 'produksi.create', UPDATE: 'produksi.update' },
  STOK: { VIEW: 'stok.view', CREATE: 'stok.create', UPDATE: 'stok.update', ADJUST: 'stok.adjust' },
  KAS: { VIEW: 'kas.view', CREATE: 'kas.create', UPDATE: 'kas.update', DELETE: 'kas.delete' },
  SALES: { VIEW: 'sales.view', CREATE: 'sales.create', APPROVE: 'sales.approve' },
  LAPORAN: {
    VIEW: 'laporan.view',
    EXPORT: 'laporan.export',
    PRODUKSI: { VIEW: 'laporan.produksi.view' },
    FLOCK: { VIEW: 'laporan.flock.view' },
    STOK: {
      VIEW: 'laporan.stok.view',
      MUTASI: { VIEW: 'laporan.stok.mutasi.view' },
    },
    PENJUALAN: { VIEW: 'laporan.penjualan.view' },
    KEUANGAN: { VIEW: 'laporan.keuangan.view' },
  },
  USER: { VIEW: 'user.view', MANAGE: 'user.manage' },
  ROLE: { MANAGE: 'role.manage' },
  COOP: { MANAGE: 'coop.manage' },
} as const

type Leaf<T> = T extends string ? T : { [K in keyof T]: Leaf<T[K]> }[keyof T]

export type PermissionKey = Leaf<typeof PERMISSIONS>

function flattenPermissions(obj: Record<string, unknown>): string[] {
  return Object.values(obj).flatMap((v) =>
    typeof v === 'string' ? [v] : flattenPermissions(v as Record<string, unknown>)
  )
}

export const ALL_PERMISSIONS: PermissionKey[] = flattenPermissions(
  PERMISSIONS as unknown as Record<string, unknown>
) as PermissionKey[]
