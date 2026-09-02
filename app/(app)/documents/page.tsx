import { FileText, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { getProjectOptions } from "@/lib/data/expenses";
import { UploadDocumentDialog } from "@/components/documents/upload-document-dialog";
import { DocumentRow } from "@/components/documents/document-row";
import { EmptyState } from "@/components/shared/empty-state";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { profile } = await requireUser();
  const { q } = await searchParams;
  const supabase = await createClient();
  const projects = await getProjectOptions();

  let query = supabase
    .from("documents")
    .select("id, file_name, file_path, file_size, created_at, uploaded_by, project_id, projects(name), profiles!documents_uploaded_by_fkey(full_name)")
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("file_name", `%${q}%`);

  const { data: documents } = await query;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-navy">Documents</h1>
          <p className="mt-1 text-sm text-gray-500">Store and organize project-related files.</p>
        </div>
        <UploadDocumentDialog projects={projects} />
      </div>

      <Card className="animate-fade-in-up">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <form>
            <Input name="q" defaultValue={q} placeholder="Search documents..." className="pl-9" />
          </form>
        </div>
      </Card>

      {!documents || documents.length === 0 ? (
        <EmptyState icon={FileText} title="No documents uploaded yet" description="Upload contracts, quotations, or service reports to get started." />
      ) : (
        <Card className="animate-fade-in-up overflow-hidden !p-0" hover>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-border text-xs text-gray-400">
                  <th className="px-5 py-3 font-medium">File Name</th>
                  <th className="px-5 py-3 font-medium">Project</th>
                  <th className="px-5 py-3 font-medium">Uploaded By</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Size</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* eslint-disable @typescript-eslint/no-explicit-any */}
                {(documents as any[]).map((d) => (
                  <DocumentRow
                    key={d.id}
                    doc={{
                      id: d.id,
                      file_name: d.file_name,
                      file_path: d.file_path,
                      file_size: d.file_size,
                      created_at: d.created_at,
                      project_name: d.projects?.name,
                      uploaded_by_name: d.profiles?.full_name,
                    }}
                    canDelete={profile.role === "admin" || d.uploaded_by === profile.id}
                  />
                ))}
                {/* eslint-enable @typescript-eslint/no-explicit-any */}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
