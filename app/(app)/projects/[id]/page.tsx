import { notFound } from "next/navigation";
import Link from "next/link";
import { Pencil, FileText, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { getProjectById } from "@/lib/data/projects";
import { formatPHP, formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ArchiveProjectButton } from "@/components/projects/archive-project-button";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { profile } = await requireUser();
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const isAdmin = profile.role === "admin";
  const supabase = await createClient();

  const expensesQuery = supabase
    .from("expenses")
    .select("id, description, amount, status, expense_date, category_id, submitted_by, expense_categories(name)")
    .eq("project_id", id)
    .order("expense_date", { ascending: false })
    .limit(10);

  const documentsQuery = supabase
    .from("documents")
    .select("id, file_name, file_type, file_size, created_at, uploaded_by")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const incomeQuery = isAdmin
    ? supabase.from("income").select("expected_amount, received_amount, payment_status").eq("project_id", id)
    : Promise.resolve({ data: [] as { expected_amount: number; received_amount: number; payment_status: string }[] });

  const [{ data: expenses }, { data: documents }, { data: projectIncome }] = await Promise.all([
    expensesQuery,
    documentsQuery,
    incomeQuery,
  ]);

  const totalProjectIncome = (projectIncome ?? [])
    .filter((i) => i.payment_status !== "cancelled")
    .reduce((s, i) => s + Number(i.received_amount), 0);
  const profit = totalProjectIncome - project.approved_expenses;
  const profitMargin = totalProjectIncome > 0 ? (profit / totalProjectIncome) * 100 : null;

  const tone = project.percent_used >= 100 ? "red" : project.percent_used >= 90 ? "orange" : "blue";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start animate-fade-in-up">
        <div>
          <p className="text-xs font-medium text-eng-blue">{project.project_code}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-navy">{project.name}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {project.client_name} • {project.site_location}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Link href={`/projects/${project.id}/edit`}>
              <Button variant="secondary" size="sm">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <ArchiveProjectButton
              projectId={project.id}
              projectName={project.name}
              isArchived={project.status === "archived"}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="animate-fade-in-up lg:col-span-2" hover>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Info label="Service Type" value={project.service_type} />
            {isAdmin && <Info label="Contract Value" value={formatPHP(project.contract_value)} />}
            <Info label="Start Date" value={formatDate(project.start_date)} />
            <Info label="End Date" value={project.end_date ? formatDate(project.end_date) : "Ongoing"} />
          </dl>
          {project.description && (
            <div className="mt-4 border-t border-gray-border pt-4">
              <p className="text-xs font-medium text-gray-400">Description</p>
              <p className="mt-1 text-sm text-navy">{project.description}</p>
            </div>
          )}
        </Card>

        {isAdmin && (
          <Card className="animate-fade-in-up" hover>
            <CardHeader>
              <CardTitle>Budget Progress</CardTitle>
            </CardHeader>
            <p className="text-2xl font-bold text-navy">{project.percent_used}%</p>
            <p className="mb-4 text-xs text-gray-400">of budget utilized</p>
            <ProgressBar value={Math.min(project.percent_used, 100)} tone={tone} />
            {project.percent_used >= 100 && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red">
                <AlertTriangle className="h-3.5 w-3.5" /> Over Budget
              </p>
            )}
            {project.percent_used >= 90 && project.percent_used < 100 && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-orange">
                <AlertTriangle className="h-3.5 w-3.5" /> Near Budget Limit
              </p>
            )}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Budget</span>
                <span className="font-medium text-navy">{formatPHP(project.budget)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Approved Expenses</span>
                <span className="font-medium text-navy">{formatPHP(project.approved_expenses)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pending Expenses</span>
                <span className="font-medium text-orange">{formatPHP(project.pending_expenses)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-border pt-2">
                <span className="text-gray-400">Remaining</span>
                <span className="font-semibold text-navy">{formatPHP(project.remaining_budget)}</span>
              </div>
            </div>
          </Card>
        )}
      </div>

      {isAdmin && (
        <Card className="animate-fade-in-up" hover>
          <CardHeader><CardTitle>Financial Summary</CardTitle></CardHeader>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <FinancialStat label="Contract Value" value={formatPHP(project.contract_value)} />
            <FinancialStat label="Project Income" value={formatPHP(totalProjectIncome)} tone="text-green" />
            <FinancialStat label="Approved Expenses" value={formatPHP(project.approved_expenses)} tone="text-orange" />
            <FinancialStat
              label="Profit"
              value={formatPHP(profit)}
              tone={profit >= 0 ? "text-green" : "text-red"}
              subtext={profitMargin !== null ? `${profitMargin.toFixed(1)}% margin` : "No income recorded yet"}
            />
          </div>
        </Card>
      )}

      <Card className="animate-fade-in-up overflow-hidden !p-0" hover>
        <div className="flex items-center justify-between p-5 pb-0">
          <CardTitle>Recent Expenses</CardTitle>
          <Link href={`/expenses?project=${project.id}`} className="text-xs font-medium text-eng-blue hover:underline">
            View All
          </Link>
        </div>
        {!expenses || expenses.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={FileText} title="No project expenses yet." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-gray-400">
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} className="border-t border-gray-border hover:bg-gray-light/60">
                    <td className="px-5 py-3 font-medium text-navy">{e.description}</td>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <td className="px-5 py-3 text-gray-500">{(e as any).expense_categories?.name ?? "—"}</td>
                    <td className="px-5 py-3 font-medium text-navy">{formatPHP(Number(e.amount))}</td>
                    <td className="px-5 py-3"><StatusBadge status={e.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="animate-fade-in-up" hover>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        {!documents || documents.length === 0 ? (
          <EmptyState icon={FileText} title="No documents uploaded yet" />
        ) : (
          <div className="space-y-2">
            {documents.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-lg border border-gray-border px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-light">
                    <FileText className="h-4 w-4 text-purple" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy">{d.file_name}</p>
                    <p className="text-xs text-gray-400">{formatDate(d.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-navy">{value}</dd>
    </div>
  );
}

function FinancialStat({
  label,
  value,
  tone = "text-navy",
  subtext,
}: {
  label: string;
  value: string;
  tone?: string;
  subtext?: string;
}) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`mt-0.5 text-lg font-bold ${tone}`}>{value}</p>
      {subtext && <p className="mt-0.5 text-xs text-gray-400">{subtext}</p>}
    </div>
  );
}
