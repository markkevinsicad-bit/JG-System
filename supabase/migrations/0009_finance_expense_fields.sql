-- =============================================================================
-- Migration 0009: Finance Expansion — additional expense categories,
-- expense reference number, payment method expansion
-- =============================================================================

insert into public.expense_categories (name) values
  ('Utilities'), ('Communication'), ('Marketing'), ('Staff / Employee Expense')
on conflict (name) do nothing;

-- Reference number for expenses (PO numbers, invoice numbers, etc.) —
-- optional, purely informational.
alter table public.expenses
  add column if not exists reference_number text;

alter table public.expenses
  add column if not exists notes text;

-- Expand payment_method to include GCash and Check alongside the existing
-- cash/bank_transfer/card/other values.
alter type payment_method add value if not exists 'gcash';
alter type payment_method add value if not exists 'check';
