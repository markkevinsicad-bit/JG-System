"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/shared/toast";
import { createBudgetAction, updateBudgetAction } from "@/lib/actions/budget-actions";
import type { ActionResult } from "@/lib/actions/project-actions";
import { Budget } from "@/types";

const periods = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual" },
  { value: "custom", label: "Custom Date Range" },
];

const statuses = [
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
  { value: "archived", label: "Archived" },
];

export function BudgetForm({
  budget,
  budgetTypes,
  projects,
}: {
  budget?: Budget;
  budgetTypes: { id: string; name: string }[];
  projects: { id: string; name: string }[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ActionResult>({});
  const [selectedTypeName, setSelectedTypeName] = useState(
    budgetTypes.find((t) => t.id === budget?.budget_type_id)?.name ?? ""
  );

  const isProjectType = selectedTypeName === "Project Budget";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const res = budget
      ? await updateBudgetAction(budget.id, formData)
      : await createBudgetAction(formData);

    setSubmitting(false);
    setResult(res);

    if (!res.error) {
      showToast(budget ? "Budget updated successfully." : "Budget created successfully.");
      router.push("/budgets");
      router.refresh();
    }
  }

  const err = (field: string) => result.fieldErrors?.[field];

  return (
    <Card hover>
      <CardHeader>
        <CardTitle>{budget ? "Edit Budget" : "New Budget"}</CardTitle>
      </CardHeader>

      {result.error && (
        <div className="mb-4 rounded-lg bg-red-light px-3 py-2.5 text-sm text-red animate-fade-in">{result.error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="budget_name">Budget Name</Label>
          <Input id="budget_name" name="budget_name" defaultValue={budget?.budget_name} placeholder="e.g. Company Meals — September 2026" required />
          {err("budget_name") && <p className="mt-1 text-xs text-red">{err("budget_name")}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="budget_type_id">Budget Type</Label>
            <Select
              id="budget_type_id"
              name="budget_type_id"
              defaultValue={budget?.budget_type_id ?? ""}
              onChange={(e) => setSelectedTypeName(e.target.options[e.target.selectedIndex].text)}
              required
            >
              <option value="" disabled>Select type</option>
              {budgetTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
            {err("budget_type_id") && <p className="mt-1 text-xs text-red">{err("budget_type_id")}</p>}
          </div>
          <div>
            <Label htmlFor="project_id">
              Project {isProjectType ? "" : "(optional)"}
            </Label>
            <Select id="project_id" name="project_id" defaultValue={budget?.project_id ?? ""}>
              <option value="">None / General Company Budget</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
            <p className="mt-1 text-xs text-gray-400">
              {isProjectType
                ? "Project Budgets are usually linked to a specific project."
                : "Leave as None for company-wide budgets like Operating or Corporate Overhead."}
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={2} defaultValue={budget?.description ?? ""} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="budget_amount">Budget Amount</Label>
            <CurrencyInput id="budget_amount" name="budget_amount" defaultValue={budget?.budget_amount} required />
            {err("budget_amount") && <p className="mt-1 text-xs text-red">{err("budget_amount")}</p>}
          </div>
          <div>
            <Label htmlFor="period_type">Period</Label>
            <Select id="period_type" name="period_type" defaultValue={budget?.period_type ?? "monthly"} required>
              {periods.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <Input id="start_date" name="start_date" type="date" defaultValue={budget?.start_date} required />
            {err("start_date") && <p className="mt-1 text-xs text-red">{err("start_date")}</p>}
          </div>
          <div>
            <Label htmlFor="end_date">End Date</Label>
            <Input id="end_date" name="end_date" type="date" defaultValue={budget?.end_date ?? ""} />
          </div>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue={budget?.status ?? "active"} required>
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={submitting}>
            {submitting ? "Saving..." : budget ? "Save Changes" : "Create Budget"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
