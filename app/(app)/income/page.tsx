import { Plus, Banknote, Pencil } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { getIncomeRecords, getIncomeCategoryOptions, getIncomeSummary } from "@/lib/data/income";
import { getProjectOptions } from "@/lib/data/expenses";
import { requireAdmin } from "@/lib/auth";
import { formatPHP, formatDate } from "@/lib/utils";
import { IncomeFilters } from "@/components/income/income-filters";
import { CancelIncomeButton } from "@/components/income/cancel-income-button";
import { EmptyState } from "@/components/shared/empty-state";

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; category?: string; type?: string; status?: string; q?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const [income, projects, categories, summary] = await Promise.all([
    getIncomeRecords(params),
    getProjectOptions(),
    getIncomeCategoryOptions(),
    getIncomeSummary(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-navy">Income</h1>
          <p className="mt-1 text-sm text-gray-500">Track money coming in from projects and other sources.</p>
        </div>
        <Link href="/income/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Income
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Total Income" value={summary.totalReceived} isCurrency subtext="Received" icon="remaining" tone="green" />
        <KpiCard label="Project Income" value={summary.projectIncome} isCurrency subtext="Received" icon="projects" tone="blue" />
        <KpiCard label="Other Income" value={summary.otherIncome} isCurrency subtext="Received" icon="budget" tone="purple" />
        <KpiCard label="Pending Income" value={summary.pendingIncome} isCurrency subtext="Expected" icon="expenses" tone="orange" />
        <KpiCard label="Outstanding" value={summary.outstanding} isCurrency subtext="Receivables" icon="remaining" tone="orange" />
      </div>

      <IncomeFilters projects={projects} categories={categories} />

      {income.length === 0 ? (
        <EmptyState icon={Banknote} title="No income records yet" description="Record your first income to start tracking." />
      ) : (
        <Card className="animate-fade-in-up overflow-hidden !p-0" hover>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-border text-xs text-gray-400">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Project</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Expected</th>
                  <th className="px-5 py-3 font-medium">Received</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* eslint-disable @typescript-eslint/no-explicit-any */}
                {(income as any[]).map((i) => (
                  <tr key={i.id} className="border-b border-gray-border last:border-0 hover:bg-gray-light/60">
                    <td className="whitespace-nowrap px-5 py-3 text-gray-500">{formatDate(i.income_date)}</td>
                    <td className="px-5 py-3 font-medium text-navy">{i.description}</td>
                    <td className="px-5 py-3 text-gray-500 capitalize">{i.income_type}</td>
                    <td className="px-5 py-3 text-gray-500">{i.projects?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-gray-500">{i.income_categories?.name}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-navy">{formatPHP(Number(i.expected_amount))}</td>
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-navy">{formatPHP(Number(i.received_amount))}</td>
                    <td className="px-5 py-3"><StatusBadge status={i.payment_status} /></td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        <Link href={`/income/${i.id}/edit`}>
                          <Button size="sm" variant="ghost"><Pencil className="h-3.5 w-3.5" /></Button>
                        </Link>
                        {i.payment_status !== "cancelled" && (
                          <CancelIncomeButton incomeId={i.id} description={i.description} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {/* eslint-enable @typescript-eslint/no-explicit-any */}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
