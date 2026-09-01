"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const demoEvents: Record<number, { label: string; tone: string }> = {
  5: { label: "Site Visit", tone: "bg-eng-blue" },
  12: { label: "PM Due", tone: "bg-orange" },
  18: { label: "Project Deadline", tone: "bg-red" },
  25: { label: "Start Date", tone: "bg-green" },
};

export default function CalendarPage() {
  const [monthLabel] = useState("September 2026");
  const daysInMonth = 30;
  const startOffset = 2; // Tuesday start, demo only

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-navy">Calendar</h1>
          <p className="mt-1 text-sm text-gray-500">Project deadlines, maintenance, and site visits.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
          <span className="min-w-[130px] text-center text-sm font-semibold text-navy">{monthLabel}</span>
          <Button variant="secondary" size="icon"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <Card className="animate-fade-in-up" hover>
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
            const event = demoEvents[day];
            return (
              <div
                key={day}
                className={cn(
                  "flex min-h-[72px] flex-col rounded-lg border border-gray-border p-1.5 text-xs transition-colors hover:bg-gray-light/60",
                  day === 2 && "border-eng-blue bg-eng-blue-light"
                )}
              >
                <span className="font-medium text-navy">{day}</span>
                {event && (
                  <span className={cn("mt-1 truncate rounded px-1.5 py-0.5 text-[10px] font-medium text-white", event.tone)}>
                    {event.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
