"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/shared/toast";
import { ManagedListEditor } from "@/components/settings/managed-list-editor";
import {
  addCategoryAction,
  toggleCategoryAction,
  addServiceTypeAction,
  toggleServiceTypeAction,
  updateProfileAction,
  changePasswordAction,
} from "@/lib/actions/settings-actions";
import { Profile } from "@/types";

export function SettingsTabs({
  profile,
  isAdmin,
  categories,
  serviceTypes,
}: {
  profile: Profile;
  isAdmin: boolean;
  categories: { id: string; name: string; is_active: boolean }[];
  serviceTypes: { id: string; name: string; is_active: boolean }[];
}) {
  const sections = ["Profile", "Appearance", ...(isAdmin ? ["System"] : []), "Security"];
  const [active, setActive] = useState("Profile");
  const router = useRouter();
  const { showToast } = useToast();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingProfile(true);
    const result = await updateProfileAction(new FormData(e.currentTarget));
    setSavingProfile(false);
    if (result.error) showToast(result.error, "error");
    else {
      showToast("Profile updated successfully.");
      router.refresh();
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordError(null);
    const result = await changePasswordAction(new FormData(e.currentTarget));
    setSavingPassword(false);
    if (result.error) setPasswordError(result.error);
    else {
      showToast("Password updated successfully.");
      (e.target as HTMLFormElement).reset();
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_1fr]">
      <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible animate-fade-in-up">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => setActive(s)}
            className={cn(
              "whitespace-nowrap rounded-lg px-3.5 py-2 text-left text-sm font-medium transition-colors",
              active === s ? "bg-eng-blue-light text-eng-blue" : "text-gray-500 hover:bg-gray-light"
            )}
          >
            {s}
          </button>
        ))}
      </nav>

      <Card className="animate-fade-in-up" hover>
        {active === "Profile" && (
          <>
            <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-eng-blue text-xl font-semibold text-white">
                  {profile.full_name?.[0]?.toUpperCase()}
                </div>
              </div>
              <div>
                <Label htmlFor="full_name">Name</Label>
                <Input id="full_name" name="full_name" defaultValue={profile.full_name} required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue={profile.email} type="email" disabled />
              </div>
              <div className="flex justify-end border-t border-gray-border pt-4">
                <Button type="submit" size="sm" loading={savingProfile}>Save Changes</Button>
              </div>
            </form>
          </>
        )}

        {active === "Appearance" && (
          <>
            <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
            <p className="text-sm text-gray-500">
              Theme customization (light / dark / system) is planned for a future update.
            </p>
          </>
        )}

        {active === "System" && isAdmin && (
          <div className="space-y-8">
            <div>
              <CardHeader><CardTitle>Expense Categories</CardTitle></CardHeader>
              <ManagedListEditor
                items={categories}
                addAction={addCategoryAction}
                toggleAction={toggleCategoryAction}
                placeholder="New category name"
              />
            </div>
            <div className="border-t border-gray-border pt-6">
              <CardHeader><CardTitle>Service Types</CardTitle></CardHeader>
              <ManagedListEditor
                items={serviceTypes}
                addAction={addServiceTypeAction}
                toggleAction={toggleServiceTypeAction}
                placeholder="New service type name"
              />
            </div>
          </div>
        )}

        {active === "Security" && (
          <>
            <CardHeader><CardTitle>Security</CardTitle></CardHeader>
            {passwordError && (
              <div className="mb-4 rounded-lg bg-red-light px-3 py-2.5 text-sm text-red">{passwordError}</div>
            )}
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="new_password">New Password</Label>
                <Input id="new_password" name="new_password" type="password" minLength={8} required />
              </div>
              <div>
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input id="confirm_password" name="confirm_password" type="password" minLength={8} required />
              </div>
              <div className="flex justify-end border-t border-gray-border pt-4">
                <Button type="submit" size="sm" loading={savingPassword}>Change Password</Button>
              </div>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
