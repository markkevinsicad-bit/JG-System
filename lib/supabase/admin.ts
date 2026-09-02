import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Privileged Supabase client using the service-role key.
 *
 * SECURITY: This file is guarded by the `server-only` package — importing
 * it from any Client Component will fail the build. The service-role key
 * itself is read from a private (non-NEXT_PUBLIC) environment variable and
 * must never be sent to the browser. Use this client only for operations
 * that genuinely require bypassing RLS, such as creating auth users for
 * staff accounts from the admin-only Staff page.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. Add it as a private (non-NEXT_PUBLIC) environment variable."
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
