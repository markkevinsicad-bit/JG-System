-- =============================================================================
-- Migration 0003: expense_categories, expenses
-- =============================================================================

create type expense_status as enum ('pending', 'approved', 'rejected');
create type payment_method as enum ('cash', 'bank_transfer', 'card', 'other');

create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.expense_categories (name) values
  ('Materials'), ('Labor'), ('Equipment'), ('Transportation'),
  ('Fuel'), ('Tools'), ('Other')
on conflict (name) do nothing;

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete restrict,
  category_id uuid not null references public.expense_categories(id) on delete restrict,
  description text not null,
  amount numeric(14, 2) not null,
  expense_date date not null,
  vendor_name text,
  payment_method payment_method not null default 'cash',
  status expense_status not null default 'pending',
  submitted_by uuid not null references public.profiles(id),
  receipt_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_expenses_amount_positive check (amount > 0)
);

create index if not exists idx_expenses_project on public.expenses(project_id);
create index if not exists idx_expenses_category on public.expenses(category_id);
create index if not exists idx_expenses_status on public.expenses(status);
create index if not exists idx_expenses_submitted_by on public.expenses(submitted_by);
create index if not exists idx_expenses_date on public.expenses(expense_date);

create trigger trg_expenses_updated_at
  before update on public.expenses
  for each row execute function public.set_updated_at();

-- RLS foundation only — see note in 0001_profiles.sql.
alter table public.expense_categories enable row level security;
alter table public.expenses enable row level security;

create policy "Authenticated users can view expense categories"
  on public.expense_categories for select
  using (auth.role() = 'authenticated');

create policy "Users can view their own submitted expenses"
  on public.expenses for select
  using (auth.uid() = submitted_by);

create policy "Users can insert their own expenses"
  on public.expenses for insert
  with check (auth.uid() = submitted_by);
