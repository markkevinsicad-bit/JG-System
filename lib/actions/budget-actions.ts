"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { budgetSchema } from "@/lib/validations";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/project-actions";
import { formatPHP } from "@/lib/utils";

function parseBudgetForm(formData: FormData) {
  return {
    budget_name: formData.get("budget_name"),
    budget_type_id: formData.get("budget_type_id"),
    project_id: formData.get("project_id"),
    description: formData.get("description"),
    budget_amount: formData.get("budget_amount"),
    period_type: formData.get("period_type"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    status: formData.get("status"),
  };
}

export async function createBudgetAction(formData: FormData): Promise<ActionResult> {
  const { profile } = await requireAdmin();
  const parsed = budgetSchema.safeParse(parseBudgetForm(formData));

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Please fix the errors below.", fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budgets")
    .insert({
      ...parsed.data,
      project_id: parsed.data.project_id || null,
      end_date: parsed.data.end_date || null,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error) return { error: "We couldn't create this budget. Please try again." };

  await logActivity(supabase, {
    userId: profile.id,
    action: "budget_created",
    entityType: "budget",
    entityId: data.id,
    description: `Created budget "${parsed.data.budget_name}" (${formatPHP(parsed.data.budget_amount)})`,
  });

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return {};
}

export async function updateBudgetAction(budgetId: string, formData: FormData): Promise<ActionResult> {
  const { profile } = await requireAdmin();
  const parsed = budgetSchema.safeParse(parseBudgetForm(formData));

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Please fix the errors below.", fieldErrors };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase.from("budgets").select("budget_amount, budget_name").eq("id", budgetId).single();

  const { error } = await supabase
    .from("budgets")
    .update({ ...parsed.data, project_id: parsed.data.project_id || null, end_date: parsed.data.end_date || null })
    .eq("id", budgetId);

  if (error) return { error: "We couldn't save your changes. Please try again." };

  const amountChanged = existing && Number(existing.budget_amount) !== parsed.data.budget_amount;
  await logActivity(supabase, {
    userId: profile.id,
    action: "budget_updated",
    entityType: "budget",
    entityId: budgetId,
    description: amountChanged
      ? `Changed "${parsed.data.budget_name}" budget from ${formatPHP(Number(existing.budget_amount))} to ${formatPHP(parsed.data.budget_amount)}`
      : `Updated budget "${parsed.data.budget_name}"`,
  });

  revalidatePath("/budgets");
  revalidatePath(`/budgets/${budgetId}`);
  revalidatePath("/dashboard");
  return {};
}

export async function archiveBudgetAction(budgetId: string, budgetName: string): Promise<ActionResult> {
  const { profile } = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("budgets").update({ status: "archived" }).eq("id", budgetId);
  if (error) return { error: "We couldn't archive this budget. Please try again." };

  await logActivity(supabase, {
    userId: profile.id,
    action: "budget_archived",
    entityType: "budget",
    entityId: budgetId,
    description: `Archived budget "${budgetName}"`,
  });

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return {};
}
