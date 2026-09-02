"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/components/shared/toast";
import { toggleStaffStatusAction } from "@/lib/actions/staff-actions";

export function StaffStatusToggle({
  userId,
  status,
  isSelf,
}: {
  userId: string;
  status: string;
  isSelf: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isActive = status === "active";

  async function handleConfirm() {
    setLoading(true);
    const result = await toggleStaffStatusAction(userId, status);
    setLoading(false);
    setOpen(false);
    if (result.error) showToast(result.error, "error");
    else {
      showToast(isActive ? "Staff member deactivated." : "Staff member activated.");
      router.refresh();
    }
  }

  if (isSelf) return null;

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        {isActive ? "Deactivate" : "Activate"}
      </Button>
      <ConfirmDialog
        open={open}
        title={isActive ? "Deactivate this account?" : "Activate this account?"}
        description={
          isActive
            ? "This person will no longer be able to sign in. Their data is preserved."
            : "This person will be able to sign in again."
        }
        confirmLabel={isActive ? "Deactivate" : "Activate"}
        destructive={isActive}
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
