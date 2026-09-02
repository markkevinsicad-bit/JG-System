import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatPHP, formatDate } from "@/lib/utils";
import { ProjectWithFinancials } from "@/lib/data/projects";

export function ProjectCard({
  project: p,
  showFinancials,
}: {
  project: ProjectWithFinancials;
  showFinancials: boolean;
}) {
  const tone = p.percent_used >= 100 ? "red" : p.percent_used >= 90 ? "orange" : p.percent_used >= 70 ? "orange" : "blue";

  return (
    <Link href={`/projects/${p.id}`}>
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

        {showFinancials && (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-400">Budget</p>
                <p className="font-semibold text-navy">{formatPHP(p.budget)}</p>
              </div>
              <div>
                <p className="text-gray-400">Remaining</p>
                <p className="font-semibold text-navy">{formatPHP(Math.max(p.remaining_budget, 0))}</p>
              </div>
            </div>

            <div className="mb-3 flex items-center gap-3">
              <ProgressBar value={Math.min(p.percent_used, 100)} tone={tone} />
              <span className="text-xs font-medium text-gray-500">{p.percent_used}%</span>
            </div>
            {p.percent_used >= 100 && (
              <p className="mb-3 text-xs font-medium text-red">⚠ Over Budget</p>
            )}
          </>
        )}

        <p className="text-xs text-gray-400">
          {formatDate(p.start_date)} — {p.end_date ? formatDate(p.end_date) : "Ongoing"}
        </p>
      </Card>
    </Link>
  );
}
