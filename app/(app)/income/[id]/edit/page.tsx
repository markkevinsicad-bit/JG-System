import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getProjectOptions } from "@/lib/data/expenses";
import { getIncomeCategoryOptions } from "@/lib/data/income";
import { IncomeForm } from "@/components/income/income-form";

export default async function EditIncomePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: income }, projects, categories] = await Promise.all([
    supabase.from("income").select("*").eq("id", id).single(),
    getProjectOptions(),
    getIncomeCategoryOptions(),
  ]);

  if (!income) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-navy">Edit Income</h1>
        <p className="mt-1 text-sm text-gray-500">{income.description}</p>
      </div>
      <IncomeForm income={income} projects={projects} categories={categories} />
    </div>
  );
}
