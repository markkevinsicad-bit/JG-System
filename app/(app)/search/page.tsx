import { Search as SearchIcon, FolderKanban, Receipt, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatPHP, formatDate } from "@/lib/utils";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { profile } = await requireUser();
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const isAdmin = profile.role === "admin";

  if (!query) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-navy">Search</h1>
        <EmptyState icon={SearchIcon} title="Enter a search term" description="Search across projects, expenses, and documents." />
      </div>
    );
  }

  const supabase = await createClient();

  const projectsQuery = supabase
    .from("projects")
    .select("id, name, project_code, client_name, status")
    .or(`name.ilike.%${query}%,project_code.ilike.%${query}%,client_name.ilike.%${query}%,site_location.ilike.%${query}%`)
    .limit(10);

  let expensesQuery = supabase
    .from("expenses")
    .select("id, description, amount, status, expense_date, projects(name)")
    .ilike("description", `%${query}%`)
    .limit(10);
  if (!isAdmin) expensesQuery = expensesQuery.eq("submitted_by", profile.id);

  const documentsQuery = supabase
    .from("documents")
    .select("id, file_name, created_at, projects(name)")
    .ilike("file_name", `%${query}%`)
    .limit(10);

  const [{ data: projects }, { data: expenses }, { data: documents }] = await Promise.all([
    projectsQuery,
    expensesQuery,
    documentsQuery,
  ]);

  const noResults = (projects?.length ?? 0) === 0 && (expenses?.length ?? 0) === 0 && (documents?.length ?? 0) === 0;

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-navy">Search Results</h1>
        <p className="mt-1 text-sm text-gray-500">Showing results for &quot;{query}&quot;</p>
      </div>

      {noResults ? (
        <EmptyState icon={SearchIcon} title="No results found" description="Try a different search term." />
      ) : (
        <div className="space-y-6">
          {projects && projects.length > 0 && (
            <Card className="animate-fade-in-up" hover>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-navy">
                <FolderKanban className="h-4 w-4 text-eng-blue" /> Projects
              </div>
              <div className="space-y-2">
                {projects.map((p) => (
                  <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-light">
                    <div>
                      <p className="text-sm font-medium text-navy">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.project_code} • {p.client_name}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {expenses && expenses.length > 0 && (
            <Card className="animate-fade-in-up" hover>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-navy">
                <Receipt className="h-4 w-4 text-eng-blue" /> Expenses
              </div>
              <div className="space-y-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(expenses as any[]).map((e) => (
                  <Link key={e.id} href="/expenses" className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-light">
                    <div>
                      <p className="text-sm font-medium text-navy">{e.description}</p>
                      <p className="text-xs text-gray-400">{e.projects?.name} • {formatDate(e.expense_date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-navy">{formatPHP(Number(e.amount))}</span>
                      <StatusBadge status={e.status} />
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {documents && documents.length > 0 && (
            <Card className="animate-fade-in-up" hover>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-navy">
                <FileText className="h-4 w-4 text-eng-blue" /> Documents
              </div>
              <div className="space-y-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(documents as any[]).map((d) => (
                  <Link key={d.id} href="/documents" className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-light">
                    <div>
                      <p className="text-sm font-medium text-navy">{d.file_name}</p>
                      <p className="text-xs text-gray-400">{d.projects?.name ?? "General"}</p>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(d.created_at)}</span>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
