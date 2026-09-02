"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { projectSchema } from "@/lib/validations";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";

export type ActionResult = { error?: string; fieldErrors?: Record<string, string> };

function parseProjectForm(formData: FormData) {
  return {
    project_code: formData.get("project_code"),
    name: formData.get("name"),
    client_name: formData.get("client_name"),
    site_location: formData.get("site_location"),
    service_type: formData.get("service_type"),
    description: formData.get("description"),
    contract_value: formData.get("contract_value"),
    budget: formData.get("budget"),
    status: formData.get("status"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
  };
}

export async function createProjectAction(formData: FormData): Promise<ActionResult> {
  const { profile } = await requireAdmin();
  const parsed = projectSchema.safeParse(parseProjectForm(formData));

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Please fix the errors below.", fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      ...parsed.data,
      end_date: parsed.data.end_date || null,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "A project with this code already exists.", fieldErrors: { project_code: "Already in use" } };
    }
    return { error: "We couldn't create this project. Please try again." };
  }

  await logActivity(supabase, {
    userId: profile.id,
    action: "project_created",
    entityType: "project",
    entityId: data.id,
    description: `Created project "${parsed.data.name}" (${parsed.data.project_code})`,
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return {};
}

export async function updateProjectAction(projectId: string, formData: FormData): Promise<ActionResult> {
  const { profile } = await requireAdmin();
  const parsed = projectSchema.safeParse(parseProjectForm(formData));

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Please fix the errors below.", fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ ...parsed.data, end_date: parsed.data.end_date || null })
    .eq("id", projectId);

  if (error) {
    if (error.code === "23505") {
      return { error: "A project with this code already exists.", fieldErrors: { project_code: "Already in use" } };
    }
    return { error: "We couldn't save your changes. Please try again." };
  }

  await logActivity(supabase, {
    userId: profile.id,
    action: "project_updated",
    entityType: "project",
    entityId: projectId,
    description: `Updated project "${parsed.data.name}"`,
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  return {};
}

export async function archiveProjectAction(projectId: string, projectName: string): Promise<ActionResult> {
  const { profile } = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("projects").update({ status: "archived" }).eq("id", projectId);
  if (error) return { error: "We couldn't archive this project. Please try again." };

  await logActivity(supabase, {
    userId: profile.id,
    action: "project_archived",
    entityType: "project",
    entityId: projectId,
    description: `Archived project "${projectName}"`,
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return {};
}

export async function restoreProjectAction(projectId: string, projectName: string): Promise<ActionResult> {
  const { profile } = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("projects").update({ status: "active" }).eq("id", projectId);
  if (error) return { error: "We couldn't restore this project. Please try again." };

  await logActivity(supabase, {
    userId: profile.id,
    action: "project_restored",
    entityType: "project",
    entityId: projectId,
    description: `Restored project "${projectName}" to active`,
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return {};
}
