import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";

const demoStaff = [
  { id: "u1", name: "Admin User", email: "admin@jgcrystalking.com", role: "admin", status: "active", last_active: "Just now" },
  { id: "u2", name: "Mark Reyes", email: "mark.reyes@jgcrystalking.com", role: "staff", status: "active", last_active: "2 hours ago" },
  { id: "u3", name: "Liza Domingo", email: "liza.domingo@jgcrystalking.com", role: "staff", status: "active", last_active: "1 day ago" },
  { id: "u4", name: "Carlos Bautista", email: "carlos.bautista@jgcrystalking.com", role: "staff", status: "inactive", last_active: "3 weeks ago" },
];

export default function StaffPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-navy">Staff</h1>
          <p className="mt-1 text-sm text-gray-500">Manage team members and their access.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Add Staff
        </Button>
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
                <th className="px-5 py-3 font-medium">Last Active</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {demoStaff.map((s) => (
                <tr key={s.id} className="border-b border-gray-border last:border-0 hover:bg-gray-light/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-eng-blue-light text-xs font-semibold text-eng-blue">
                        {s.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="font-medium text-navy">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{s.email}</td>
                  <td className="px-5 py-3">
                    <Badge tone={s.role === "admin" ? "purple" : "blue"}>
                      {s.role === "admin" ? "Admin" : "Staff"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-5 py-3 text-gray-500">{s.last_active}</td>
                  <td className="px-5 py-3">
                    <Button variant="ghost" size="sm">Edit</Button>
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
