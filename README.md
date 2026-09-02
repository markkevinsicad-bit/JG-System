# JG Crystal King — Project, Budget, Expense & Income Management System

An internal system for **JG Crystal King Engineering Services** to manage
projects, budgets, expenses, and income in one coherent application.

> **Status: Finance Expansion — Complete.** Building on Phase 1 (foundation)
> and Phase 2 (auth, RLS, core workflows), this expansion adds standalone
> budgets, a full Income module, project profitability, and a financial
> dashboard. Existing Phase 1/2 data and functionality are fully preserved.

---

## 1. Overview

A modern SaaS-style dashboard that helps a small engineering-services
company answer: how much came in, how much went out, what it was for,
which budgets are close to their limit, and which projects are profitable
— without becoming a full accounting/ERP platform.

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

Open [http://localhost:3000](http://localhost:3000).

## 4. Environment variables

Unchanged from Phase 2 — `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`,
`SUPABASE_SERVICE_ROLE_KEY` (private, server-only, only needed for
Staff → Add Staff). See `.env.example`.

## 5. Supabase setup — new migrations

Three new migration files, all additive and backward-compatible with
existing data:

| File | What it does |
|---|---|
| `0007_finance_budgets.sql` | Adds `budget_types` and `budgets` tables; adds `expenses.budget_id` (nullable); relaxes `expenses.project_id` to nullable so existing project-only expenses are untouched |
| `0008_finance_income.sql` | Adds `income_categories` and `income` tables |
| `0009_finance_expense_fields.sql` | Adds more expense categories, `expenses.reference_number`/`notes`, GCash/Check payment methods |

Apply them the same way as before (Supabase CLI `db push` or paste into
the SQL Editor, in numeric order). **No existing data is modified or
deleted** — `expenses.project_id` becoming nullable only relaxes a
constraint; every existing row keeps its existing value.

## 6. Authentication & Permissions

Unchanged from Phase 2. New finance rule: **Income is Admin-only** —
Staff can create/edit/view their own expenses but do not see the Income
module at all (enforced via RLS, matching the Phase 2 pattern).

## 7. Budget System

Budgets are now **standalone records**, not tied to a project by
default:

- **Project Budget** — linked to a specific project (`budgets.project_id` set)
- **Operating / Corporate Overhead / Department / Staff / Emergency / Custom** — company-wide (`budgets.project_id` is `NULL`)

Budget Types are Admin-manageable (Settings → System). Every budget
tracks Approved / Pending / Rejected expenses separately — **only
Approved expenses reduce the official remaining budget**; Pending is
shown as a separate "projected usage" figure so nothing is silently
double-counted.

## 8. Expense System

The Expense form no longer requires a Project. Selecting a Project
narrows the Budget dropdown to that project's budgets plus general
company budgets; leaving Project empty shows only general/company
budgets. Adding an expense against a budget that would push it over its
limit shows a warning (not a hard block) — legitimate business expenses
can exceed a budget and go to Admin for approval either way.

## 9. Income

Two income types:

- **Project Income** — requires a Project (enforced by both a Zod schema
  refinement and a database `CHECK` constraint)
- **Other Income** — no project required (refunds, interest, misc.)

Each record tracks **Expected Amount** vs **Received Amount**;
Outstanding is calculated as `Expected − Received` (never shown
negative). Payment status: Pending / Partially Received / Received /
Cancelled. Cancelling an income record preserves it (soft-cancel, not a
delete) so historical reporting stays accurate.

## 10. Financial Dashboard

New KPIs (Admin only): Total Income, Total Expenses, **Net Cash Flow**
(Received Income − Approved Expenses), Outstanding Income. A period
filter (This Month / Last Month / This Quarter / This Year / All Time)
scopes these consistently. The existing Project KPIs (Total Projects,
Budget, Remaining) are preserved alongside the new financial ones —
nothing was removed.

## 11. Project Profitability

The Project Detail page now shows a Financial Summary (Admin only):
Contract Value, Project Income (received), Approved Expenses, and
**Profit** with margin % — `Profit = Project Income − Approved Expenses`,
`Margin = Profit / Income × 100`. Margin is omitted (not divided by
zero) when a project has no recorded income yet.

## 12. Reports

Expanded with: Income Summary, Net Cash Flow, Outstanding Receivables,
Over-Budget Report (every budget currently at or above 100% utilization,
linking to its detail page), and a Cash Flow Summary section that is
explicit about its scope (income received vs. expenses approved — it
does not track a beginning cash balance, since none was tracked
previously and inventing one would be misleading).

## 13. Number Formatting — Verified

A reusable `<CurrencyInput>` component (`components/ui/currency-input.tsx`)
is used everywhere a peso amount is entered (Budget Amount, Expense
Amount, Income Expected/Received Amount). It displays live
thousands-separator formatting as the user types, backspaces, or pastes,
while submitting a **plain numeric string** via a paired hidden input —
the database always receives `numeric`/`decimal` values, never a
formatted string with commas or a ₱ symbol.

Verified test cases (see table below) — left is what the user
types/pastes, right is both the live display and the confirmed raw
value that reaches the database:

| Input | Display shown | Raw value stored |
|---|---|---|
| `1000` | `1,000` | `1000` |
| `10000` | `10,000` | `10000` |
| `100000` | `100,000` | `100000` |
| `1000000` | `1,000,000` | `1000000` |
| `1250000.50` | `1,250,000.50` | `1250000.50` |
| `1,500,000` (pasted) | `1,500,000` | `1500000` |
| `₱1,500,000` (pasted) | `1,500,000` | `1500000` |
| `1,500,000.75` (pasted) | `1,500,000.75` | `1500000.75` |

## 14. Security & RLS

- RLS remains enabled on every table, including the three new ones
  (`budget_types`, `budgets`, `income_categories`, `income`) — never
  disabled anywhere in any migration (verified by direct grep before
  packaging).
- Budgets and Income are Admin-managed at the RLS layer (`is_admin()`
  helper), not just hidden in the UI.
- The service-role key remains isolated to the one file that needs it
  (`lib/supabase/admin.ts`, guarded by the `server-only` package) —
  confirmed it never appears as a value anywhere client-reachable.

## 15. Local development

```bash
npm run dev
```

## 16. Production build

```bash
npm run lint
npm run build
```

Both pass with zero errors and zero warnings.

## 17. Vercel deployment

Unchanged from Phase 2 — see the four environment variables in Section 4,
set them in Project Settings before deploying.

## 18. Testing performed

- Budget: created a Project Budget and a standalone Operating Budget,
  edited both, verified approved/pending/rejected math and over-budget
  status thresholds (Healthy < 70%, Warning 70–89%, Near Limit 90–99%,
  Over Budget ≥ 100%)
- Expense: submitted both a project-linked and a general (no-project)
  expense, each against a budget; verified the smart budget dropdown
  narrows correctly; verified the over-budget warning appears without
  blocking submission
- Income: recorded Project Income (project required, enforced) and Other
  Income (project not required); verified outstanding = expected −
  received, never negative; verified received cannot exceed expected
- Project: verified profit/margin calculation and the zero-income
  no-divide-by-zero case
- Dashboard: verified Net Cash Flow and Outstanding Income across all
  period filter options
- Number formatting: all 8 spec test cases verified programmatically
  (see Section 13 table) — raw stored values confirmed numeric, never
  formatted strings
- `npm run build` and `npm run lint`: zero errors, zero warnings
- Security: confirmed RLS enabled on every new table and never disabled
  anywhere in the migrations; confirmed the service-role key is isolated
  to a single server-only file

## 19. Known limitations

Carried over from Phase 2 (see prior notes) plus:

- Global Search does not yet include Budgets or Income records (only
  Projects, Expenses, Documents) — a reasonable follow-up, not core to
  this expansion's priority list.
- No beginning cash balance is tracked, so the Cash Flow Summary is
  explicitly scoped to income-received vs. expenses-approved rather than
  a full running balance — stated plainly in the report itself rather
  than inventing a number.
- PDF export remains out of scope (CSV + browser print cover the same
  need), consistent with the Phase 2 decision to avoid an unnecessarily
  complex reporting engine.

---

## Project structure (additions)

```
app/(app)/
  budgets/ budgets/new/ budgets/[id]/ budgets/[id]/edit/
  income/ income/new/ income/[id]/edit/
components/
  budgets/   — form, filters, archive button
  income/    — form, filters, cancel button
  ui/currency-input.tsx  — shared formatted-number input
lib/
  actions/budget-actions.ts
  actions/income-actions.ts
  data/budgets.ts   — budget financial calculations
  data/income.ts    — income summary calculations
supabase/migrations/0007–0009
```
