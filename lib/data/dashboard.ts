import { createClient } from "@/lib/supabase/server";

export async function getDashboardData(userId: string, isAdmin: boolean) {
  const supabase = await createClient();

  const projectsQuery = supabase.from("projects").select("*");
  const expensesQuery = isAdmin
    ? supabase.from("expenses").select("*, projects(name)")
    : supabase.from("expenses").select("*, projects(name)").eq("submitted_by", userId);

  const [{ data: projects }, { data: expenses }] = await Promise.all([projectsQuery, expensesQuery]);

  const activeProjects = (projects ?? []).filter((p) => p.status === "active" || p.status === "planning" || p.status === "on_hold");
  const totalBudget = (projects ?? []).reduce((s, p) => s + Number(p.budget), 0);

  const approvedExpenses = (expenses ?? []).filter((e) => e.status === "approved");
  const pendingExpenses = (expenses ?? []).filter((e) => e.status === "pending");

  const totalApproved = approvedExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalPending = pendingExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const remaining = totalBudget - totalApproved;

  // Monthly expenses for the last 6 months (approved only)
  const now = new Date();
  const months: { month: string; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("en-US", { month: "short" });
    const amount = approvedExpenses
      .filter((e) => {
        const ed = new Date(e.expense_date);
        return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth();
      })
      .reduce((s, e) => s + Number(e.amount), 0);
    months.push({ month: label, amount });
  }

  // Expense by category (approved only)
  const { data: categories } = await supabase.from("expense_categories").select("id, name");
  const categoryColors = ["#1f5fd6", "#16a34a", "#7c3aed", "#ea9a1a", "#dc2626", "#0b1b33", "#8b5cf6", "#14b8a6"];
  const byCategory = (categories ?? [])
    .map((c, i) => ({
      name: c.name,
      value: approvedExpenses.filter((e) => e.category_id === c.id).reduce((s, e) => s + Number(e.amount), 0),
      color: categoryColors[i % categoryColors.length],
    }))
    .filter((c) => c.value > 0);

  const projectsNearLimit = isAdmin
    ? (projects ?? [])
        .filter((p) => p.status !== "archived")
        .map((p) => {
          const spent = approvedExpenses
            .filter((e) => e.project_id === p.id)
            .reduce((s, e) => s + Number(e.amount), 0);
          const pct = p.budget > 0 ? (spent / Number(p.budget)) * 100 : 0;
          return { ...p, spent, pct };
        })
        .filter((p) => p.pct >= 90)
    : [];

  const recentExpenses = (expenses ?? [])
    .sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime())
    .slice(0, 5);

  const topProjects = (projects ?? [])
    .filter((p) => p.status !== "archived")
    .map((p) => {
      const spent = approvedExpenses.filter((e) => e.project_id === p.id).reduce((s, e) => s + Number(e.amount), 0);
      const progress = p.budget > 0 ? Math.min(Math.round((spent / Number(p.budget)) * 100), 100) : 0;
      return { ...p, spent, progress };
    })
    .slice(0, 4);

  return {
    totalProjects: (projects ?? []).length,
    activeProjectsCount: activeProjects.length,
    totalBudget,
    totalApproved,
    totalPending,
    remaining,
    monthlyExpenses: months,
    expenseByCategory: byCategory,
    projectsNearLimit,
    recentExpenses,
    topProjects,
  };
}
