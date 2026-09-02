import { Plus, Receipt as ReceiptIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { getExpenses, getProjectOptions, getCategoryOptions } from "@/lib/data/expenses";
import { formatPHP, formatDate } from "@/lib/utils";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { ExpenseFilters } from "@/components/expenses/expense-filters";
import { ExpenseRowActions } from "@/components/expenses/expense-row-actions";
import { EmptyState } from "@/components/shared/empty-state";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; category?: string; status?: string; q?: string; from?: string; to?: string }>;
}) {
  const { profile } = await requireUser();
  const isAdmin = profile.role === "admin";
  const params = await searchParams;

  const [expenses, projects, categories] = await Promise.all([
    getExpenses({
      ...params,
      dateFrom: params.from,
      dateTo: params.to,
      mineOnly: !isAdmin,
      userId: profile.id,
    }),
    getProjectOptions(),
    getCategoryOptions(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-navy">Expenses</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isAdmin ? "Track and review project expenses." : "Track your submitted expenses."}
          </p>
        </div>
        <Link href="/expenses/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Expense
          </Button>
        </Link>
      </div>

      <ExpenseFilters projects={projects} categories={categories} />

      {expenses.length === 0 ? (
        <EmptyState icon={ReceiptIcon} title="No expenses found" description="Try adjusting your filters, or submit a new expense." />
      ) : (
        <Card className="animate-fade-in-up overflow-hidden !p-0" hover>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-border text-xs text-gray-400">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium">Project</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  {isAdmin && <th className="px-5 py-3 font-medium">Submitted By</th>}
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* eslint-disable @typescript-eslint/no-explicit-any */}
                {(expenses as any[]).map((e) => (
                  <tr key={e.id} className="border-b border-gray-border last:border-0 transition-colors hover:bg-gray-light/60">
                    <td className="whitespace-nowrap px-5 py-3 text-gray-500">{formatDate(e.expense_date)}</td>
                    <td className="px-5 py-3 font-medium text-navy">
                      {e.description}
                      {e.status === "rejected" && e.rejection_reason && (
                        <p className="mt-0.5 text-xs text-red">Reason: {e.rejection_reason}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{e.projects?.name ?? "General"}</td>
                    <td className="px-5 py-3 text-gray-500">{e.expense_categories?.name}</td>
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-navy">{formatPHP(Number(e.amount))}</td>
                    {isAdmin && <td className="px-5 py-3 text-gray-500">{e.profiles?.full_name}</td>}
                    <td className="px-5 py-3"><StatusBadge status={e.status} /></td>
                    <td className="px-5 py-3">
                      <ExpenseRowActions
                        expenseId={e.id}
                        status={e.status}
                        canEdit={e.submitted_by === profile.id}
                        isAdmin={isAdmin}
                      />
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
