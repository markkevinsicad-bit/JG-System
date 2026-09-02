import { notFound } from "next/navigation";
import Link from "next/link";
import { Pencil, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { getBudgetById, getBudgetStatus } from "@/lib/data/budgets";
import { createClient } from "@/lib/supabase/server";
import { formatPHP, formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { Receipt } from "lucide-react";
import { ArchiveBudgetButton } from "@/components/budgets/archive-budget-button";

export default async function BudgetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const budget = await getBudgetById(id);
  if (!budget) notFound();

  const supabase = await createClient();
  const { data: expenses } = await supabase
    .from("expenses")
    .select("id, description, amount, status, expense_date, expense_categories(name)")
    .eq("budget_id", id)
    .order("expense_date", { ascending: false });

  const status = getBudgetStatus(budget.percent_used);
  const tone = budget.percent_used >= 100 ? "red" : budget.percent_used >= 70 ? "orange" : "green";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start animate-fade-in-up">
        <div>
          <p className="text-xs font-medium text-eng-blue">{budget.budget_type_name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-navy">{budget.budget_name}</h1>
            <StatusBadge status={status} />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {budget.project_name ?? "General / Company-wide"} • {budget.period_type}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/budgets/${budget.id}/edit`}>
            <Button variant="secondary" size="sm">
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          </Link>
          <ArchiveBudgetButton budgetId={budget.id} budgetName={budget.budget_name} isArchived={budget.status === "archived"} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="animate-fade-in-up lg:col-span-2" hover>
          <CardHeader><CardTitle>Budget Overview</CardTitle></CardHeader>
          {budget.description && <p className="mb-4 text-sm text-gray-500">{budget.description}</p>}
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Info label="Start Date" value={formatDate(budget.start_date)} />
            <Info label="End Date" value={budget.end_date ? formatDate(budget.end_date) : "Ongoing"} />
            <Info label="Period" value={budget.period_type} />
          </dl>
        </Card>

        <Card className="animate-fade-in-up" hover>
          <CardHeader><CardTitle>Utilization</CardTitle></CardHeader>
          <p className="text-2xl font-bold text-navy">{budget.percent_used}%</p>
          <p className="mb-4 text-xs text-gray-400">of budget used (approved only)</p>
          <ProgressBar value={Math.min(budget.percent_used, 100)} tone={tone} />
          {budget.percent_used >= 100 && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red">
              <AlertTriangle className="h-3.5 w-3.5" /> Over Budget
            </p>
          )}
          {budget.projected_percent_used > budget.percent_used && (
            <p className="mt-2 text-xs text-gray-400">Projected (incl. pending): {budget.projected_percent_used}%</p>
          )}
          <div className="mt-4 space-y-2 text-xs">
            <Row label="Budget" value={formatPHP(budget.budget_amount)} />
            <Row label="Approved" value={formatPHP(budget.approved_expenses)} />
            <Row label="Pending" value={formatPHP(budget.pending_expenses)} tone="text-orange" />
            <Row label="Rejected" value={formatPHP(budget.rejected_expenses)} tone="text-gray-400" />
            <div className="flex justify-between border-t border-gray-border pt-2">
              <span className="text-gray-400">Remaining</span>
              <span className="font-semibold text-navy">{formatPHP(budget.remaining_budget)}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="animate-fade-in-up overflow-hidden !p-0" hover>
        <div className="p-5 pb-0"><CardTitle>Expenses Against This Budget</CardTitle></div>
        {!expenses || expenses.length === 0 ? (
          <div className="p-5"><EmptyState icon={Receipt} title="No expenses charged to this budget yet" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-gray-400">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(expenses as any[]).map((e) => (
                  <tr key={e.id} className="border-t border-gray-border hover:bg-gray-light/60">
                    <td className="px-5 py-3 text-gray-500">{formatDate(e.expense_date)}</td>
                    <td className="px-5 py-3 font-medium text-navy">{e.description}</td>
                    <td className="px-5 py-3 text-gray-500">{e.expense_categories?.name}</td>
                    <td className="px-5 py-3 font-medium text-navy">{formatPHP(Number(e.amount))}</td>
                    <td className="px-5 py-3"><StatusBadge status={e.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium capitalize text-navy">{value}</dd>
    </div>
  );
}

function Row({ label, value, tone = "text-navy" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className={`font-medium ${tone}`}>{value}</span>
    </div>
  );
}
