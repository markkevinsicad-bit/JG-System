"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/shared/toast";
import { createProjectAction, updateProjectAction, type ActionResult } from "@/lib/actions/project-actions";
import { Project } from "@/types";

const statuses = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

export function ProjectForm({
  project,
  serviceTypes,
}: {
  project?: Project;
  serviceTypes: { name: string }[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ActionResult>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const res = project
      ? await updateProjectAction(project.id, formData)
      : await createProjectAction(formData);

    setSubmitting(false);
    setResult(res);

    if (!res.error) {
      showToast(project ? "Project updated successfully." : "Project created successfully.");
      router.push(project ? `/projects/${project.id}` : "/projects");
      router.refresh();
    }
  }

  const err = (field: string) => result.fieldErrors?.[field];

  return (
    <Card hover>
      <CardHeader>
        <CardTitle>{project ? "Edit Project" : "New Project"}</CardTitle>
      </CardHeader>

      {result.error && (
        <div className="mb-4 rounded-lg bg-red-light px-3 py-2.5 text-sm text-red animate-fade-in">
          {result.error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="project_code">Project Code</Label>
            <Input id="project_code" name="project_code" defaultValue={project?.project_code} placeholder="PRJ-2026-001" required />
            {err("project_code") && <p className="mt-1 text-xs text-red">{err("project_code")}</p>}
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select id="status" name="status" defaultValue={project?.status ?? "planning"} required>
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="name">Project Name</Label>
          <Input id="name" name="name" defaultValue={project?.name} required />
          {err("name") && <p className="mt-1 text-xs text-red">{err("name")}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="client_name">Client</Label>
            <Input id="client_name" name="client_name" defaultValue={project?.client_name} required />
            {err("client_name") && <p className="mt-1 text-xs text-red">{err("client_name")}</p>}
          </div>
          <div>
            <Label htmlFor="site_location">Site Location</Label>
            <Input id="site_location" name="site_location" defaultValue={project?.site_location} required />
            {err("site_location") && <p className="mt-1 text-xs text-red">{err("site_location")}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="service_type">Service Type</Label>
          <Select id="service_type" name="service_type" defaultValue={project?.service_type ?? ""} required>
            <option value="" disabled>Select service type</option>
            {serviceTypes.map((s) => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={3} defaultValue={project?.description ?? ""} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="contract_value">Contract Value (₱)</Label>
            <Input id="contract_value" name="contract_value" type="number" min="0" step="0.01" defaultValue={project?.contract_value} required />
            {err("contract_value") && <p className="mt-1 text-xs text-red">{err("contract_value")}</p>}
          </div>
          <div>
            <Label htmlFor="budget">Budget (₱)</Label>
            <Input id="budget" name="budget" type="number" min="0" step="0.01" defaultValue={project?.budget} required />
            {err("budget") && <p className="mt-1 text-xs text-red">{err("budget")}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <Input id="start_date" name="start_date" type="date" defaultValue={project?.start_date} required />
            {err("start_date") && <p className="mt-1 text-xs text-red">{err("start_date")}</p>}
          </div>
          <div>
            <Label htmlFor="end_date">End Date</Label>
            <Input id="end_date" name="end_date" type="date" defaultValue={project?.end_date ?? ""} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={submitting}>
            {submitting ? "Saving..." : project ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
