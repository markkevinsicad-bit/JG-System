import { createClient } from "@/lib/supabase/server";

export type IncomeFilters = {
  project?: string;
  category?: string;
  type?: string;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
};

export async function getIncomeRecords(filters: IncomeFilters) {
  const supabase = await createClient();

  let query = supabase
    .from("income")
    .select("*, projects(name), income_categories(name), profiles!income_created_by_fkey(full_name)")
    .order("income_date", { ascending: false });

  if (filters.project) query = query.eq("project_id", filters.project);
  if (filters.category) query = query.eq("income_category_id", filters.category);
  if (filters.type) query = query.eq("income_type", filters.type);
  if (filters.status) query = query.eq("payment_status", filters.status);
  if (filters.dateFrom) query = query.gte("income_date", filters.dateFrom);
  if (filters.dateTo) query = query.lte("income_date", filters.dateTo);
  if (filters.search) query = query.ilike("description", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) return [];
  return data;
}

export async function getIncomeCategoryOptions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("income_categories")
    .select("id, name")
    .eq("is_active", true)
    .order("name");
  return data ?? [];
}

export async function getIncomeSummary(dateFrom?: string, dateTo?: string) {
  const supabase = await createClient();
  let query = supabase.from("income").select("income_type, expected_amount, received_amount, payment_status");
  if (dateFrom) query = query.gte("income_date", dateFrom);
  if (dateTo) query = query.lte("income_date", dateTo);

  const { data } = await query;
  const records = data ?? [];

  const totalReceived = records.reduce((s, r) => s + Number(r.received_amount), 0);
  const projectIncome = records.filter((r) => r.income_type === "project").reduce((s, r) => s + Number(r.received_amount), 0);
  const otherIncome = records.filter((r) => r.income_type === "other").reduce((s, r) => s + Number(r.received_amount), 0);
  const pendingIncome = records
    .filter((r) => r.payment_status === "pending")
    .reduce((s, r) => s + Number(r.expected_amount), 0);
  const outstanding = records.reduce((s, r) => {
    const diff = Number(r.expected_amount) - Number(r.received_amount);
    return s + Math.max(diff, 0);
  }, 0);

  return { totalReceived, projectIncome, otherIncome, pendingIncome, outstanding };
}
