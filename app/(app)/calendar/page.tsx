import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CalendarView } from "@/components/calendar/calendar-view";

export default async function CalendarPage() {
  await requireUser();
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, start_date, end_date, status")
    .neq("status", "archived");

  const events = (projects ?? []).flatMap((p) => {
    const list: { date: string; label: string; tone: "bg-green" | "bg-red" | "bg-eng-blue" | "bg-orange" }[] = [
      { date: p.start_date, label: `${p.name} — Start`, tone: "bg-green" },
    ];
    if (p.end_date) {
      list.push({ date: p.end_date, label: `${p.name} — Deadline`, tone: "bg-red" });
    }
    return list;
  });

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-navy">Calendar</h1>
        <p className="mt-1 text-sm text-gray-500">Project start dates and deadlines.</p>
      </div>

      <Card className="animate-fade-in-up" hover>
        <CalendarView events={events} />
      </Card>
    </div>
  );
}
