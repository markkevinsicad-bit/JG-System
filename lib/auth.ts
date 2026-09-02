import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types";

/**
 * Returns the current authenticated user's profile, or redirects to /login.
 * Also redirects (with a message) if the account has been deactivated —
 * inactive users must not be able to use the application.
 */
export async function requireUser(): Promise<{ profile: Profile }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  if (profile.status === "inactive") {
    await supabase.auth.signOut();
    redirect("/login?error=account_inactive");
  }

  return { profile: profile as Profile };
}

/** Same as requireUser, but redirects to /unauthorized if not an admin. */
export async function requireAdmin(): Promise<{ profile: Profile }> {
  const { profile } = await requireUser();
  if (profile.role !== "admin") {
    redirect("/unauthorized");
  }
  return { profile };
}
