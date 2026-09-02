"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/components/shared/toast";
import { archiveBudgetAction } from "@/lib/actions/budget-actions";

export function ArchiveBudgetButton({
  budgetId,
  budgetName,
  isArchived,
}: {
  budgetId: string;
  budgetName: string;
  isArchived: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isArchived) return null;

  async function handleConfirm() {
    setLoading(true);
    const result = await archiveBudgetAction(budgetId, budgetName);
    setLoading(false);
    setOpen(false);
    if (result.error) showToast(result.error, "error");
    else {
      showToast("Budget archived.");
      router.refresh();
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Archive className="h-4 w-4" /> Archive
      </Button>
      <ConfirmDialog
        open={open}
        title="Archive this budget?"
        description={`"${budgetName}" will no longer appear in active budget lists. Its historical data is preserved.`}
        confirmLabel="Archive"
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
