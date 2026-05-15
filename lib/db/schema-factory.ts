import {
  pgSchema,
  uuid,
  text,
  boolean,
  integer,
  date,
  timestamp,
  numeric,
  uniqueIndex,
  primaryKey,
  varchar,
} from 'drizzle-orm/pg-core'

export function getFarmSchema(schema: string) {
  const s = pgSchema(schema)

  // --- Enums ---
  const coopStatusEnum = s.enum('coop_status', ['active', 'inactive'])
  const movementTypeEnum = s.enum('movement_type', ['in', 'out'])
  const movementSourceEnum = s.enum('movement_source', [
    'production', 'sale', 'adjustment', 'regrade', 'import', 'purchase',
  ])
  const movementSourceTypeEnum = s.enum('movement_source_type', [
    'daily_egg_records', 'daily_feed_records', 'daily_vaccine_records',
    'sales_order_items', 'stock_adjustments', 'regrade_requests',
    'sales_returns', 'import',
  ])
  const regradeStatusEnum = s.enum('regrade_status', ['PENDING', 'APPROVED', 'REJECTED'])
  const customerTypeEnum = s.enum('customer_type', ['retail', 'wholesale', 'distributor'])
  const customerStatusEnum = s.enum('customer_status', ['active', 'inactive', 'blocked'])
  const paymentMethodEnum = s.enum('payment_method', ['cash', 'credit'])
  const salesOrderStatusEnum = s.enum('sales_order_status', ['draft', 'confirmed', 'fulfilled', 'cancelled'])
  const salesItemTypeEnum = s.enum('sales_item_type', ['egg_grade_a', 'egg_grade_b', 'flock', 'other'])
  const salesUnitEnum = s.enum('sales_unit', ['butir', 'ekor', 'unit'])
  const returnReasonTypeEnum = s.enum('return_reason_type', ['wrong_grade', 'damaged', 'quantity_error', 'other'])
  const salesReturnStatusEnum = s.enum('sales_return_status', ['pending', 'approved', 'rejected'])
  const invoiceTypeEnum = s.enum('invoice_type', ['sales_invoice', 'cash_receipt', 'credit_note'])
  const invoiceStatusEnum = s.enum('invoice_status', ['draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled'])
  const paymentMethodTypeEnum = s.enum('payment_method_type', ['cash', 'transfer', 'cheque', 'credit'])
  const creditSourceTypeEnum = s.enum('credit_source_type', ['overpayment', 'credit_note'])
  const correctionEntityTypeEnum = s.enum('correction_entity_type', ['daily_records', 'inventory_movements', 'sales_orders'])
  const notificationTypeEnum = s.enum('notification_type', ['production_alert', 'overdue_invoice', 'stock_warning', 'phase_change', 'other'])
  const notificationTargetRoleEnum = s.enum('notification_target_role', ['operator', 'supervisor', 'admin', 'all'])
  const cashAccountTypeEnum = s.enum('cash_account_type', ['cash', 'bank', 'ewallet'])
  const cashTransactionTypeEnum = s.enum('cash_transaction_type', ['in', 'out', 'transfer_in', 'transfer_out'])
  const cashCategoryTypeEnum = s.enum('cash_category_type', ['in', 'out', 'both'])

  // --- Tables (dependency order) ---

  const roles = s.table('roles', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').unique().notNull(),
    displayName: text('display_name').notNull(),
    isSystem: boolean('is_system').notNull().default(false),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: uuid('created_by'),
  })

  const rolePermissions = s.table('role_permissions', {
    roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
    permissionKey: text('permission_key').notNull(),
    grantedAt: timestamp('granted_at', { withTimezone: true }).defaultNow().notNull(),
    grantedBy: uuid('granted_by'),
  }, (t) => [
    primaryKey({ columns: [t.roleId, t.permissionKey] }),
  ])

  const users = s.table('users', {
    id: uuid('id').primaryKey(), // no defaultRandom — sync'd from Supabase Auth
    email: text('email').unique().notNull(),
    fullName: text('full_name').notNull(),
    phone: text('phone'),
    roleId: uuid('role_id').references(() => roles.id).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdBy: uuid('created_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
  })

  const coops = s.table('coops', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').unique().notNull(),
    capacity: integer('capacity'),
    status: coopStatusEnum('status').default('active').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
  })

  const flocks = s.table('flocks', {
    id: uuid('id').primaryKey().defaultRandom(),
    coopId: uuid('coop_id').notNull().references(() => coops.id),
    name: text('name').notNull(),
    arrivalDate: date('arrival_date', { mode: 'string' }).notNull(),
    docDate: date('doc_date', { mode: 'string' }).notNull(),
    breed: text('breed'),
    notes: text('notes'),
    retiredAt: timestamp('retired_at', { withTimezone: true }),
    isImported: boolean('is_imported').notNull().default(false),
    importedBy: uuid('imported_by').references(() => users.id),
    createdBy: uuid('created_by').references(() => users.id),
    updatedBy: uuid('updated_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
  })

  const flockDeliveries = s.table('flock_deliveries', {
    id: uuid('id').primaryKey().defaultRandom(),
    flockId: uuid('flock_id').notNull().references(() => flocks.id),
    deliveryDate: date('delivery_date', { mode: 'string' }).notNull(),
    quantity: integer('quantity').notNull(),
    ageAtArrivalDays: integer('age_at_arrival_days'),
    notes: text('notes'),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  })

  const flockPhases = s.table('flock_phases', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    minWeeks: integer('min_weeks').notNull(),
    maxWeeks: integer('max_weeks'),
    sortOrder: integer('sort_order').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
  })

  const userCoopAssignments = s.table('user_coop_assignments', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
    coopId: uuid('coop_id').notNull().references(() => coops.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  }, (t) => [
    uniqueIndex('user_coop_assignments_user_coop_idx').on(t.userId, t.coopId),
  ])

  const stockCategories = s.table('stock_categories', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').unique().notNull(),
    unit: text('unit').notNull(),
    isSystem: boolean('is_system').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
  })

  const stockItems = s.table('stock_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    categoryId: uuid('category_id').notNull().references(() => stockCategories.id),
    name: text('name').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    useBundleMethod: boolean('use_bundle_method').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
  }, (t) => [
    uniqueIndex('stock_items_category_name_idx').on(t.categoryId, t.name),
  ])

  const dailyRecords = s.table('daily_records', {
    id: uuid('id').primaryKey().defaultRandom(),
    flockId: uuid('flock_id').notNull().references(() => flocks.id),
    recordDate: date('record_date', { mode: 'string' }).notNull(),
    deaths: integer('deaths').notNull().default(0),
    culled: integer('culled').notNull().default(0),
    eggsCracked: integer('eggs_cracked').notNull().default(0),
    eggsAbnormal: integer('eggs_abnormal').notNull().default(0),
    isLateInput: boolean('is_late_input').notNull().default(false),
    notes: text('notes'),
    isImported: boolean('is_imported').notNull().default(false),
    importedBy: uuid('imported_by').references(() => users.id),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  }, (t) => [
    uniqueIndex('daily_records_flock_date_idx').on(t.flockId, t.recordDate),
  ])

  const dailyEggRecords = s.table('daily_egg_records', {
    id: uuid('id').primaryKey().defaultRandom(),
    dailyRecordId: uuid('daily_record_id').notNull().references(() => dailyRecords.id, { onDelete: 'cascade' }),
    stockItemId: uuid('stock_item_id').notNull().references(() => stockItems.id),
    qtyButir: integer('qty_butir').notNull().default(0),
    qtyKg: numeric('qty_kg', { precision: 8, scale: 2 }).notNull().default('0'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
  }, (t) => [
    uniqueIndex('daily_egg_records_record_item_idx').on(t.dailyRecordId, t.stockItemId),
  ])

  const dailyEggBundles = s.table(
    'daily_egg_bundles',
    {
      id: uuid('id').primaryKey().defaultRandom(),
      dailyEggRecordId: uuid('daily_egg_record_id')
        .notNull()
        .references(() => dailyEggRecords.id, { onDelete: 'cascade' }),
      bundleIndex: integer('bundle_index').notNull(),
      trayCount: integer('tray_count').notNull(),
      topTrayCount: integer('top_tray_count').notNull(),
      qtyButir: integer('qty_butir').notNull(),
      qtyKg: numeric('qty_kg', { precision: 8, scale: 2 }).notNull(),
      bundleCode: varchar('bundle_code', { length: 12 }),
      createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
      updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
    },
    (t) => [
      uniqueIndex('daily_egg_bundles_record_index_unique').on(t.dailyEggRecordId, t.bundleIndex),
    ]
  )

  const dailyFeedRecords = s.table('daily_feed_records', {
    id: uuid('id').primaryKey().defaultRandom(),
    dailyRecordId: uuid('daily_record_id').notNull().references(() => dailyRecords.id, { onDelete: 'cascade' }),
    stockItemId: uuid('stock_item_id').notNull().references(() => stockItems.id),
    qtyUsed: numeric('qty_used', { precision: 8, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
  }, (t) => [
    uniqueIndex('daily_feed_records_record_item_idx').on(t.dailyRecordId, t.stockItemId),
  ])

  const dailyVaccineRecords = s.table('daily_vaccine_records', {
    id: uuid('id').primaryKey().defaultRandom(),
    dailyRecordId: uuid('daily_record_id').notNull().references(() => dailyRecords.id, { onDelete: 'cascade' }),
    stockItemId: uuid('stock_item_id').notNull().references(() => stockItems.id),
    qtyUsed: numeric('qty_used', { precision: 8, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
  }, (t) => [
    uniqueIndex('daily_vaccine_records_record_item_idx').on(t.dailyRecordId, t.stockItemId),
  ])

  const inventoryMovements = s.table('inventory_movements', {
    id: uuid('id').primaryKey().defaultRandom(),
    stockItemId: uuid('stock_item_id').notNull().references(() => stockItems.id),
    flockId: uuid('flock_id').references(() => flocks.id),
    movementType: movementTypeEnum('movement_type').notNull(),
    source: movementSourceEnum('source').notNull(),
    sourceType: movementSourceTypeEnum('source_type'),
    sourceId: uuid('source_id'),
    quantity: integer('quantity').notNull(),
    movementDate: date('movement_date', { mode: 'string' }).notNull(),
    note: text('note'),
    isImported: boolean('is_imported').notNull().default(false),
    importedBy: uuid('imported_by').references(() => users.id),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  })

  const stockAdjustments = s.table('stock_adjustments', {
    id: uuid('id').primaryKey().defaultRandom(),
    stockItemId: uuid('stock_item_id').notNull().references(() => stockItems.id),
    flockId: uuid('flock_id').references(() => flocks.id),
    quantity: integer('quantity').notNull(),
    reason: text('reason').notNull(),
    notes: text('notes'),
    adjustmentDate: date('adjustment_date', { mode: 'string' }).notNull(),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  })

  const regradeRequests = s.table('regrade_requests', {
    id: uuid('id').primaryKey().defaultRandom(),
    fromItemId: uuid('from_item_id').notNull().references(() => stockItems.id),
    toItemId: uuid('to_item_id').notNull().references(() => stockItems.id),
    quantity: integer('quantity').notNull(),
    requestDate: date('request_date', { mode: 'string' }).notNull(),
    status: regradeStatusEnum('status').notNull().default('PENDING'),
    notes: text('notes'),
    createdBy: uuid('created_by').references(() => users.id),
    reviewedBy: uuid('reviewed_by').references(() => users.id),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  })

  const customers = s.table('customers', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    type: customerTypeEnum('type'),
    email: text('email'),
    phone: text('phone'),
    address: text('address'),
    creditLimit: numeric('credit_limit', { precision: 15, scale: 2 }).default('0').notNull(),
    paymentTerms: integer('payment_terms').default(0).notNull(),
    status: customerStatusEnum('status').default('active').notNull(),
    notes: text('notes'),
    isImported: boolean('is_imported').notNull().default(false),
    importedBy: uuid('imported_by').references(() => users.id),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
  })

  const salesOrders = s.table('sales_orders', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderNumber: text('order_number').notNull().unique(),
    orderDate: date('order_date', { mode: 'string' }).notNull(),
    customerId: uuid('customer_id').notNull().references(() => customers.id),
    paymentMethod: paymentMethodEnum('payment_method').notNull(),
    status: salesOrderStatusEnum('status').notNull().default('draft'),
    taxPct: numeric('tax_pct', { precision: 5, scale: 2 }).default('0').notNull(),
    subtotal: numeric('subtotal', { precision: 15, scale: 2 }).notNull(),
    taxAmount: numeric('tax_amount', { precision: 15, scale: 2 }).notNull(),
    totalAmount: numeric('total_amount', { precision: 15, scale: 2 }).notNull(),
    notes: text('notes'),
    createdBy: uuid('created_by').references(() => users.id),
    updatedBy: uuid('updated_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
  })

  const salesOrderItems = s.table('sales_order_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').notNull().references(() => salesOrders.id),
    itemType: salesItemTypeEnum('item_type').notNull(),
    itemRefId: uuid('item_ref_id'),
    description: text('description'),
    quantity: integer('quantity').notNull(),
    unit: salesUnitEnum('unit').notNull(),
    pricePerUnit: numeric('price_per_unit', { precision: 15, scale: 2 }).notNull(),
    discountPct: numeric('discount_pct', { precision: 5, scale: 2 }).notNull().default('0'),
    subtotal: numeric('subtotal', { precision: 15, scale: 2 }).notNull(),
  })

  const salesReturns = s.table('sales_returns', {
    id: uuid('id').primaryKey().defaultRandom(),
    returnNumber: text('return_number').notNull().unique(),
    orderId: uuid('order_id').notNull().references(() => salesOrders.id),
    customerId: uuid('customer_id').notNull().references(() => customers.id),
    returnDate: date('return_date', { mode: 'string' }).notNull(),
    reasonType: returnReasonTypeEnum('reason_type').notNull(),
    notes: text('notes'),
    status: salesReturnStatusEnum('status').notNull().default('pending'),
    submittedBy: uuid('submitted_by').references(() => users.id),
    reviewedBy: uuid('reviewed_by').references(() => users.id),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
  })

  const salesReturnItems = s.table('sales_return_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    returnId: uuid('return_id').notNull().references(() => salesReturns.id),
    itemType: salesItemTypeEnum('item_type').notNull(),
    itemRefId: uuid('item_ref_id'),
    quantity: integer('quantity').notNull(),
    unit: salesUnitEnum('unit').notNull(),
  })

  const invoices = s.table('invoices', {
    id: uuid('id').primaryKey().defaultRandom(),
    invoiceNumber: text('invoice_number').notNull().unique(),
    type: invoiceTypeEnum('type').notNull(),
    orderId: uuid('order_id').references(() => salesOrders.id),
    referenceInvoiceId: uuid('reference_invoice_id'),
    returnId: uuid('return_id').references(() => salesReturns.id),
    customerId: uuid('customer_id').notNull().references(() => customers.id),
    issueDate: date('issue_date', { mode: 'string' }).notNull(),
    dueDate: date('due_date', { mode: 'string' }).notNull(),
    totalAmount: numeric('total_amount', { precision: 15, scale: 2 }).notNull(),
    paidAmount: numeric('paid_amount', { precision: 15, scale: 2 }).default('0').notNull(),
    status: invoiceStatusEnum('status').notNull(),
    pdfUrl: text('pdf_url'),
    pdfGeneratedAt: timestamp('pdf_generated_at', { withTimezone: true }),
    notes: text('notes'),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
  })

  const payments = s.table('payments', {
    id: uuid('id').primaryKey().defaultRandom(),
    invoiceId: uuid('invoice_id').notNull().references(() => invoices.id),
    paymentDate: date('payment_date', { mode: 'string' }).notNull(),
    amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
    method: paymentMethodTypeEnum('method').notNull(),
    referenceNumber: text('reference_number'),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
  })

  const customerCredits = s.table('customer_credits', {
    id: uuid('id').primaryKey().defaultRandom(),
    customerId: uuid('customer_id').notNull().references(() => customers.id),
    amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
    sourceType: creditSourceTypeEnum('source_type').notNull(),
    sourcePaymentId: uuid('source_payment_id').references(() => payments.id),
    sourceInvoiceId: uuid('source_invoice_id').references(() => invoices.id),
    usedAmount: numeric('used_amount', { precision: 15, scale: 2 }).notNull().default('0'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  })

  const correctionRecords = s.table('correction_records', {
    id: uuid('id').primaryKey().defaultRandom(),
    entityType: correctionEntityTypeEnum('entity_type').notNull(),
    entityId: uuid('entity_id').notNull(),
    fieldName: text('field_name').notNull(),
    oldValue: text('old_value'),
    newValue: text('new_value'),
    reason: text('reason').notNull(),
    correctedBy: uuid('corrected_by').notNull().references(() => users.id),
    correctedAt: timestamp('corrected_at', { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  })

  const notifications = s.table('notifications', {
    id: uuid('id').primaryKey().defaultRandom(),
    type: notificationTypeEnum('type').notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    targetRole: notificationTargetRoleEnum('target_role').notNull(),
    relatedEntityType: text('related_entity_type'),
    relatedEntityId: uuid('related_entity_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  })

  const notificationReads = s.table('notification_reads', {
    id: uuid('id').primaryKey().defaultRandom(),
    notificationId: uuid('notification_id').notNull().references(() => notifications.id),
    userId: uuid('user_id').notNull().references(() => users.id),
    readAt: timestamp('read_at', { withTimezone: true }).defaultNow().notNull(),
  }, (t) => [
    uniqueIndex('notification_reads_notif_user_idx').on(t.notificationId, t.userId),
  ])

  const alertCooldowns = s.table('alert_cooldowns', {
    id: uuid('id').primaryKey().defaultRandom(),
    alertType: text('alert_type').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: uuid('entity_id').notNull(),
    lastSentAt: timestamp('last_sent_at', { withTimezone: true }).notNull(),
  }, (t) => [
    uniqueIndex('alert_cooldowns_unique').on(t.alertType, t.entityId),
  ])

  const appSettings = s.table('app_settings', {
    key: text('key').primaryKey().notNull(),
    value: text('value').notNull(),
    updatedBy: uuid('updated_by').references(() => users.id),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()).notNull(),
  })

  const cashCategories = s.table('cash_categories', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    type: cashCategoryTypeEnum('type').notNull(),
    isActive: boolean('is_active').notNull().default(true),
  })

  const cashAccounts = s.table('cash_accounts', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    type: cashAccountTypeEnum('type').notNull(),
    beginningBalance: numeric('beginning_balance', { precision: 15, scale: 2 }).notNull().default('0'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
  })

  const cashTransactions = s.table('cash_transactions', {
    id: uuid('id').primaryKey().defaultRandom(),
    accountId: uuid('account_id').notNull().references(() => cashAccounts.id),
    type: cashTransactionTypeEnum('type').notNull(),
    amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
    transactionDate: date('transaction_date', { mode: 'string' }).notNull(),
    categoryId: uuid('category_id').references(() => cashCategories.id),
    referenceNumber: text('reference_number'),
    description: text('description'),
    transferRefId: uuid('transfer_ref_id'),
    sourceType: text('source_type'),
    sourceId: uuid('source_id'),
    createdBy: uuid('created_by').notNull().references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  })

  return {
    roles,
    rolePermissions,
    users,
    coops,
    flocks,
    flockDeliveries,
    flockPhases,
    userCoopAssignments,
    stockCategories,
    stockItems,
    dailyRecords,
    dailyEggRecords,
    dailyEggBundles,
    dailyFeedRecords,
    dailyVaccineRecords,
    inventoryMovements,
    stockAdjustments,
    regradeRequests,
    customers,
    salesOrders,
    salesOrderItems,
    salesReturns,
    salesReturnItems,
    invoices,
    payments,
    customerCredits,
    correctionRecords,
    notifications,
    notificationReads,
    alertCooldowns,
    appSettings,
    cashCategories,
    cashAccounts,
    cashTransactions,
  }
}

export type FarmTables = ReturnType<typeof getFarmSchema>
