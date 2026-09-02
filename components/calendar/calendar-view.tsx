"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarView({
  events,
}: {
  events: { date: string; label: string; tone: "bg-green" | "bg-red" | "bg-eng-blue" | "bg-orange" }[];
}) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const startOffset = cursor.getDay();
  const today = new Date();

  const eventsByDay = useMemo(() => {
    const map = new Map<number, typeof events>();
    for (const e of events) {
      const d = new Date(e.date);
      if (d.getFullYear() === cursor.getFullYear() && d.getMonth() === cursor.getMonth()) {
        const day = d.getDate();
        map.set(day, [...(map.get(day) ?? []), e]);
      }
    }
    return map;
  }, [events, cursor]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-navy">{monthLabel}</span>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400">
        {weekdays.map((d) => (
          <div key={d} className="py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayEvents = eventsByDay.get(day) ?? [];
          const isToday =
            today.getFullYear() === cursor.getFullYear() &&
            today.getMonth() === cursor.getMonth() &&
            today.getDate() === day;

          return (
            <div
              key={day}
              className={cn(
                "flex min-h-[76px] flex-col rounded-lg border border-gray-border p-1.5 text-xs transition-colors hover:bg-gray-light/60",
                isToday && "border-eng-blue bg-eng-blue-light"
              )}
            >
              <span className="font-medium text-navy">{day}</span>
              {dayEvents.slice(0, 2).map((e, idx) => (
                <span key={idx} className={cn("mt-1 truncate rounded px-1.5 py-0.5 text-[10px] font-medium text-white", e.tone)}>
                  {e.label}
                </span>
              ))}
              {dayEvents.length > 2 && (
                <span className="mt-0.5 text-[10px] text-gray-400">+{dayEvents.length - 2} more</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
