import { Plus, Search, FolderKanban } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { demoProjects } from "@/lib/demo-data";
import { formatPHP, formatDate } from "@/lib/utils";
import Link from "next/link";

const filters = ["All", "Active", "Completed", "On Hold", "Archived"];

export default function ProjectsPage() {
  const hasProjects = demoProjects.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-navy">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and track your engineering projects.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in-up">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search projects..." className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f, i) => (
            <button
              key={f}
              className={
                i === 0
                  ? "rounded-full bg-eng-blue px-3.5 py-1.5 text-xs font-semibold text-white"
                  : "rounded-full border border-gray-border px-3.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-light"
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {!hasProjects ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Get started by creating your first engineering project."
          actionLabel="+ Create Project"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {demoProjects.map((p) => {
            const remaining = p.budget - (p.expenses ?? 0);
            return (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <Card hover className="h-full animate-fade-in-up">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-eng-blue">{p.project_code}</p>
                      <h3 className="mt-0.5 text-sm font-semibold text-navy">{p.name}</h3>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>

                  <p className="mb-1 text-xs text-gray-400">{p.client_name}</p>
                  <p className="mb-4 text-xs text-gray-400">{p.service_type} • {p.site_location}</p>

                  <div className="mb-4 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-400">Budget</p>
                      <p className="font-semibold text-navy">{formatPHP(p.budget)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Remaining</p>
                      <p className="font-semibold text-navy">{formatPHP(remaining)}</p>
                    </div>
                  </div>

                  <div className="mb-3 flex items-center gap-3">
                    <ProgressBar value={p.progress ?? 0} tone="blue" />
                    <span className="text-xs font-medium text-gray-500">{p.progress}%</span>
                  </div>

                  <p className="text-xs text-gray-400">
                    {formatDate(p.start_date)} — {p.end_date ? formatDate(p.end_date) : "Ongoing"}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
