"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileCheck } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/shared/toast";
import { createIncomeAction, updateIncomeAction } from "@/lib/actions/income-actions";
import type { ActionResult } from "@/lib/actions/project-actions";
import { Income } from "@/types";

const paymentStatuses = [
  { value: "pending", label: "Pending" },
  { value: "partially_received", label: "Partially Received" },
  { value: "received", label: "Received" },
  { value: "cancelled", label: "Cancelled" },
];

export function IncomeForm({
  income,
  projects,
  categories,
}: {
  income?: Income;
  projects: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ActionResult>({});
  const [incomeType, setIncomeType] = useState<"project" | "other">(income?.income_type ?? "project");
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const res = income
      ? await updateIncomeAction(income.id, formData)
      : await createIncomeAction(formData);

    setSubmitting(false);
    setResult(res);

    if (!res.error) {
      showToast(income ? "Income updated successfully." : "Income recorded successfully.");
      router.push("/income");
      router.refresh();
    }
  }

  const err = (field: string) => result.fieldErrors?.[field];

  return (
    <Card hover>
      <CardHeader>
        <CardTitle>{income ? "Edit Income" : "New Income"}</CardTitle>
      </CardHeader>

      {result.error && (
        <div className="mb-4 rounded-lg bg-red-light px-3 py-2.5 text-sm text-red animate-fade-in">{result.error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="income_type">Income Type</Label>
            <Select
              id="income_type"
              name="income_type"
              value={incomeType}
              onChange={(e) => setIncomeType(e.target.value as "project" | "other")}
              required
            >
              <option value="project">Project Income</option>
              <option value="other">Other Income</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="project_id">
              Project {incomeType === "project" ? "" : "(not applicable)"}
            </Label>
            <Select
              id="project_id"
              name="project_id"
              defaultValue={income?.project_id ?? ""}
              disabled={incomeType === "other"}
              required={incomeType === "project"}
            >
              <option value="" disabled={incomeType === "project"}>
                {incomeType === "project" ? "Select project" : "Not applicable"}
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
            {err("project_id") && <p className="mt-1 text-xs text-red">{err("project_id")}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="income_category_id">Category</Label>
          <Select id="income_category_id" name="income_category_id" defaultValue={income?.income_category_id ?? ""} required>
            <option value="" disabled>Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          {err("income_category_id") && <p className="mt-1 text-xs text-red">{err("income_category_id")}</p>}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={2} defaultValue={income?.description} required />
          {err("description") && <p className="mt-1 text-xs text-red">{err("description")}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="expected_amount">Expected Amount</Label>
            <CurrencyInput id="expected_amount" name="expected_amount" defaultValue={income?.expected_amount} required />
            {err("expected_amount") && <p className="mt-1 text-xs text-red">{err("expected_amount")}</p>}
          </div>
          <div>
            <Label htmlFor="received_amount">Received Amount</Label>
            <CurrencyInput id="received_amount" name="received_amount" defaultValue={income?.received_amount ?? 0} required />
            {err("received_amount") && <p className="mt-1 text-xs text-red">{err("received_amount")}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="income_date">Date</Label>
            <Input id="income_date" name="income_date" type="date" defaultValue={income?.income_date} required />
            {err("income_date") && <p className="mt-1 text-xs text-red">{err("income_date")}</p>}
          </div>
          <div>
            <Label htmlFor="payment_status">Payment Status</Label>
            <Select id="payment_status" name="payment_status" defaultValue={income?.payment_status ?? "pending"} required>
              {paymentStatuses.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="source_name">Client / Source</Label>
            <Input id="source_name" name="source_name" defaultValue={income?.source_name ?? ""} placeholder="Optional" />
          </div>
          <div>
            <Label htmlFor="reference_number">Reference Number</Label>
            <Input id="reference_number" name="reference_number" defaultValue={income?.reference_number ?? ""} placeholder="OR / Invoice #" />
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" rows={2} defaultValue={income?.notes ?? ""} />
        </div>

        {!income && (
          <div>
            <Label htmlFor="attachment">Attachment (optional)</Label>
            <label
              htmlFor="attachment"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-border py-6 text-center transition-colors hover:border-eng-blue hover:bg-eng-blue-light/40"
            >
              {fileName ? (
                <>
                  <FileCheck className="mb-2 h-5 w-5 text-green" />
                  <p className="text-sm font-medium text-navy">{fileName}</p>
                </>
              ) : (
                <>
                  <Upload className="mb-2 h-5 w-5 text-gray-400" />
                  <p className="text-sm text-gray-500">Billing document, OR, or proof of payment</p>
                </>
              )}
              <input
                id="attachment"
                name="attachment"
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
            {submitting ? "Saving..." : income ? "Save Changes" : "Record Income"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
