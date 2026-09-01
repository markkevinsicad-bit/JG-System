import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { demoProjects, demoExpenses, demoDocuments } from "@/lib/demo-data";
import { formatPHP, formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { FileText } from "lucide-react";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = demoProjects.find((p) => p.id === id);
  if (!project) notFound();

  const expenses = demoExpenses.filter((e) => e.project_id === id);
  const documents = demoDocuments.filter((d) => d.project_id === id);
  const remaining = project.budget - (project.expenses ?? 0);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <p className="text-xs font-medium text-eng-blue">{project.project_code}</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-navy">{project.name}</h1>
          <StatusBadge status={project.status} />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {project.client_name} • {project.site_location}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="animate-fade-in-up lg:col-span-2" hover>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Info label="Service Type" value={project.service_type} />
            <Info label="Contract Value" value={formatPHP(project.contract_value)} />
            <Info label="Budget" value={formatPHP(project.budget)} />
            <Info label="Expenses to Date" value={formatPHP(project.expenses ?? 0)} />
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

        <Card className="animate-fade-in-up" hover>
          <CardHeader>
            <CardTitle>Budget Progress</CardTitle>
          </CardHeader>
          <p className="text-2xl font-bold text-navy">{project.progress}%</p>
          <p className="mb-4 text-xs text-gray-400">of budget utilized</p>
          <ProgressBar value={project.progress ?? 0} tone={project.progress && project.progress > 90 ? "red" : "blue"} />
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Remaining</span>
              <span className="font-medium text-navy">{formatPHP(remaining)}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="animate-fade-in-up overflow-hidden !p-0" hover>
        <div className="p-5 pb-0">
          <CardTitle>Recent Expenses</CardTitle>
        </div>
        {expenses.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={FileText} title="No expenses for this project yet" />
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
                    <td className="px-5 py-3 text-gray-500">{e.category_name}</td>
                    <td className="px-5 py-3 font-medium text-navy">{formatPHP(e.amount)}</td>
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
        {documents.length === 0 ? (
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
                    <p className="text-xs text-gray-400">{d.category}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">{formatDate(d.created_at)}</p>
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
