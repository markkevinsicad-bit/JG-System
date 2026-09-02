import { createClient } from "@/lib/supabase/server";
import { Budget } from "@/types";

export type BudgetWithFinancials = Budget & {
  approved_expenses: number;
  pending_expenses: number;
  rejected_expenses: number;
  remaining_budget: number;
  percent_used: number;
  projected_percent_used: number;
};

export async function getBudgetsWithFinancials(filters?: {
  type?: string;
  project?: string;
  status?: string;
  search?: string;
}): Promise<BudgetWithFinancials[]> {
  const supabase = await createClient();

  let query = supabase
    .from("budgets")
    .select("*, budget_types(name), projects(name)")
    .order("created_at", { ascending: false });

  if (filters?.type) query = query.eq("budget_type_id", filters.type);
  if (filters?.project) query = query.eq("project_id", filters.project);
  if (filters?.status && filters.status !== "all") query = query.eq("status", filters.status);
  if (filters?.search) query = query.ilike("budget_name", `%${filters.search}%`);

  const { data: budgets, error } = await query;
  if (error || !budgets) return [];

  const { data: expenses } = await supabase.from("expenses").select("budget_id, amount, status");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (budgets as any[]).map((b) => {
    const budgetExpenses = (expenses ?? []).filter((e) => e.budget_id === b.id);
    const approved_expenses = budgetExpenses.filter((e) => e.status === "approved").reduce((s, e) => s + Number(e.amount), 0);
    const pending_expenses = budgetExpenses.filter((e) => e.status === "pending").reduce((s, e) => s + Number(e.amount), 0);
    const rejected_expenses = budgetExpenses.filter((e) => e.status === "rejected").reduce((s, e) => s + Number(e.amount), 0);
    const remaining_budget = Number(b.budget_amount) - approved_expenses;
    const percent_used = b.budget_amount > 0 ? Math.round((approved_expenses / Number(b.budget_amount)) * 100) : 0;
    const projected_percent_used =
      b.budget_amount > 0 ? Math.round(((approved_expenses + pending_expenses) / Number(b.budget_amount)) * 100) : 0;

    return {
      ...b,
      budget_type_name: b.budget_types?.name,
      project_name: b.projects?.name,
      approved_expenses,
      pending_expenses,
      rejected_expenses,
      remaining_budget,
      percent_used,
      projected_percent_used,
    };
  });
}

export async function getBudgetById(id: string): Promise<BudgetWithFinancials | null> {
  const all = await getBudgetsWithFinancials();
  return all.find((b) => b.id === id) ?? null;
}

export async function getBudgetTypeOptions() {
  const supabase = await createClient();
  const { data } = await supabase.from("budget_types").select("*").eq("is_active", true).order("name");
  return data ?? [];
}

/** Budgets relevant to a given project (or general/company budgets if projectId is null). */
export async function getBudgetsForProject(projectId: string | null) {
  const supabase = await createClient();
  let query = supabase
    .from("budgets")
    .select("id, budget_name, project_id")
    .eq("status", "active")
    .order("budget_name");

  if (projectId) {
    query = query.or(`project_id.eq.${projectId},project_id.is.null`);
  } else {
    query = query.is("project_id", null);
  }

  const { data } = await query;
  return data ?? [];
}

export function getBudgetStatus(pct: number): "healthy" | "warning" | "near_limit" | "over_budget" {
  if (pct >= 100) return "over_budget";
  if (pct >= 90) return "near_limit";
  if (pct >= 70) return "warning";
  return "healthy";
}
