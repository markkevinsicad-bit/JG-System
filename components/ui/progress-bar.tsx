"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Tone = "green" | "orange" | "red" | "blue";

const toneClasses: Record<Tone, string> = {
  green: "bg-green",
  orange: "bg-orange",
  red: "bg-red",
  blue: "bg-eng-blue",
};

export function ProgressBar({
  value,
  tone = "blue",
  className,
}: {
  value: number;
  tone?: Tone;
  className?: string;
}) {
  const [width, setWidth] = useState(0);
  const clamped = Math.min(Math.max(value, 0), 100);

  useEffect(() => {
    const t = setTimeout(() => setWidth(clamped), 50);
    return () => clearTimeout(t);
  }, [clamped]);

  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-gray-light", className)}>
      <div
        className={cn("progress-bar-fill h-full rounded-full", toneClasses[tone])}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
