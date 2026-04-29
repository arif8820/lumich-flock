## Phase 5: Hardening (Sprint 9 — 1 week)

### Goals
- System safe for go-live
- UAT passed by real farm operators

### Tasks (Section 9.2, 9.3)

**Security Hardening**
- [ ] Supabase RLS review — all tables have correct policies
- [ ] Every API endpoint validates role (backend, not just frontend hide)
- [ ] Rate limiting on auth endpoints
- [ ] Input sanitization review
- [ ] No sensitive data in client-side logs

**Backup & Disaster Recovery**
- [ ] Supabase PITR enabled (7-day)
- [ ] pg_dump scheduled to Storage/S3 (30-day retention)
- [ ] Restore drill — full restore from backup to staging env
- [ ] Admin alert on backup failure

**Performance Verification**
- [ ] Dashboard < 3s with > 1 year data
- [ ] Stock real-time endpoint < 1s
- [ ] Aging report < 5s with > 100 invoices
- [ ] Invoice PDF < 5s

**UAT**
- [ ] Operator scenario: complete daily input workflow
- [ ] Supervisor scenario: review, approve adjustments, create SO
- [ ] Admin scenario: user management, invoices, credit, reports
- [ ] All critical bugs fixed before sign-off

### Acceptance Criteria Sprint 9
- [ ] Restore drill successful
- [ ] All RLS policies verified
- [ ] UAT sign-off from farm operator and supervisor
- [ ] Zero critical bugs open

---

## Role Permission Summary (Reference)

| Feature | Operator | Supervisor | Admin |
|---------|----------|-----------|-------|
| Daily input (today + H-1) | ✅ | ✅ | ✅ |
| Backdate H-2 to H-3 | ❌ | ✅ | ✅ |
| Backdate > H-3 | ❌ | ❌ | ✅ |
| Stock adjustment | ❌ | ✅ | ✅ |
| Regrade approve/reject | ❌ | ❌ | ✅ |
| Create/confirm/fulfill SO | ❌ | ✅ | ✅ |
| Sales return approve/reject | ❌ | ❌ | ✅ |
| Record payment | ❌ | ✅ | ✅ |
| Apply customer credit | ❌ | ❌ | ✅ |
| Import CSV | ❌ | ❌ | ✅ |
| User management | ❌ | ❌ | ✅ |
| Coop add/edit | ❌ | ❌ | ✅ |

---
