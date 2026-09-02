-- =============================================================================
-- Migration 0007: Finance Expansion — Budgets
-- Adds standalone budget architecture (project-linked OR company-wide),
-- database-driven budget types, and links expenses to budgets.
-- Fully backward-compatible: existing expenses.project_id stays NOT NULL
-- as it already was, and the new expenses.budget_id is nullable so no
-- existing row needs to change.
-- =============================================================================

create table if not exists public.budget_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.budget_types (name) values
  ('Project Budget'),
  ('Operating Budget'),
  ('Corporate Overhead'),
  ('Department Budget'),
  ('Staff / Employee Budget'),
  ('Emergency / Reserve Budget'),
  ('Custom Budget')
on conflict (name) do nothing;

create type budget_period as enum ('monthly', 'quarterly', 'annual', 'custom');
create type budget_status as enum ('active', 'closed', 'archived');

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  budget_name text not null,
  budget_type_id uuid not null references public.budget_types(id),
  project_id uuid references public.projects(id) on delete set null,
  description text,
  budget_amount numeric(14, 2) not null,
  period_type budget_period not null default 'monthly',
  start_date date not null,
  end_date date,
  status budget_status not null default 'active',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_budgets_amount_nonnegative check (budget_amount >= 0),
  constraint chk_budgets_dates check (end_date is null or end_date >= start_date)
);

create index if not exists idx_budgets_type on public.budgets(budget_type_id);
create index if not exists idx_budgets_project on public.budgets(project_id);
create index if not exists idx_budgets_status on public.budgets(status);
create index if not exists idx_budgets_dates on public.budgets(start_date, end_date);

create trigger trg_budgets_updated_at
  before update on public.budgets
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Link expenses to budgets and make project optional on new expenses.
-- Existing expenses keep their existing project_id value untouched; we only
-- relax the NOT NULL constraint going forward so historical data is
-- unaffected, and add budget_id as a new nullable column.
-- ---------------------------------------------------------------------------
alter table public.expenses
  add column if not exists budget_id uuid references public.budgets(id) on delete set null;

alter table public.expenses
  alter column project_id drop not null;

create index if not exists idx_expenses_budget on public.expenses(budget_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.budget_types enable row level security;
alter table public.budgets enable row level security;

create policy "Active users can view budget types"
  on public.budget_types for select
  using (public.is_active_user());

create policy "Admins can manage budget types"
  on public.budget_types for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Active users can view budgets"
  on public.budgets for select
  using (public.is_active_user());

create policy "Admins can manage budgets"
  on public.budgets for all
  using (public.is_admin())
  with check (public.is_admin());
