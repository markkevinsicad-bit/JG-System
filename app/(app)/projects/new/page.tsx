import { requireAdmin } from "@/lib/auth";
import { getActiveServiceTypes } from "@/lib/data/projects";
import { ProjectForm } from "@/components/projects/project-form";

export default async function NewProjectPage() {
  await requireAdmin();
  const serviceTypes = await getActiveServiceTypes();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-navy">New Project</h1>
        <p className="mt-1 text-sm text-gray-500">Create a new engineering project.</p>
      </div>
      <ProjectForm serviceTypes={serviceTypes} />
    </div>
  );
}
