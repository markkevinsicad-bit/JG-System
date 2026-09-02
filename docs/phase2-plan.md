# Phase 2 — Completion Notes

Phase 2 is complete. This file now documents what was delivered and any
scope notes, rather than a forward-looking plan (see README.md Section 15
for known limitations).

## Delivered

- Real Supabase Authentication (sign in/out, password reset, inactive
  account blocking), enforced server-side on every protected route
- Full Admin/Staff permission model enforced via RLS (not just UI hiding)
- Projects: real CRUD, archive/restore, budget-vs-actual calculations
- Expenses: submission, staff edit-own-pending, admin approve/reject with
  reason, receipt upload to private Storage
- Documents: upload/view (signed URLs)/delete against private Storage
- Staff management: admin-only, using an isolated service-role client
- Settings: profile editing, password change, admin-managed categories
  and service types
- Dashboard & Reports: fully live Supabase data, role-aware
- CSV export + print-friendly report view
- Activity log (admin-only, all key actions recorded)
- Global search across projects/expenses/documents
- Calendar showing real project start/end dates
- Toasts, confirm dialogs, loading states, empty states, 404/unauthorized
  pages throughout

## Scope notes

- PDF export was intentionally not built; CSV + browser print cover the
  same need without an unnecessarily complex reporting engine, per the
  Phase 2 brief's guidance to avoid over-engineering.
- In-app notifications and theme switching are stubbed in the UI but not
  wired to real events — flagged in README.md Section 15 rather than
  silently left out.
