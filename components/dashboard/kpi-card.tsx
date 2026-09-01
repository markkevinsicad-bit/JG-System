"use client";

import { useEffect, useState } from "react";
import { FolderKanban, Wallet, Receipt, PiggyBank } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tone = "navy" | "blue" | "green" | "orange" | "purple";
export type KpiIconName = "projects" | "budget" | "expenses" | "remaining";

const iconMap = {
  projects: FolderKanban,
  budget: Wallet,
  expenses: Receipt,
  remaining: PiggyBank,
};

const iconTone: Record<Tone, string> = {
  navy: "bg-navy/10 text-navy",
  blue: "bg-eng-blue-light text-eng-blue",
  green: "bg-green-light text-green",
  orange: "bg-orange-light text-orange",
  purple: "bg-purple-light text-purple",
};

export function KpiCard({
  label,
  value,
  isCurrency = false,
  subtext,
  icon,
  tone = "blue",
}: {
  label: string;
  value: number;
  isCurrency?: boolean;
  subtext: string;
  icon: KpiIconName;
  tone?: Tone;
}) {
  const Icon = iconMap[icon];
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    let raf: number;

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const formatted = isCurrency
    ? new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 0 }).format(display)
    : display.toLocaleString();

  return (
    <Card hover className="animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-navy">{formatted}</p>
          <p className="mt-1 text-xs text-gray-400">{subtext}</p>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconTone[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
