import { requireAdmin } from "@/lib/auth";
import { getProjectOptions } from "@/lib/data/expenses";
import { getIncomeCategoryOptions } from "@/lib/data/income";
import { IncomeForm } from "@/components/income/income-form";

export default async function NewIncomePage() {
  await requireAdmin();
  const [projects, categories] = await Promise.all([getProjectOptions(), getIncomeCategoryOptions()]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-navy">New Income</h1>
        <p className="mt-1 text-sm text-gray-500">Record money received or expected.</p>
      </div>
      <IncomeForm projects={projects} categories={categories} />
    </div>
  );
}
