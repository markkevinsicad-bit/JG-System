"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { staffSchema } from "@/lib/validations";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/project-actions";

/**
 * Creates a new staff/admin account. Uses the service-role admin client
 * (server-only) to create the auth user with a temporary password and an
 * auto-confirmed email, since this is an internal tool where the admin is
 * vouching for the new user directly rather than through public sign-up.
 * The corresponding profiles row is created automatically by the
 * on_auth_user_created trigger from migration 0001.
 */
export async function addStaffAction(formData: FormData): Promise<ActionResult> {
  const { profile: currentAdmin } = await requireAdmin();

  const parsed = staffSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Please fix the errors below.", fieldErrors };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Staff creation isn't configured yet. Add SUPABASE_SERVICE_ROLE_KEY on the server." };
  }

  const tempPassword = crypto.randomUUID().slice(0, 16);

  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.full_name },
  });

  if (createError || !newUser.user) {
    if (createError?.message?.toLowerCase().includes("already")) {
      return { error: "A user with this email already exists.", fieldErrors: { email: "Already in use" } };
    }
    return { error: "We couldn't create this account. Please try again." };
  }

  // Set the intended role (the trigger defaults new profiles to 'staff').
  if (parsed.data.role === "admin") {
    await admin.from("profiles").update({ role: "admin" }).eq("id", newUser.user.id);
  }

  // Send a password reset / set-password email so the new user can set
  // their own password rather than an admin knowing it.
  await admin.auth.resetPasswordForEmail(parsed.data.email);

  const supabase = await createClient();
  await logActivity(supabase, {
    userId: currentAdmin.id,
    action: "staff_added",
    entityType: "profile",
    entityId: newUser.user.id,
    description: `Added staff member "${parsed.data.full_name}" (${parsed.data.role})`,
  });

  revalidatePath("/staff");
  return {};
}

export async function updateStaffAction(userId: string, formData: FormData): Promise<ActionResult> {
  const { profile: currentAdmin } = await requireAdmin();

  const parsed = staffSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Please fix the errors below.", fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.full_name, role: parsed.data.role })
    .eq("id", userId);

  if (error) return { error: "We couldn't save these changes. Please try again." };

  await logActivity(supabase, {
    userId: currentAdmin.id,
    action: "staff_updated",
    entityType: "profile",
    entityId: userId,
    description: `Updated staff member "${parsed.data.full_name}"`,
  });

  revalidatePath("/staff");
  return {};
}

export async function toggleStaffStatusAction(userId: string, currentStatus: string): Promise<ActionResult> {
  const { profile: currentAdmin } = await requireAdmin();

  if (userId === currentAdmin.id) {
    return { error: "You cannot deactivate your own account." };
  }

  const newStatus = currentStatus === "active" ? "inactive" : "active";
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", userId);

  if (error) return { error: "We couldn't update this account's status. Please try again." };

  await logActivity(supabase, {
    userId: currentAdmin.id,
    action: newStatus === "active" ? "staff_activated" : "staff_deactivated",
    entityType: "profile",
    entityId: userId,
    description: `Set staff member status to ${newStatus}`,
  });

  revalidatePath("/staff");
  return {};
}
