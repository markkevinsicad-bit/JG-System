import { createClient } from "@/lib/supabase/server";
import { Project } from "@/types";

export type ProjectWithFinancials = Project & {
  approved_expenses: number;
  pending_expenses: number;
  remaining_budget: number;
  percent_used: number;
};

/**
 * Fetches all projects visible to the current authenticated user (RLS
 * already restricts this), enriched with real approved/pending expense
 * totals. Budget math: Remaining = Budget - Approved Expenses only —
 * pending and rejected expenses never count as actual spend.
 */
export async function getProjectsWithFinancials(filters?: {
  status?: string;
  search?: string;
}): Promise<ProjectWithFinancials[]> {
  const supabase = await createClient();

  let query = supabase.from("projects").select("*").order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,project_code.ilike.%${filters.search}%,client_name.ilike.%${filters.search}%,site_location.ilike.%${filters.search}%`
    );
  }

  const { data: projects, error } = await query;
  if (error || !projects) return [];

  const { data: expenses } = await supabase
    .from("expenses")
    .select("project_id, amount, status");

  return (projects as Project[]).map((p) => {
    const projectExpenses = (expenses ?? []).filter((e) => e.project_id === p.id);
    const approved_expenses = projectExpenses
      .filter((e) => e.status === "approved")
      .reduce((s, e) => s + Number(e.amount), 0);
    const pending_expenses = projectExpenses
      .filter((e) => e.status === "pending")
      .reduce((s, e) => s + Number(e.amount), 0);
    const remaining_budget = Number(p.budget) - approved_expenses;
    const percent_used = p.budget > 0 ? Math.round((approved_expenses / Number(p.budget)) * 100) : 0;

    return { ...p, approved_expenses, pending_expenses, remaining_budget, percent_used };
  });
}

export async function getProjectById(id: string): Promise<ProjectWithFinancials | null> {
  const supabase = await createClient();
  const { data: project, error } = await supabase.from("projects").select("*").eq("id", id).single();
  if (error || !project) return null;

  const { data: expenses } = await supabase.from("expenses").select("amount, status").eq("project_id", id);

  const approved_expenses = (expenses ?? [])
    .filter((e) => e.status === "approved")
    .reduce((s, e) => s + Number(e.amount), 0);
  const pending_expenses = (expenses ?? [])
    .filter((e) => e.status === "pending")
    .reduce((s, e) => s + Number(e.amount), 0);
  const remaining_budget = Number(project.budget) - approved_expenses;
  const percent_used = project.budget > 0 ? Math.round((approved_expenses / Number(project.budget)) * 100) : 0;

  return { ...project, approved_expenses, pending_expenses, remaining_budget, percent_used };
}

export async function getActiveServiceTypes() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("service_types")
    .select("*")
    .eq("is_active", true)
    .order("name");
  return data ?? [];
}
