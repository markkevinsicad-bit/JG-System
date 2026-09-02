import { Card } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { AddStaffDialog } from "@/components/staff/add-staff-dialog";
import { StaffStatusToggle } from "@/components/staff/staff-status-toggle";

export default async function StaffPage() {
  const { profile } = await requireAdmin();
  const supabase = await createClient();
  const { data: staff } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-navy">Staff</h1>
          <p className="mt-1 text-sm text-gray-500">Manage team members and their access.</p>
        </div>
        <AddStaffDialog />
      </div>

      <Card className="animate-fade-in-up overflow-hidden !p-0" hover>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-border text-xs text-gray-400">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Created</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(staff ?? []).map((s) => (
                <tr key={s.id} className="border-b border-gray-border last:border-0 hover:bg-gray-light/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-eng-blue-light text-xs font-semibold text-eng-blue">
                        {s.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-medium text-navy">{s.full_name}</span>
                      {s.id === profile.id && <span className="text-xs text-gray-400">(You)</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{s.email}</td>
                  <td className="px-5 py-3">
                    <Badge tone={s.role === "admin" ? "purple" : "blue"}>
                      {s.role === "admin" ? "Admin" : "Staff"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-5 py-3 text-gray-500">{formatDate(s.created_at)}</td>
                  <td className="px-5 py-3">
                    <StaffStatusToggle userId={s.id} status={s.status} isSelf={s.id === profile.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
