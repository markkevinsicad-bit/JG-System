import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { StatusBadge } from "@/components/ui/badge";
import { ExpensesOverviewChart, ExpenseByCategoryChart } from "@/components/dashboard/charts";
import { requireAdmin } from "@/lib/auth";
import { getDashboardData } from "@/lib/data/dashboard";
import { getIncomeSummary } from "@/lib/data/income";
import { getBudgetsWithFinancials, getBudgetStatus } from "@/lib/data/budgets";
import { createClient } from "@/lib/supabase/server";
import { ExportButtons } from "@/components/reports/export-buttons";
import { formatPHP } from "@/lib/utils";
import Link from "next/link";

export default async function ReportsPage() {
  const { profile } = await requireAdmin();
  const [data, incomeSummary, budgets, { data: allExpenses }, { data: allProjects }] = await Promise.all([
    getDashboardData(profile.id, true, "all"),
    getIncomeSummary(),
    getBudgetsWithFinancials(),
    (async () => {
      const supabase = await createClient();
      return supabase
        .from("expenses")
        .select("description, amount, status, expense_date, projects(name), expense_categories(name), profiles!expenses_submitted_by_fkey(full_name)")
        .order("expense_date", { ascending: false });
    })(),
    (async () => {
      const supabase = await createClient();
      return supabase.from("projects").select("name, project_code, client_name, budget, status").order("name");
    })(),
  ]);

  const activeCount = (allProjects ?? []).filter((p) => p.status === "active").length;
  const completedCount = (allProjects ?? []).filter((p) => p.status === "completed").length;
  const overBudgetList = budgets.filter((b) => b.status !== "archived" && b.percent_used >= 100);
  const netCashFlow = incomeSummary.totalReceived - data.totalApproved;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-navy">Reports</h1>
          <p className="mt-1 text-sm text-gray-500">Financial overview across all projects and company operations.</p>
        </div>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ExportButtons expenses={(allExpenses ?? []) as any} projects={allProjects ?? []} />
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Income" value={incomeSummary.totalReceived} isCurrency subtext="Received (all time)" icon="income" tone="green" />
        <KpiCard label="Total Expenses" value={data.totalApproved} isCurrency subtext="Approved (all time)" icon="expenses" tone="orange" />
        <KpiCard
          label="Net Cash Flow"
          value={Math.abs(netCashFlow)}
          isCurrency
          subtext={netCashFlow >= 0 ? "Positive — Income received vs. approved expenses" : "Negative — Income received vs. approved expenses"}
          icon="cashflow"
          tone={netCashFlow >= 0 ? "green" : "orange"}
        />
        <KpiCard label="Outstanding Receivables" value={incomeSummary.outstanding} isCurrency subtext="Expected but not received" icon="remaining" tone="purple" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Budget" value={data.totalBudget} isCurrency subtext="Project Budgets" icon="budget" tone="blue" />
        <KpiCard label="Project Income" value={incomeSummary.projectIncome} isCurrency subtext="Received" icon="income" tone="blue" />
        <KpiCard label="Other Income" value={incomeSummary.otherIncome} isCurrency subtext="Received" icon="income" tone="purple" />
        <KpiCard label="Total Projects" value={data.totalProjects} subtext={`${activeCount} Active • ${completedCount} Completed`} icon="projects" tone="navy" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="animate-fade-in-up" hover>
          <CardHeader><CardTitle>Income vs Expenses by Month</CardTitle></CardHeader>
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

      <Card className="animate-fade-in-up" hover>
        <CardHeader>
          <CardTitle>Over-Budget Report</CardTitle>
        </CardHeader>
        {overBudgetList.length === 0 ? (
          <p className="text-sm text-gray-400">No budgets are currently over their limit.</p>
        ) : (
          <div className="space-y-2">
            {overBudgetList.map((b) => (
              <Link
                key={b.id}
                href={`/budgets/${b.id}`}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-gray-light"
              >
                <div>
                  <span className="font-medium text-navy">{b.budget_name}</span>
                  <span className="ml-2 text-xs text-gray-400">{b.budget_type_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{formatPHP(b.approved_expenses)} / {formatPHP(b.budget_amount)}</span>
                  <StatusBadge status={getBudgetStatus(b.percent_used)} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card className="animate-fade-in-up" hover>
        <CardHeader><CardTitle>Cash Flow Summary</CardTitle></CardHeader>
        <p className="mb-4 text-xs text-gray-400">
          Scope: income received and expenses approved to date. This does not track a beginning cash balance.
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Income Received</span>
            <span className="font-medium text-green">{formatPHP(incomeSummary.totalReceived)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Expenses Approved</span>
            <span className="font-medium text-orange">{formatPHP(data.totalApproved)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-border pt-2">
            <span className="font-medium text-navy">Net Cash Flow</span>
            <span className={`font-bold ${netCashFlow >= 0 ? "text-green" : "text-red"}`}>{formatPHP(netCashFlow)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
