# UAT: Dynamic RBAC (Role-Based Access Control)

**Feature:** Dynamic Role-Based Access Control for lumich-flock ERP  
**Version:** Phase 1 Foundation  
**Date Created:** 2026-05-11  
**Document Owner:** QA Team  

---

## Overview

This document defines User Acceptance Test (UAT) scenarios for the Dynamic RBAC feature in lumich-flock. The feature enables administrators to create custom roles, assign granular permissions, and enforce access control across all modules without requiring users to re-login (permission changes take effect within ~60 seconds).

**System Architecture:**
- Three built-in roles: Admin (system), Supervisor, Operator
- Admin can create unlimited custom roles (e.g., "Kasir", "Gudang")
- Permission matrix model: Admin toggles permissions per role via `/admin/roles` UI
- Deny by default: if a permission is not granted, access is denied
- Permission enforcement: server action level (not just UI filtering)
- Cache duration: ~60 seconds for permission checks

---

## Prerequisites

- [ ] Test environment is running with latest `rbac` branch code
- [ ] PostgreSQL schema includes `roles`, `role_permissions`, and `user_roles` tables
- [ ] Supabase project is initialized with three default roles: Admin, Supervisor, Operator
- [ ] Test users exist with different roles assigned:
  - Admin user (e.g., `admin@test.com`)
  - Supervisor user (e.g., `supervisor@test.com`)
  - Operator user (e.g., `operator@test.com`)
  - Unassigned user (e.g., `newuser@test.com`)
- [ ] All modules are deployed and accessible: Flock, Produksi, Stok, Kas, Penjualan, Laporan, Admin
- [ ] Browser cache and cookies are cleared before starting UAT
- [ ] Network speed is throttled to "Slow 3G" to verify cache behavior (optional but recommended)

---

## Test Scenarios

### Scenario 1: Default Role Behavior (Out-of-the-Box)

**Objective:** Verify that default built-in roles maintain backward-compatible permissions after migration.

#### 1.1 Admin Role Retains Full Access

- [ ] Log in as Admin user (`admin@test.com`)
- [ ] Verify sidebar displays all modules: Flock, Produksi, Stok, Kas, Penjualan, Laporan, Admin
- [ ] Navigate to `/flock` → page loads successfully
- [ ] Navigate to `/produksi` → page loads successfully
- [ ] Navigate to `/stok` → page loads successfully
- [ ] Navigate to `/kas` → page loads successfully
- [ ] Navigate to `/penjualan` → page loads successfully
- [ ] Navigate to `/laporan` → page loads successfully
- [ ] Navigate to `/admin/users` → page loads successfully
- [ ] Navigate to `/admin/roles` → page loads successfully
- [ ] Navigate to `/admin/kandang` → page loads successfully

**Expected:** All modules are accessible. Admin user sees full functionality without restrictions.

#### 1.2 Supervisor Role Has Backward-Compatible Permissions

- [ ] Log in as Supervisor user (`supervisor@test.com`)
- [ ] Verify sidebar displays: Flock, Stok, Penjualan, Kas, Laporan, User (but NOT Produksi, Role, Kandang)
- [ ] Navigate to `/flock` → page loads (flock.view permission)
- [ ] Navigate to `/stok` → page loads (stok.view permission)
- [ ] Navigate to `/penjualan` → page loads (penjualan.view permission)
- [ ] Navigate to `/kas` → page loads (kas.view permission)
- [ ] Navigate to `/laporan` → page loads (laporan.view permission)
- [ ] Navigate to `/admin/users` → page loads (user.view permission)
- [ ] Try to navigate to `/produksi` → redirected to `/forbidden` (no produksi.view)
- [ ] Try to navigate to `/admin/roles` → redirected to `/forbidden` (no role.manage)
- [ ] Try to navigate to `/admin/kandang` → redirected to `/forbidden` (no kandang.manage)

**Expected:** Supervisor can only access modules with explicit permissions. Navigation to forbidden modules returns 403 Forbidden.

#### 1.3 Operator Role Has Backward-Compatible Permissions

- [ ] Log in as Operator user (`operator@test.com`)
- [ ] Verify sidebar displays: Produksi, Stok, Flock (NOT Kas, Penjualan, Laporan, Admin, Role)
- [ ] Navigate to `/produksi` → page loads (produksi.view, produksi.create)
- [ ] Navigate to `/stok` → page loads (stok.view permission)
- [ ] Navigate to `/flock` → page loads (flock.view permission)
- [ ] Try to navigate to `/kas` → redirected to `/forbidden` (no kas.view)
- [ ] Try to navigate to `/penjualan` → redirected to `/forbidden` (no penjualan.view)
- [ ] Try to navigate to `/laporan` → redirected to `/forbidden` (no laporan.view)
- [ ] Try to navigate to `/admin/users` → redirected to `/forbidden` (no user.view)

**Expected:** Operator can only access assigned modules. Other modules are forbidden.

---

### Scenario 2: Create Custom Role

**Objective:** Verify that Admin can create new roles through the UI and they appear in the role list.

#### 2.1 Admin Accesses Role Management

- [ ] Log in as Admin user
- [ ] Navigate to `/admin/roles`
- [ ] Page loads with heading "Manajemen Peran" (Role Management)
- [ ] Existing roles displayed: Admin (SISTEM), Supervisor, Operator

**Expected:** Role management page is accessible and shows all default roles with Admin marked as SISTEM.

#### 2.2 Create New Role "Kasir"

- [ ] Click button "Tambah Peran" (Add Role) on `/admin/roles`
- [ ] Modal or form appears with fields: Role Name, Display Name
- [ ] Enter Role Name: `kasir`
- [ ] Enter Display Name: `Kasir`
- [ ] Click "Buat Peran" (Create Role) button
- [ ] Form closes/redirects
- [ ] New role "Kasir" appears in role list below Operator

**Expected:** New role is created and immediately visible in the role list.

#### 2.3 Create Another Role "Gudang"

- [ ] Click "Tambah Peran" (Add Role)
- [ ] Enter Role Name: `gudang`
- [ ] Enter Display Name: `Gudang`
- [ ] Click "Buat Peran" (Create Role)
- [ ] Role "Gudang" appears in role list

**Expected:** Multiple custom roles can be created.

#### 2.4 Non-Admin Cannot Access Role Management

- [ ] Open new browser/tab, log in as Supervisor
- [ ] Navigate directly to `/admin/roles` in URL bar
- [ ] Page shows `/forbidden` or redirects to `/dashboard`
- [ ] Sidebar does NOT show "Peran" (Roles) option

- [ ] Repeat with Operator user
- [ ] Same result: access denied to `/admin/roles`

**Expected:** Only Admin users can access role management pages. Supervisor and Operator are forbidden.

---

### Scenario 3: Assign Permissions to Custom Role

**Objective:** Verify that Admin can toggle permissions for custom roles via the permission matrix UI.

#### 3.1 Open Permission Matrix for Kasir Role

- [ ] Log in as Admin
- [ ] Navigate to `/admin/roles`
- [ ] Click on "Kasir" role in the list
- [ ] Permission matrix form opens showing all modules and permissions:
  - Flock (view, create, update, delete)
  - Produksi (view, create, update)
  - Stok (view, create, update, adjust)
  - Kas (view, create, update, delete)
  - Penjualan (view, create, approve)
  - Laporan (view, export)
  - User (view, manage)
  - Role (manage)
  - Kandang (manage)
- [ ] All checkboxes are unchecked (no permissions yet)

**Expected:** Permission matrix displays correctly with all permissions unchecked for the new role.

#### 3.2 Toggle kas.view Permission

- [ ] Locate "Kas" module row in the matrix
- [ ] Find "view" checkbox under "Kas"
- [ ] Click checkbox to toggle ON
- [ ] Checkbox is now checked

**Expected:** Checkbox state changes immediately. No "Save" button needed (auto-save on toggle).

#### 3.3 Toggle kas.create Permission

- [ ] In the same "Kas" row, find "create" checkbox
- [ ] Click checkbox to toggle ON
- [ ] Checkbox is now checked

**Expected:** Both kas.view and kas.create are now enabled.

#### 3.4 Toggle kas.update Permission

- [ ] In the same "Kas" row, find "update" checkbox
- [ ] Click checkbox to toggle ON
- [ ] Checkbox is now checked

**Expected:** Three Kas permissions are enabled.

#### 3.5 Verify Auto-Save (No Explicit Save Button)

- [ ] Refresh the page (F5)
- [ ] Navigate back to Kasir role
- [ ] kas.view, kas.create, kas.update remain checked
- [ ] kas.delete is still unchecked

**Expected:** Permission changes persist without explicit save action (auto-save functionality works).

#### 3.6 Toggle Multiple Permissions for Gudang Role

- [ ] Click on "Gudang" role
- [ ] Toggle ON: stok.view, stok.create, stok.adjust
- [ ] Toggle ON: produksi.view, produksi.create
- [ ] Verify checkboxes are updated

**Expected:** Multiple permissions can be toggled in sequence. Each is auto-saved.

---

### Scenario 4: Assign User to Custom Role

**Objective:** Verify that Admin can assign users to custom roles and the assignment is persisted.

#### 4.1 Assign User to Kasir Role

- [ ] Log in as Admin
- [ ] Navigate to `/admin/users`
- [ ] Find test user "newuser@test.com" (or create if not exists)
- [ ] Click on user row to open user details/edit form
- [ ] Dropdown/select for "Role" is visible
- [ ] Current role is "(None)" or "Unassigned"
- [ ] Click role dropdown
- [ ] Select "Kasir" from dropdown
- [ ] Save user (click "Simpan" or auto-save if applicable)
- [ ] Return to user list
- [ ] Verify "newuser@test.com" now shows "Kasir" as role

**Expected:** User is assigned to Kasir role successfully. Role change is visible in user list.

#### 4.2 Assign Another User to Gudang Role

- [ ] In `/admin/users`, find another test user (e.g., `gudang-user@test.com`)
- [ ] Open user details
- [ ] Select "Gudang" from role dropdown
- [ ] Save user
- [ ] Verify role is updated to "Gudang"

**Expected:** Multiple users can be assigned to different custom roles.

#### 4.3 Verify Role Assignment Persists

- [ ] Refresh `/admin/users` page
- [ ] "newuser@test.com" still shows role "Kasir"
- [ ] "gudang-user@test.com" still shows role "Gudang"

**Expected:** Role assignments persist across page refreshes.

---

### Scenario 5: Verify Permission Enforcement — Server Action Level

**Objective:** Confirm that permissions are enforced at the server action/API layer, not just UI filtering.

#### 5.1 Kasir User Cannot Access Forbidden Modules via Server Action

- [ ] Log in as the Kasir user ("newuser@test.com")
- [ ] Verify sidebar only shows "Kas" module (sidebar filtering works)
- [ ] Manually try to call a server action for a forbidden module, e.g., create a flock:
  - Open browser developer console → Network tab
  - Or use curl/Postman to call the server action endpoint directly with proper auth
- [ ] Attempt to create a flock entry:
  ```
  POST /api/actions/flock/createFlock
  Body: { name: "Test Flock", ... }
  ```
- [ ] Response returns: `{ success: false, error: "Akses ditolak" }`

**Expected:** Server action rejects the request because Kasir role does not have flock.create permission. Error message is in Indonesian.

#### 5.2 Kasir User CAN Access kas.create Server Action

- [ ] Kasir user attempts to create a Kas entry:
  ```
  POST /api/actions/kas/createKas
  Body: { description: "Test", amount: 1000, ... }
  ```
- [ ] Response returns: `{ success: true, data: { id: "...", ... } }`
- [ ] Entry is created successfully

**Expected:** Kas creation succeeds because Kasir has kas.create permission.

#### 5.3 Kasir User CANNOT Delete Kas Entry (No Delete Permission)

- [ ] Kasir user attempts to delete a Kas entry:
  ```
  POST /api/actions/kas/deleteKas
  Body: { kasId: "..." }
  ```
- [ ] Response returns: `{ success: false, error: "Akses ditolak" }`

**Expected:** Delete fails because Kasir role only has kas.view, kas.create, kas.update — NOT kas.delete.

#### 5.4 Gudang User Cannot Create Kas Entry

- [ ] Log in as Gudang user ("gudang-user@test.com")
- [ ] Attempt to create Kas entry (same as 5.2)
- [ ] Response returns: `{ success: false, error: "Akses ditolak" }`

**Expected:** Gudang role only has stok/produksi permissions, not Kas permissions.

---

### Scenario 6: Verify UI Filtering

**Objective:** Confirm that sidebar and navigation UI reflects the user's assigned permissions.

#### 6.1 Kasir User Sees Only Kas in Sidebar

- [ ] Log in as Kasir user
- [ ] Dashboard loads
- [ ] Sidebar modules visible: ONLY "Kas"
- [ ] Sidebar modules NOT visible: Flock, Produksi, Stok, Penjualan, Laporan, Admin
- [ ] Header does NOT show admin menu or role management link

**Expected:** UI shows only modules the Kasir user has permission to view. Admin sections are completely hidden.

#### 6.2 Gudang User Sees Only Stok and Produksi in Sidebar

- [ ] Log in as Gudang user
- [ ] Sidebar modules visible: "Stok", "Produksi"
- [ ] Sidebar modules NOT visible: Kas, Flock, Penjualan, Laporan, Admin

**Expected:** Gudang user's sidebar matches their assigned permissions.

#### 6.3 Admin User Still Sees All Modules

- [ ] Log in as Admin user
- [ ] All modules visible in sidebar: Flock, Produksi, Stok, Kas, Penjualan, Laporan, Admin
- [ ] Admin section shows "Users", "Roles", "Coops" (Kandang)

**Expected:** Admin retains full visibility regardless of role_permissions entries.

#### 6.4 Button/Action Visibility

- [ ] Log in as Kasir user
- [ ] Navigate to `/kas` page
- [ ] "Tambah Kas" (Create) button IS visible (has kas.create)
- [ ] Navigate to `/kas/[id]` (edit page)
- [ ] "Update" button IS visible (has kas.update)
- [ ] "Hapus" (Delete) button is NOT visible (no kas.delete)

**Expected:** Action buttons appear/disappear based on assigned permissions.

---

### Scenario 7: Permission Change Takes Effect Without Re-login

**Objective:** Verify that permission changes are reflected to the user within ~60 seconds without requiring re-login.

#### 7.1 Initial State: Kasir User Cannot Access Flock

- [ ] Log in as Kasir user in Browser Tab A
- [ ] Sidebar shows only "Kas"
- [ ] Try to access `/flock` → redirected to `/forbidden`
- [ ] Keep this tab open

**Expected:** Kasir user cannot access Flock module.

#### 7.2 Admin Grants flock.view Permission

- [ ] In Browser Tab B, log in as Admin
- [ ] Navigate to `/admin/roles`
- [ ] Open "Kasir" role
- [ ] Toggle ON: flock.view
- [ ] Permission is auto-saved
- [ ] Note the timestamp (for verification)

**Expected:** flock.view is now enabled for Kasir role.

#### 7.3 Kasir User Sees Permission Change (Within 60 Seconds)

- [ ] Switch back to Browser Tab A (Kasir user tab, still logged in)
- [ ] Wait max 60 seconds
- [ ] Refresh the browser page (F5) or navigate away and back
- [ ] Sidebar now shows "Flock" module (in addition to "Kas")
- [ ] Navigate to `/flock` → page loads successfully
- [ ] No re-login was required

**Expected:** Permission change takes effect within 60 seconds. Kasir user gains access to Flock without logging out/in.

#### 7.4 Add More Permissions for Kasir

- [ ] In Admin tab, Kasir role details still open
- [ ] Toggle ON: stok.view, stok.create
- [ ] Wait 10-30 seconds
- [ ] Switch to Kasir tab, refresh
- [ ] Sidebar now shows "Kas", "Flock", "Stok"

**Expected:** Multiple permission grants are reflected quickly without re-login.

#### 7.5 Revoke Permission and Verify Access Lost

- [ ] In Admin tab, for Kasir role, toggle OFF: kas.create
- [ ] Wait ~30 seconds
- [ ] Switch to Kasir tab, navigate to `/kas`
- [ ] "Tambah Kas" button is no longer visible
- [ ] Try to call kas.create server action (via console or curl) → returns error

**Expected:** Permission revocation is reflected. Access to the action is immediately denied.

---

### Scenario 8: System Role Protection

**Objective:** Verify that the built-in Admin role is protected and cannot be deleted or modified.

#### 8.1 Admin Role Marked as SISTEM

- [ ] Log in as Admin user
- [ ] Navigate to `/admin/roles`
- [ ] Admin role row shows "SISTEM" badge or label next to the name
- [ ] Display name is "Admin" (not editable)

**Expected:** Admin role is clearly marked as a system role.

#### 8.2 Admin Role Permissions Are Read-Only

- [ ] Click on Admin role to open permission matrix
- [ ] All checkboxes are disabled/greyed out (cannot be toggled)
- [ ] No "Save" or "Update" button is visible
- [ ] Try to click a checkbox → nothing happens (checkbox remains disabled)

**Expected:** Permission matrix for Admin role is read-only. No modifications are allowed.

#### 8.3 Admin Role Cannot Be Deleted

- [ ] In role list, Admin role row does NOT have a delete button or delete option
- [ ] Right-click on Admin row → no context menu with delete option
- [ ] Try to delete via API (if available) → returns error: `{ success: false, error: "Tidak dapat menghapus peran sistem" }`

**Expected:** Admin role is protected from deletion.

#### 8.4 Admin User Retains Full Access Regardless of role_permissions

- [ ] Log in as Admin
- [ ] Manually check database: Admin role has NO entries in role_permissions table (or minimal entries)
- [ ] Admin can still access all modules and perform all actions
- [ ] Navigate to all pages: Flock, Produksi, Stok, Kas, Penjualan, Laporan, Admin
- [ ] All server actions succeed

**Expected:** Admin access is hardcoded and not dependent on role_permissions table. Admin always has full permissions.

#### 8.5 Supervisor and Operator Roles Cannot Be Edited Beyond Permissions

- [ ] Click on Supervisor role
- [ ] Display Name field is visible but read-only or not editable (verify behavior)
- [ ] Only permission matrix can be modified
- [ ] Same for Operator role

**Expected:** Default roles (non-custom) are protected from name/display name changes. Only permissions can be modified.

---

### Scenario 9: Delete Custom Role

**Objective:** Verify that custom roles can be deleted only when no users are assigned.

#### 9.1 Create and Delete an Unused Role

- [ ] Log in as Admin
- [ ] Create a new role: "Test Role" (role_name: `test_role`)
- [ ] Do NOT assign any users to this role
- [ ] In `/admin/roles`, find "Test Role" row
- [ ] Click delete button or menu option → confirm dialog appears
- [ ] Confirm deletion
- [ ] "Test Role" disappears from list

**Expected:** Unused roles can be deleted immediately.

#### 9.2 Attempt to Delete Role with Users Assigned

- [ ] Create a new role: "Delete Test Role" (role_name: `delete_test_role`)
- [ ] In `/admin/users`, assign a user to this role
- [ ] Return to `/admin/roles`
- [ ] Try to delete "Delete Test Role"
- [ ] Delete option is disabled (greyed out) OR
- [ ] Click delete → error modal appears: "Tidak dapat menghapus peran yang memiliki pengguna"
- [ ] Role remains in list

**Expected:** Deletion is prevented with clear error message when users are assigned to the role.

#### 9.3 Unassign User and Delete Successfully

- [ ] In `/admin/users`, find the user assigned to "Delete Test Role"
- [ ] Change their role to "Operator" (or another role)
- [ ] Save user
- [ ] Return to `/admin/roles`
- [ ] "Delete Test Role" delete button is now enabled
- [ ] Click delete → confirm → role is deleted

**Expected:** Once all users are unassigned, the role can be deleted.

#### 9.4 Prevent Deletion of Default Roles

- [ ] Try to delete "Supervisor" role (default role)
- [ ] Delete option is disabled OR
- [ ] Attempt to delete returns error: "Tidak dapat menghapus peran bawaan"

**Expected:** Default built-in roles (Admin, Supervisor, Operator) cannot be deleted.

---

### Scenario 10: Rename Role Display Name

**Objective:** Verify that custom role display names can be updated.

#### 10.1 Edit Custom Role Display Name

- [ ] Log in as Admin
- [ ] Create a new role: "Kasir Outlet" (role_name: `kasir_outlet`)
- [ ] In `/admin/roles`, click on this role
- [ ] Display Name field shows "Kasir Outlet"
- [ ] Click edit button or directly edit the field (verify UI)
- [ ] Change Display Name to "Kasir Pusat" (Central Cashier)
- [ ] Click "Simpan" (Save) or auto-save applies
- [ ] Return to role list
- [ ] Role now shows "Kasir Pusat" instead of "Kasir Outlet"

**Expected:** Display name can be edited for custom roles.

#### 10.2 Verify Renamed Role Appears in User Profile

- [ ] Navigate to `/admin/users`
- [ ] Find a user assigned to "Kasir Pusat" role
- [ ] User's role field shows "Kasir Pusat" (updated name)
- [ ] User's profile page also shows the new role name

**Expected:** Role name change is reflected across the application immediately.

#### 10.3 Cannot Edit Role Name (System Identifier)

- [ ] In role edit form, the "Role Name" field (role_name: `kasir_pusat`) is read-only
- [ ] Only Display Name can be edited
- [ ] Attempt to change role_name → field is disabled or reverts on save

**Expected:** Role name (system identifier) is immutable. Only display name is editable.

#### 10.4 Rename a Default Role (Negative Test)

- [ ] Try to edit Supervisor role Display Name
- [ ] Display Name field is read-only (disabled)
- [ ] No edit button available
- [ ] Verify same for Operator and Admin roles

**Expected:** Default roles cannot have their display names changed. Only custom roles are editable.

---

### Scenario 11: Permission Matrix Validation

**Objective:** Verify that the permission matrix UI is comprehensive and all modules are covered.

#### 11.1 All Modules Present in Matrix

- [ ] Log in as Admin
- [ ] Create a test role or open an existing custom role
- [ ] Verify all modules are listed:
  - [ ] Flock (dengan checkboxes: view, create, update, delete)
  - [ ] Produksi (view, create, update)
  - [ ] Stok (view, create, update, adjust)
  - [ ] Kas (view, create, update, delete)
  - [ ] Penjualan (view, create, approve)
  - [ ] Laporan (view, export)
  - [ ] User (view, manage)
  - [ ] Role (manage)
  - [ ] Kandang (manage)

**Expected:** All 9 modules and their permissions are displayed in the matrix.

#### 11.2 Permission Count per Module

- [ ] Flock: 4 permissions (view, create, update, delete)
- [ ] Produksi: 3 permissions (view, create, update)
- [ ] Stok: 4 permissions (view, create, update, adjust)
- [ ] Kas: 4 permissions (view, create, update, delete)
- [ ] Penjualan: 3 permissions (view, create, approve)
- [ ] Laporan: 2 permissions (view, export)
- [ ] User: 2 permissions (view, manage)
- [ ] Role: 1 permission (manage)
- [ ] Kandang: 1 permission (manage)

**Expected:** Permission counts match specification.

#### 11.3 No Orphaned Permissions

- [ ] Verify that all checkboxes in the matrix correspond to actual server action checks
- [ ] Create a role with kas.view = ON only
- [ ] Attempt to call kas.create action → error "Akses ditolak"
- [ ] Attempt to call kas.view action → succeeds

**Expected:** All permissions in matrix are enforced. No "ghost" permissions.

---

### Scenario 12: Multiple Roles (Advanced)

**Objective:** Verify that role assignment and permission system work correctly with multiple concurrent users.

#### 12.1 User A (Kasir) and User B (Gudang) Have Different Sidebar

- [ ] Log in as Kasir user in Browser Tab A
- [ ] Sidebar shows: Kas
- [ ] Open incognito/private window, log in as Gudang user
- [ ] Sidebar shows: Stok, Produksi
- [ ] Switch back to Tab A → sidebar still shows: Kas
- [ ] Switch to Gudang tab → sidebar still shows: Stok, Produksi

**Expected:** Multiple logged-in users see different sidebars based on their respective roles.

#### 12.2 Admin Changes Kasir Permissions While Kasir Is Logged In

- [ ] Kasir user is logged in (Tab A)
- [ ] Admin (Tab B) adds flock.view to Kasir role
- [ ] Wait 30 seconds
- [ ] Kasir user (Tab A) refreshes page
- [ ] Flock now appears in sidebar

**Expected:** Permission change is reflected for the logged-in user without re-login.

#### 12.3 User Reassigned to New Role

- [ ] User is logged in with "Kasir" role (Tab A)
- [ ] Admin reassigns user to "Gudang" role (Tab B)
- [ ] Wait ~30 seconds
- [ ] User (Tab A) refreshes page
- [ ] Sidebar now reflects Gudang permissions: Stok, Produksi (NOT Kas)

**Expected:** Role change is reflected immediately after permission cache expires.

---

## Regression Tests

**Objective:** Verify that existing functionality is not broken by RBAC implementation.

### R.1 Flock Module Functionality

- [ ] Admin user can create a flock
- [ ] Admin can view flock details
- [ ] Admin can update flock
- [ ] Admin can calculate age and phase correctly
- [ ] Population tracking works
- [ ] No new errors in browser console

**Expected:** Flock module works as before.

### R.2 Produksi Module Functionality

- [ ] Admin/Operator can input daily production data
- [ ] Eggs counted, deaths recorded, feed consumed logged
- [ ] Data validation works (no negative values)
- [ ] Reports reflect correct production totals

**Expected:** Produksi module works as before.

### R.3 Stok Module Functionality

- [ ] Inventory ledger shows all movements
- [ ] Buy/adjustment/sale transactions are recorded
- [ ] Stock levels are calculated correctly
- [ ] No orphaned inventory_movements entries

**Expected:** Stok module works as before.

### R.4 Kas Module Functionality

- [ ] Kas entries can be created, updated
- [ ] Balance calculations are correct
- [ ] Reports reflect accurate cash flow

**Expected:** Kas module works as before.

### R.5 Penjualan Module Functionality

- [ ] Sales orders can be created
- [ ] Stock is deducted correctly
- [ ] Invoices are generated
- [ ] Payments are recorded

**Expected:** Penjualan module works as before.

### R.6 Laporan Module Functionality

- [ ] Reports generate without errors
- [ ] Export to PDF/Excel works
- [ ] Data accuracy is maintained

**Expected:** Laporan module works as before.

### R.7 User Management

- [ ] Users can be created, updated, deleted
- [ ] Email notifications work
- [ ] Password reset flow works
- [ ] No regression in auth flow

**Expected:** User management works as before.

### R.8 Navigation and Session Management

- [ ] Session timeout still works
- [ ] Logout clears session correctly
- [ ] Login redirects to dashboard
- [ ] Browser back button behavior is correct

**Expected:** Session and navigation work as before.

---

## Test Data Requirements

| User Email | Role | Modules Accessible | Purpose |
|---|---|---|---|
| `admin@test.com` | Admin | All | Full system access validation |
| `supervisor@test.com` | Supervisor | Flock, Stok, Penjualan, Kas, Laporan, User | Backward compatibility |
| `operator@test.com` | Operator | Produksi, Stok, Flock | Backward compatibility |
| `kasir@test.com` | Kasir (custom) | Kas | Custom role testing |
| `gudang@test.com` | Gudang (custom) | Stok, Produksi | Custom role testing |
| `newuser@test.com` | (Initially unassigned) | None | Role assignment testing |

---

## Success Criteria

All tests PASS if:

- [ ] All 12 scenarios complete without failures
- [ ] No regressions in existing modules (R.1–R.8 pass)
- [ ] Permission enforcement works at server action level
- [ ] UI correctly reflects user permissions
- [ ] Permission changes take effect within 60 seconds
- [ ] System roles (Admin, Supervisor, Operator) are backward-compatible
- [ ] Custom roles can be created, assigned, and deleted
- [ ] No console errors or unhandled promise rejections
- [ ] Database integrity is maintained (no orphaned records)

---

## Known Limitations / Deferred Items

- **Multi-farm isolation:** RBAC currently applies per user across all farms. Multi-farm permission scoping is Phase 2 (admin can restrict user to specific farm schemas).
- **Bulk user role assignment:** Not yet supported; individual assignment only.
- **Audit log for permission changes:** Permissions applied but not logged. Logging added in Phase 2.
- **API Key / Service Account permissions:** Admin only; no RBAC for API keys yet.

---

## Test Execution Log

| Scenario | Tester | Date | Status | Notes |
|---|---|---|---|---|
| 1.1 | | | | |
| 1.2 | | | | |
| 1.3 | | | | |
| 2.1 | | | | |
| 2.2 | | | | |
| 2.3 | | | | |
| 2.4 | | | | |
| 3.1 | | | | |
| 3.2 | | | | |
| 3.3 | | | | |
| 3.4 | | | | |
| 3.5 | | | | |
| 3.6 | | | | |
| 4.1 | | | | |
| 4.2 | | | | |
| 4.3 | | | | |
| 5.1 | | | | |
| 5.2 | | | | |
| 5.3 | | | | |
| 5.4 | | | | |
| 6.1 | | | | |
| 6.2 | | | | |
| 6.3 | | | | |
| 6.4 | | | | |
| 7.1 | | | | |
| 7.2 | | | | |
| 7.3 | | | | |
| 7.4 | | | | |
| 7.5 | | | | |
| 8.1 | | | | |
| 8.2 | | | | |
| 8.3 | | | | |
| 8.4 | | | | |
| 8.5 | | | | |
| 9.1 | | | | |
| 9.2 | | | | |
| 9.3 | | | | |
| 9.4 | | | | |
| 10.1 | | | | |
| 10.2 | | | | |
| 10.3 | | | | |
| 10.4 | | | | |
| 11.1 | | | | |
| 11.2 | | | | |
| 11.3 | | | | |
| 12.1 | | | | |
| 12.2 | | | | |
| 12.3 | | | | |
| R.1 | | | | |
| R.2 | | | | |
| R.3 | | | | |
| R.4 | | | | |
| R.5 | | | | |
| R.6 | | | | |
| R.7 | | | | |
| R.8 | | | | |

---

## Sign-Off

| Role | Name | Date | Status |
|---|---|---|---|
| QA Lead | | | Pending |
| Product Owner | | | Pending |
| Tech Lead | | | Pending |

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-11  
**Next Review:** Post-UAT feedback
