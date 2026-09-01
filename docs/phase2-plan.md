# Phase 2 Plan

This document lists exactly what Phase 2 will implement, continuing
directly from the Phase 1 codebase. Nothing here has been built yet.

## Authentication & Authorization
- Real Supabase sign-in/sign-out wiring on the login page
- Protected routes enforced server-side
- Full Admin/Staff role enforcement across every page and action
- Full production RLS policies (replacing Phase 1's minimal foundation)

## Projects
- Real CRUD via Supabase (create/edit/status changes)
- Project details backed by live data
- Budget management per project
- Project monitoring/status transitions

## Expenses
- Real Supabase CRUD (replacing demo data)
- Expense submission with server-side validation
- Receipt upload to Supabase Storage
- Expense approval / rejection workflow
- Staff restrictions (own expenses only, edit-recent-only, etc.)

## Budgets
- Live budget-vs-actual calculations
- Over-budget alerts / status thresholds enforced server-side

## Documents
- Supabase Storage wiring for the `project-documents` bucket
- Secure upload/download with per-project access control
- File permissions

## Search
- Global search across projects, expenses, vendors, and documents

## Reports
- Real-time data (replacing demo data)
- Date/project/category filters
- PDF export
- Excel/CSV export

## Activity Logs
- Real database-backed activity tracking for key actions

## Notifications
- In-app notifications for approvals, rejections, and important events

## Testing
- Functional testing across all modules
- RLS policy testing (staff cannot see/do what they shouldn't)
- Responsive testing across breakpoints
- Production build verification

## Deployment
- Production environment variable checklist
- Vercel production configuration
- Final pre-launch checklist
