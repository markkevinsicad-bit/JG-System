-- =============================================================================
-- Migration 0008: Finance Expansion — Income
-- =============================================================================

create type income_type as enum ('project', 'other');
create type income_payment_status as enum ('pending', 'partially_received', 'received', 'cancelled');

create table if not exists public.income_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.income_categories (name) values
  ('Client Payment'),
  ('Project Down Payment'),
  ('Progress Billing'),
  ('Final Payment'),
  ('Service Income'),
  ('Repair Income'),
  ('Maintenance Income'),
  ('Supply Income'),
  ('Refund'),
  ('Interest Income'),
  ('Miscellaneous Income'),
  ('Other')
on conflict (name) do nothing;

create table if not exists public.income (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  income_category_id uuid not null references public.income_categories(id),
  income_type income_type not null default 'other',
  description text not null,
  expected_amount numeric(14, 2) not null,
  received_amount numeric(14, 2) not null default 0,
  income_date date not null,
  payment_status income_payment_status not null default 'pending',
  source_name text,
  reference_number text,
  notes text,
  attachment_path text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_income_expected_nonnegative check (expected_amount >= 0),
  constraint chk_income_received_nonnegative check (received_amount >= 0),
  constraint chk_income_project_required_for_project_type
    check (income_type = 'other' or project_id is not null)
);

create index if not exists idx_income_project on public.income(project_id);
create index if not exists idx_income_category on public.income(income_category_id);
create index if not exists idx_income_status on public.income(payment_status);
create index if not exists idx_income_date on public.income(income_date);
create index if not exists idx_income_created_by on public.income(created_by);

create trigger trg_income_updated_at
  before update on public.income
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — Income is an Admin-managed financial record (Staff do not create
-- or view income per the Phase 2/Finance Expansion permission model).
-- ---------------------------------------------------------------------------
alter table public.income_categories enable row level security;
alter table public.income enable row level security;

create policy "Active users can view income categories"
  on public.income_categories for select
  using (public.is_active_user());

create policy "Admins can manage income categories"
  on public.income_categories for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can manage income"
  on public.income for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: income attachments live in the existing private
-- project-documents bucket under an income/ prefix — no new bucket needed.
-- ---------------------------------------------------------------------------
