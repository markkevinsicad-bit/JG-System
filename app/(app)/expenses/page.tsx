import { Plus, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { demoExpenses } from "@/lib/demo-data";
import { formatPHP, formatDate } from "@/lib/utils";
import Link from "next/link";

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-navy">Expenses</h1>
          <p className="mt-1 text-sm text-gray-500">Track and monitor project expenses.</p>
        </div>
        <Link href="/expenses/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Expense
          </Button>
        </Link>
      </div>

      <Card className="animate-fade-in-up">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search expenses..." className="pl-9" />
          </div>
          <Input type="date" />
          <Select defaultValue="">
            <option value="">All Projects</option>
            <option>Sprinkler System Installation</option>
            <option>FDAS & Suppression System</option>
          </Select>
          <Select defaultValue="">
            <option value="">All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </Select>
        </div>
      </Card>

      <Card className="animate-fade-in-up overflow-hidden !p-0" hover>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-border text-xs text-gray-400">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Description</th>
                <th className="px-5 py-3 font-medium">Project</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Added By</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {demoExpenses.map((e) => (
                <tr key={e.id} className="border-b border-gray-border last:border-0 transition-colors hover:bg-gray-light/60">
                  <td className="whitespace-nowrap px-5 py-3 text-gray-500">{formatDate(e.expense_date)}</td>
                  <td className="px-5 py-3 font-medium text-navy">{e.description}</td>
                  <td className="px-5 py-3 text-gray-500">{e.project_name}</td>
                  <td className="px-5 py-3 text-gray-500">{e.category_name}</td>
                  <td className="whitespace-nowrap px-5 py-3 font-medium text-navy">{formatPHP(e.amount)}</td>
                  <td className="px-5 py-3 text-gray-500">{e.submitted_by_name}</td>
                  <td className="px-5 py-3"><StatusBadge status={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
