import { Plus, Wallet } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { formatPHP } from "@/lib/utils";
import { getBudgetsWithFinancials, getBudgetTypeOptions, getBudgetStatus } from "@/lib/data/budgets";
import { getProjectOptions } from "@/lib/data/expenses";
import { requireAdmin } from "@/lib/auth";
import { EmptyState } from "@/components/shared/empty-state";
import { BudgetFilters } from "@/components/budgets/budget-filters";

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; project?: string; status?: string; q?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const [budgets, budgetTypes, projects] = await Promise.all([
    getBudgetsWithFinancials(params),
    getBudgetTypeOptions(),
    getProjectOptions(),
  ]);

  const activeBudgets = budgets.filter((b) => b.status !== "archived");
  const totalBudget = activeBudgets.reduce((s, b) => s + Number(b.budget_amount), 0);
  const totalApproved = activeBudgets.reduce((s, b) => s + b.approved_expenses, 0);
  const totalRemaining = totalBudget - totalApproved;
  const nearLimit = activeBudgets.filter((b) => b.percent_used >= 90 && b.percent_used < 100).length;
  const overBudget = activeBudgets.filter((b) => b.percent_used >= 100).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-navy">Budgets</h1>
          <p className="mt-1 text-sm text-gray-500">Plan, monitor, and control spending across projects and company operations.</p>
        </div>
        <Link href="/budgets/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Budget
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Total Budget" value={totalBudget} isCurrency subtext="All Budgets" icon="budget" tone="blue" />
        <KpiCard label="Approved Spending" value={totalApproved} isCurrency subtext="This period" icon="expenses" tone="orange" />
        <KpiCard label="Remaining Budget" value={Math.max(totalRemaining, 0)} isCurrency subtext="Across all budgets" icon="remaining" tone="green" />
        <KpiCard label="Near Limit" value={nearLimit} subtext="90-99% used" icon="projects" tone="orange" />
        <KpiCard label="Over Budget" value={overBudget} subtext="100%+ used" icon="projects" tone="navy" />
      </div>

      <BudgetFilters budgetTypes={budgetTypes} projects={projects} />

      {budgets.length === 0 ? (
        <EmptyState icon={Wallet} title="No budgets yet" description="Create your first budget to start tracking spending." />
      ) : (
        <Card className="animate-fade-in-up overflow-hidden !p-0" hover>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-border text-xs text-gray-400">
                  <th className="px-5 py-3 font-medium">Budget Name</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Project</th>
                  <th className="px-5 py-3 font-medium">Period</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Approved</th>
                  <th className="px-5 py-3 font-medium">Remaining</th>
                  <th className="px-5 py-3 font-medium">% Used</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((b) => {
                  const status = getBudgetStatus(b.percent_used);
                  return (
                    <tr key={b.id} className="border-b border-gray-border last:border-0 hover:bg-gray-light/60">
                      <td className="px-5 py-3">
                        <Link href={`/budgets/${b.id}`} className="font-medium text-navy hover:text-eng-blue">
                          {b.budget_name}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{b.budget_type_name}</td>
                      <td className="px-5 py-3 text-gray-500">{b.project_name ?? "—"}</td>
                      <td className="px-5 py-3 text-gray-500 capitalize">{b.period_type}</td>
                      <td className="whitespace-nowrap px-5 py-3 font-medium text-navy">{formatPHP(b.budget_amount)}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-navy">{formatPHP(b.approved_expenses)}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-navy">{formatPHP(Math.max(b.remaining_budget, 0))}</td>
                      <td className="px-5 py-3">
                        <div className="flex w-24 items-center gap-2">
                          <ProgressBar value={Math.min(b.percent_used, 100)} tone={b.percent_used >= 100 ? "red" : b.percent_used >= 70 ? "orange" : "green"} />
                          <span className="text-xs text-gray-500">{b.percent_used}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3"><StatusBadge status={status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
