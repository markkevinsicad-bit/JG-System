"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/components/shared/toast";
import { deleteDocumentAction, getDocumentUrlAction } from "@/lib/actions/document-actions";
import { formatDate } from "@/lib/utils";

function formatSize(bytes: number) {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export function DocumentRow({
  doc,
  canDelete,
}: {
  doc: {
    id: string;
    file_name: string;
    file_path: string;
    file_size: number;
    created_at: string;
    project_name?: string;
    uploaded_by_name?: string;
    category?: string;
  };
  canDelete: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [opening, setOpening] = useState(false);

  async function handleView() {
    setOpening(true);
    const result = await getDocumentUrlAction(doc.file_path);
    setOpening(false);
    if (result.error || !result.url) {
      showToast(result.error ?? "We couldn't open this file.", "error");
      return;
    }
    window.open(result.url, "_blank", "noopener,noreferrer");
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteDocumentAction(doc.id, doc.file_path, doc.file_name);
    setDeleting(false);
    setConfirmOpen(false);
    if (result.error) showToast(result.error, "error");
    else {
      showToast("Document deleted.");
      router.refresh();
    }
  }

  return (
    <>
      <tr className="border-b border-gray-border last:border-0 hover:bg-gray-light/60">
        <td className="px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-light">
              <FileText className="h-4 w-4 text-purple" />
            </div>
            <span className="font-medium text-navy">{doc.file_name}</span>
          </div>
        </td>
        <td className="px-5 py-3 text-gray-500">{doc.project_name ?? "—"}</td>
        <td className="px-5 py-3 text-gray-500">{doc.uploaded_by_name ?? "—"}</td>
        <td className="whitespace-nowrap px-5 py-3 text-gray-500">{formatDate(doc.created_at)}</td>
        <td className="px-5 py-3 text-gray-500">{formatSize(doc.file_size)}</td>
        <td className="px-5 py-3">
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={handleView} loading={opening}>
              <Eye className="h-3.5 w-3.5" />
            </Button>
            {canDelete && (
              <Button size="sm" variant="ghost" onClick={() => setConfirmOpen(true)}>
                <Trash2 className="h-3.5 w-3.5 text-red" />
              </Button>
            )}
          </div>
        </td>
      </tr>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this document?"
        description={`"${doc.file_name}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
