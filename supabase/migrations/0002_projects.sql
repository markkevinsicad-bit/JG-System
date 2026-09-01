-- =============================================================================
-- Migration 0002: projects
-- =============================================================================

create type project_status as enum ('active', 'completed', 'on_hold', 'archived');

create type service_type as enum (
  'FDAS',
  'Fire Sprinkler System',
  'Preventive Maintenance',
  'Testing & Commissioning',
  'Repair & Troubleshooting',
  'Installation',
  'System Upgrade',
  'Engineering / Design',
  'Supply',
  'Other'
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  project_code text not null unique,
  name text not null,
  client_name text not null,
  site_location text not null,
  service_type service_type not null,
  description text,
  contract_value numeric(14, 2) not null default 0,
  budget numeric(14, 2) not null default 0,
  status project_status not null default 'active',
  start_date date not null,
  end_date date,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_projects_dates check (end_date is null or end_date >= start_date),
  constraint chk_projects_nonnegative check (contract_value >= 0 and budget >= 0)
);

create index if not exists idx_projects_status on public.projects(status);
create index if not exists idx_projects_created_by on public.projects(created_by);

create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- RLS foundation only — see note in 0001_profiles.sql.
alter table public.projects enable row level security;

create policy "Authenticated users can view projects"
  on public.projects for select
  using (auth.role() = 'authenticated');
