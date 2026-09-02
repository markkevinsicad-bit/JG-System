"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/components/shared/toast";
import { cancelIncomeAction } from "@/lib/actions/income-actions";

export function CancelIncomeButton({ incomeId, description }: { incomeId: string; description: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    const result = await cancelIncomeAction(incomeId, description);
    setLoading(false);
    setOpen(false);
    if (result.error) showToast(result.error, "error");
    else {
      showToast("Income record cancelled.");
      router.refresh();
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <X className="h-3.5 w-3.5" />
      </Button>
      <ConfirmDialog
        open={open}
        title="Cancel this income record?"
        description={`"${description}" will be marked as cancelled. It will remain in the system but excluded from totals.`}
        confirmLabel="Cancel Record"
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
