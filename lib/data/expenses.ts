import { createClient } from "@/lib/supabase/server";

export type ExpenseFilters = {
  project?: string;
  category?: string;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  mineOnly?: boolean;
  userId?: string;
};

export async function getExpenses(filters: ExpenseFilters) {
  const supabase = await createClient();

  let query = supabase
    .from("expenses")
    .select(
      "*, projects(name), expense_categories(name), profiles!expenses_submitted_by_fkey(full_name)"
    )
    .order("expense_date", { ascending: false });

  if (filters.project) query = query.eq("project_id", filters.project);
  if (filters.category) query = query.eq("category_id", filters.category);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.dateFrom) query = query.gte("expense_date", filters.dateFrom);
  if (filters.dateTo) query = query.lte("expense_date", filters.dateTo);
  if (filters.mineOnly && filters.userId) query = query.eq("submitted_by", filters.userId);
  if (filters.search) query = query.ilike("description", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) return [];
  return data;
}

export async function getProjectOptions() {
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("id, name").order("name");
  return data ?? [];
}

export async function getCategoryOptions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("expense_categories")
    .select("id, name")
    .eq("is_active", true)
    .order("name");
  return data ?? [];
}
