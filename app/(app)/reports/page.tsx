import { Download } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ExpensesOverviewChart, ExpenseByCategoryChart } from "@/components/dashboard/charts";
import { demoProjects } from "@/lib/demo-data";

export default function ReportsPage() {
  const totalBudget = demoProjects.reduce((s, p) => s + p.budget, 0);
  const totalExpenses = demoProjects.reduce((s, p) => s + (p.expenses ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-navy">Reports</h1>
          <p className="mt-1 text-sm text-gray-500">Financial overview across all projects.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" disabled title="Available in Phase 2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="secondary" disabled title="Available in Phase 2">
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Budget" value={totalBudget} isCurrency subtext="All Projects" icon="budget" tone="blue" />
        <KpiCard label="Total Expenses" value={totalExpenses} isCurrency subtext="This Year" icon="expenses" tone="orange" />
        <KpiCard label="Remaining Budget" value={totalBudget - totalExpenses} isCurrency subtext="Across all projects" icon="remaining" tone="green" />
        <KpiCard label="Total Projects" value={demoProjects.length} subtext="Active + Completed" icon="projects" tone="navy" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="animate-fade-in-up" hover>
          <CardHeader><CardTitle>Expenses by Month</CardTitle></CardHeader>
          <ExpensesOverviewChart />
        </Card>
        <Card className="animate-fade-in-up" hover>
          <CardHeader><CardTitle>Expenses by Category</CardTitle></CardHeader>
          <ExpenseByCategoryChart />
        </Card>
      </div>

      <Card className="animate-fade-in-up" hover>
        <CardHeader><CardTitle>Budget vs Actual by Project</CardTitle></CardHeader>
        <div className="space-y-3">
          {demoProjects.map((p) => (
            <div key={p.id} className="flex items-center justify-between text-sm">
              <span className="font-medium text-navy">{p.name}</span>
              <span className="text-gray-500">
                {(p.expenses ?? 0).toLocaleString()} / {p.budget.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
