import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ExpensesOverviewChart, ExpenseByCategoryChart } from "@/components/dashboard/charts";
import { requireAdmin } from "@/lib/auth";
import { getDashboardData } from "@/lib/data/dashboard";
import { createClient } from "@/lib/supabase/server";
import { ExportButtons } from "@/components/reports/export-buttons";
import { formatPHP } from "@/lib/utils";

export default async function ReportsPage() {
  const { profile } = await requireAdmin();
  const data = await getDashboardData(profile.id, true);
  const supabase = await createClient();

  const [{ data: allExpenses }, { data: allProjects }] = await Promise.all([
    supabase
      .from("expenses")
      .select("description, amount, status, expense_date, projects(name), expense_categories(name), profiles!expenses_submitted_by_fkey(full_name)")
      .order("expense_date", { ascending: false }),
    supabase.from("projects").select("name, project_code, client_name, budget, status").order("name"),
  ]);

  const activeCount = (allProjects ?? []).filter((p) => p.status === "active").length;
  const completedCount = (allProjects ?? []).filter((p) => p.status === "completed").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-navy">Reports</h1>
          <p className="mt-1 text-sm text-gray-500">Financial overview across all projects.</p>
        </div>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ExportButtons expenses={(allExpenses ?? []) as any} projects={allProjects ?? []} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Budget" value={data.totalBudget} isCurrency subtext="All Projects" icon="budget" tone="blue" />
        <KpiCard label="Approved Expenses" value={data.totalApproved} isCurrency subtext="All Time" icon="expenses" tone="orange" />
        <KpiCard label="Remaining Budget" value={data.remaining} isCurrency subtext="Across all projects" icon="remaining" tone="green" />
        <KpiCard label="Total Projects" value={data.totalProjects} subtext={`${activeCount} Active • ${completedCount} Completed`} icon="projects" tone="navy" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="animate-fade-in-up" hover>
          <CardHeader><CardTitle>Expenses by Month</CardTitle></CardHeader>
          <ExpensesOverviewChart data={data.monthlyExpenses} />
        </Card>
        <Card className="animate-fade-in-up" hover>
          <CardHeader><CardTitle>Expenses by Category</CardTitle></CardHeader>
          <ExpenseByCategoryChart data={data.expenseByCategory} />
        </Card>
      </div>

      <Card className="animate-fade-in-up" hover>
        <CardHeader><CardTitle>Budget vs Actual by Project</CardTitle></CardHeader>
        {(allProjects ?? []).length === 0 ? (
          <p className="text-sm text-gray-400">No projects yet.</p>
        ) : (
          <div className="space-y-3">
            {(allProjects ?? []).map((p) => {
              const spent = data.topProjects.find((tp) => tp.name === p.name)?.spent ?? 0;
              return (
                <div key={p.project_code} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-navy">{p.name}</span>
                  <span className="text-gray-500">
                    {formatPHP(spent)} / {formatPHP(Number(p.budget))}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
