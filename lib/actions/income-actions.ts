"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { incomeSchema, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/validations";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/project-actions";
import { formatPHP } from "@/lib/utils";

function parseIncomeForm(formData: FormData) {
  return {
    income_type: formData.get("income_type"),
    project_id: formData.get("project_id"),
    income_category_id: formData.get("income_category_id"),
    description: formData.get("description"),
    expected_amount: formData.get("expected_amount"),
    received_amount: formData.get("received_amount"),
    income_date: formData.get("income_date"),
    payment_status: formData.get("payment_status"),
    source_name: formData.get("source_name"),
    reference_number: formData.get("reference_number"),
    notes: formData.get("notes"),
  };
}

async function uploadAttachment(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  file: File
): Promise<{ path?: string; error?: string }> {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { error: "Attachments must be a JPG, PNG, or PDF file." };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { error: "Attachment is too large (10MB max)." };
  }
  const ext = file.name.split(".").pop();
  const path = `income/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("project-documents").upload(path, file);
  if (error) return { error: "We couldn't upload this attachment. Please try again." };
  return { path };
}

export async function createIncomeAction(formData: FormData): Promise<ActionResult> {
  const { profile } = await requireAdmin();
  const parsed = incomeSchema.safeParse(parseIncomeForm(formData));

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: parsed.error.issues[0]?.message ?? "Please fix the errors below.", fieldErrors };
  }

  if (parsed.data.received_amount > parsed.data.expected_amount) {
    return {
      error: "Received amount cannot exceed the expected amount.",
      fieldErrors: { received_amount: "Cannot exceed expected amount" },
    };
  }

  const supabase = await createClient();
  let attachmentPath: string | null = null;

  const file = formData.get("attachment") as File | null;
  if (file && file.size > 0) {
    const uploadResult = await uploadAttachment(supabase, profile.id, file);
    if (uploadResult.error) return { error: uploadResult.error };
    attachmentPath = uploadResult.path ?? null;
  }

  const { data, error } = await supabase
    .from("income")
    .insert({
      ...parsed.data,
      project_id: parsed.data.project_id || null,
      source_name: parsed.data.source_name || null,
      reference_number: parsed.data.reference_number || null,
      notes: parsed.data.notes || null,
      attachment_path: attachmentPath,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error) return { error: "We couldn't record this income. Please try again." };

  await logActivity(supabase, {
    userId: profile.id,
    action: "income_created",
    entityType: "income",
    entityId: data.id,
    description: `Recorded income "${parsed.data.description}" for ${formatPHP(parsed.data.expected_amount)}`,
  });

  revalidatePath("/income");
  revalidatePath("/dashboard");
  return {};
}

export async function updateIncomeAction(incomeId: string, formData: FormData): Promise<ActionResult> {
  const { profile } = await requireAdmin();
  const parsed = incomeSchema.safeParse(parseIncomeForm(formData));

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: parsed.error.issues[0]?.message ?? "Please fix the errors below.", fieldErrors };
  }

  if (parsed.data.received_amount > parsed.data.expected_amount) {
    return {
      error: "Received amount cannot exceed the expected amount.",
      fieldErrors: { received_amount: "Cannot exceed expected amount" },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("income")
    .update({
      ...parsed.data,
      project_id: parsed.data.project_id || null,
      source_name: parsed.data.source_name || null,
      reference_number: parsed.data.reference_number || null,
      notes: parsed.data.notes || null,
    })
    .eq("id", incomeId);

  if (error) return { error: "We couldn't save your changes. Please try again." };

  await logActivity(supabase, {
    userId: profile.id,
    action: "income_updated",
    entityType: "income",
    entityId: incomeId,
    description: `Updated income "${parsed.data.description}" (payment status: ${parsed.data.payment_status})`,
  });

  revalidatePath("/income");
  revalidatePath("/dashboard");
  return {};
}

export async function cancelIncomeAction(incomeId: string, description: string): Promise<ActionResult> {
  const { profile } = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("income").update({ payment_status: "cancelled" }).eq("id", incomeId);
  if (error) return { error: "We couldn't cancel this income record. Please try again." };

  await logActivity(supabase, {
    userId: profile.id,
    action: "income_cancelled",
    entityType: "income",
    entityId: incomeId,
    description: `Cancelled income "${description}"`,
  });

  revalidatePath("/income");
  revalidatePath("/dashboard");
  return {};
}
