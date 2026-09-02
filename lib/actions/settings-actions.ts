"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { categorySchema, serviceTypeSchema, budgetTypeSchema, incomeCategorySchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/project-actions";

export async function addCategoryAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { error } = await supabase.from("expense_categories").insert({
    name: parsed.data.name,
    description: parsed.data.description || null,
  });
  if (error) {
    if (error.code === "23505") return { error: "This category already exists." };
    return { error: "We couldn't add this category. Please try again." };
  }

  revalidatePath("/settings");
  return {};
}

export async function toggleCategoryAction(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("expense_categories").update({ is_active: !isActive }).eq("id", id);
  if (error) return { error: "We couldn't update this category. Please try again." };
  revalidatePath("/settings");
  return {};
}

export async function addServiceTypeAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = serviceTypeSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { error } = await supabase.from("service_types").insert({ name: parsed.data.name });
  if (error) {
    if (error.code === "23505") return { error: "This service type already exists." };
    return { error: "We couldn't add this service type. Please try again." };
  }

  revalidatePath("/settings");
  return {};
}

export async function toggleServiceTypeAction(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("service_types").update({ is_active: !isActive }).eq("id", id);
  if (error) return { error: "We couldn't update this service type. Please try again." };
  revalidatePath("/settings");
  return {};
}

export async function addBudgetTypeAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = budgetTypeSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { error } = await supabase.from("budget_types").insert({ name: parsed.data.name });
  if (error) {
    if (error.code === "23505") return { error: "This budget type already exists." };
    return { error: "We couldn't add this budget type. Please try again." };
  }

  revalidatePath("/settings");
  return {};
}

export async function toggleBudgetTypeAction(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("budget_types").update({ is_active: !isActive }).eq("id", id);
  if (error) return { error: "We couldn't update this budget type. Please try again." };
  revalidatePath("/settings");
  return {};
}

export async function addIncomeCategoryAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = incomeCategorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { error } = await supabase.from("income_categories").insert({ name: parsed.data.name });
  if (error) {
    if (error.code === "23505") return { error: "This income category already exists." };
    return { error: "We couldn't add this income category. Please try again." };
  }

  revalidatePath("/settings");
  return {};
}

export async function toggleIncomeCategoryAction(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("income_categories").update({ is_active: !isActive }).eq("id", id);
  if (error) return { error: "We couldn't update this income category. Please try again." };
  revalidatePath("/settings");
  return {};
}

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const full_name = String(formData.get("full_name") ?? "").trim();
  if (full_name.length < 2) return { error: "Please enter your full name." };

  const { error } = await supabase.from("profiles").update({ full_name }).eq("id", user.id);
  if (error) return { error: "We couldn't save your changes. Please try again." };

  revalidatePath("/settings");
  return {};
}

export async function changePasswordAction(formData: FormData): Promise<ActionResult> {
  const newPassword = String(formData.get("new_password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (newPassword.length < 8) return { error: "Password must be at least 8 characters." };
  if (newPassword !== confirmPassword) return { error: "Passwords do not match." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: "We couldn't update your password. Please try again." };

  return {};
}
