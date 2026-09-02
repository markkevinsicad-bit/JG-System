"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/components/shared/toast";
import { archiveProjectAction, restoreProjectAction } from "@/lib/actions/project-actions";

export function ArchiveProjectButton({
  projectId,
  projectName,
  isArchived,
}: {
  projectId: string;
  projectName: string;
  isArchived: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    const result = isArchived
      ? await restoreProjectAction(projectId, projectName)
      : await archiveProjectAction(projectId, projectName);
    setLoading(false);
    setOpen(false);

    if (result.error) {
      showToast(result.error, "error");
    } else {
      showToast(isArchived ? "Project restored." : "Project archived.");
      router.refresh();
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        {isArchived ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
        {isArchived ? "Restore" : "Archive"}
      </Button>
      <ConfirmDialog
        open={open}
        title={isArchived ? "Restore this project?" : "Archive this project?"}
        description={
          isArchived
            ? `"${projectName}" will be set back to active and will appear in active project lists again.`
            : `"${projectName}" will be archived. It will no longer appear in active project lists, but all its data is preserved.`
        }
        confirmLabel={isArchived ? "Restore" : "Archive"}
        destructive={!isArchived}
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
