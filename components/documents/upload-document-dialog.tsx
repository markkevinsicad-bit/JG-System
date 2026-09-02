"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { useToast } from "@/components/shared/toast";
import { uploadDocumentAction } from "@/lib/actions/document-actions";

export function UploadDocumentDialog({ projects }: { projects: { id: string; name: string }[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await uploadDocumentAction(formData);
    setUploading(false);

    if (result.error) {
      setError(result.error);
    } else {
      showToast("Document uploaded successfully.");
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4" />
        Upload Document
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-navy">Upload Document</h3>
              <button onClick={() => setOpen(false)}><X className="h-4 w-4 text-gray-400" /></button>
            </div>

            {error && <div className="mb-3 rounded-lg bg-red-light px-3 py-2 text-sm text-red">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">Project (optional)</label>
                <Select name="project_id" defaultValue="">
                  <option value="">General / Not project-specific</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">File</label>
                <input
                  type="file"
                  name="file"
                  accept="image/jpeg,image/png,application/pdf"
                  required
                  className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-eng-blue-light file:px-3 file:py-2 file:text-xs file:font-medium file:text-eng-blue"
                />
                <p className="mt-1 text-xs text-gray-400">JPG, PNG, or PDF — max 10MB</p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm" loading={uploading}>
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
