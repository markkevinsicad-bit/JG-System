import { Plus, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ExpensesOverviewChart, ExpenseByCategoryChart } from "@/components/dashboard/charts";
import { formatPHP, formatDate } from "@/lib/utils";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/data/dashboard";
import Link from "next/link";

export default async function DashboardPage() {
  const { profile } = await requireUser();
  const isAdmin = profile.role === "admin";
  const data = await getDashboardData(profile.id, isAdmin);
  const firstName = profile.full_name.split(" ")[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-navy">Welcome back, {firstName}! 👋</h1>
          <p className="mt-1 text-sm text-gray-500">
            Here&apos;s what&apos;s happening with your projects today.
          </p>
        </div>
        <Link href="/expenses/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Expense
          </Button>
        </Link>
      </div>

      {isAdmin && data.projectsNearLimit.length > 0 && (
        <div className="rounded-xl border border-orange/30 bg-orange-light px-4 py-3 text-sm text-orange animate-fade-in-up">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4" />
            {data.projectsNearLimit.length} project{data.projectsNearLimit.length > 1 ? "s" : ""} near or over budget
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Projects" value={data.totalProjects} subtext={`${data.activeProjectsCount} Active`} icon="projects" tone="navy" />
        {isAdmin && <KpiCard label="Total Budget" value={data.totalBudget} isCurrency subtext="All Projects" icon="budget" tone="blue" />}
        <KpiCard
          label={isAdmin ? "Approved Expenses" : "My Approved Expenses"}
          value={data.totalApproved}
          isCurrency
          subtext="All Time"
          icon="expenses"
          tone="orange"
        />
        {isAdmin ? (
          <KpiCard label="Budget Remaining" value={data.remaining} isCurrency subtext={`Pending: ${formatPHP(data.totalPending)}`} icon="remaining" tone="green" />
        ) : (
          <KpiCard label="My Pending Expenses" value={data.totalPending} isCurrency subtext="Awaiting review" icon="remaining" tone="orange" />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="animate-fade-in-up lg:col-span-2" hover>
          <CardHeader>
            <CardTitle>Expenses Overview</CardTitle>
            <span className="text-xs font-medium text-gray-400">Last 6 Months</span>
          </CardHeader>
          <ExpensesOverviewChart data={data.monthlyExpenses} />
        </Card>

        <Card className="animate-fade-in-up" hover>
          <CardHeader>
            <CardTitle>Expense by Category</CardTitle>
          </CardHeader>
          <ExpenseByCategoryChart data={data.expenseByCategory} />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="animate-fade-in-up" hover>
          <CardHeader>
            <CardTitle>{isAdmin ? "Top Projects" : "My Projects"}</CardTitle>
          </CardHeader>
          {data.topProjects.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">No projects yet.</p>
          ) : (
            <div className="space-y-4">
              {data.topProjects.map((p) => (
                <div key={p.id} className="border-b border-gray-border pb-4 last:border-0 last:pb-0">
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="text-sm font-semibold text-navy">{p.name}</p>
                    <StatusBadge status={p.status} />
                  </div>
                  {isAdmin && (
                    <p className="mb-2 text-xs text-gray-400">
                      {p.client_name} • {formatPHP(p.budget)}
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    <ProgressBar value={p.progress} tone="blue" />
                    <span className="text-xs font-medium text-gray-500">{p.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="animate-fade-in-up overflow-hidden !p-0" hover>
          <div className="p-5 pb-0">
            <CardTitle>Recent Expenses</CardTitle>
          </div>
          {data.recentExpenses.length === 0 ? (
            <p className="p-5 text-center text-sm text-gray-400">No expenses yet.</p>
          ) : (
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
                  {/* eslint-disable @typescript-eslint/no-explicit-any */}
                  {(data.recentExpenses as any[]).map((e) => (
                    <tr key={e.id} className="border-t border-gray-border transition-colors hover:bg-gray-light/60">
                      <td className="px-5 py-3">
                        <p className="font-medium text-navy">{e.description}</p>
                        <p className="text-xs text-gray-400">
                          {e.projects?.name} • {formatDate(e.expense_date)}
                        </p>
                      </td>
                      <td className="px-5 py-3 font-medium text-navy">{formatPHP(Number(e.amount))}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={e.status} />
                      </td>
                    </tr>
                  ))}
                  {/* eslint-enable @typescript-eslint/no-explicit-any */}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
