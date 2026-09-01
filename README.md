# JG Crystal King — Project & Expense Management System

An internal **Project → Budget → Expense → Document → Monitoring → Reporting**
management system built for **JG Crystal King Engineering Services**.

> **Status: Phase 1 — Foundation.** This is the UI, architecture, and
> database foundation only. See [docs/phase2-plan.md](docs/phase2-plan.md)
> for what's intentionally deferred to Phase 2.

---

## 1. What this application is

A modern SaaS-style dashboard that helps a small engineering-services
company track projects, budgets, expenses, documents, and staff — without
the weight of a full accounting/ERP system.

## 2. Technology stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + React
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com) — PostgreSQL, Authentication, Storage
- [Recharts](https://recharts.org) for charts
- [Lucide](https://lucide.dev) for icons

## 3. Requirements

- Node.js 18.18+ (Node 20 LTS recommended)
- npm 9+
- A free [Supabase](https://supabase.com) account/project

## 4. Installation

```bash
npm install
```

## 5. Environment variables

Copy the example file and fill in your Supabase project's public values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
```

You'll find both under **Supabase Dashboard → Settings → API**.
Never commit `.env.local` or paste a service-role key into this project.

## 6. Supabase setup

1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. Copy the Project URL and `anon` public key into `.env.local` (step 5).
3. Apply the database migrations (step 7).
4. Authentication is enabled by default on new Supabase projects — no
   extra configuration is required for Phase 1.

## 7. Database migrations

Migration files live in `supabase/migrations/` and are numbered in the
order they must run:

```
0001_profiles.sql
0002_projects.sql
0003_expenses.sql
0004_documents_activity.sql
```

**Option A — Supabase CLI (recommended)**

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR-PROJECT-REF
supabase db push
```

**Option B — SQL Editor**

Open **Supabase Dashboard → SQL Editor**, paste each migration file's
contents in order (0001 → 0004), and run them one at a time.

These migrations are additive only — they never drop or reset existing
data.

## 8. Local development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected
to `/login`, and after Phase 2 wires up real authentication, into
`/dashboard`.

## 9. Build command

```bash
npm run build
```

## 10. GitHub setup

```bash
git init
git add .
git commit -m "Phase 1: foundation"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

`.git`, `node_modules`, and all `.env*` files are already excluded via
`.gitignore`.

## 11. Vercel deployment preparation

1. Push this repository to GitHub.
2. Import it in [Vercel](https://vercel.com/new).
3. Add the two environment variables from step 5 in the Vercel project
   settings (Production and Preview).
4. Deploy — no extra configuration is required; this is a standard
   Next.js App Router project.

## 12. Phase 1 limitations

Phase 1 intentionally does **not** include:

- Working sign-in (the login page is UI-only for now)
- Enforced role-based permissions (Admin vs Staff)
- Production-grade RLS policies (minimal safe policies only)
- Real Supabase data — all lists/dashboards use isolated demo data
  (see `lib/demo-data.ts`)
- Expense approval workflow logic
- File upload to Supabase Storage
- Reports export (PDF/Excel)
- Notifications

## 13. What remains for Phase 2

See [docs/phase2-plan.md](docs/phase2-plan.md) for the full breakdown.

---

## Project structure

```
app/
  (app)/            # Authenticated app shell (sidebar + header + pages)
    dashboard/
    projects/
    expenses/
    budgets/
    reports/
    calendar/
    documents/
    staff/
    settings/
  login/
components/
  layout/ navigation/ dashboard/ projects/ expenses/ budgets/
  reports/ calendar/ documents/ staff/ settings/ forms/ ui/ shared/
lib/
  supabase/          # client.ts, server.ts, middleware.ts
  demo-data.ts        # isolated Phase 1 mock data
  utils.ts
types/
supabase/migrations/  # numbered SQL migration files
docs/
```

## Security notes

- No service-role key, password, or secret is ever present in this
  project.
- RLS is enabled on every table; Phase 1 ships only the minimum policies
  needed for the authentication foundation to function safely.
- `.env.local` is git-ignored; only `.env.example` (placeholders) is
  committed.
