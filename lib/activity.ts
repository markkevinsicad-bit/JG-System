import { SupabaseClient } from "@supabase/supabase-js";

export async function logActivity(
  supabase: SupabaseClient,
  params: {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    description: string;
  }
) {
  // Best-effort: a failed activity log write must never block the primary
  // action it's describing.
  await supabase.from("activity_logs").insert({
    user_id: params.userId,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    description: params.description,
  });
}
