"use client";

import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/export-csv";
import { formatPHP } from "@/lib/utils";

type ExpenseRow = {
  description: string;
  amount: number;
  status: string;
  expense_date: string;
  projects?: { name: string } | null;
  expense_categories?: { name: string } | null;
  profiles?: { full_name: string } | null;
};

type ProjectRow = {
  name: string;
  project_code: string;
  client_name: string;
  budget: number;
  status: string;
};

export function ExportButtons({
  expenses,
  projects,
}: {
  expenses: ExpenseRow[];
  projects: ProjectRow[];
}) {
  function exportExpenses() {
    downloadCsv(
      `expenses-report-${new Date().toISOString().slice(0, 10)}.csv`,
      expenses.map((e) => ({
        Date: e.expense_date,
        Description: e.description,
        Project: e.projects?.name ?? "",
        Category: e.expense_categories?.name ?? "",
        Amount: formatPHP(Number(e.amount)),
        "Submitted By": e.profiles?.full_name ?? "",
        Status: e.status,
      }))
    );
  }

  function exportProjects() {
    downloadCsv(
      `projects-report-${new Date().toISOString().slice(0, 10)}.csv`,
      projects.map((p) => ({
        "Project Code": p.project_code,
        Name: p.name,
        Client: p.client_name,
        Budget: formatPHP(Number(p.budget)),
        Status: p.status,
      }))
    );
  }

  return (
    <div className="flex flex-wrap gap-2 no-print">
      <Button variant="secondary" onClick={exportExpenses}>
        <Download className="h-4 w-4" />
        Export Expenses (CSV)
      </Button>
      <Button variant="secondary" onClick={exportProjects}>
        <Download className="h-4 w-4" />
        Export Projects (CSV)
      </Button>
      <Button variant="secondary" onClick={() => window.print()}>
        <Printer className="h-4 w-4" />
        Print Report
      </Button>
    </div>
  );
}
