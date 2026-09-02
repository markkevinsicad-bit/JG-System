import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SettingsTabs } from "@/components/settings/settings-tabs";

export default async function SettingsPage() {
  const { profile } = await requireUser();
  const isAdmin = profile.role === "admin";
  const supabase = await createClient();

  const [{ data: categories }, { data: serviceTypes }] = await Promise.all([
    isAdmin ? supabase.from("expense_categories").select("*").order("name") : Promise.resolve({ data: [] }),
    isAdmin ? supabase.from("service_types").select("*").order("name") : Promise.resolve({ data: [] }),
  ]);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-navy">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account and system preferences.</p>
      </div>

      <SettingsTabs
        profile={profile}
        isAdmin={isAdmin}
        categories={categories ?? []}
        serviceTypes={serviceTypes ?? []}
      />
    </div>
  );
}
