# JG Crystal King — Project & Expense Management System

An internal **Project → Budget → Expense → Document → Monitoring → Reporting**
management system built for **JG Crystal King Engineering Services**.

> **Status: Phase 2 — Complete.** Authentication, Admin/Staff permissions,
> RLS, and all core workflows are fully functional against a real Supabase
> backend. This is the final development phase.

---

## 1. Overview

A modern SaaS-style dashboard that helps a small engineering-services
company track projects, budgets, expenses, documents, and staff. It is
intentionally **not** a full accounting/ERP system — it stays focused on
day-to-day project and expense tracking.

## 2. Technology

- [Next.js](https://nextjs.org) (App Router) + TypeScript + React
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com) — PostgreSQL, Authentication, Storage, RLS
- [Zod](https://zod.dev) for server-side validation
- [Recharts](https://recharts.org) for charts

## 3. Local setup

```bash
npm install
cp .env.example .env.local   # fill in the values, see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected
to `/login`.

## 4. Environment variables

| Variable | Where to find it | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | Public — protected entirely by RLS |
| `NEXT_PUBLIC_SITE_URL` | Your deployed URL (or `http://localhost:3000`) | Used to build password-reset links |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` | **Private.** Server-only. Required only for the Staff → Add Staff feature. Never prefix this with `NEXT_PUBLIC_`. |

## 5. Supabase setup

### Migrations

Migration files live in `supabase/migrations/`, numbered in run order
(`0001` → `0006`). Apply them via the Supabase CLI:

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR-PROJECT-REF
supabase db push
```

...or paste each file's contents into the **SQL Editor** in order. They are
additive-only and safe to re-run (`if not exists` / `on conflict do
nothing` throughout).

### Storage

Migrations `0004` and `0006` provision two **private** buckets:
`project-documents` and `receipts`. No manual setup is needed — RLS-backed
storage policies are created by the migrations.

### Authentication

Supabase Auth is enabled by default. No extra configuration is required
for email/password sign-in. If you want branded password-reset emails,
customize the templates under Supabase → Authentication → Email Templates.

### Creating your first Admin account

The simplest path: sign up a user manually in **Supabase → Authentication
→ Users → Add User** (with a password, email confirmed), then in the
**Table Editor**, open `profiles` and change that user's `role` to
`admin`. From there, that Admin can use the in-app **Staff → Add Staff**
flow for everyone else.

## 6. Authentication

- Real Supabase email/password sign-in, sign-out, and password reset.
- Inactive accounts (`profiles.status = 'inactive'`) are blocked at sign-in
  even with correct credentials.
- All `(app)` routes are protected server-side by `lib/auth.ts` — there is
  no client-side-only route guarding.

## 7. Permissions

**Admin** — full access: manage projects, budgets, staff, categories,
service types; approve/reject expenses; view all reports and activity.

**Staff** — sign in, view projects, submit and manage their own pending
expenses, upload receipts/documents, use search. Staff cannot approve
expenses, change budgets, manage other users, or access other staff
members' expense data.

Permissions are enforced **at the database level via RLS**, not just by
hiding UI buttons — see Section 9.

## 8. Database

| Table | Purpose |
|---|---|
| `profiles` | User identity, role (`admin`/`staff`), status (`active`/`inactive`) |
| `projects` | Project records, budget, contract value, status, timeline |
| `service_types` | Admin-manageable list of engineering service types |
| `expense_categories` | Admin-manageable list of expense categories |
| `expenses` | Expense records, approval workflow, rejection reason |
| `documents` | Project/general document metadata (files live in Storage) |
| `activity_logs` | Immutable audit trail of key actions |

Budget math: **Remaining = Budget − Approved Expenses.** Pending and
rejected expenses never count as actual spend.

## 9. RLS & Security

- RLS is enabled on every table — see `supabase/migrations/0006_rls_policies.sql`.
- Two `security definer` helper functions (`is_admin()`, `is_active_user()`)
  centralize the role check so policies stay simple and consistent.
- Staff can only `select`/`update` their **own** expenses while `pending`;
  only Admins can approve, reject, or delete any expense.
- Storage buckets (`project-documents`, `receipts`) are **private** with
  matching RLS policies — files are served via short-lived signed URLs,
  never public URLs.
- The Supabase **service-role key** is used in exactly one place
  (`lib/supabase/admin.ts`, guarded by the `server-only` package) for
  admin-initiated staff account creation. It is never sent to the browser.

## 10. Storage

Receipts upload to the private `receipts` bucket; project/general
documents upload to `project-documents`. Both validate file type
(JPG/PNG/PDF) and size (10MB max) server-side before upload. Viewing a
document generates a 60-second signed URL rather than exposing a public
one.

## 11. Local development

```bash
npm run dev
```

## 12. Production build

```bash
npm run lint
npm run build
```

## 13. Vercel deployment

1. Push this repository to GitHub.
2. Import it in [Vercel](https://vercel.com/new).
3. Add all four environment variables from Section 4 under **Project
   Settings → Environment Variables** (Production and Preview). Missing
   the Supabase URL/anon key will crash the middleware on every request.
4. Set `NEXT_PUBLIC_SITE_URL` to your Vercel deployment URL.
5. Deploy.

## 14. QA results

Manually tested and passing:

- Sign in (valid/invalid credentials), sign out, session persistence, password reset
- Inactive account correctly blocked at login
- Admin: create/edit/archive/restore project, approve/reject expense,
  add/deactivate staff, manage categories & service types, upload/delete
  document, view reports, export CSV, view activity log
- Staff: create expense, upload receipt, edit own pending expense, view
  own expenses only — confirmed staff cannot approve expenses or see
  budget/staff/reports pages (nav items hidden **and** routes
  admin-gated server-side)
- Budget math verified: ₱100,000 budget / ₱40,000 approved → ₱60,000
  remaining, 40% used; ₱100,000 budget / ₱110,000 approved → −₱10,000
  remaining, 110% used, "Over Budget" state shown
- `npm run build` and `npm run lint` both pass with zero errors/warnings

## 15. Known limitations

- In-app notifications (bell icon) are UI-only — no real notification
  events are generated yet.
- PDF export is not implemented; CSV export and a browser print view
  (`window.print()` with dedicated print CSS) are provided instead.
- Appearance/theme settings (light/dark/system) are UI-only.
- Pagination is not yet implemented on large tables (expenses, activity
  log limited to the 100 most recent entries) — acceptable at current
  scale, worth revisiting if data volume grows significantly.

---

## Project structure

```
app/
  (app)/              # Authenticated shell (sidebar + header)
    dashboard/ projects/ projects/new/ projects/[id]/ projects/[id]/edit/
    expenses/ expenses/new/ expenses/[id]/edit/
    budgets/ reports/ calendar/ documents/ staff/ activity/ search/ settings/
  login/ forgot-password/ reset-password/ unauthorized/
components/
  navigation/ dashboard/ projects/ expenses/ documents/ staff/
  settings/ calendar/ reports/ ui/ shared/
lib/
  supabase/       # client.ts, server.ts, middleware.ts, admin.ts (service-role, server-only)
  actions/        # server actions: auth, project, expense, document, staff, settings
  data/           # server-side data-fetching + financial calculations
  auth.ts         # requireUser() / requireAdmin() route guards
  validations.ts  # Zod schemas
  activity.ts     # activity log helper
  export-csv.ts
types/
supabase/migrations/  # 0001–0006, numbered, additive-only
docs/
```
