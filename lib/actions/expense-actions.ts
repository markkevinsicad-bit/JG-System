"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireUser } from "@/lib/auth";
import { expenseSchema, rejectExpenseSchema, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/validations";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/project-actions";

function parseExpenseForm(formData: FormData) {
  return {
    project_id: formData.get("project_id"),
    category_id: formData.get("category_id"),
    description: formData.get("description"),
    amount: formData.get("amount"),
    expense_date: formData.get("expense_date"),
    vendor_name: formData.get("vendor_name"),
    payment_method: formData.get("payment_method"),
  };
}

async function uploadReceipt(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  file: File
): Promise<{ path?: string; error?: string }> {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { error: "Receipts must be a JPG, PNG, or PDF file." };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { error: "Receipt file is too large (10MB max)." };
  }

  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from("receipts").upload(path, file);
  if (error) return { error: "We couldn't upload your receipt. Please try again." };

  return { path };
}

export async function createExpenseAction(formData: FormData): Promise<ActionResult> {
  const { profile } = await requireUser();
  const parsed = expenseSchema.safeParse(parseExpenseForm(formData));

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Please fix the errors below.", fieldErrors };
  }

  const supabase = await createClient();
  let receiptPath: string | null = null;

  const file = formData.get("receipt") as File | null;
  if (file && file.size > 0) {
    const uploadResult = await uploadReceipt(supabase, profile.id, file);
    if (uploadResult.error) return { error: uploadResult.error };
    receiptPath = uploadResult.path ?? null;
  }

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      ...parsed.data,
      vendor_name: parsed.data.vendor_name || null,
      status: "pending",
      submitted_by: profile.id,
      receipt_path: receiptPath,
    })
    .select("id")
    .single();

  if (error) return { error: "We couldn't submit this expense. Please try again." };

  await logActivity(supabase, {
    userId: profile.id,
    action: "expense_created",
    entityType: "expense",
    entityId: data.id,
    description: `Submitted expense "${parsed.data.description}" for ₱${parsed.data.amount.toLocaleString()}`,
  });

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return {};
}

export async function updateExpenseAction(expenseId: string, formData: FormData): Promise<ActionResult> {
  const { profile } = await requireUser();
  const parsed = expenseSchema.safeParse(parseExpenseForm(formData));

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Please fix the errors below.", fieldErrors };
  }

  const supabase = await createClient();

  // RLS also enforces this, but check here first for a clean error message.
  const { data: existing } = await supabase
    .from("expenses")
    .select("submitted_by, status")
    .eq("id", expenseId)
    .single();

  if (!existing || (existing.submitted_by !== profile.id && profile.role !== "admin")) {
    return { error: "You don't have permission to edit this expense." };
  }
  if (existing.status !== "pending" && profile.role !== "admin") {
    return { error: "Only pending expenses can be edited." };
  }

  const { error } = await supabase
    .from("expenses")
    .update({ ...parsed.data, vendor_name: parsed.data.vendor_name || null })
    .eq("id", expenseId);

  if (error) return { error: "We couldn't save your changes. Please try again." };

  await logActivity(supabase, {
    userId: profile.id,
    action: "expense_updated",
    entityType: "expense",
    entityId: expenseId,
    description: `Updated expense "${parsed.data.description}"`,
  });

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return {};
}

export async function approveExpenseAction(expenseId: string): Promise<ActionResult> {
  const { profile } = await requireAdmin();
  const supabase = await createClient();

  const { data: expense, error } = await supabase
    .from("expenses")
    .update({ status: "approved", reviewed_by: profile.id, reviewed_at: new Date().toISOString(), rejection_reason: null })
    .eq("id", expenseId)
    .select("description, amount")
    .single();

  if (error || !expense) return { error: "We couldn't approve this expense. Please try again." };

  await logActivity(supabase, {
    userId: profile.id,
    action: "expense_approved",
    entityType: "expense",
    entityId: expenseId,
    description: `Approved expense "${expense.description}" for ₱${Number(expense.amount).toLocaleString()}`,
  });

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/budgets");
  return {};
}

export async function rejectExpenseAction(formData: FormData): Promise<ActionResult> {
  const { profile } = await requireAdmin();
  const parsed = rejectExpenseSchema.safeParse({
    expense_id: formData.get("expense_id"),
    rejection_reason: formData.get("rejection_reason"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please provide a rejection reason." };
  }

  const supabase = await createClient();
  const { data: expense, error } = await supabase
    .from("expenses")
    .update({
      status: "rejected",
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: parsed.data.rejection_reason,
    })
    .eq("id", parsed.data.expense_id)
    .select("description")
    .single();

  if (error || !expense) return { error: "We couldn't reject this expense. Please try again." };

  await logActivity(supabase, {
    userId: profile.id,
    action: "expense_rejected",
    entityType: "expense",
    entityId: parsed.data.expense_id,
    description: `Rejected expense "${expense.description}": ${parsed.data.rejection_reason}`,
  });

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return {};
}

export async function deleteExpenseAction(expenseId: string): Promise<ActionResult> {
  const { profile } = await requireAdmin();
  const supabase = await createClient();

  const { data: expense } = await supabase.from("expenses").select("description").eq("id", expenseId).single();
  const { error } = await supabase.from("expenses").delete().eq("id", expenseId);

  if (error) return { error: "We couldn't delete this expense. Please try again." };

  await logActivity(supabase, {
    userId: profile.id,
    action: "expense_deleted",
    entityType: "expense",
    entityId: expenseId,
    description: `Deleted expense "${expense?.description ?? expenseId}"`,
  });

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return {};
}
