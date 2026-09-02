import { requireUser } from "@/lib/auth";
import { getProjectOptions, getCategoryOptions } from "@/lib/data/expenses";
import { getBudgetsForProject } from "@/lib/data/budgets";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewExpensePage() {
  await requireUser();
  const supabase = await createClient();

  const [projects, categories, generalBudgets, { data: allProjectBudgets }] = await Promise.all([
    getProjectOptions(),
    getCategoryOptions(),
    getBudgetsForProject(null),
    supabase.from("budgets").select("id, budget_name, project_id").eq("status", "active").not("project_id", "is", null),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-navy">New Expense</h1>
        <p className="mt-1 text-sm text-gray-500">Submit a new expense — project-related or general company spending.</p>
      </div>
      <ExpenseForm
        projects={projects}
        categories={categories}
        generalBudgets={generalBudgets}
        projectBudgets={[...generalBudgets, ...(allProjectBudgets ?? [])]}
      />
    </div>
  );
}
