import { Plus, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { getProjectsWithFinancials } from "@/lib/data/projects";
import { requireUser } from "@/lib/auth";
import Link from "next/link";
import { ProjectFilters } from "@/components/projects/project-filters";
import { ProjectCard } from "@/components/projects/project-card";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { profile } = await requireUser();
  const { status, q } = await searchParams;
  const projects = await getProjectsWithFinancials({ status, search: q });
  const isAdmin = profile.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-navy">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and track your engineering projects.</p>
        </div>
        {isAdmin && (
          <Link href="/projects/new">
            <Button>
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </Link>
        )}
      </div>

      <ProjectFilters />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description={
            isAdmin
              ? "Get started by creating your first engineering project."
              : "No projects have been created yet."
          }
          actionLabel={isAdmin ? "+ Create Project" : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} showFinancials={isAdmin} />
          ))}
        </div>
      )}
    </div>
  );
}
