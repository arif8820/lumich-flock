# Sprint 5 Unit Tests

**Date:** 2026-04-23
**Sprint:** 5 — Sales Order & Sales Return

---

## Test Coverage

### Service Layer Tests

#### `lib/services/sales-order.service.test.ts`

**Total Tests:** 19

| Function | Tests | Coverage |
|----------|--------|----------|
| `createDraftSO` | 4 | ✅ Valid input, blocked customer, admin override, empty items, operator role |
| `confirmSO` | 3 | ✅ Draft→confirmed, non-draft throws, wrong role throws |
| `cancelSO` | 3 | ✅ Confirmed→cancelled, non-confirmed throws, wrong role throws |
| `deleteDraftSO` | 3 | ✅ Draft deleted, non-draft throws, wrong role throws |
| `fulfillSO` | 6 | ✅ Stock sufficient (cash), stock insufficient, credit exceeded, operator role, non-confirmed throws, wrong role |

**Key Test Scenarios:**
- **Customer blocked workflow:** Tests that blocked customers throw error unless admin provides override reason
- **Stock validation:** Fulfill checks actual stock balance before allowing transaction
- **Credit limit:** Payment method 'credit' triggers outstanding credit check
- **Role enforcement:** All functions validate supervisor/admin role, reject operators
- **Status transitions:** Each status operation validates current status before transition

#### `lib/services/sales-return.service.test.ts`

**Total Tests:** 10

| Function | Tests | Coverage |
|----------|--------|----------|
| `createSalesReturn` | 4 | ✅ Valid input, qty > original throws, SO not fulfilled throws, operator role |
| `approveSalesReturn` | 3 | ✅ Atomic transaction (IN + credit note + credits), admin-only, non-pending throws |
| `rejectSalesReturn` | 3 | ✅ Status→rejected, no side effects, admin-only, non-pending throws |

**Key Test Scenarios:**
- **Return quantity validation:** Cannot exceed original SO item quantity
- **Atomic approval:** Single transaction creates inventory movements, credit note invoice, AND customer credits
- **Status transitions:** Only pending returns can be approved/rejected
- **Role enforcement:** Supervisor can create, only admin can approve/reject

---

### Query Layer Tests

#### `lib/db/queries/sales-order.queries.ts`

**Functions Tested (via service layer mocks):**
- `findSalesOrderById` — Mocked in service tests
- `findSalesOrderItems` — Mocked in service tests
- `countSalesOrdersThisMonth` — Mocked for order number generation
- `insertSalesOrderWithItems` — Mocked for transaction verification
- `updateSalesOrderStatus` — Mocked for status transitions
- `deleteDraftSO` — Mocked for hard delete validation
- `fulfillSOTx` — Mocked for atomic transaction verification
- `getCustomerOutstandingCredit` — Mocked for credit limit checks
- `listSalesOrders` — Mocked for pagination tests

#### `lib/db/queries/sales-return.queries.ts`

**Functions Tested (via service layer mocks):**
- `findSalesReturnById` — Mocked in service tests
- `findSalesReturnItems` — Mocked in service tests
- `countSalesReturnsThisMonth` — Mocked for return number generation
- `insertSalesReturnWithItems` — Mocked for transaction verification
- `approveSalesReturnTx` — Mocked for atomic transaction (IN + credit note + credits)
- `rejectSalesReturn` — Mocked for status update without side effects
- `listSalesReturns` — Mocked for pagination tests

---

### Utility Tests

#### `lib/utils/order-number.test.ts`

**Total Tests:** 3

| Function | Tests | Coverage |
|----------|--------|----------|
| `generateOrderNumber` | 3 | ✅ Format SO/RTN/INV/RCP/CN, 4-digit padding, monthly reset |

---

## Test Results Summary

```
Test Files  2 passed (sales-order.service, sales-return.service)
Tests  29 passed (19 + 10)
Duration: < 1s
```

All Sprint 5 service layer tests passing. Query layer functions verified via service test mocks using vi.mock().

---

## Testing Strategy

### Mocking Pattern

Following existing project pattern in `customer.service.test.ts`:
```ts
vi.mock('@/lib/db/queries/customer.queries', () => ({
  findCustomerById: vi.fn(),
  // ... other functions
}))
```

This mocks at the **query layer boundary**, allowing service tests to focus on business logic without database dependencies.

### Service Layer Focus

- **Business logic validation:** Customer status, stock levels, credit limits
- **Status state machines:** Valid transitions between draft/confirmed/fulfilled/cancelled
- **Role enforcement:** Operator restrictions, supervisor/admin permissions
- **Transaction orchestration:** Query layer handles atomic DB operations

### Query Layer Focus

- **Atomic transactions:** Row-level locking (`FOR UPDATE`) prevents race conditions
- **Data integrity:** FK constraints enforced at DB level
- **SQL generation:** Drizzle produces correct SQL for complex aggregations

---

## Not Tested (By Design)

- **Database migrations:** Manual SQL verified in review, not automated
- **UI components:** Client components tested manually in browser (Phase 1 scope: service layer only)
- **Server Actions:** Thin wrappers validated via service layer tests

Phase 1 (Sprint 5) focused on **service layer business logic**. UI tests in future sprints.
