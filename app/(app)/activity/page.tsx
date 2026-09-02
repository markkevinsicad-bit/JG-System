import { History } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/shared/empty-state";

function formatTimestamp(date: string) {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

const actionTone: Record<string, "green" | "red" | "orange" | "blue" | "purple" | "gray"> = {
  expense_approved: "green",
  expense_rejected: "red",
  expense_created: "blue",
  expense_updated: "orange",
  expense_deleted: "red",
  project_created: "blue",
  project_updated: "orange",
  project_archived: "gray",
  project_restored: "green",
  document_uploaded: "purple",
  document_deleted: "red",
  staff_added: "blue",
  staff_updated: "orange",
  staff_activated: "green",
  staff_deactivated: "red",
  budget_created: "blue",
  budget_updated: "orange",
  budget_archived: "gray",
  income_created: "green",
  income_updated: "orange",
  income_cancelled: "red",
};

export default async function ActivityLogPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("activity_logs")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-navy">Activity Log</h1>
        <p className="mt-1 text-sm text-gray-500">Recent actions across the system.</p>
      </div>

      {!logs || logs.length === 0 ? (
        <EmptyState icon={History} title="No activity yet" description="Actions like project creation and expense approvals will appear here." />
      ) : (
        <Card className="animate-fade-in-up overflow-hidden !p-0" hover>
          <div className="divide-y divide-gray-border">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(logs as any[]).map((log) => (
              <div key={log.id} className="flex items-start justify-between gap-4 px-5 py-3.5">
                <div>
                  <p className="text-sm text-navy">{log.description}</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {log.profiles?.full_name ?? "Unknown user"} • {formatTimestamp(log.created_at)}
                  </p>
                </div>
                <Badge tone={actionTone[log.action] ?? "gray"} className="shrink-0">
                  {log.action.replace(/_/g, " ")}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
