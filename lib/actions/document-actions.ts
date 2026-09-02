"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/project-actions";

export async function uploadDocumentAction(formData: FormData): Promise<ActionResult> {
  const { profile } = await requireUser();
  const file = formData.get("file") as File | null;
  const projectId = formData.get("project_id") as string | null;

  if (!file || file.size === 0) return { error: "Please choose a file to upload." };
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { error: "Only JPG, PNG, or PDF files are supported." };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { error: "File is too large (10MB max)." };
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop();
  const path = `${projectId ?? "general"}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("project-documents").upload(path, file);
  if (uploadError) return { error: "We couldn't upload this document. Please try again." };

  const { data, error } = await supabase
    .from("documents")
    .insert({
      project_id: projectId || null,
      file_name: file.name,
      file_path: path,
      file_type: file.type,
      file_size: file.size,
      uploaded_by: profile.id,
    })
    .select("id")
    .single();

  if (error) return { error: "We couldn't save this document's details. Please try again." };

  await logActivity(supabase, {
    userId: profile.id,
    action: "document_uploaded",
    entityType: "document",
    entityId: data.id,
    description: `Uploaded document "${file.name}"`,
  });

  revalidatePath("/documents");
  return {};
}

export async function deleteDocumentAction(documentId: string, filePath: string, fileName: string): Promise<ActionResult> {
  const { profile } = await requireUser();
  const supabase = await createClient();

  const { error: storageError } = await supabase.storage.from("project-documents").remove([filePath]);
  if (storageError) return { error: "We couldn't delete this file. Please try again." };

  const { error } = await supabase.from("documents").delete().eq("id", documentId);
  if (error) return { error: "We couldn't delete this document. Please try again." };

  await logActivity(supabase, {
    userId: profile.id,
    action: "document_deleted",
    entityType: "document",
    entityId: documentId,
    description: `Deleted document "${fileName}"`,
  });

  revalidatePath("/documents");
  return {};
}

export async function getDocumentUrlAction(filePath: string): Promise<{ url?: string; error?: string }> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from("project-documents").createSignedUrl(filePath, 60);
  if (error || !data) return { error: "We couldn't open this file." };
  return { url: data.signedUrl };
}
