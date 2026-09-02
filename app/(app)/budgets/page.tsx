import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/badge";
import { formatPHP } from "@/lib/utils";
import { getProjectsWithFinancials } from "@/lib/data/projects";
import { requireAdmin } from "@/lib/auth";
import { EmptyState } from "@/components/shared/empty-state";
import { Wallet } from "lucide-react";

function getBudgetStatus(pct: number) {
  if (pct >= 100) return "over_budget";
  if (pct >= 90) return "near_limit";
  if (pct >= 70) return "warning";
  return "healthy";
}

export default async function BudgetsPage() {
  await requireAdmin();
  const projects = await getProjectsWithFinancials();
  const active = projects.filter((p) => p.status !== "archived");

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-navy">Budgets</h1>
        <p className="mt-1 text-sm text-gray-500">Monitor project budgets against actual approved expenses.</p>
      </div>

      {active.length === 0 ? (
        <EmptyState icon={Wallet} title="No budgets to show yet" description="Create a project with a budget to see it here." />
      ) : (
        <div className="space-y-4">
          {active.map((p) => {
            const status = getBudgetStatus(p.percent_used);
            const tone = p.percent_used >= 100 ? "red" : p.percent_used >= 70 ? "orange" : "green";

            return (
              <Card key={p.id} className="animate-fade-in-up" hover>
                <CardHeader>
                  <div>
                    <CardTitle>{p.name}</CardTitle>
                    <p className="mt-0.5 text-xs text-gray-400">{p.client_name}</p>
                  </div>
                  <StatusBadge status={status} />
                </CardHeader>

                <div className="mb-2 flex items-baseline justify-between text-sm">
                  <span className="font-semibold text-navy">
                    {formatPHP(p.approved_expenses)} <span className="font-normal text-gray-400">/ {formatPHP(p.budget)}</span>
                  </span>
                  <span className="text-xs font-medium text-gray-500">{p.percent_used}% Used</span>
                </div>

                <ProgressBar value={Math.min(p.percent_used, 100)} tone={tone} />

                <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                  <div>
                    <p className="text-gray-400">Remaining</p>
                    <p className="font-semibold text-navy">{formatPHP(Math.max(p.remaining_budget, 0))}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Pending</p>
                    <p className="font-semibold text-orange">{formatPHP(p.pending_expenses)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Percentage Used</p>
                    <p className="font-semibold text-navy">{p.percent_used}%</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
