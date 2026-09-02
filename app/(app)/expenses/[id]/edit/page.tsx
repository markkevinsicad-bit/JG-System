import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getProjectOptions, getCategoryOptions } from "@/lib/data/expenses";
import { ExpenseForm } from "@/components/expenses/expense-form";

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { profile } = await requireUser();
  const { id } = await params;
  const supabase = await createClient();

  const { data: expense } = await supabase.from("expenses").select("*").eq("id", id).single();
  if (!expense) notFound();

  const canEdit = expense.submitted_by === profile.id && expense.status === "pending";
  if (!canEdit && profile.role !== "admin") {
    redirect("/expenses");
  }

  const [projects, categories] = await Promise.all([getProjectOptions(), getCategoryOptions()]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-navy">Edit Expense</h1>
        <p className="mt-1 text-sm text-gray-500">Update the details of this expense.</p>
      </div>
      <ExpenseForm expense={expense} projects={projects} categories={categories} />
    </div>
  );
}
