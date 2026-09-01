import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ExpensesOverviewChart, ExpenseByCategoryChart } from "@/components/dashboard/charts";
import { demoProjects, demoExpenses } from "@/lib/demo-data";
import { formatPHP, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const totalBudget = demoProjects.reduce((s, p) => s + p.budget, 0);
  const totalExpenses = demoProjects.reduce((s, p) => s + (p.expenses ?? 0), 0);
  const remaining = totalBudget - totalExpenses;
  const remainingPct = ((remaining / totalBudget) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-navy">Welcome back, Admin! 👋</h1>
          <p className="mt-1 text-sm text-gray-500">
            Here&apos;s what&apos;s happening with your projects today.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          New Expense
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Projects" value={demoProjects.length} subtext="Active Projects" icon="projects" tone="navy" />
        <KpiCard label="Total Budget" value={totalBudget} isCurrency subtext="All Projects" icon="budget" tone="blue" />
        <KpiCard label="Total Expenses" value={totalExpenses} isCurrency subtext="This Year" icon="expenses" tone="orange" />
        <KpiCard label="Budget Remaining" value={remaining} isCurrency subtext={`${remainingPct}% Remaining`} icon="remaining" tone="green" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="animate-fade-in-up lg:col-span-2" hover>
          <CardHeader>
            <CardTitle>Expenses Overview</CardTitle>
            <select className="rounded-lg border border-gray-border px-2.5 py-1.5 text-xs font-medium text-gray-500 focus:outline-none">
              <option>This Year</option>
              <option>Last Year</option>
              <option>This Month</option>
              <option>Custom</option>
            </select>
          </CardHeader>
          <ExpensesOverviewChart />
        </Card>

        <Card className="animate-fade-in-up" hover>
          <CardHeader>
            <CardTitle>Expense by Category</CardTitle>
          </CardHeader>
          <ExpenseByCategoryChart />
        </Card>
      </div>

      {/* Top projects + recent expenses */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="animate-fade-in-up" hover>
          <CardHeader>
            <CardTitle>Top Projects</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            {demoProjects.slice(0, 4).map((p) => (
              <div key={p.id} className="border-b border-gray-border pb-4 last:border-0 last:pb-0">
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-sm font-semibold text-navy">{p.name}</p>
                  <StatusBadge status={p.status} />
                </div>
                <p className="mb-2 text-xs text-gray-400">
                  {p.client_name} • {formatPHP(p.budget)}
                </p>
                <div className="flex items-center gap-3">
                  <ProgressBar value={p.progress ?? 0} tone="blue" />
                  <span className="text-xs font-medium text-gray-500">{p.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="animate-fade-in-up overflow-hidden !p-0" hover>
          <div className="p-5 pb-0">
            <CardTitle>Recent Expenses</CardTitle>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-gray-400">
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {demoExpenses.slice(0, 5).map((e) => (
                  <tr key={e.id} className="border-t border-gray-border transition-colors hover:bg-gray-light/60">
                    <td className="px-5 py-3">
                      <p className="font-medium text-navy">{e.description}</p>
                      <p className="text-xs text-gray-400">
                        {e.project_name} • {formatDate(e.expense_date)}
                      </p>
                    </td>
                    <td className="px-5 py-3 font-medium text-navy">{formatPHP(e.amount)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={e.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
