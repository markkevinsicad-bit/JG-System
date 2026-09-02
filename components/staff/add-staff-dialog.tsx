"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useToast } from "@/components/shared/toast";
import { addStaffAction } from "@/lib/actions/staff-actions";

export function AddStaffDialog() {
  const router = useRouter();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await addStaffAction(formData);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      showToast("Staff member added. They'll receive an email to set their password.");
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add Staff
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-navy">Add Staff Member</h3>
              <button onClick={() => setOpen(false)}><X className="h-4 w-4 text-gray-400" /></button>
            </div>

            {error && <div className="mb-3 rounded-lg bg-red-light px-3 py-2 text-sm text-red">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" name="full_name" required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select id="role" name="role" defaultValue="staff" required>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </Select>
              </div>
              <p className="text-xs text-gray-400">
                They&apos;ll receive an email with a link to set their own password.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm" loading={submitting}>
                  {submitting ? "Adding..." : "Add Staff"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
