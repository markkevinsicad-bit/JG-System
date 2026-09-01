import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "green" | "orange" | "red" | "purple" | "blue" | "gray";

const toneClasses: Record<BadgeTone, string> = {
  green: "bg-green-light text-green",
  orange: "bg-orange-light text-orange",
  red: "bg-red-light text-red",
  purple: "bg-purple-light text-purple",
  blue: "bg-eng-blue-light text-eng-blue",
  gray: "bg-gray-light text-gray-600",
};

export function Badge({
  tone = "gray",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

const statusToneMap: Record<string, BadgeTone> = {
  active: "green",
  approved: "green",
  healthy: "green",
  recorded: "green",
  completed: "blue",
  pending: "orange",
  warning: "orange",
  near_limit: "orange",
  on_hold: "orange",
  rejected: "red",
  over_budget: "red",
  archived: "gray",
  draft: "gray",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = statusToneMap[status] ?? "gray";
  const label = status
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
  return <Badge tone={tone}>{label}</Badge>;
}
