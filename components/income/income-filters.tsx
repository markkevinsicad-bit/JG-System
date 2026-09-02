"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export function IncomeFilters({
  projects,
  categories,
}: {
  projects: { id: string; name: string }[];
  categories: { id: string; name: string }[];
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search income..."
            defaultValue={searchParams.get("q") ?? ""}
            className="pl-9"
            onChange={(e) => updateParam("q", e.target.value)}
          />
        </div>
        <Select defaultValue={searchParams.get("type") ?? ""} onChange={(e) => updateParam("type", e.target.value)}>
          <option value="">All Types</option>
          <option value="project">Project Income</option>
          <option value="other">Other Income</option>
        </Select>
        <Select defaultValue={searchParams.get("project") ?? ""} onChange={(e) => updateParam("project", e.target.value)}>
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </Select>
        <Select defaultValue={searchParams.get("status") ?? ""} onChange={(e) => updateParam("status", e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="partially_received">Partially Received</option>
          <option value="received">Received</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>
      <div className="mt-3">
        <Select
          defaultValue={searchParams.get("category") ?? ""}
          onChange={(e) => updateParam("category", e.target.value)}
          className="max-w-[220px]"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      </div>
    </Card>
  );
}
