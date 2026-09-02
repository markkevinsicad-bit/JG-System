-- =============================================================================
-- Migration 0006: Production RLS policies
-- Replaces Phase 1's minimal foundation policies with the full Admin/Staff
-- access model. This migration only adds/replaces policies — it never
-- disables RLS or drops tables.
-- =============================================================================

-- Helper: is the current authenticated user an active admin?
-- SECURITY DEFINER so it can read profiles without recursing into this
-- table's own RLS policies.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

create or replace function public.is_active_user()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'active'
  );
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Active users can view all profiles"
  on public.profiles for select
  using (public.is_active_user());

create policy "Users can update their own basic profile fields"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin());

create policy "Admins can insert profiles"
  on public.profiles for insert
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
drop policy if exists "Authenticated users can view projects" on public.projects;

create policy "Active users can view projects"
  on public.projects for select
  using (public.is_active_user());

create policy "Admins can insert projects"
  on public.projects for insert
  with check (public.is_admin());

create policy "Admins can update projects"
  on public.projects for update
  using (public.is_admin());

-- No delete policy: projects are archived (status change), never hard-deleted.

-- ---------------------------------------------------------------------------
-- expense_categories / service_types
-- ---------------------------------------------------------------------------
drop policy if exists "Authenticated users can view expense categories" on public.expense_categories;

create policy "Active users can view expense categories"
  on public.expense_categories for select
  using (public.is_active_user());

create policy "Admins can manage expense categories"
  on public.expense_categories for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Authenticated users can view service types" on public.service_types;

create policy "Active users can view service types"
  on public.service_types for select
  using (public.is_active_user());

create policy "Admins can manage service types"
  on public.service_types for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- expenses
-- ---------------------------------------------------------------------------
drop policy if exists "Users can view their own submitted expenses" on public.expenses;
drop policy if exists "Users can insert their own expenses" on public.expenses;

create policy "Admins can view all expenses"
  on public.expenses for select
  using (public.is_admin());

create policy "Staff can view their own expenses"
  on public.expenses for select
  using (auth.uid() = submitted_by);

create policy "Active users can insert their own expenses"
  on public.expenses for insert
  with check (public.is_active_user() and auth.uid() = submitted_by and status = 'pending');

create policy "Staff can update their own pending expenses"
  on public.expenses for update
  using (auth.uid() = submitted_by and status = 'pending')
  with check (auth.uid() = submitted_by and status = 'pending');

create policy "Admins can update any expense (review/approve/reject)"
  on public.expenses for update
  using (public.is_admin());

create policy "Admins can delete expenses"
  on public.expenses for delete
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- documents
-- ---------------------------------------------------------------------------
drop policy if exists "Authenticated users can view documents" on public.documents;

create policy "Active users can view documents"
  on public.documents for select
  using (public.is_active_user());

create policy "Active users can upload documents"
  on public.documents for insert
  with check (public.is_active_user() and auth.uid() = uploaded_by);

create policy "Admins or uploader can delete documents"
  on public.documents for delete
  using (public.is_admin() or auth.uid() = uploaded_by);

-- ---------------------------------------------------------------------------
-- activity_logs
-- ---------------------------------------------------------------------------
drop policy if exists "Users can view their own activity" on public.activity_logs;

create policy "Admins can view all activity"
  on public.activity_logs for select
  using (public.is_admin());

create policy "Users can view their own activity"
  on public.activity_logs for select
  using (auth.uid() = user_id);

create policy "Active users can insert their own activity"
  on public.activity_logs for insert
  with check (public.is_active_user() and auth.uid() = user_id);

-- No update/delete policies on activity_logs: entries are immutable once written.

-- ---------------------------------------------------------------------------
-- Storage: project-documents bucket (private)
-- ---------------------------------------------------------------------------
drop policy if exists "Active users can read project documents" on storage.objects;
drop policy if exists "Active users can upload project documents" on storage.objects;
drop policy if exists "Admins can delete project documents" on storage.objects;

create policy "Active users can read project documents"
  on storage.objects for select
  using (bucket_id = 'project-documents' and public.is_active_user());

create policy "Active users can upload project documents"
  on storage.objects for insert
  with check (bucket_id = 'project-documents' and public.is_active_user());

create policy "Admins can delete project documents"
  on storage.objects for delete
  using (bucket_id = 'project-documents' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: receipts bucket (private) — created here since Phase 1 only
-- provisioned project-documents.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

create policy "Active users can read receipts"
  on storage.objects for select
  using (bucket_id = 'receipts' and public.is_active_user());

create policy "Active users can upload their own receipts"
  on storage.objects for insert
  with check (bucket_id = 'receipts' and public.is_active_user());

create policy "Admins can delete receipts"
  on storage.objects for delete
  using (bucket_id = 'receipts' and public.is_admin());
