"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const filters = [
  { label: "All", value: "all" },
  { label: "Planning", value: "planning" },
  { label: "Active", value: "active" },
  { label: "On Hold", value: "on_hold" },
  { label: "Completed", value: "completed" },
  { label: "Archived", value: "archived" },
];

export function ProjectFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") ?? "all";
  const currentQ = searchParams.get("q") ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Card className="animate-fade-in-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search projects..."
            defaultValue={currentQ}
            className="pl-9"
            onChange={(e) => {
              const val = e.target.value;
              const timeout = setTimeout(() => updateParam("q", val), 400);
              return () => clearTimeout(timeout);
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => updateParam("status", f.value)}
              className={
                currentStatus === f.value
                  ? "rounded-full bg-eng-blue px-3.5 py-1.5 text-xs font-semibold text-white"
                  : "rounded-full border border-gray-border px-3.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-light"
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
