# Sidebar Restructure Design

**Date:** 2026-05-03  
**Status:** Approved

## Context

Current sidebar has flat top-level items with Flock, Kandang (hidden in Admin grid), and Pelanggan (hidden in Admin grid) scattered across unrelated sections. sidebar.htm spec proposes grouping pages by functional domain. Goal: reorganize sidebar so related pages are co-located under their parent domain, with accordion expand/collapse.

## Decisions

| Question | Decision |
|----------|----------|
| Accordion type | Single-open (auto-close others) |
| Parent click behaviour | Expand only — no navigation |
| Active page | Auto-expands parent accordion |
| Admin sub-items | Stay as grid cards on `/admin`, sidebar only links to `/admin` (flat) |
| Kandang role | Admin only (unchanged) |
| Pelanggan role | Admin + Supervisor (unchanged) |

## New Nav Structure

```
Dashboard          /dashboard                    all roles
Produksi           (accordion)                   all roles
  Input Harian     /produksi                     all roles
  Kandang          /admin/kandang                admin only
  Flock            /flock                        all roles
Stok               /stok                         all roles        (flat, no sub)
Penjualan          (accordion)                   non-operator
  Sales Order      /penjualan                    non-operator
  Invoice          /penjualan/invoices            admin + supervisor
  Pelanggan        /admin/pelanggan               admin + supervisor
Laporan            (accordion)                   admin + supervisor
  Piutang          /laporan                      admin + supervisor
  Produksi         /laporan/produksi             admin + supervisor
Admin              /admin                        admin only       (flat, no sub)
```

## Accordion Behaviour

- Klik parent = toggle expand/collapse, tidak navigate
- Saat satu parent expand, parent lain otomatis collapse
- Saat user navigasi ke sub-page (e.g. `/produksi/input`), parent-nya (`Produksi`) otomatis expand
- Active state: sub-item highlight jika `currentPath.startsWith(href)`
- Parent highlight (muted): jika salah satu sub-itemnya active

## Changes from Current

| Item | Before | After |
|------|--------|-------|
| Flock | Top-level item | Sub-item under Produksi |
| Kandang | Hidden in `/admin` grid | Sub-item under Produksi (admin only) |
| Pelanggan | Hidden in `/admin` grid | Sub-item under Penjualan (admin+supervisor) |
| Invoice | Sub-item under Penjualan | Sub-item under Penjualan (same href, same role) |
| Laporan | Separate section, flat sub-items | Accordion with sub-items |
| Admin sub-pages | Grid cards on `/admin` | Unchanged — still grid cards, no sidebar sub-items |

## Files to Modify

- `components/layout/sidebar.tsx` — full rewrite of nav data structure + accordion logic
- No route/page changes needed
- No role/permission changes needed

## Active State Logic

```
isSubActive(href) = currentPath.startsWith(href)
isParentActive(children) = children.some(child => isSubActive(child.href))
accordionOpen(parent) = isParentActive(parent.children) || manuallyOpened
```

## Verification

1. `npm run dev` — visual check all 3 accordion states
2. Navigate to `/produksi/input` → Produksi accordion auto-expands
3. Navigate to `/penjualan/invoices` → Penjualan accordion auto-expands, Produksi collapses
4. Click "Produksi" parent → expands without navigating
5. Click "Stok" → navigates to `/stok`, no accordion
6. Login as operator → Penjualan, Laporan, Admin hidden
7. Login as supervisor → Admin hidden, Kandang sub-item hidden
8. Login as admin → all items visible
