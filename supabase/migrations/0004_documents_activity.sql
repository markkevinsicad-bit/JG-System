-- =============================================================================
-- Migration 0004: documents, activity_logs
-- =============================================================================

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_type text not null,
  file_size bigint not null,
  uploaded_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_documents_project on public.documents(project_id);
create index if not exists idx_documents_uploaded_by on public.documents(uploaded_by);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  description text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_logs_user on public.activity_logs(user_id);
create index if not exists idx_activity_logs_entity on public.activity_logs(entity_type, entity_id);
create index if not exists idx_activity_logs_created_at on public.activity_logs(created_at desc);

-- RLS foundation only — see note in 0001_profiles.sql.
alter table public.documents enable row level security;
alter table public.activity_logs enable row level security;

create policy "Authenticated users can view documents"
  on public.documents for select
  using (auth.role() = 'authenticated');

create policy "Users can view their own activity"
  on public.activity_logs for select
  using (auth.uid() = user_id);

-- =============================================================================
-- Storage foundation: project-documents bucket
-- Prefer private storage; secure access policies will be finalized in Phase 2.
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('project-documents', 'project-documents', false)
on conflict (id) do nothing;
