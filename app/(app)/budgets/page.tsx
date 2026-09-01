import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/badge";
import { demoProjects } from "@/lib/demo-data";
import { formatPHP } from "@/lib/utils";
import { BudgetStatus } from "@/types";

function getBudgetStatus(pct: number): BudgetStatus {
  if (pct >= 100) return "over_budget";
  if (pct >= 90) return "near_limit";
  if (pct >= 70) return "warning";
  return "healthy";
}

export default function BudgetsPage() {
  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-navy">Budgets</h1>
        <p className="mt-1 text-sm text-gray-500">Monitor project budgets against actual expenses.</p>
      </div>

      <div className="space-y-4">
        {demoProjects.map((p) => {
          const spent = p.expenses ?? 0;
          const pct = Math.round((spent / p.budget) * 100);
          const remaining = p.budget - spent;
          const status = getBudgetStatus(pct);
          const tone = pct >= 100 ? "red" : pct >= 90 ? "orange" : pct >= 70 ? "orange" : "green";

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
                  {formatPHP(spent)} <span className="font-normal text-gray-400">/ {formatPHP(p.budget)}</span>
                </span>
                <span className="text-xs font-medium text-gray-500">{pct}% Used</span>
              </div>

              <ProgressBar value={pct} tone={tone} />

              <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                <div>
                  <p className="text-gray-400">Remaining</p>
                  <p className="font-semibold text-navy">{formatPHP(Math.max(remaining, 0))}</p>
                </div>
                <div>
                  <p className="text-gray-400">Percentage Used</p>
                  <p className="font-semibold text-navy">{pct}%</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
