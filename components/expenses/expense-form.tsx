"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileCheck } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/shared/toast";
import { createExpenseAction, updateExpenseAction } from "@/lib/actions/expense-actions";
import type { ActionResult } from "@/lib/actions/project-actions";
import { Expense } from "@/types";

const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "card", label: "Card" },
  { value: "other", label: "Other" },
];

export function ExpenseForm({
  expense,
  projects,
  categories,
}: {
  expense?: Expense;
  projects: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ActionResult>({});
  const [fileName, setFileName] = useState<string | null>(null);

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
            <Label htmlFor="project_id">Project</Label>
            <Select id="project_id" name="project_id" defaultValue={expense?.project_id ?? ""} required>
              <option value="" disabled>Select project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
            {err("project_id") && <p className="mt-1 text-xs text-red">{err("project_id")}</p>}
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
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={3} defaultValue={expense?.description} placeholder="What was this expense for?" required />
          {err("description") && <p className="mt-1 text-xs text-red">{err("description")}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="amount">Amount (₱)</Label>
            <Input id="amount" name="amount" type="number" min="0.01" step="0.01" defaultValue={expense?.amount} placeholder="0.00" required />
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
            <Label htmlFor="vendor_name">Vendor / Supplier</Label>
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
