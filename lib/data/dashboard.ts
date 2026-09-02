import { createClient } from "@/lib/supabase/server";

export type DashboardPeriod = "this_month" | "last_month" | "this_quarter" | "this_year" | "all";

function getPeriodRange(period: DashboardPeriod): { from: Date | null; to: Date | null } {
  const now = new Date();
  switch (period) {
    case "this_month":
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: new Date(now.getFullYear(), now.getMonth() + 1, 0) };
    case "last_month":
      return { from: new Date(now.getFullYear(), now.getMonth() - 1, 1), to: new Date(now.getFullYear(), now.getMonth(), 0) };
    case "this_quarter": {
      const q = Math.floor(now.getMonth() / 3);
      return { from: new Date(now.getFullYear(), q * 3, 1), to: new Date(now.getFullYear(), q * 3 + 3, 0) };
    }
    case "this_year":
      return { from: new Date(now.getFullYear(), 0, 1), to: new Date(now.getFullYear(), 11, 31) };
    default:
      return { from: null, to: null };
  }
}

function inRange(dateStr: string, from: Date | null, to: Date | null) {
  if (!from || !to) return true;
  const d = new Date(dateStr);
  return d >= from && d <= to;
}

export async function getDashboardData(userId: string, isAdmin: boolean, period: DashboardPeriod = "this_month") {
  const supabase = await createClient();
  const { from, to } = getPeriodRange(period);

  const projectsQuery = supabase.from("projects").select("*");
  const expensesQuery = isAdmin
    ? supabase.from("expenses").select("*, projects(name)")
    : supabase.from("expenses").select("*, projects(name)").eq("submitted_by", userId);
  const incomeQuery = isAdmin ? supabase.from("income").select("*") : Promise.resolve({ data: [] as never[] });

  const [{ data: projects }, { data: expenses }, { data: income }] = await Promise.all([
    projectsQuery,
    expensesQuery,
    incomeQuery,
  ]);

  const activeProjects = (projects ?? []).filter((p) => p.status === "active" || p.status === "planning" || p.status === "on_hold");
  const totalBudget = (projects ?? []).reduce((s, p) => s + Number(p.budget), 0);

  const allApproved = (expenses ?? []).filter((e) => e.status === "approved");
  const allPending = (expenses ?? []).filter((e) => e.status === "pending");

  // Period-scoped figures for the finance KPIs
  const periodApproved = allApproved.filter((e) => inRange(e.expense_date, from, to));
  const periodPending = allPending.filter((e) => inRange(e.expense_date, from, to));
  const periodIncome = (income ?? []).filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (i: any) => i.payment_status !== "cancelled" && inRange(i.income_date, from, to)
  );

  const totalApproved = periodApproved.reduce((s, e) => s + Number(e.amount), 0);
  const totalPending = periodPending.reduce((s, e) => s + Number(e.amount), 0);
  const remaining = totalBudget - allApproved.reduce((s, e) => s + Number(e.amount), 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalIncomeReceived = periodIncome.reduce((s: number, i: any) => s + Number(i.received_amount), 0);
  const netCashFlow = totalIncomeReceived - totalApproved;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const outstandingIncome = (income ?? []).reduce((s: number, i: any) => {
    if (i.payment_status === "cancelled") return s;
    return s + Math.max(Number(i.expected_amount) - Number(i.received_amount), 0);
  }, 0);

  // Monthly income vs expenses for the last 6 months
  const now = new Date();
  const months: { month: string; amount: number; income: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("en-US", { month: "short" });
    const amount = allApproved
      .filter((e) => {
        const ed = new Date(e.expense_date);
        return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth();
      })
      .reduce((s, e) => s + Number(e.amount), 0);
    const monthIncome = (income ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((inc: any) => {
        if (inc.payment_status === "cancelled") return false;
        const idate = new Date(inc.income_date);
        return idate.getFullYear() === d.getFullYear() && idate.getMonth() === d.getMonth();
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .reduce((s: number, inc: any) => s + Number(inc.received_amount), 0);
    months.push({ month: label, amount, income: monthIncome });
  }

  const { data: categories } = await supabase.from("expense_categories").select("id, name");
  const categoryColors = ["#1f5fd6", "#16a34a", "#7c3aed", "#ea9a1a", "#dc2626", "#0b1b33", "#8b5cf6", "#14b8a6"];
  const byCategory = (categories ?? [])
    .map((c, i) => ({
      name: c.name,
      value: allApproved.filter((e) => e.category_id === c.id).reduce((s, e) => s + Number(e.amount), 0),
      color: categoryColors[i % categoryColors.length],
    }))
    .filter((c) => c.value > 0);

  const projectsNearLimit = isAdmin
    ? (projects ?? [])
        .filter((p) => p.status !== "archived")
        .map((p) => {
          const spent = allApproved.filter((e) => e.project_id === p.id).reduce((s, e) => s + Number(e.amount), 0);
          const pct = p.budget > 0 ? (spent / Number(p.budget)) * 100 : 0;
          return { ...p, spent, pct };
        })
        .filter((p) => p.pct >= 90)
    : [];

  const overBudgetBudgetsCount = 0; // computed on Budgets page; kept simple here to avoid a heavy join

  const recentExpenses = (expenses ?? [])
    .sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime())
    .slice(0, 5);

  const topProjects = (projects ?? [])
    .filter((p) => p.status !== "archived")
    .map((p) => {
      const spent = allApproved.filter((e) => e.project_id === p.id).reduce((s, e) => s + Number(e.amount), 0);
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
    totalIncomeReceived,
    netCashFlow,
    outstandingIncome,
    overBudgetBudgetsCount,
    monthlyExpenses: months,
    expenseByCategory: byCategory,
    projectsNearLimit,
    recentExpenses,
    topProjects,
  };
}
