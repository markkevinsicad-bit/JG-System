import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getBudgetById, getBudgetTypeOptions } from "@/lib/data/budgets";
import { getProjectOptions } from "@/lib/data/expenses";
import { BudgetForm } from "@/components/budgets/budget-form";

export default async function EditBudgetPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [budget, budgetTypes, projects] = await Promise.all([
    getBudgetById(id),
    getBudgetTypeOptions(),
    getProjectOptions(),
  ]);

  if (!budget) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-navy">Edit Budget</h1>
        <p className="mt-1 text-sm text-gray-500">{budget.budget_name}</p>
      </div>
      <BudgetForm budget={budget} budgetTypes={budgetTypes} projects={projects} />
    </div>
  );
}
