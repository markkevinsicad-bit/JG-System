import { Upload, FileText, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { demoDocuments } from "@/lib/demo-data";
import { formatDate } from "@/lib/utils";

const categories = [
  "Contracts",
  "Quotations",
  "Purchase Orders",
  "Service Reports",
  "Receipts",
  "Project Documents",
  "Other",
];

function formatSize(bytes: number) {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-navy">Documents</h1>
          <p className="mt-1 text-sm text-gray-500">Store and organize project-related files.</p>
        </div>
        <Button>
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <Card className="animate-fade-in-up">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search documents..." className="pl-9" />
          </div>
          <Select defaultValue="">
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </div>
      </Card>

      <Card className="animate-fade-in-up overflow-hidden !p-0" hover>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-border text-xs text-gray-400">
                <th className="px-5 py-3 font-medium">File Name</th>
                <th className="px-5 py-3 font-medium">Project</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Uploaded By</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Size</th>
              </tr>
            </thead>
            <tbody>
              {demoDocuments.map((d) => (
                <tr key={d.id} className="border-b border-gray-border last:border-0 hover:bg-gray-light/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-light">
                        <FileText className="h-4 w-4 text-purple" />
                      </div>
                      <span className="font-medium text-navy">{d.file_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{d.project_name}</td>
                  <td className="px-5 py-3 text-gray-500">{d.category}</td>
                  <td className="px-5 py-3 text-gray-500">{d.uploaded_by_name}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-gray-500">{formatDate(d.created_at)}</td>
                  <td className="px-5 py-3 text-gray-500">{formatSize(d.file_size)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
