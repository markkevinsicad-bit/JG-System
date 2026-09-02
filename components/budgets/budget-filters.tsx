"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export function BudgetFilters({
  budgetTypes,
  projects,
}: {
  budgetTypes: { id: string; name: string }[];
  projects: { id: string; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Card className="animate-fade-in-up">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search budgets..."
            defaultValue={searchParams.get("q") ?? ""}
            className="pl-9"
            onChange={(e) => updateParam("q", e.target.value)}
          />
        </div>
        <Select defaultValue={searchParams.get("type") ?? ""} onChange={(e) => updateParam("type", e.target.value)}>
          <option value="">All Types</option>
          {budgetTypes.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </Select>
        <Select defaultValue={searchParams.get("project") ?? ""} onChange={(e) => updateParam("project", e.target.value)}>
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </Select>
        <Select defaultValue={searchParams.get("status") ?? "all"} onChange={(e) => updateParam("status", e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
          <option value="archived">Archived</option>
        </Select>
      </div>
    </Card>
  );
}
