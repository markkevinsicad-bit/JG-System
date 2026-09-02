import { requireUser } from "@/lib/auth";
import { getProjectOptions, getCategoryOptions } from "@/lib/data/expenses";
import { ExpenseForm } from "@/components/expenses/expense-form";

export default async function NewExpensePage() {
  await requireUser();
  const [projects, categories] = await Promise.all([getProjectOptions(), getCategoryOptions()]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-navy">New Expense</h1>
        <p className="mt-1 text-sm text-gray-500">Submit a new project expense for review.</p>
      </div>
      <ExpenseForm projects={projects} categories={categories} />
    </div>
  );
}
