"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/shared/toast";
import { approveExpenseAction, rejectExpenseAction } from "@/lib/actions/expense-actions";
import { Textarea } from "@/components/ui/input";

export function ExpenseRowActions({
  expenseId,
  status,
  canEdit,
  isAdmin,
}: {
  expenseId: string;
  status: string;
  canEdit: boolean;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState("");

  async function handleApprove() {
    setApproving(true);
    const res = await approveExpenseAction(expenseId);
    setApproving(false);
    if (res.error) showToast(res.error, "error");
    else {
      showToast("Expense approved.");
      router.refresh();
    }
  }

  async function handleReject() {
    if (reason.trim().length < 5) {
      showToast("Please explain why this expense is being rejected.", "error");
      return;
    }
    setRejecting(true);
    const formData = new FormData();
    formData.set("expense_id", expenseId);
    formData.set("rejection_reason", reason);
    const res = await rejectExpenseAction(formData);
    setRejecting(false);
    if (res.error) showToast(res.error, "error");
    else {
      showToast("Expense rejected.");
      setShowRejectForm(false);
      setReason("");
      router.refresh();
    }
  }

  if (isAdmin && status === "pending") {
    return (
      <div className="flex flex-col items-end gap-2">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleApprove} loading={approving}>
            <Check className="h-3.5 w-3.5" /> Approve
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setShowRejectForm((s) => !s)}>
            <X className="h-3.5 w-3.5" /> Reject
          </Button>
        </div>
        {showRejectForm && (
          <div className="w-64 rounded-lg border border-gray-border bg-white p-3 shadow-lg animate-fade-in-up">
            <Textarea
              placeholder="Reason for rejection..."
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="text-xs"
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button size="sm" variant="secondary" onClick={() => setShowRejectForm(false)}>Cancel</Button>
              <Button size="sm" variant="destructive" onClick={handleReject} loading={rejecting}>Confirm</Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (canEdit && status === "pending") {
    return (
      <Link href={`/expenses/${expenseId}/edit`}>
        <Button size="sm" variant="ghost">
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
      </Link>
    );
  }

  return null;
}
