import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getProjectById, getActiveServiceTypes } from "@/lib/data/projects";
import { ProjectForm } from "@/components/projects/project-form";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [project, serviceTypes] = await Promise.all([getProjectById(id), getActiveServiceTypes()]);

  if (!project) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-navy">Edit Project</h1>
        <p className="mt-1 text-sm text-gray-500">{project.project_code}</p>
      </div>
      <ProjectForm project={project} serviceTypes={serviceTypes} />
    </div>
  );
}
