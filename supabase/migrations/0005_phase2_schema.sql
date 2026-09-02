-- =============================================================================
-- Migration 0005: Phase 2 — project status expansion, service_types table
-- =============================================================================

-- Expand project_status: add 'planning' (before active) and 'completed'
-- (Phase 1 only had active/completed/on_hold/archived — 'completed' already
-- existed; we're adding 'planning' per the Phase 2 spec).
alter type project_status add value if not exists 'planning';

-- service_types becomes Admin-manageable (was a fixed enum in Phase 1).
create table if not exists public.service_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.service_types (name) values
  ('FDAS'),
  ('Fire Sprinkler System'),
  ('Preventive Maintenance'),
  ('Testing & Commissioning'),
  ('Repair & Troubleshooting'),
  ('Installation'),
  ('System Upgrade'),
  ('Engineering / Design'),
  ('Supply'),
  ('Other')
on conflict (name) do nothing;

alter table public.service_types enable row level security;

create policy "Authenticated users can view service types"
  on public.service_types for select
  using (auth.role() = 'authenticated');

-- Migrate projects.service_type from enum to a free text column that
-- references service_types.name, so Admin can add new types without a
-- schema migration. Existing values are preserved.
alter table public.projects
  alter column service_type type text using service_type::text;

alter table public.projects
  add constraint fk_projects_service_type
  foreign key (service_type) references public.service_types(name)
  on update cascade;

-- Expand expense_categories to the Phase 2 default list (additive only).
insert into public.expense_categories (name) values
  ('Meals'), ('Accommodation'), ('Permits / Government Fees'),
  ('Subcontractor'), ('Office Expense'), ('Maintenance'), ('Miscellaneous')
on conflict (name) do nothing;

-- Expense rejection reason, for auditability of the approval workflow.
alter table public.expenses
  add column if not exists rejection_reason text;

alter table public.expenses
  add column if not exists reviewed_by uuid references public.profiles(id);

alter table public.expenses
  add column if not exists reviewed_at timestamptz;
