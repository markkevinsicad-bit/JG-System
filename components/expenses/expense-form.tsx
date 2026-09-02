"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileCheck, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/shared/toast";
import { createExpenseAction, updateExpenseAction, getBudgetSnapshotAction } from "@/lib/actions/expense-actions";
import type { ActionResult } from "@/lib/actions/project-actions";
import { Expense } from "@/types";
import { formatPHP } from "@/lib/utils";

const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "card", label: "Company Card" },
  { value: "gcash", label: "GCash" },
  { value: "check", label: "Check" },
  { value: "other", label: "Other" },
];

export function ExpenseForm({
  expense,
  projects,
  categories,
  generalBudgets,
  projectBudgets,
}: {
  expense?: Expense;
  projects: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  generalBudgets: { id: string; budget_name: string; project_id: string | null }[];
  projectBudgets: { id: string; budget_name: string; project_id: string | null }[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ActionResult>({});
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState(expense?.project_id ?? "");
  const [selectedBudget, setSelectedBudget] = useState(expense?.budget_id ?? "");
  const [amount, setAmount] = useState(expense?.amount ?? 0);
  const [budgetWarning, setBudgetWarning] = useState<string | null>(null);

  const availableBudgets = selectedProject
    ? projectBudgets.filter((b) => b.project_id === selectedProject || b.project_id === null)
    : generalBudgets.filter((b) => b.project_id === null);

  function handleProjectChange(newProjectId: string) {
    setSelectedProject(newProjectId);
    const nextAvailable = newProjectId
      ? projectBudgets.filter((b) => b.project_id === newProjectId || b.project_id === null)
      : generalBudgets.filter((b) => b.project_id === null);
    if (!nextAvailable.some((b) => b.id === selectedBudget)) {
      setSelectedBudget("");
    }
  }

  useEffect(() => {
    let cancelled = false;
    if (!selectedBudget || !amount || amount <= 0) {
      return;
    }

    getBudgetSnapshotAction(selectedBudget).then((snapshot) => {
      if (cancelled || !snapshot) return;
      const projected = snapshot.approved + snapshot.pending + amount;
      if (projected > snapshot.budgetAmount) {
        const over = projected - snapshot.budgetAmount;
        setBudgetWarning(
          `This expense would put the budget ${formatPHP(over)} over budget (projected ${formatPHP(projected)} of ${formatPHP(snapshot.budgetAmount)}).`
        );
      } else {
        setBudgetWarning(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selectedBudget, amount]);

  const showBudgetWarning = selectedBudget && amount > 0 ? budgetWarning : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const res = expense
      ? await updateExpenseAction(expense.id, formData)
      : await createExpenseAction(formData);

    setSubmitting(false);
    setResult(res);

    if (!res.error) {
      showToast(expense ? "Expense updated successfully." : "Expense submitted successfully.");
      router.push("/expenses");
      router.refresh();
    }
  }

  const err = (field: string) => result.fieldErrors?.[field];

  return (
    <Card hover>
      <CardHeader>
        <CardTitle>Expense Details</CardTitle>
      </CardHeader>

      {result.error && (
        <div className="mb-4 rounded-lg bg-red-light px-3 py-2.5 text-sm text-red animate-fade-in">
          {result.error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="project_id">Project (optional)</Label>
            <Select
              id="project_id"
              name="project_id"
              value={selectedProject}
              onChange={(e) => handleProjectChange(e.target.value)}
            >
              <option value="">None / General Company Expense</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="category_id">Category</Label>
            <Select id="category_id" name="category_id" defaultValue={expense?.category_id ?? ""} required>
              <option value="" disabled>Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
            {err("category_id") && <p className="mt-1 text-xs text-red">{err("category_id")}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="budget_id">Budget</Label>
          <Select
            id="budget_id"
            name="budget_id"
            value={selectedBudget}
            onChange={(e) => setSelectedBudget(e.target.value)}
          >
            <option value="">No specific budget</option>
            {availableBudgets.map((b) => (
              <option key={b.id} value={b.id}>{b.budget_name}</option>
            ))}
          </Select>
          <p className="mt-1 text-xs text-gray-400">
            {selectedProject
              ? "Showing budgets for this project, plus general company budgets."
              : "Showing general/company-wide budgets."}
          </p>
          {showBudgetWarning && (
            <div className="mt-2 flex items-start gap-2 rounded-lg bg-orange-light px-3 py-2 text-xs text-orange">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {showBudgetWarning}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={3} defaultValue={expense?.description} placeholder="What was this expense for?" required />
          {err("description") && <p className="mt-1 text-xs text-red">{err("description")}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <CurrencyInput
              id="amount"
              name="amount"
              defaultValue={expense?.amount}
              required
              onValueChange={setAmount}
            />
            {err("amount") && <p className="mt-1 text-xs text-red">{err("amount")}</p>}
          </div>
          <div>
            <Label htmlFor="expense_date">Date</Label>
            <Input id="expense_date" name="expense_date" type="date" defaultValue={expense?.expense_date} required />
            {err("expense_date") && <p className="mt-1 text-xs text-red">{err("expense_date")}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="vendor_name">Vendor / Payee</Label>
            <Input id="vendor_name" name="vendor_name" defaultValue={expense?.vendor_name ?? ""} placeholder="Optional" />
          </div>
          <div>
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select id="payment_method" name="payment_method" defaultValue={expense?.payment_method ?? ""} required>
              <option value="" disabled>Select method</option>
              {paymentMethods.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="reference_number">Reference Number (optional)</Label>
            <Input id="reference_number" name="reference_number" defaultValue={expense?.reference_number ?? ""} placeholder="PO / Invoice #" />
          </div>
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input id="notes" name="notes" defaultValue={expense?.notes ?? ""} />
          </div>
        </div>

        {!expense && (
          <div>
            <Label htmlFor="receipt">Receipt / Attachment</Label>
            <label
              htmlFor="receipt"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-border py-8 text-center transition-colors hover:border-eng-blue hover:bg-eng-blue-light/40"
            >
              {fileName ? (
                <>
                  <FileCheck className="mb-2 h-6 w-6 text-green" />
                  <p className="text-sm font-medium text-navy">{fileName}</p>
                </>
              ) : (
                <>
                  <Upload className="mb-2 h-6 w-6 text-gray-400" />
                  <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400">PNG, JPG, or PDF (max 10MB)</p>
                </>
              )}
              <input
                id="receipt"
                name="receipt"
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                className="hidden"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
              />
            </label>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={submitting}>
            {submitting ? "Submitting..." : expense ? "Save Changes" : "Submit Expense"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
