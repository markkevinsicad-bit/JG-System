import { requireAdmin } from "@/lib/auth";
import { getBudgetTypeOptions } from "@/lib/data/budgets";
import { getProjectOptions } from "@/lib/data/expenses";
import { BudgetForm } from "@/components/budgets/budget-form";

export default async function NewBudgetPage() {
  await requireAdmin();
  const [budgetTypes, projects] = await Promise.all([getBudgetTypeOptions(), getProjectOptions()]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-navy">New Budget</h1>
        <p className="mt-1 text-sm text-gray-500">Plan spending across a project or company operations.</p>
      </div>
      <BudgetForm budgetTypes={budgetTypes} projects={projects} />
    </div>
  );
}
