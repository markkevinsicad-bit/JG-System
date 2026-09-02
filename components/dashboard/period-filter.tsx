"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select } from "@/components/ui/input";

const periods = [
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "this_year", label: "This Year" },
  { value: "all", label: "All Time" },
];

export function DashboardPeriodFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("period") ?? "this_month";

  return (
    <Select
      value={current}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("period", e.target.value);
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="max-w-[160px]"
    >
      {periods.map((p) => (
        <option key={p.value} value={p.value}>{p.label}</option>
      ))}
    </Select>
  );
}
